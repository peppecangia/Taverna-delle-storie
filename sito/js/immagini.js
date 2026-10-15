/*
 * Illustrazioni. Il servizio gratuito Pollinations non chiede chiavi ma accetta
 * circa una richiesta ogni 15 secondi, quindi le immagini si caricano solo su richiesta.
 * Finché non arrivano, o se il servizio non risponde, si vede una scena disegnata qui.
 */
import { esc } from "./ui.js";
import { generatore, hashTesto } from "./caso.js";

const urlImmagine = (prompt, larghezza, altezza) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(`${prompt}, fantasy illustration, painterly, no text`)}?width=${larghezza}&height=${altezza}&seed=${hashTesto(prompt) % 100000}&nologo=true`;

/* Scena di riserva: cielo, montagne e una luce, colori scelti in base al testo. */
export function disegnaScena(canvas, testo) {
  const rnd = generatore(testo);
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const tinta = rnd.intero(0, 360);
  const cielo = ctx.createLinearGradient(0, 0, 0, h);
  cielo.addColorStop(0, `hsl(${tinta} 35% 14%)`);
  cielo.addColorStop(1, `hsl(${(tinta + 30) % 360} 45% 38%)`);
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `hsl(${(tinta + 50) % 360} 80% 80% / 0.85)`;
  ctx.beginPath();
  ctx.arc(rnd() * w, h * (0.15 + rnd() * 0.25), h * 0.07, 0, Math.PI * 2);
  ctx.fill();
  for (let strato = 0; strato < 4; strato++) {
    const base = h * (0.45 + strato * 0.15);
    ctx.fillStyle = `hsl(${tinta} 30% ${18 - strato * 4}%)`;
    ctx.beginPath();
    ctx.moveTo(0, h);
    let y = base;
    for (let x = 0; x <= w; x += w / 24) {
      y = Math.min(h, Math.max(h * 0.25, y + (rnd() - 0.5) * h * 0.12));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  }
}

export function riquadroImmagine(prompt, didascalia = "") {
  if (!prompt) return "";
  return `<figure class="illustrazione" data-prompt="${esc(prompt)}">
    <canvas width="896" height="504" aria-hidden="true"></canvas>
    <button type="button" class="pulsante piccolo carica-immagine">Mostra illustrazione</button>
    ${didascalia ? `<figcaption>${esc(didascalia)}</figcaption>` : ""}
  </figure>`;
}

/* Da chiamare dopo aver inserito l'HTML: disegna le scene e collega i pulsanti. */
export function attivaImmagini(radice) {
  for (const fig of radice.querySelectorAll(".illustrazione")) {
    if (fig.dataset.pronta) continue;
    fig.dataset.pronta = "1";
    const prompt = fig.dataset.prompt;
    disegnaScena(fig.querySelector("canvas"), prompt);
    const pulsante = fig.querySelector(".carica-immagine");
    pulsante.addEventListener("click", () => {
      pulsante.disabled = true;
      pulsante.textContent = "Sto dipingendo… può servire fino a un minuto";
      const img = new Image();
      img.alt = fig.querySelector("figcaption")?.textContent || "Illustrazione";
      img.referrerPolicy = "no-referrer";
      const scadenza = setTimeout(() => (img.src = ""), 90000);
      img.onload = () => {
        clearTimeout(scadenza);
        fig.querySelector("canvas").replaceWith(img);
        pulsante.remove();
      };
      img.onerror = () => {
        clearTimeout(scadenza);
        pulsante.disabled = false;
        pulsante.textContent = "Servizio occupato, riprova tra 15 secondi";
      };
      img.src = urlImmagine(prompt, 896, 504);
    });
  }
}
