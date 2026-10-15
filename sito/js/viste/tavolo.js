/* Strumenti per la partita: funzionano tutti offline e non consumano generazioni. */
import { esc, campo, numero, selezione, avviso, $ } from "../ui.js";
import { stato, salvaStato, nuovoId, preferenze } from "../archivio.js";
import { tira, tiraD20, tiraCaratteristiche } from "../dadi.js";
import { GRADI_SFIDA, difficolta5e, difficolta35, budget5e } from "../regole.js";
import * as T from "../tabelle.js";
import { ATMOSFERE, linkYouTube, linkSpotify } from "../musica.js";

const SCHEDE = [
  ["iniziativa", "Iniziativa"], ["dadi", "Dadi"], ["difficolta", "Difficoltà"], ["volo", "Al volo"], ["musica", "Musica"],
];

const CONDIZIONI = ["accecato", "affascinato", "afferrato", "assordato", "avvelenato", "incapacitato", "invisibile", "paralizzato",
  "pietrificato", "prono", "spaventato", "stordito", "svenuto", "trattenuto", "concentrato", "sfinito"];

const iniziativa = () => stato("iniziativa", { round: 1, turno: 0, iniziato: false, combattenti: [] });
const salvaIniziativa = (s) => salvaStato("iniziativa", s);

/* Riordina per iniziativa. A combattimento iniziato il turno resta a chi lo stava giocando. */
function riordina(s) {
  const attivo = s.combattenti[s.turno];
  s.combattenti.sort((a, b) => b.init - a.init);
  s.turno = s.iniziato ? Math.max(0, s.combattenti.indexOf(attivo)) : 0;
}

export function aggiungiCombattenti(nome, quantita, pf, ca) {
  const s = iniziativa();
  const n = Math.max(1, Math.min(20, Number(quantita) || 1));
  for (let i = 1; i <= n; i++) {
    const pfNum = parseInt(pf, 10) || 0;
    s.combattenti.push({ id: nuovoId(), nome: n > 1 ? `${nome} ${i}` : nome, init: tiraD20().totale, pf: pfNum, pfMax: pfNum, ca: parseInt(ca, 10) || "", condizioni: [], nemico: true });
  }
  riordina(s);
  salvaIniziativa(s);
}

function vistaIniziativa() {
  const s = iniziativa();
  return `<div class="iniziativa">
    <div class="barra-round">
      <span>Round <b>${s.round}</b></span>
      <button class="pulsante" data-ini="prossimo" ${s.combattenti.length ? "" : "disabled"}>Turno successivo ›</button>
    </div>
    <ol class="combattenti">
      ${s.combattenti.map((c, i) => `<li class="${i === s.turno ? "attivo" : ""} ${c.pfMax && c.pf <= 0 ? "a-terra" : ""}" data-id="${c.id}">
        <div class="riga-c">
          <input class="init" type="number" value="${esc(c.init)}" data-campo="init" aria-label="Iniziativa di ${esc(c.nome)}">
          <span class="nome-c">${esc(c.nome)}</span>
          ${c.ca !== "" ? `<span class="ca" title="Classe armatura">🛡 ${esc(c.ca)}</span>` : ""}
          <button class="icona-btn" data-ini="rimuovi" aria-label="Rimuovi ${esc(c.nome)}">✕</button>
        </div>
        ${c.pfMax ? `<div class="riga-pf">
          <span class="pf"><b>${c.pf}</b>/${c.pfMax} PF</span>
          <input type="number" class="quanto" placeholder="n" inputmode="numeric" aria-label="Quantità">
          <button class="pulsante piccolo danno" data-ini="danno">Danno</button>
          <button class="pulsante piccolo cura" data-ini="cura">Cura</button>
        </div>` : ""}
        <div class="condizioni">
          ${c.condizioni.map((k) => `<button class="chip" data-ini="togli-cond" data-cond="${esc(k)}">${esc(k)} ✕</button>`).join("")}
          <select data-ini="cond" aria-label="Aggiungi condizione"><option value="">+ condizione</option>${CONDIZIONI.map((k) => `<option>${k}</option>`).join("")}</select>
        </div>
      </li>`).join("")}
    </ol>
    ${s.combattenti.length ? "" : `<p class="vuoto">Nessun combattente. Aggiungi i personaggi e i nemici qui sotto, oppure usa "Aggiungi all'iniziativa" da un incontro generato.</p>`}
    <form class="aggiungi-c" data-form="combattente">
      <input name="nome" placeholder="Nome" required maxlength="40">
      <input name="init" type="number" placeholder="Init." aria-label="Iniziativa (vuoto = tira d20)">
      <input name="pf" type="number" placeholder="PF" aria-label="Punti ferita">
      <input name="ca" type="number" placeholder="CA" aria-label="Classe armatura">
      <button class="pulsante">Aggiungi</button>
    </form>
    <p class="nota">Lascia vuota l'iniziativa per tirare un d20. L'ordine si aggiorna da solo.</p>
    <button class="pulsante secondario" data-ini="azzera">Nuovo combattimento</button>
  </div>`;
}

