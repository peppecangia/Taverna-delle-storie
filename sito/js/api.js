/* Comunicazione con il server: avvia una generazione e aspetta il risultato. */
import { dispositivo, preferenze } from "./archivio.js";

const MESSAGGI = {
  chiave_mancante: "Il servizio non è ancora configurato: manca la chiave API sul server.",
  chiave_non_valida: "La chiave API sul server non è valida o è scaduta.",
  limite_raggiunto: "Hai usato tutte le generazioni gratuite di oggi. Domani il contatore riparte.",
  troppe_richieste: "Troppe richieste ravvicinate. Aspetta un minuto e riprova.",
  servizio_sovraccarico: "Il servizio è sovraccarico in questo momento. Riprova tra qualche minuto.",
  errore_servizio: "Il servizio ha risposto con un errore. Riprova.",
  connessione: "Il server non riesce a raggiungere il servizio AI. Riprova.",
  formato: "La risposta non era nel formato atteso. Riprova: capita di rado.",
  troppo_lungo: "La richiesta era troppo ampia. Prova con meno sessioni o meno elementi.",
  rifiuto: "Il servizio ha rifiutato questa richiesta. Prova a riformulare le note.",
  scaduto: "La generazione ha impiegato troppo tempo. Riprova.",
  offline: "Sei offline. Le generazioni richiedono la connessione; dadi, mappe e strumenti da tavolo funzionano comunque.",
};

export const messaggioErrore = (codice) => MESSAGGI[codice] || "Qualcosa è andato storto. Riprova.";

class ErroreGenerazione extends Error {
  constructor(codice) {
    super(messaggioErrore(codice));
    this.codice = codice;
  }
}

function intestazioni() {
  const h = { "Content-Type": "application/json", "X-Dispositivo": dispositivo() };
  const codice = preferenze().codice;
  if (codice) h["X-Codice"] = codice;
  return h;
}

export async function generazioniRimaste() {
  try {
    const r = await fetch("/api/avvia", { headers: intestazioni() });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/*
 * Avvia la generazione e controlla lo stato ogni 3 secondi.
 * alPasso riceve messaggi di avanzamento da mostrare all'utente.
 */
export async function genera(tipo, dati, alPasso = () => {}) {
  if (!navigator.onLine) throw new ErroreGenerazione("offline");
  let avvio;
  try {
    avvio = await fetch("/api/avvia", { method: "POST", headers: intestazioni(), body: JSON.stringify({ tipo, dati }) });
  } catch {
    throw new ErroreGenerazione("offline");
  }
  const corpo = await avvio.json().catch(() => ({}));
  if (!avvio.ok) throw new ErroreGenerazione(corpo.errore || "errore_servizio");
  alPasso({ fase: "avviata", rimaste: corpo.rimaste });

  const inizio = Date.now();
  while (Date.now() - inizio < 16 * 60 * 1000) {
    await pausa(3000);
    let stato;
    try {
      const r = await fetch(`/api/stato?id=${corpo.id}`, { headers: intestazioni() });
      stato = await r.json();
      if (!r.ok) throw new ErroreGenerazione(stato.errore === "non_trovato" ? "scaduto" : "errore_servizio");
    } catch (err) {
      if (err instanceof ErroreGenerazione) throw err;
      continue; // connessione ballerina: riprova al giro dopo
    }
    if (stato.stato === "pronto") return stato.risultato;
    if (stato.stato === "errore") throw new ErroreGenerazione(stato.errore);
    alPasso({ fase: stato.stato, secondi: Math.round((Date.now() - inizio) / 1000) });
  }
  throw new ErroreGenerazione("scaduto");
}
