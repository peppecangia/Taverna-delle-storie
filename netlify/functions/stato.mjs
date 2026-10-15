/* Il browser chiede ogni pochi secondi a che punto è una generazione. */
import { lavori, json } from "../lib/comune.mjs";

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return json(400, { errore: "id_non_valido" });

  const store = lavori();
  const lavoro = await store.get(id, { type: "json" });
  if (!lavoro) return json(404, { errore: "non_trovato" });

  if (lavoro.stato === "pronto" || lavoro.stato === "errore") {
    // Consegnato una volta, poi cancellato: il contenuto resta solo sul telefono dell'utente.
    await store.delete(id);
    return json(200, lavoro);
  }
  if (Date.now() - lavoro.creato > 15 * 60 * 1000) {
    await store.delete(id);
    return json(200, { stato: "errore", errore: "scaduto" });
  }
  return json(200, { stato: lavoro.stato });
};

export const config = { path: "/api/stato" };
