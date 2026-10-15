/*
 * Riceve una richiesta di generazione, controlla il limite giornaliero,
 * la registra e fa partire la funzione in background che chiama Claude.
 * GET restituisce solo quante generazioni restano oggi.
 */
import { createHash, randomUUID } from "node:crypto";
import { TIPI, pulisciDati } from "../lib/prompt.mjs";
import { lavori, quote, json, oggi, limiteGiornaliero, haCodiceIllimitato } from "../lib/comune.mjs";

const hash = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 32);

export default async (req, context) => {
  if (!process.env.ANTHROPIC_API_KEY)
    return json(500, { errore: "chiave_mancante" });

  const dispositivo = (req.headers.get("x-dispositivo") || "").slice(0, 64);
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(dispositivo))
    return json(400, { errore: "dispositivo_non_valido" });

  const illimitato = haCodiceIllimitato(req);
  const limite = limiteGiornaliero();
  const giorno = oggi();
  const chiaveDisp = `${giorno}/d/${dispositivo}`;
  // Più dispositivi possono condividere la stessa rete (famiglia, wifi pubblico): limite più largo.
  const chiaveIp = `${giorno}/ip/${hash(context.ip || "sconosciuto")}`;
  const store = quote();
  const [usateDisp, usateIp] = await Promise.all([
    store.get(chiaveDisp, { type: "json" }).then((v) => v || 0),
    store.get(chiaveIp, { type: "json" }).then((v) => v || 0),
  ]);
  const rimaste = illimitato ? null : Math.max(0, limite - usateDisp);

  if (req.method === "GET") return json(200, { rimaste, limite, illimitato });
  if (req.method !== "POST") return json(405, { errore: "metodo_non_consentito" });

  if (!illimitato && (usateDisp >= limite || usateIp >= limite * 4))
    return json(429, { errore: "limite_raggiunto", rimaste: 0, limite });

  let corpo;
  try {
    corpo = await req.json();
  } catch {
    return json(400, { errore: "richiesta_non_valida" });
  }
  if (!TIPI.includes(corpo?.tipo)) return json(400, { errore: "tipo_sconosciuto" });

  const id = randomUUID();
  await lavori().setJSON(id, {
    stato: "attesa",
    tipo: corpo.tipo,
    dati: pulisciDati(corpo.dati),
    creato: Date.now(),
  });

  const avvio = await fetch(new URL("/.netlify/functions/genera-background", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!avvio.ok && avvio.status !== 202) {
    await lavori().delete(id);
    return json(502, { errore: "avvio_fallito" });
  }

  if (!illimitato)
    await Promise.all([store.setJSON(chiaveDisp, usateDisp + 1), store.setJSON(chiaveIp, usateIp + 1)]);

  // Ogni tanto cancella i contatori dei giorni passati: non servono più.
  if (Math.random() < 0.05) {
    const { blobs } = await store.list();
    await Promise.all(blobs.filter((b) => !b.key.startsWith(giorno)).map((b) => store.delete(b.key)));
  }

  return json(202, { id, rimaste: illimitato ? null : rimaste - 1 });
};

export const config = { path: "/api/avvia" };
