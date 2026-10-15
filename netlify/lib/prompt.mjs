/*
 * Istruzioni per Claude. Stanno sul server: chi usa l'app sceglie solo il tipo
 * di contenuto e i parametri, non può mandare richieste libere a spese nostre.
 */

const EDIZIONI = {
  "5e": `Regole: quinta edizione, contenuti del System Reference Document 5.1 (licenza CC-BY 4.0).
Usa grado di sfida (GS), classe difficoltà (CD) tipiche 10 facile, 15 media, 20 difficile, 25 molto difficile.
Abilità in italiano: Acrobazia, Addestrare Animali, Arcano, Atletica, Furtività, Indagare, Inganno, Intimidire,
Intrattenere, Intuizione, Medicina, Natura, Percezione, Persuasione, Rapidità di Mano, Religione, Sopravvivenza, Storia.
Tiri salvezza su Forza, Destrezza, Costituzione, Intelligenza, Saggezza, Carisma.`,
  "3.5": `Regole: edizione 3.5, contenuti del System Reference Document 3.5 (licenza OGL 1.0a).
Usa grado di sfida (GS), livello incontro (LI) e classe difficoltà (CD) tipiche 10 facile, 15 media, 20 difficile, 25+ eroica.
Abilità in italiano: Ascoltare, Cercare, Osservare, Disattivare Congegni, Scassinare Serrature, Diplomazia, Raggirare,
Intimidire, Percepire Intenzioni, Sapienza Magica, Conoscenze (arcane, storia, religioni, natura, dungeon, nobiltà),
Equilibrio, Scalare, Saltare, Nuotare, Nascondersi, Muoversi Silenziosamente, Sopravvivenza, Guarire, Utilizzare Corde.
Tiri salvezza: Tempra, Riflessi, Volontà.`,
};

const BASE = `Sei un Dungeon Master esperto che prepara materiale pronto da usare al tavolo per un altro master.
Scrivi in italiano, con uno stile evocativo ma concreto: ogni elemento deve essere giocabile, con numeri e scelte chiare.
Usa solo mostri, incantesimi e oggetti presenti nei documenti SRD o creati da te. Non usare creature e nomi
protetti come beholder, mind flayer, illithid, githyanki, githzerai, bestia distorcente, slaad, umber hulk, yuan-ti,
né ambientazioni ufficiali (Forgotten Realms, Greyhawk, Eberron). Inventa nomi propri originali.
Calibra difficoltà, CD, danni e tesori sul numero e sul livello dei personaggi indicati.
Per ogni momento che lo richiede proponi musica: "atmosfera" descrive il mood in poche parole,
"ricerca" è una breve frase di ricerca in inglese adatta a YouTube e Spotify (es. "dark dungeon ambience",
"medieval tavern music", "epic orchestral boss battle"). Non scrivere mai link o URL.
I campi "promptImmagine" sono descrizioni visive in inglese, 20-40 parole, stile "fantasy illustration",
senza testo nell'immagine e senza nomi propri.
Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo e senza blocchi di codice.`;

const MUSICA = `{"atmosfera": "...", "ricerca": "..."}`;

