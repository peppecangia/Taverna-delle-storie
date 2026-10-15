/*
 * Generatori rapidi da usare al volo durante la partita.
 * Funzionano offline e non consumano generazioni AI.
 */
import { casuale } from "./ui.js";

const SILLABE = {
  umano: { inizio: ["Al", "Ber", "Cor", "Dar", "El", "Fel", "Gar", "Hal", "Ilm", "Mar", "Ner", "Ros", "Tal", "Val", "Ered", "Lia", "Sel", "Mira", "Ada", "Bri"], fine: ["ric", "wen", "dan", "mond", "ia", "ena", "ard", "tor", "rin", "da", "ion", "eth", "ana", "is", "ald"] },
  elfo: { inizio: ["Ae", "Cael", "Ely", "Fae", "Ithi", "Lae", "Mel", "Nae", "Sil", "Thal", "Var", "Yll", "Aru", "Shae"], fine: ["ndril", "rion", "thiel", "wyn", "lith", "ndel", "ssar", "riel", "lanor", "vain", "nora", "thas"] },
  nano: { inizio: ["Bal", "Bru", "Dur", "Gim", "Har", "Kil", "Mor", "Thor", "Ulf", "Vond", "Ris", "Gund", "Eld", "Bof"], fine: ["in", "grim", "dek", "rak", "dal", "nar", "unn", "gar", "bek", "hild", "dis", "ra"] },
  halfling: { inizio: ["Bil", "Cora", "Fen", "Lav", "Mer", "Pip", "Ros", "Tam", "Wil", "Ber", "Lil", "Nob"], fine: ["bo", "ry", "lie", "ender", "wick", "pin", "sy", "do", "la", "kin", "ly"] },
  gnomo: { inizio: ["Bim", "Fiz", "Gim", "Nack", "Orr", "Wren", "Zook", "Ell", "Tink", "Quil", "Rib"], fine: ["ble", "wick", "pip", "nock", "sy", "dle", "ree", "zab", "tink", "bin"] },
  orco: { inizio: ["Gro", "Kru", "Mog", "Ush", "Dur", "Thok", "Gra", "Shag", "Yur", "Zug"], fine: ["nak", "ush", "gash", "rok", "mak", "th", "ga", "ruk", "zog", "ka"] },
};

const COGNOMI = ["Pietranera", "Ventoforte", "Martellargento", "Foglia d'Autunno", "Corvobianco", "Mezzaluna", "Fiumequieto",
  "Spinarossa", "Cuordiquercia", "Lanterna Fioca", "Brughiera", "Vallescura", "Ferrovecchio", "Ramingo", "Stellacadente"];

export const RAZZE_NOMI = Object.keys(SILLABE);

export function nome(razza = "umano") {
  const s = SILLABE[razza] || SILLABE.umano;
  const n = casuale(s.inizio) + casuale(s.fine);
  return razza === "orco" ? n : `${n} ${casuale(COGNOMI)}`;
}

const TAVERNA_A = ["Il Cinghiale", "La Lanterna", "Il Drago", "La Volpe", "Il Barile", "La Civetta", "Il Boccale", "La Sirena", "Il Grifone", "La Spada", "Il Corvo", "La Rosa", "L'Orso", "Il Calderone"];
const TAVERNA_B = ["Ubriaco", "Spenta", "Addormentato", "Zoppa", "Sfondato", "Cieca", "d'Oro", "Stonata", "Ferito", "Arrugginita", "Ridente", "Nera", "Danzante", "Che Fuma"];
const OSTE = ["un ex avventuriero con una gamba di legno", "una vedova sveglia che sa tutto di tutti", "due fratelli gemelli che litigano sempre",
  "un mezzorco gentile che cucina benissimo", "un'anziana halfling che bara a carte", "un nano che annacqua la birra e lo nega",
  "una giovane che sogna di partire all'avventura", "un ex sacerdote che ha perso la fede"];
const SPECIALITA = ["stufato di cinghiale al vino rosso", "pane nero e formaggio di capra", "zuppa di pesce dal sapore discutibile",
  "idromele speziato", "birra scura dei nani", "funghi arrosto della foresta", "torta di mele e cannella", "salsicce piccanti"];
const CLIENTI = ["un bardo che cerca ispirazione", "mercanti che contrattano a bassa voce", "guardie fuori servizio", "un incappucciato in un angolo",
  "un gruppo di nani che canta", "una cartografa che cerca una guida", "un ragazzo che vende mappe false", "un cacciatore di taglie silenzioso"];

export function taverna() {
  return {
    titolo: `${casuale(TAVERNA_A)} ${casuale(TAVERNA_B)}`,
    righe: [`Gestita da ${casuale(OSTE)}.`, `Specialità: ${casuale(SPECIALITA)}.`, `Stasera ci sono ${casuale(CLIENTI)} e ${casuale(CLIENTI)}.`],
  };
}

