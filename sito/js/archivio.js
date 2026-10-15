/*
 * Tutto resta sul telefono (localStorage). Esporta e importa servono
 * come copia di sicurezza o per passare i dati su un altro dispositivo.
 */

const CHIAVE = "taverna.archivio.v1";
const PREFERENZE = "taverna.preferenze.v1";

function leggi(chiave, predefinito) {
  try {
    const v = localStorage.getItem(chiave);
    return v ? JSON.parse(v) : predefinito;
  } catch {
    return predefinito;
  }
}

function scrivi(chiave, valore) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
    return true;
  } catch {
    return false;
  }
}

export const elenco = () => leggi(CHIAVE, []);

export function salva(voce) {
  const tutte = elenco();
  const i = tutte.findIndex((v) => v.id === voce.id);
  const aggiornata = { ...voce, modificato: Date.now() };
  if (i >= 0) tutte[i] = aggiornata;
  else tutte.unshift({ ...aggiornata, creato: Date.now() });
  if (!scrivi(CHIAVE, tutte)) throw new Error("spazio_esaurito");
  return aggiornata;
}

export const trova = (id) => elenco().find((v) => v.id === id);

export function elimina(id) {
  scrivi(CHIAVE, elenco().filter((v) => v.id !== id));
}

export function nuovoId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function esporta() {
  return JSON.stringify({ app: "taverna-delle-storie", versione: 1, data: new Date().toISOString(), voci: elenco() }, null, 2);
}

/* Unisce senza cancellare: a parità di id tiene la versione modificata più di recente. */
export function importa(testo) {
  const dati = JSON.parse(testo);
  if (dati?.app !== "taverna-delle-storie" || !Array.isArray(dati.voci)) throw new Error("file_non_valido");
  const mappa = new Map(elenco().map((v) => [v.id, v]));
  for (const v of dati.voci) {
    if (!v?.id || !v?.tipo) continue;
    const esistente = mappa.get(v.id);
    if (!esistente || (v.modificato || 0) > (esistente.modificato || 0)) mappa.set(v.id, v);
  }
  const unite = [...mappa.values()].sort((a, b) => (b.modificato || 0) - (a.modificato || 0));
  if (!scrivi(CHIAVE, unite)) throw new Error("spazio_esaurito");
  return dati.voci.length;
}

export const preferenze = () =>
  leggi(PREFERENZE, { edizione: "5e", numeroPG: 4, livello: 3, codice: "" });

export function salvaPreferenze(p) {
  scrivi(PREFERENZE, { ...preferenze(), ...p });
}

/* Stato persistente di strumenti come il tracciatore di iniziativa. */
export const stato = (nome, predefinito) => leggi(`taverna.${nome}`, predefinito);
export const salvaStato = (nome, valore) => scrivi(`taverna.${nome}`, valore);

export function dispositivo() {
  let id = stato("dispositivo", null);
  if (!id) {
    id = nuovoId();
    salvaStato("dispositivo", id);
  }
  return id;
}