const SCHEMI = {
  avventura: (d) => `Crea ${d.formato === "campagna"
    ? `il progetto di una campagna di ${d.sessioni} sessioni da circa ${d.durataOre} ore ciascuna. In "struttura" metti una voce per sessione con 1-2 scene principali descritte in sintesi: le sessioni verranno sviluppate in dettaglio una alla volta in seguito`
    : `una one shot da giocare in circa ${d.durataOre} ore, divisa in 3-5 atti. In "struttura" metti gli atti con tutte le scene sviluppate in dettaglio`}.
Gruppo: ${d.numeroPG} personaggi di livello ${d.livello}.
Ambientazione: ${d.ambientazione || "a tua scelta"}. Tono: ${d.tono || "a tua scelta"}.
${d.temi ? `Temi ed elementi richiesti: ${d.temi}.` : ""}
${d.note ? `Note del master: ${d.note}.` : ""}
Includi almeno un enigma o indovinello e almeno una trappola o pericolo ambientale dove ha senso.
Formato JSON:
{
 "titolo": "...", "sinossi": "3-4 frasi", "gancio": "come coinvolgere i personaggi",
 "struttura": [{
   "numero": 1, "titolo": "...", "obiettivo": "...", "durata": "es. 45 minuti",
   "scene": [{
     "titolo": "...", "tipo": "esplorazione|sociale|combattimento|enigma|viaggio|riposo",
     "testoDaLeggere": "testo da leggere ad alta voce ai giocatori, 2-4 frasi",
     "descrizione": "cosa succede e cosa sa il master",
     "prove": [{"abilita": "...", "cd": 15, "esito": "..."}],
     "incontro": null oppure {"nemici": [{"nome": "...", "quantita": 2, "gs": "1/2"}], "tattiche": "...", "terreno": "..."},
     "enigma": null oppure {"testo": "...", "soluzione": "...", "indizi": ["...", "...", "..."]},
     "trappola": null oppure {"nome": "...", "individuare": "abilità e CD", "disattivare": "abilità e CD", "effetto": "..."},
     "musica": ${MUSICA}
   }]
 }],
 "antagonista": {"nome": "...", "chiE": "...", "obiettivo": "...", "metodi": "...", "segreto": "...", "statistiche": "CA, PF, attacchi principali, GS", "musica": ${MUSICA}},
 "png": [{"nome": "...", "ruolo": "...", "aspetto": "...", "carattere": "...", "voce": "come interpretarlo", "segreto": "..."}],
 "luoghi": [{"nome": "...", "descrizione": "...", "dettagli": ["..."], "promptImmagine": "..."}],
 "tesori": [{"nome": "...", "dove": "...", "descrizione": "..."}],
 "finali": [{"condizione": "se i personaggi...", "esito": "..."}],
 "consigli": ["consigli pratici per il master"],
 "seguiti": ["idee per continuare la storia"]
}
Metti 4-6 PNG e 2-4 luoghi.`,

  sessione: (d) => `Sviluppa in dettaglio la sessione ${d.numero} della campagna "${d.titolo}".
Gruppo: ${d.numeroPG} personaggi di livello ${d.livello}. Durata: circa ${d.durataOre} ore.
Riassunto della campagna: ${d.sinossi}
Traccia prevista per questa sessione: ${d.traccia}
${d.diario ? `Cosa è successo finora al tavolo (ha la precedenza sulla traccia): ${d.diario}` : ""}
Formato JSON:
{
 "titolo": "...", "riassuntoIniziale": "testo per ricordare ai giocatori la sessione precedente",
 "obiettivo": "...",
 "scene": [ come nelle avventure: {"titolo","tipo","testoDaLeggere","descrizione","prove","incontro","enigma","trappola","musica": ${MUSICA}} ],
 "png": [{"nome","ruolo","aspetto","carattere","voce","segreto"}],
 "tesori": [{"nome","dove","descrizione"}],
 "finaleSessione": "un momento forte su cui chiudere",
 "consigli": ["..."]
}
Metti 4-7 scene.`,

  png: (d) => `Crea ${d.quantita} personaggi non giocanti.
${d.ruolo ? `Ruolo: ${d.ruolo}.` : ""} ${d.razza ? `Razza: ${d.razza}.` : ""}
Livello o potenza adatta a un gruppo di livello ${d.livello}. ${d.note ? `Note: ${d.note}.` : ""}
Formato JSON:
{"png": [{
 "nome": "...", "razza": "...", "ruolo": "...", "allineamento": "...",
 "aspetto": "...", "personalita": "...", "voce": "come parla, intercalari, gestualità",
 "motivazione": "...", "segreto": "...", "gancio": "come usarlo in una storia",
 "frasi": ["3 frasi tipiche tra virgolette"],
 "statistiche": {"ca": 12, "pf": 22, "velocita": "9 m", "caratteristiche": {"for": 10, "des": 12, "cos": 12, "int": 10, "sag": 14, "car": 16},
   "attacchi": ["..."], "abilita": ["..."], "capacita": ["..."], "gs": "1"},
 "promptImmagine": "ritratto: ..."
}]}`,

  luogo: (d) => `Crea un luogo: ${d.tipoLuogo}. ${d.ambiente ? `Ambiente: ${d.ambiente}.` : ""}
Per un gruppo di ${d.numeroPG} personaggi di livello ${d.livello}. ${d.note ? `Note: ${d.note}.` : ""}
Formato JSON:
{"nome": "...", "descrizione": "...", "testoDaLeggere": "2-4 frasi da leggere ai giocatori",
 "zone": [{"nome": "...", "descrizione": "...", "cosaSiTrova": "...", "pericoli": "..."}],
 "png": [{"nome": "...", "ruolo": "...", "carattere": "..."}],
 "voci": ["dicerie che si sentono"], "segreti": ["..."],
 "promptImmagine": "...", "musica": ${MUSICA}}
Metti 4-6 zone.`,

  enigma: (d) => `Crea ${d.quantita} enigmi di tipo "${d.tipoEnigma}", difficoltà ${d.difficolta}, per personaggi di livello ${d.livello}.
${d.tema ? `Tema o luogo: ${d.tema}.` : ""}
Devono essere risolvibili dai giocatori veri, non solo con un tiro di dado, e avere una soluzione univoca e verificabile.
Gli indovinelli in rima devono rimare davvero in italiano.
Formato JSON:
{"enigmi": [{
 "titolo": "...", "tipo": "...",
 "testoPerGiocatori": "testo o descrizione da mostrare",
 "soluzione": "...", "spiegazione": "perché la soluzione è quella",
 "indizi": ["indizio leggero", "indizio medio", "indizio quasi risolutivo"],
 "aiutoConDadi": {"abilita": "...", "cd": 15, "effetto": "quale indizio si ottiene"},
 "seSbagliano": "...", "ricompensa": "..."
}]}`,

  trappola: (d) => `Crea ${d.quantita} trappole o pericoli. Luogo: ${d.luogo || "dungeon"}. Pericolosità: ${d.pericolo}.
Per ${d.numeroPG} personaggi di livello ${d.livello}.
Formato JSON:
{"trappole": [{
 "nome": "...", "descrizione": "cosa vedono o non vedono i personaggi", "innesco": "...",
 "individuare": {"abilita": "...", "cd": 15}, "disattivare": {"abilita": "...", "cd": 15},
 "tiroSalvezza": "tipo e CD", "effetto": "...", "danni": "es. 4d10 contundenti",
 "aggirare": "modi creativi per evitarla", "varianti": "come renderla più o meno letale"
}]}`,

  tesoro: (d) => `Crea un ${d.tipoTesoro} adatto a ${d.numeroPG} personaggi di livello ${d.livello}.
${d.tema ? `Contesto: ${d.tema}.` : ""} Rispetta le quantità consigliate dalle regole per quel livello.
Formato JSON:
{"titolo": "...", "monete": "es. 230 mo, 1.200 ma",
 "gemmeEArte": [{"nome": "...", "valore": "..."}],
 "oggettiMagici": [{"nome": "...", "tipo": "...", "rarita": "...", "sintonia": false, "descrizione": "...", "effetto": "regole precise"}],
 "curiosita": ["oggetti strani non magici che raccontano una storia"],
 "ganci": ["storie legate al tesoro"]}`,

  incontro: (d) => `Crea un incontro di combattimento di difficoltà ${d.difficolta} per ${d.numeroPG} personaggi di livello ${d.livello}.
Ambiente: ${d.ambiente || "a tua scelta"}. ${d.tema ? `Tema: ${d.tema}.` : ""}
Rispetta il budget di difficoltà delle regole (punti esperienza in 5e, livello incontro in 3.5).
In "gs" usa il formato "1/4", "1/2", "3".
Formato JSON:
{"titolo": "...", "descrizione": "situazione e motivazioni dei nemici",
 "testoDaLeggere": "...",
 "nemici": [{"nome": "...", "quantita": 3, "gs": "1/2", "ca": 13, "pf": 11, "attacchi": "...", "capacita": "...", "tattiche": "..."}],
 "terreno": ["elementi del campo di battaglia utili in combattimento"],
 "svolte": ["eventi che cambiano lo scontro a metà"],
 "seFuggono": "...", "ricompense": "...", "musica": ${MUSICA}}`,

  mappa: (d) => `Questa è la pianta di un ${d.tipoMappa} già disegnata, con ${d.stanze.length} aree numerate.
Tema: ${d.tema || "a tua scelta"}. Per ${d.numeroPG} personaggi di livello ${d.livello}.
Aree (numero: dimensioni in quadretti da 1,5 m): ${d.stanze.map((s) => `${s.numero}: ${s.larghezza}x${s.altezza}`).join("; ")}.
Riempi ogni area in modo coerente, con un percorso che culmini nell'area più grande o più lontana.
Formato JSON:
{"nome": "...", "storia": "chi l'ha costruito e cosa succede ora", "musica": ${MUSICA},
 "aree": [{"numero": 1, "nome": "...", "testoDaLeggere": "...", "contenuto": "...",
   "incontro": null oppure "nemici e numero", "trappola": null oppure "...", "tesoro": null oppure "..."}]}`,
};

