/* Avvio dell'app: navigazione tra le pagine e azioni dei pulsanti. */
import { $, $$, avviso, datiForm, scarica, esc, conferma } from "./ui.js";
import * as A from "./archivio.js";
import { genera, generazioniRimaste, messaggioErrore } from "./api.js";
import { paginaHome, paginaModulo, pannelloAttesa } from "./viste/crea.js";
import { renderVoce, titoloVoce, ETICHETTE } from "./viste/risultati.js";
import { paginaTavolo, montaTavolo, aggiungiCombattenti } from "./viste/tavolo.js";
import { paginaArchivio, paginaAltro } from "./viste/altro.js";
import { attivaImmagini } from "./immagini.js";
import { generaMappa, disegnaMappa } from "./mappe.js";
import { EMAIL_CONTATTO } from "./config.js";

const app = $("#app");
const inCorso = new Set(); // id delle voci con una generazione in corso

function percorso() {
  return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
}

function evidenziaMenu(sezione) {
  for (const a of $$(".menu a")) a.classList.toggle("attiva", a.dataset.sezione === sezione);
}

async function mostra() {
  const [pagina, arg] = percorso();
  window.scrollTo(0, 0);
  switch (pagina) {
    case undefined:
      evidenziaMenu("crea");
      app.innerHTML = paginaHome(null);
      generazioniRimaste().then((r) => {
        if (r && !percorso().length) app.innerHTML = paginaHome(r);
      });
      break;
    case "crea": {
      evidenziaMenu("crea");
      const html = paginaModulo(arg);
      if (!html) return (location.hash = "#/");
      app.innerHTML = html;
      preparaModulo($("#modulo"));
      break;
    }
    case "voce":
      evidenziaMenu("archivio");
      mostraVoce(arg);
      break;
    case "archivio":
      evidenziaMenu("archivio");
      app.innerHTML = paginaArchivio(arg && ETICHETTE[arg] ? arg : "");
      break;
    case "tavolo": {
      evidenziaMenu("tavolo");
      const ridisegna = () => {
        const y = window.scrollY;
        app.innerHTML = paginaTavolo(arg);
        montaTavolo(app, ridisegna);
        window.scrollTo(0, y);
      };
      ridisegna();
      break;
    }
    case "altro":
      evidenziaMenu("altro");
      app.innerHTML = paginaAltro();
      break;
    default:
      location.hash = "#/";
  }
  $("h1, h2", app)?.setAttribute("tabindex", "-1");
}

/* ---------- Moduli di generazione ---------- */