function vistaDadi() {
  const storico = stato("storicoDadi", []);
  return `<div class="dadi">
    <div class="tasti-dadi">${[4, 6, 8, 10, 12, 20, 100].map((f) => `<button class="dado" data-dado="1d${f}">d${f}</button>`).join("")}</div>
    <div class="tasti-dadi">
      <button class="pulsante secondario" data-d20="vantaggio">d20 vantaggio</button>
      <button class="pulsante secondario" data-d20="svantaggio">d20 svantaggio</button>
      <button class="pulsante secondario" data-dado="caratteristiche">Caratteristiche 4d6</button>
    </div>
    <form data-form="dadi" class="riga-form">
      <input name="espr" placeholder="es. 2d6+3, 8d6, 4d6k3" autocomplete="off" aria-label="Espressione di dadi">
      <button class="pulsante">Tira</button>
    </form>
    <div class="risultato-dadi" aria-live="polite">${storico[0] ? `<b>${esc(storico[0].totale)}</b><small>${esc(storico[0].testo)}</small>` : ""}</div>
    <ul class="storico">${storico.slice(1, 12).map((t) => `<li><b>${esc(t.totale)}</b> ${esc(t.testo)}</li>`).join("")}</ul>
  </div>`;
}

function vistaDifficolta() {
  const p = preferenze();
  const nemici = stato("calcoloNemici", [{ gs: "1", quantita: 2 }]);
  return `<form class="difficolta" data-form="difficolta">
    ${campo("Edizione", selezione("edizione", [["5e", "5ª edizione"], ["3.5", "Edizione 3.5"]], p.edizione))}
    <div class="due">${campo("Personaggi", numero("numeroPG", p.numeroPG, 1, 10))}${campo("Livello", numero("livello", p.livello, 1, 20))}</div>
    <h4>Nemici</h4>
    <div class="righe-nemici">
      ${nemici.map((n, i) => `<div class="riga-nemico">
        <label>Quanti ${numero(`q${i}`, n.quantita, 1, 30)}</label>
        <label>GS ${selezione(`g${i}`, GRADI_SFIDA, n.gs)}</label>
        <button type="button" class="icona-btn" data-nemico="togli" data-i="${i}" aria-label="Rimuovi">✕</button>
      </div>`).join("")}
    </div>
    <button type="button" class="pulsante secondario piccolo" data-nemico="aggiungi">+ gruppo di nemici</button>
    <div class="esito-difficolta" aria-live="polite"></div>
  </form>`;
}

function calcolaDifficolta(form) {
  const f = new FormData(form);
  const nemici = [];
  for (let i = 0; f.has(`q${i}`); i++) nemici.push({ quantita: Number(f.get(`q${i}`)) || 1, gs: f.get(`g${i}`) });
  salvaStato("calcoloNemici", nemici);
  const n = Number(f.get("numeroPG")) || 4, l = Number(f.get("livello")) || 1;
  const pg = Array(n).fill(l);
  const out = $(".esito-difficolta", form);
  if (f.get("edizione") === "3.5") {
    const r = difficolta35(nemici, pg);
    out.innerHTML = `<p class="grande">${esc(r.livello)}</p><p>Livello incontro <b>${r.li}</b> contro livello del gruppo <b>${r.livelloMedio}</b>.</p>
      <p class="nota">Pari al livello del gruppo: consuma circa un quinto delle risorse. Da +5 in su rischia di uccidere qualcuno.</p>`;
  } else {
    const r = difficolta5e(nemici, pg);
    out.innerHTML = `<p class="grande">${esc(r.livello)}</p>
      <p>PE adattati <b>${r.peAdattati}</b> (base ${r.peBase} × ${r.moltiplicatore}).</p>
      <table><tr><th>Facile</th><th>Media</th><th>Difficile</th><th>Letale</th></tr><tr>${r.soglie.map((s) => `<td>${s}</td>`).join("")}</tr></table>
      <p>PE guadagnati da ciascun personaggio: <b>${r.pePerPG}</b>.</p>
      <p class="nota">Budget per giornata: circa ${budget5e(n, l, "media") * 3}–${budget5e(n, l, "difficile") * 3} PE adattati prima di un riposo lungo. Regole 2014 (SRD 5.1).</p>`;
  }
}

