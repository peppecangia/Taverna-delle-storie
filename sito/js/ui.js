/* Piccoli strumenti per costruire l'interfaccia senza librerie. */

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const $ = (sel, radice = document) => radice.querySelector(sel);
export const $$ = (sel, radice = document) => [...radice.querySelectorAll(sel)];

export function avviso(testo, tipo = "info") {
  const box = $("#avvisi");
  const el = document.createElement("div");
  el.className = `avviso avviso-${tipo}`;
  el.setAttribute("role", tipo === "errore" ? "alert" : "status");
  el.textContent = testo;
  box.append(el);
  setTimeout(() => el.classList.add("via"), 3800);
  setTimeout(() => el.remove(), 4300);
}

/* Legge un form in un oggetto; i campi numerici diventano numeri. */
export function datiForm(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "radio" && !el.checked) continue;
    if (el.type === "checkbox") out[el.name] = el.checked;
    else out[el.name] = el.type === "number" || el.type === "range" ? Number(el.value) : el.value;
  }
  return out;
}

export const campo = (etichetta, controllo, aiuto = "") =>
  `<label class="campo"><span>${etichetta}</span>${controllo}${aiuto ? `<small>${aiuto}</small>` : ""}</label>`;

export const selezione = (nome, opzioni, scelto) =>
  `<select name="${nome}">${opzioni
    .map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}"${String(v) === String(scelto) ? " selected" : ""}>${esc(t)}</option>`;
    })
    .join("")}</select>`;

export const numero = (nome, valore, min, max) =>
  `<input type="number" name="${nome}" value="${valore}" min="${min}" max="${max}" inputmode="numeric" required>`;

export const testo = (nome, segnaposto = "", valore = "") =>
  `<input type="text" name="${nome}" placeholder="${esc(segnaposto)}" value="${esc(valore)}" maxlength="400">`;

export const area = (nome, segnaposto = "", valore = "") =>
  `<textarea name="${nome}" rows="3" placeholder="${esc(segnaposto)}" maxlength="600">${esc(valore)}</textarea>`;

export const scelte = (nome, opzioni, scelto) =>
  `<div class="scelte" role="radiogroup">${opzioni
    .map(([v, t]) => `<label><input type="radio" name="${nome}" value="${esc(v)}"${v === scelto ? " checked" : ""}><span>${esc(t)}</span></label>`)
    .join("")}</div>`;

export function scarica(nomeFile, contenuto, tipo = "application/json") {
  const url = URL.createObjectURL(contenuto instanceof Blob ? contenuto : new Blob([contenuto], { type: tipo }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nomeFile });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const casuale = (lista) => lista[Math.floor(Math.random() * lista.length)];

/* Conferma dentro la pagina: confirm() del browser non funziona in tutte le app. */
export function conferma(testo, etichettaSi = "Conferma") {
  return new Promise((risolvi) => {
    const sfondo = document.createElement("div");
    sfondo.className = "conferma-sfondo";
    sfondo.innerHTML = `<div class="conferma" role="alertdialog" aria-modal="true" aria-labelledby="conferma-testo">
      <p id="conferma-testo">${esc(testo)}</p>
      <div class="azioni">
        <button type="button" class="pulsante secondario" data-r="0">Annulla</button>
        <button type="button" class="pulsante" data-r="1">${esc(etichettaSi)}</button>
      </div></div>`;
    const chiudi = (r) => {
      sfondo.remove();
      document.removeEventListener("keydown", tasto);
      risolvi(r);
    };
    const tasto = (e) => e.key === "Escape" && chiudi(false);
    sfondo.addEventListener("click", (e) => {
      if (e.target === sfondo) return chiudi(false);
      const b = e.target.closest("[data-r]");
      if (b) chiudi(b.dataset.r === "1");
    });
    document.addEventListener("keydown", tasto);
    document.body.append(sfondo);
    sfondo.querySelector('[data-r="1"]').focus();
  });
}