function preparaModulo(form) {
  const tipo = form.dataset.tipo;
  const aggiornaSessioni = () => {
    const campo = form.elements.sessioni?.closest(".campo");
    if (campo) campo.hidden = form.elements.formato.value !== "campagna";
  };
  if (tipo === "avventura") {
    form.addEventListener("change", aggiornaSessioni);
    aggiornaSessioni();
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const dati = datiForm(form);
    A.salvaPreferenze({ edizione: dati.edizione, numeroPG: dati.numeroPG, livello: dati.livello });

    if (tipo === "mappa") {
      const voce = A.salva({
        id: A.nuovoId(), tipo, dati, risultato: null,
        titolo: `${dati.tipoMappa === "caverna" ? "Caverna" : "Dungeon"} ${dati.dimensione}`,
        mappa: { tipo: dati.tipoMappa, dimensione: dati.dimensione, seme: Math.floor(Math.random() * 1e9) },
      });
      location.hash = `#/voce/${voce.id}`;
      return;
    }

    const contenitore = form.parentElement;
    const copia = form.cloneNode(true);
    form.replaceWith(document.createRange().createContextualFragment(pannelloAttesa(tipo)));
    const fermaAttesa = animaAttesa(contenitore);
    try {
      const risultato = await genera(tipo, dati, (p) => {
        if (p.fase === "avviata" && p.rimaste != null) avviso(`Generazione avviata. Te ne restano ${p.rimaste} per oggi.`);
      });
      const voce = A.salva({ id: A.nuovoId(), tipo, dati, risultato });
      fermaAttesa();
      if (percorso()[0] === "crea") location.hash = `#/voce/${voce.id}`;
      else avviso(`Pronto: ${titoloVoce(voce)}. Lo trovi nell'archivio.`, "successo");
    } catch (err) {
      fermaAttesa();
      if (!contenitore.isConnected) return avviso(err.message, "errore");
      $(".attesa", contenitore)?.replaceWith(copia);
      preparaModulo(copia);
      copia.insertAdjacentHTML("afterbegin", `<p class="errore" role="alert">${esc(err.message)}</p>`);
      copia.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function animaAttesa(radice) {
  const frase = $(".frase", radice);
  const tempo = $(".tempo", radice);
  const frasi = JSON.parse(frase?.dataset.frasi || "[]");
  const inizio = Date.now();
  let i = 0;
  const t = setInterval(() => {
    if (!frase?.isConnected) return clearInterval(t);
    const s = Math.round((Date.now() - inizio) / 1000);
    tempo.textContent = `${s} secondi`;
    if (s % 6 === 0 && frasi.length) frase.textContent = frasi[++i % frasi.length];
  }, 1000);
  return () => clearInterval(t);
}

/* ---------- Pagina di una voce salvata ---------- */

function mostraVoce(id) {
  const voce = A.trova(id);
  if (!voce) {
    app.innerHTML = `<section class="pagina"><p class="vuoto">Questo elemento non esiste più.</p><a class="pulsante" href="#/archivio">Vai all'archivio</a></section>`;
    return;
  }
  app.innerHTML = `<section class="pagina voce" data-id="${voce.id}">
    <div class="barra-voce">
      <a href="#/archivio" class="indietro">‹ Archivio</a>
      <span class="spazio"></span>
      <button class="pulsante piccolo secondario" data-azione="stampa">Stampa o PDF</button>
      <button class="pulsante piccolo pericolo" data-azione="elimina">Elimina</button>
    </div>
    ${renderVoce(voce)}
    ${voce.risultato ? `<p class="segnala"><a href="mailto:${EMAIL_CONTATTO}?subject=${encodeURIComponent("Segnalazione contenuto")}&body=${encodeURIComponent(`Tipo: ${ETICHETTE[voce.tipo]}\nTitolo: ${titoloVoce(voce)}\n\nCosa c'è di offensivo o sbagliato:\n`)}">Segnala un contenuto offensivo o inappropriato</a></p>` : ""}
  </section>`;
  attivaImmagini(app);
  if (voce.tipo === "mappa") {
    const canvas = $("canvas[data-mappa]", app);
    disegnaMappa(canvas, generaMappa(voce.mappa), { lato: 24 });
    canvas.addEventListener("click", () => canvas.classList.toggle("ingrandita"));
  }
  for (const id of inCorso) {
    const [vid, numero] = id.split(":");
    if (vid === voce.id) segnaInCorso($(`[data-azione="${numero ? "sviluppa-sessione" : "descrivi-mappa"}"]${numero ? `[data-numero="${numero}"]` : ""}`, app));
  }
}

function segnaInCorso(pulsante) {
  if (!pulsante) return;
  pulsante.disabled = true;
  pulsante.textContent = "Sto scrivendo… puoi continuare a leggere";
}

/* Generazioni che aggiornano una voce esistente: sessioni di campagna e aree della mappa. */
async function generaPerVoce(voce, chiave, tipo, dati, applica, pulsante) {
  if (inCorso.has(chiave)) return;
  inCorso.add(chiave);
  segnaInCorso(pulsante);
  try {
    const risultato = await genera(tipo, dati);
    const aggiornata = A.trova(voce.id);
    if (!aggiornata) return;
    applica(aggiornata, risultato);
    A.salva(aggiornata);
    avviso("Pronto!", "successo");
  } catch (err) {
    avviso(err.message, "errore");
  } finally {
    inCorso.delete(chiave);
    if (percorso()[0] === "voce" && percorso()[1] === voce.id) {
      const y = window.scrollY;
      mostraVoce(voce.id);
      window.scrollTo(0, y);
    }
  }
}

function tracciaSessione(parte) {
  return [parte.titolo, parte.obiettivo, ...(parte.scene || []).map((s) => `${s.titolo}: ${s.descrizione}`)].filter(Boolean).join(". ");
}

function diarioPrecedente(voce, numero) {
  return Object.entries(voce.diario || {})
    .filter(([n, t]) => Number(n) < numero && t.trim())
    .map(([n, t]) => `Sessione ${n}: ${t.trim()}`)
    .join("\n");
}

app.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-azione]");
  if (!b || b.tagName === "INPUT") return;
  const id = b.closest(".voce")?.dataset.id;
  const voce = id && A.trova(id);

  switch (b.dataset.azione) {
    case "stampa":
      $$("details", app).forEach((d) => (d.open = true));
      window.print();
      break;
    case "elimina":
      if (voce && (await conferma(`Eliminare "${titoloVoce(voce)}"? Non si può annullare.`, "Elimina"))) {
        A.elimina(voce.id);
        location.hash = "#/archivio";
      }
      break;
    case "sviluppa-sessione": {
      const numero = Number(b.dataset.numero);
      const parte = voce.risultato.struttura.find((p) => p.numero === numero);
      if (voce.sessioni?.[numero] && !(await conferma("Rigenerare questa sessione? La versione attuale verrà sostituita e userai una generazione.", "Rigenera"))) return;
      generaPerVoce(voce, `${voce.id}:${numero}`, "sessione",
        { ...voce.dati, numero, titolo: voce.risultato.titolo, sinossi: voce.risultato.sinossi, traccia: tracciaSessione(parte), diario: diarioPrecedente(voce, numero) },
        (v, r) => { v.sessioni = { ...(v.sessioni || {}), [numero]: r }; }, b);
      break;
    }
    case "descrivi-mappa": {
      const m = generaMappa(voce.mappa);
      generaPerVoce(voce, voce.id, "mappa",
        { ...voce.dati, stanze: m.stanze.map((s) => ({ larghezza: s.larghezza, altezza: s.altezza })) },
        (v, r) => { v.risultato = r; v.titolo = r.nome || v.titolo; }, b);
      break;
    }
    case "scarica-mappa": {
      const canvas = document.createElement("canvas");
      disegnaMappa(canvas, generaMappa(voce.mappa), { lato: 48, tema: b.dataset.tema, numeri: !b.dataset.senzaNumeri });
      canvas.toBlob((blob) => scarica(`${titoloVoce(voce).replace(/[^\p{L}\p{N}]+/gu, "-")}${b.dataset.senzaNumeri ? "-giocatori" : ""}.png`, blob), "image/png");
      break;
    }
    case "in-iniziativa":
      aggiungiCombattenti(b.dataset.nome, b.dataset.quantita, b.dataset.pf, b.dataset.ca);
      avviso(`${b.dataset.nome} aggiunto all'iniziativa (scheda Al tavolo).`, "successo");
      break;
    case "esporta":
      scarica(`taverna-delle-storie-${new Date().toISOString().slice(0, 10)}.json`, A.esporta());
      break;
  }
});