function vistaVolo() {
  return `<div class="volo">
    <div class="carta-volo"><h4>Nome</h4>
      <div class="riga-form">${selezione("razzaNome", T.RAZZE_NOMI.map((r) => [r, r]), "umano")}<button class="pulsante" data-volo="nome">Genera</button></div>
      <p class="uscita" data-uscita="nome"></p></div>
    <div class="carta-volo"><h4>Taverna</h4><button class="pulsante" data-volo="taverna">Genera</button><div class="uscita" data-uscita="taverna"></div></div>
    <div class="carta-volo"><h4>Voce di paese</h4><button class="pulsante" data-volo="voce">Genera</button><p class="uscita" data-uscita="voce"></p></div>
    <div class="carta-volo"><h4>Incontro in viaggio</h4><button class="pulsante" data-volo="viaggio">Genera</button><p class="uscita" data-uscita="viaggio"></p></div>
    <div class="carta-volo"><h4>Meteo</h4>
      <div class="riga-form">${selezione("stagione", T.STAGIONI.map((s) => [s, s]), "primavera")}<button class="pulsante" data-volo="meteo">Genera</button></div>
      <p class="uscita" data-uscita="meteo"></p></div>
    <div class="carta-volo"><h4>Complicazione</h4><button class="pulsante" data-volo="complicazione">Genera</button><p class="uscita" data-uscita="complicazione"></p></div>
    <div class="carta-volo"><h4>Oggetto curioso</h4><button class="pulsante" data-volo="oggetto">Genera</button><p class="uscita" data-uscita="oggetto"></p></div>
  </div>`;
}

function vistaMusica() {
  return `<p class="nota">Tocca un'atmosfera per cercare playlist adatte.</p>
    <div class="atmosfere">${ATMOSFERE.map(([n, q]) => `<div class="atmosfera"><span>${esc(n)}</span>
      <a class="pulsante piccolo yt" href="${linkYouTube(q)}" target="_blank" rel="noopener">YouTube</a>
      <a class="pulsante piccolo sp" href="${linkSpotify(q)}" target="_blank" rel="noopener">Spotify</a></div>`).join("")}</div>`;
}

const VISTE = { iniziativa: vistaIniziativa, dadi: vistaDadi, difficolta: vistaDifficolta, volo: vistaVolo, musica: vistaMusica };

export function paginaTavolo(scheda) {
  const attiva = VISTE[scheda] ? scheda : "iniziativa";
  return `<section class="pagina tavolo">
    <h2>Al tavolo</h2>
    <nav class="schede" role="tablist">${SCHEDE.map(([k, n]) => `<a role="tab" href="#/tavolo/${k}" aria-selected="${k === attiva}" class="${k === attiva ? "attiva" : ""}">${n}</a>`).join("")}</nav>
    <div class="contenuto-scheda" data-scheda="${attiva}">${VISTE[attiva]()}</div>
  </section>`;
}

function registraTiro(totale, testo) {
  const storico = stato("storicoDadi", []);
  storico.unshift({ totale, testo });
  salvaStato("storicoDadi", storico.slice(0, 30));
}