export const TIPI = Object.keys(SCHEMI);

export function costruisciPrompt(tipo, dati) {
  const edizione = dati.edizione === "3.5" ? "3.5" : "5e";
  return {
    system: `${BASE}\n\n${EDIZIONI[edizione]}`,
    utente: SCHEMI[tipo](dati),
  };
}

/* Pulisce i dati in ingresso: solo campi attesi, testi corti, numeri nei limiti. */
export function pulisciDati(grezzi) {
  const g = grezzi && typeof grezzi === "object" ? grezzi : {};
  const testo = (v, max = 400) => (typeof v === "string" ? v.slice(0, max).trim() : "");
  const num = (v, min, max, def) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : def;
  };
  const stanze = Array.isArray(g.stanze)
    ? g.stanze.slice(0, 30).map((s, i) => ({
        numero: i + 1,
        larghezza: num(s?.larghezza, 1, 60, 4),
        altezza: num(s?.altezza, 1, 60, 4),
      }))
    : [];
  return {
    edizione: g.edizione === "3.5" ? "3.5" : "5e",
    formato: g.formato === "campagna" ? "campagna" : "oneshot",
    sessioni: num(g.sessioni, 2, 20, 6),
    durataOre: num(g.durataOre, 1, 8, 4),
    numeroPG: num(g.numeroPG, 1, 10, 4),
    livello: num(g.livello, 1, 20, 3),
    quantita: num(g.quantita, 1, 5, 1),
    numero: num(g.numero, 1, 20, 1),
    ambientazione: testo(g.ambientazione),
    tono: testo(g.tono, 100),
    temi: testo(g.temi),
    note: testo(g.note, 600),
    ruolo: testo(g.ruolo, 100),
    razza: testo(g.razza, 60),
    tipoLuogo: testo(g.tipoLuogo, 100) || "luogo a sorpresa",
    ambiente: testo(g.ambiente, 100),
    tipoEnigma: testo(g.tipoEnigma, 60) || "indovinello",
    difficolta: testo(g.difficolta, 30) || "media",
    tema: testo(g.tema, 200),
    luogo: testo(g.luogo, 100),
    pericolo: testo(g.pericolo, 30) || "media",
    tipoTesoro: testo(g.tipoTesoro, 60) || "tesoretto",
    tipoMappa: testo(g.tipoMappa, 30) || "dungeon",
    stanze,
    titolo: testo(g.titolo, 120),
    sinossi: testo(g.sinossi, 1200),
    traccia: testo(g.traccia, 1500),
    diario: testo(g.diario, 3000),
  };
}
