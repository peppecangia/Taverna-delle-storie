/* Pagina iniziale con i generatori e i moduli di ciascuno. */
import { campo, selezione, numero, testo, area, scelte, esc } from "../ui.js";
import { preferenze } from "../archivio.js";

export const GENERATORI = [
  { tipo: "avventura", icona: "📜", nome: "Avventura", descr: "One shot da 3-4 ore o campagna a più sessioni" },
  { tipo: "png", icona: "🎭", nome: "Personaggi non giocanti", descr: "Con carattere, voce, segreti, statistiche e ritratto" },
  { tipo: "mappa", icona: "🗺️", nome: "Mappa tattica", descr: "Dungeon o caverna a griglia, da stampare o proiettare", gratis: true },
  { tipo: "luogo", icona: "🏰", nome: "Luogo illustrato", descr: "Città, taverna, rovine, foresta: zone, dicerie, segreti" },
  { tipo: "incontro", icona: "⚔️", nome: "Incontro", descr: "Bilanciato sul gruppo, con controllo della difficoltà" },
  { tipo: "enigma", icona: "🧩", nome: "Enigmi e indovinelli", descr: "Con indizi graduati e soluzione nascosta" },
  { tipo: "trappola", icona: "⚠️", nome: "Trappole", descr: "CD per individuarle e disattivarle, danni, varianti" },
  { tipo: "tesoro", icona: "💰", nome: "Tesoro", descr: "Monete, oggetti magici e curiosità adatti al livello" },
];

const TONI = ["a sorpresa", "avventura classica", "eroico ed epico", "cupo e horror", "mistero e indagine", "leggero e comico", "intrighi politici", "esplorazione e sopravvivenza"];
const AMBIENTAZIONI = ["", "regno medievale classico", "terre selvagge e foreste antiche", "città portuale piena di intrighi", "deserto e rovine sepolte", "montagne innevate e regni nanici", "paludi e terre maledette", "arcipelago e mare aperto", "sottosuolo e caverne profonde"];

function comuni(p) {
  return `<fieldset class="gruppo">
    <legend>Il tavolo</legend>
    ${campo("Edizione", scelte("edizione", [["5e", "5ª edizione"], ["3.5", "Edizione 3.5"]], p.edizione))}
    <div class="due">
      ${campo("Personaggi giocanti", numero("numeroPG", p.numeroPG, 1, 10))}
      ${campo("Livello", numero("livello", p.livello, 1, 20))}
    </div>
  </fieldset>`;
}

const SPECIFICI = {
  avventura: () => `
    <fieldset class="gruppo"><legend>La storia</legend>
      ${campo("Formato", scelte("formato", [["oneshot", "One shot"], ["campagna", "Campagna"]], "oneshot"))}
      <div class="due">
        ${campo("Durata di una sessione (ore)", numero("durataOre", 4, 1, 8))}
        ${campo("Numero di sessioni", numero("sessioni", 6, 2, 20), "Solo per le campagne")}
      </div>
      ${campo("Tono", selezione("tono", TONI, TONI[0]))}
      ${campo("Ambientazione", selezione("ambientazione", AMBIENTAZIONI.map((a) => [a, a || "a sorpresa"]), ""))}
      ${campo("Temi o elementi da includere", testo("temi", "es. un drago, un tradimento, una nave volante"))}
      ${campo("Note per l'AI", area("note", "es. un giocatore è alle prime armi; niente ragni; il gruppo ama i combattimenti"))}
    </fieldset>`,
  png: () => `
    <fieldset class="gruppo"><legend>Chi ti serve</legend>
      ${campo("Quanti", numero("quantita", 1, 1, 3))}
      ${campo("Ruolo", testo("ruolo", "es. oste, mercante losco, cavaliere caduto, cattivo principale"))}
      ${campo("Razza", testo("razza", "a sorpresa"))}
      ${campo("Note", area("note", "es. deve avere un legame con il passato di un personaggio"))}
    </fieldset>`,
  luogo: () => `
    <fieldset class="gruppo"><legend>Il luogo</legend>
      ${campo("Che luogo", selezione("tipoLuogo", ["villaggio", "città", "taverna", "castello", "tempio", "rovine antiche", "foresta", "torre del mago", "porto", "accampamento", "palazzo nobiliare", "luogo a sorpresa"], "taverna"))}
      ${campo("Ambiente", testo("ambiente", "es. montagna innevata, palude, deserto"))}
      ${campo("Note", area("note", "es. è controllato in segreto da una gilda di ladri"))}
    </fieldset>`,
  incontro: () => `
    <fieldset class="gruppo"><legend>Lo scontro</legend>
      ${campo("Difficoltà", scelte("difficolta", [["facile", "Facile"], ["media", "Media"], ["difficile", "Difficile"], ["letale", "Letale"]], "media"))}
      ${campo("Ambiente", testo("ambiente", "es. ponte di corda sopra un burrone"))}
      ${campo("Tema", testo("tema", "es. non morti, banditi, bestie della foresta"))}
    </fieldset>`,
  enigma: () => `
    <fieldset class="gruppo"><legend>L'enigma</legend>
      ${campo("Tipo", selezione("tipoEnigma", ["indovinello in rima", "meccanismo o leve", "enigma logico", "rune e simboli", "porta parlante", "sequenza o schema", "a sorpresa"], "indovinello in rima"))}
      ${campo("Difficoltà", scelte("difficolta", [["facile", "Facile"], ["media", "Media"], ["difficile", "Difficile"]], "media"))}
      ${campo("Quanti", numero("quantita", 2, 1, 4))}
      ${campo("Tema o luogo", testo("tema", "es. tomba di un re, biblioteca del mago"))}
    </fieldset>`,
  trappola: () => `
    <fieldset class="gruppo"><legend>Le trappole</legend>
      ${campo("Luogo", testo("luogo", "es. corridoio di una cripta"))}
      ${campo("Pericolosità", scelte("pericolo", [["fastidiosa", "Fastidiosa"], ["media", "Pericolosa"], ["letale", "Letale"]], "media"))}
      ${campo("Quante", numero("quantita", 2, 1, 4))}
    </fieldset>`,
  tesoro: () => `
    <fieldset class="gruppo"><legend>Il tesoro</legend>
      ${campo("Tipo", selezione("tipoTesoro", [["bottino di un singolo nemico", "Bottino di un nemico"], ["tesoretto di un covo", "Tesoretto di un covo"], ["tesoro di un drago o di fine avventura", "Grande tesoro finale"]], "tesoretto di un covo"))}
      ${campo("Contesto", testo("tema", "es. covo di pirati, tomba di un elfo"))}
    </fieldset>`,
  mappa: () => `
    <fieldset class="gruppo"><legend>La mappa</legend>
      ${campo("Tipo", scelte("tipoMappa", [["dungeon", "Dungeon"], ["caverna", "Caverna"]], "dungeon"))}
      ${campo("Dimensione", scelte("dimensione", [["piccola", "Piccola"], ["media", "Media"], ["grande", "Grande"]], "media"))}
      ${campo("Tema", testo("tema", "es. cripta di un culto, miniera abbandonata"), "Serve solo se poi riempi le aree con l'AI")}
    </fieldset>`,
};