const VOCI = [
  "Dicono che al vecchio mulino si vedano luci di notte, ma il mugnaio è morto da anni.",
  "Il figlio del borgomastro è sparito tre giorni fa, e nessuno ne parla apertamente.",
  "Una carovana è arrivata senza conducente: i cavalli conoscevano la strada.",
  "Il pozzo della piazza ha cominciato a sussurrare nomi.",
  "Al mercato qualcuno vende monete coniate con il volto di un re che non è mai esistito.",
  "I lupi non ululano più. I cacciatori dicono che qualcosa li ha fatti scappare.",
  "La torre della maga è chiusa da una settimana e il suo corvo gira per le strade.",
  "Un minatore giura di aver sentito battere dall'altra parte della roccia.",
  "Il tempio offre una ricompensa per chi riporta una reliquia rubata, ma non dice quale.",
  "Due famiglie nobili stanno per sposarsi, e il fidanzato non sembra più lui.",
  "Nel bosco c'è un albero con una porta. Ieri era aperta.",
  "Le guardie cercano una donna con una cicatrice a forma di stella.",
  "Il fiume ha portato a riva un'armatura vuota ancora calda.",
  "Un mercante paga oro per uova di qualsiasi creatura, purché siano integre.",
  "Il nuovo esattore delle tasse non dorme mai e non mangia mai.",
  "Al cimitero hanno trovato una tomba scavata dall'interno.",
];
export const voce = () => casuale(VOCI);

const METEO = {
  primavera: ["pioggia leggera e fango sulle strade", "sole tiepido e vento fresco", "nebbia mattutina che si dirada a mezzogiorno", "temporale improvviso nel pomeriggio", "cielo sereno, notte fredda"],
  estate: ["caldo soffocante, serve il doppio dell'acqua", "afa e temporale serale", "cielo limpido e vento secco", "notte stellata e tiepida", "grandinata breve e violenta"],
  autunno: ["vento forte e foglie ovunque", "pioggia continua tutto il giorno", "nebbia fitta, visibilità a 10 metri", "giornata tersa e fredda", "prime gelate all'alba"],
  inverno: ["neve fitta, il viaggio rallenta della metà", "gelo intenso, rischio di sfinimento", "cielo grigio e nevischio", "bufera: meglio trovare riparo", "sole basso sulla neve, accecante"],
};
export const STAGIONI = Object.keys(METEO);
export const meteo = (stagione) => casuale(METEO[stagione] || METEO.primavera);

const INCONTRI_VIAGGIO = [
  "Un carro rovesciato blocca la strada. Il proprietario chiede aiuto, ma è un'imboscata?",
  "Un pellegrino anziano chiede di viaggiare con il gruppo fino alla prossima città.",
  "Tracce di una creatura grande attraversano il sentiero. Sono fresche.",
  "Un ponte di corda è danneggiato: attraversarlo richiede attenzione.",
  "Un gruppo di banditi chiede un pedaggio, ma sembrano più affamati che pericolosi.",
  "Un cane ferito segue il gruppo e non se ne va.",
  "Una pattuglia di soldati sta cercando un disertore e fa domande.",
  "Un cerchio di funghi brilla al crepuscolo. Una musica lontana viene dal centro.",
  "Un mercante ambulante vende oggetti curiosi a prezzi strani.",
  "Corvi seguono il gruppo da ore, sempre alla stessa distanza.",
  "Una statua in mezzo al bosco indica una direzione diversa ogni giorno.",
  "Un bambino si è perso e dice di abitare in un villaggio che non esiste sulle mappe.",
  "Una frana ha aperto l'ingresso di una grotta mai vista prima.",
  "Un cavaliere sfida a duello il membro più forte del gruppo, per onore.",
];
export const incontroViaggio = () => casuale(INCONTRI_VIAGGIO);

const COMPLICAZIONI = [
  "Arriva un terzo gruppo con interessi propri.", "L'alleato rivela un debito con il nemico.", "Il tempo stringe: qualcosa accadrà al tramonto.",
  "L'oggetto cercato è falso.", "Un innocente si trova in mezzo allo scontro.", "Il terreno cede o prende fuoco.",
  "La ricompensa promessa non esiste.", "Un nemico chiede di arrendersi e offre informazioni.", "Una guardia riconosce uno dei personaggi.",
];
export const complicazione = () => casuale(COMPLICAZIONI);

const OGGETTI_CURIOSI = [
  "un dente d'oro con un nome inciso", "una lettera d'amore mai spedita", "un dado che dà sempre 4", "una chiave calda al tatto",
  "una mappa disegnata da un bambino", "una moneta di un regno sconosciuto", "un carillon che suona solo al buio", "una piuma che non tocca mai terra",
  "un occhio di vetro che segue chi lo guarda", "un sacchetto di semi che sussurrano", "un anello troppo piccolo per qualsiasi dito", "un diario con l'ultima pagina strappata",
];
export const oggettoCurioso = () => casuale(OGGETTI_CURIOSI);
