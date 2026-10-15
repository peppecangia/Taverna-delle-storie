import { getStore } from "@netlify/blobs";

export const lavori = () => getStore({ name: "lavori", consistency: "strong" });
export const quote = () => getStore({ name: "quote", consistency: "strong" });

export function json(stato, corpo) {
  return new Response(JSON.stringify(corpo), {
    status: stato,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const oggi = () => new Date().toISOString().slice(0, 10);

export const limiteGiornaliero = () => {
  const n = parseInt(process.env.LIMITE_GIORNALIERO ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : 5;
};

/* Il codice illimitato serve al proprietario dell'app per provarla senza limiti. */
export function haCodiceIllimitato(req) {
  const atteso = process.env.CODICE_ILLIMITATO;
  return Boolean(atteso) && req.headers.get("x-codice") === atteso;
}
