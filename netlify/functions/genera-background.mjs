/*
 * Funzione in background: può durare fino a 15 minuti, quindi regge anche
 * le generazioni lunghe. Il risultato viene salvato e il browser lo legge da /api/stato.
 */
import Anthropic from "@anthropic-ai/sdk";
import { costruisciPrompt } from "../lib/prompt.mjs";
import { lavori } from "../lib/comune.mjs";

const client = new Anthropic();
const MODELLO = process.env.MODELLO || "claude-opus-5-5";
const IMPEGNO = process.env.IMPEGNO || "medium";

/* Estrae l'oggetto JSON anche se il modello aggiunge qualcosa attorno. */
function leggiJSON(testo) {
  const inizio = testo.indexOf("{");
  const fine = testo.lastIndexOf("}");
  if (inizio < 0 || fine <= inizio) throw new Error("nessun JSON");
  return JSON.parse(testo.slice(inizio, fine + 1));
}

async function chiamaClaude(system, utente) {
  const risposta = await client.beta.messages.create({
    model: MODELLO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: IMPEGNO },
    system,
    messages: [{ role: "user", content: utente }],
  });
  if (risposta.stop_reason === "refusal") throw Object.assign(new Error("rifiuto"), { codice: "rifiuto" });
  if (risposta.stop_reason === "max_tokens") throw Object.assign(new Error("troppo lungo"), { codice: "troppo_lungo" });
  const testo = risposta.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return leggiJSON(testo);
}

function codiceErrore(err) {
  if (err.codice) return err.codice;
  if (err instanceof Anthropic.AuthenticationError) return "chiave_non_valida";
  if (err instanceof Anthropic.RateLimitError) return "troppe_richieste";
  if (err instanceof Anthropic.InternalServerError) return "servizio_sovraccarico";
  if (err instanceof Anthropic.APIConnectionError) return "connessione";
  if (err instanceof Anthropic.APIError) return err.status === 529 ? "servizio_sovraccarico" : "errore_servizio";
  if (err instanceof SyntaxError || err.message === "nessun JSON") return "formato";
  return "sconosciuto";
}

export default async (req) => {
  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return;

  const store = lavori();
  const lavoro = await store.get(id, { type: "json" });
  // Solo i lavori registrati da /api/avvia e non ancora partiti: niente generazioni fuori quota.
  if (!lavoro || lavoro.stato !== "attesa") return;
  await store.setJSON(id, { ...lavoro, stato: "in_corso" });

  const { system, utente } = costruisciPrompt(lavoro.tipo, lavoro.dati);
  let risultato;
  try {
    try {
      risultato = await chiamaClaude(system, utente);
    } catch (err) {
      // Un JSON malformato capita di rado: un secondo tentativo di solito basta.
      if (codiceErrore(err) !== "formato") throw err;
      risultato = await chiamaClaude(system, utente);
    }
    await store.setJSON(id, { stato: "pronto", tipo: lavoro.tipo, dati: lavoro.dati, risultato, creato: lavoro.creato });
  } catch (err) {
    console.error(err);
    await store.setJSON(id, { stato: "errore", errore: codiceErrore(err), creato: lavoro.creato });
  }
};

// Il suffisso -background nel nome basta già; la dichiarazione esplicita è il modo consigliato oggi.
export const config = { background: true };