export function paginaHome(rimaste) {
  return `<section class="pagina">
    <div class="benvenuto">
      <h1>Taverna delle storie</h1>
      <p>Tutto quello che serve al master per preparare la prossima sessione.</p>
      ${rimaste?.illimitato ? `<p class="contatore">Generazioni illimitate attive</p>` : rimaste ? `<p class="contatore">Generazioni AI rimaste oggi: <b>${rimaste.rimaste}</b> su ${rimaste.limite}</p>` : ""}
    </div>
    <div class="griglia-generatori">
      ${GENERATORI.map((g) => `<a class="carta-gen" href="#/crea/${g.tipo}">
        <span class="icona" aria-hidden="true">${g.icona}</span>
        <span class="nome">${g.nome}</span><span class="descr">${g.descr}</span>
        ${g.gratis ? `<span class="badge">Senza AI, illimitata</span>` : ""}</a>`).join("")}
    </div>
  </section>`;
}

export function paginaModulo(tipo) {
  const g = GENERATORI.find((x) => x.tipo === tipo);
  if (!g) return null;
  return `<section class="pagina">
    <a href="#/" class="indietro">‹ Generatori</a>
    <h2>${g.icona} ${esc(g.nome)}</h2>
    <form id="modulo" data-tipo="${tipo}" novalidate>
      ${comuni(preferenze())}
      ${SPECIFICI[tipo]()}
      <button type="submit" class="pulsante grande">${tipo === "mappa" ? "Disegna la mappa" : "Genera"}</button>
      ${tipo === "avventura" ? `<p class="nota">Una avventura completa richiede da 1 a 3 minuti. Puoi lasciare l'app aperta e fare altro.</p>` : ""}
    </form>
  </section>`;
}

export function pannelloAttesa(tipo) {
  const frasi = {
    avventura: ["Il master sta consultando antiche pergamene…", "Sto intrecciando trame e tradimenti…", "Sto piazzando trappole e tesori…", "Sto scrivendo i testi da leggere ai giocatori…"],
    predefinito: ["Sto tirando i dadi del destino…", "Sto consultando il bestiario…", "Quasi pronto…"],
  };
  const lista = frasi[tipo] || frasi.predefinito;
  return `<div class="attesa" role="status" aria-live="polite">
    <div class="d20" aria-hidden="true">⬢</div>
    <p class="frase" data-frasi='${esc(JSON.stringify(lista))}'>${esc(lista[0])}</p>
    <p class="tempo"></p>
  </div>`;
}