/* Collega gli eventi della pagina; ridisegna chiama di nuovo la vista corrente. */
export function montaTavolo(radice, ridisegna) {
  const contenuto = $(".contenuto-scheda", radice);
  const scheda = contenuto.dataset.scheda;

  contenuto.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (scheda === "iniziativa" && b.dataset.ini) {
      const s = iniziativa();
      const li = b.closest("li");
      const c = li && s.combattenti.find((x) => x.id === li.dataset.id);
      switch (b.dataset.ini) {
        case "prossimo":
          s.iniziato = true;
          s.turno = (s.turno + 1) % s.combattenti.length;
          if (s.turno === 0) s.round++;
          break;
        case "rimuovi": {
          const i = s.combattenti.indexOf(c);
          s.combattenti.splice(i, 1);
          if (i < s.turno) s.turno--;
          if (s.turno >= s.combattenti.length) s.turno = 0;
          break;
        }
        case "danno":
        case "cura": {
          const n = parseInt($(".quanto", li).value, 10);
          if (!n) return avviso("Scrivi prima quanti punti.");
          c.pf = b.dataset.ini === "danno" ? c.pf - n : Math.min(c.pfMax, c.pf + n);
          break;
        }
        case "togli-cond":
          c.condizioni = c.condizioni.filter((k) => k !== b.dataset.cond);
          break;
        case "azzera":
          if (!confirm("Cancellare tutti i combattenti?")) return;
          Object.assign(s, { round: 1, turno: 0, iniziato: false, combattenti: [] });
          break;
        default:
          return;
      }
      salvaIniziativa(s);
      ridisegna();
    }
    if (scheda === "dadi") {
      if (b.dataset.dado === "caratteristiche") {
        const v = tiraCaratteristiche();
        registraTiro(v.reduce((a, x) => a + x, 0), `caratteristiche: ${v.join(", ")}`);
      } else if (b.dataset.dado) {
        const r = tira(b.dataset.dado);
        registraTiro(r.totale, r.dettagli);
      } else if (b.dataset.d20) {
        const r = tiraD20(b.dataset.d20);
        registraTiro(r.totale, `d20 ${b.dataset.d20} [${r.tiri.join(", ")}]`);
      } else return;
      ridisegna();
    }
    if (scheda === "difficolta" && b.dataset.nemico) {
      const form = $("form", contenuto);
      const f = new FormData(form);
      const nemici = [];
      for (let i = 0; f.has(`q${i}`); i++) nemici.push({ quantita: Number(f.get(`q${i}`)) || 1, gs: f.get(`g${i}`) });
      if (b.dataset.nemico === "aggiungi") nemici.push({ gs: "1", quantita: 1 });
      else if (nemici.length > 1) nemici.splice(Number(b.dataset.i), 1);
      salvaStato("calcoloNemici", nemici);
      ridisegna();
    }
    if (scheda === "volo" && b.dataset.volo) {
      const tipo = b.dataset.volo;
      const out = $(`[data-uscita="${tipo}"]`, contenuto);
      if (tipo === "nome") out.textContent = T.nome($('[name="razzaNome"]', contenuto).value);
      else if (tipo === "taverna") {
        const t = T.taverna();
        out.innerHTML = `<p><b>${esc(t.titolo)}</b></p>${t.righe.map((r) => `<p>${esc(r)}</p>`).join("")}`;
      } else if (tipo === "meteo") out.textContent = T.meteo($('[name="stagione"]', contenuto).value);
      else out.textContent = { voce: T.voce, viaggio: T.incontroViaggio, complicazione: T.complicazione, oggetto: T.oggettoCurioso }[tipo]();
    }
  });

  contenuto.addEventListener("change", (e) => {
    if (scheda === "iniziativa") {
      const s = iniziativa();
      const li = e.target.closest("li");
      const c = li && s.combattenti.find((x) => x.id === li.dataset.id);
      if (!c) return;
      if (e.target.dataset.campo === "init") c.init = Number(e.target.value) || 0;
      else if (e.target.dataset.ini === "cond" && e.target.value && !c.condizioni.includes(e.target.value)) c.condizioni.push(e.target.value);
      else return;
      riordina(s);
      salvaIniziativa(s);
      ridisegna();
    }
    if (scheda === "difficolta") calcolaDifficolta($("form", contenuto));
  });

  contenuto.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (form.dataset.form === "combattente") {
      const f = new FormData(form);
      const nome = String(f.get("nome")).trim();
      if (!nome) return;
      const s = iniziativa();
      const pf = parseInt(f.get("pf"), 10) || 0;
      const init = f.get("init") === "" ? tiraD20().totale : Number(f.get("init"));
      s.combattenti.push({ id: nuovoId(), nome, init, pf, pfMax: pf, ca: f.get("ca") === "" ? "" : Number(f.get("ca")), condizioni: [] });
      riordina(s);
      salvaIniziativa(s);
      ridisegna();
      $('.aggiungi-c [name="nome"]')?.focus();
    }
    if (form.dataset.form === "dadi") {
      const espr = form.espr.value.trim();
      if (!espr) return;
      try {
        const r = tira(espr);
        registraTiro(r.totale, r.dettagli);
        ridisegna();
      } catch {
        avviso("Espressione non valida. Esempi: 2d6+3, 1d20-1, 4d6k3", "errore");
      }
    }
  });

  if (scheda === "difficolta") calcolaDifficolta($("form", contenuto));
}