/* Il diario di sessione si salva mentre scrivi. */
let timerDiario;
app.addEventListener("input", (e) => {
  const area = e.target.closest("[data-diario]");
  if (!area) return;
  clearTimeout(timerDiario);
  timerDiario = setTimeout(() => {
    const voce = A.trova(area.closest(".voce").dataset.id);
    if (!voce) return;
    voce.diario = { ...(voce.diario || {}), [area.dataset.diario]: area.value };
    A.salva(voce);
  }, 600);
});

app.addEventListener("change", async (e) => {
  if (e.target.dataset.azione !== "importa") return;
  const file = e.target.files[0];
  if (!file) return;
  try {
    const n = A.importa(await file.text());
    avviso(`Copia caricata: ${n} elementi.`, "successo");
  } catch (err) {
    avviso(err.message === "spazio_esaurito" ? "Spazio sul telefono esaurito." : "Questo file non è una copia di Taverna delle storie.", "errore");
  }
  e.target.value = "";
});

app.addEventListener("submit", (e) => {
  if (e.target.dataset.form !== "preferenze") return;
  e.preventDefault();
  const d = datiForm(e.target);
  A.salvaPreferenze({ edizione: d.edizione, numeroPG: d.numeroPG, livello: d.livello, codice: d.codice.trim() });
  avviso("Impostazioni salvate.", "successo");
});

/* ---------- Avvio ---------- */

window.addEventListener("hashchange", mostra);
window.addEventListener("offline", () => avviso(messaggioErrore("offline")));
window.addEventListener("error", (e) => console.error(e.error));
window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.message === "spazio_esaurito") avviso("Spazio sul telefono esaurito: elimina qualcosa dall'archivio o scarica una copia.", "errore");
});
mostra();

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
