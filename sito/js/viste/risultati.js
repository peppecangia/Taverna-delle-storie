/* Trasforma i JSON generati in pagine leggibili al tavolo. */
import { esc } from "../ui.js";
import { bloccoMusica } from "../musica.js";
import { riquadroImmagine } from "../immagini.js";
import { difficolta5e, difficolta35, gsInNumero } from "../regole.js";

const lista = (voci, fn = (v) => esc(v)) => (voci?.length ? `<ul>${voci.map((v) => `<li>${fn(v)}</li>`).join("")}</ul>` : "");
const riga = (etichetta, valore) => (valore ? `<p><strong>${etichetta}:</strong> ${esc(valore)}</p>` : "");
const daLeggere = (t) => (t ? `<blockquote class="da-leggere"><span>Da leggere ai giocatori</span>${esc(t)}</blockquote>` : "");
const segreto = (titolo, contenuto) => (contenuto ? `<details class="segreto"><summary>${titolo}</summary>${contenuto}</details>` : "");

const ICONE_SCENA = { esplorazione: "🧭", sociale: "🗣️", combattimento: "⚔️", enigma: "🧩", viaggio: "🐎", riposo: "🔥" };

function enigmaBreve(e) {
  if (!e) return "";
  return `<div class="riquadro enigma"><h5>🧩 Enigma</h5><p>${esc(e.testo)}</p>
    ${segreto("Indizi", lista(e.indizi))}${segreto("Soluzione", `<p>${esc(e.soluzione)}</p>`)}</div>`;
}

function trappolaBreve(t) {
  if (!t) return "";
  return `<div class="riquadro trappola"><h5>⚠️ ${esc(t.nome || "Trappola")}</h5>
    ${riga("Individuare", t.individuare)}${riga("Disattivare", t.disattivare)}${riga("Effetto", t.effetto)}</div>`;
}

function incontroBreve(inc, contesto) {
  if (!inc?.nemici?.length) return "";
  return `<div class="riquadro incontro"><h5>⚔️ Incontro</h5>
    ${lista(inc.nemici, (n) => `${esc(n.quantita)} × ${esc(n.nome)} <small>(GS ${esc(n.gs)})</small>`)}
    ${verificaDifficolta(inc.nemici, contesto)}
    ${riga("Tattiche", inc.tattiche)}${riga("Terreno", inc.terreno)}</div>`;
}

/* Controllo indipendente dall'AI: ricalcola la difficoltà con le tabelle delle regole. */
export function verificaDifficolta(nemici, { edizione, numeroPG, livello } = {}) {
  if (!nemici?.length || !numeroPG || !livello) return "";
  const n = nemici.map((x) => ({ gs: String(x.gs ?? "0").replace(/\s/g, ""), quantita: Number(x.quantita) || 1 }));
  const pg = Array(Number(numeroPG)).fill(Number(livello));
  if (edizione === "3.5") {
    const r = difficolta35(n, pg);
    return `<p class="verifica">Controllo regole 3.5: livello incontro ${r.li} contro livello del gruppo ${r.livelloMedio}, <strong>${r.livello}</strong>.</p>`;
  }
  if (n.some((x) => !Number.isFinite(gsInNumero(x.gs)))) return "";
  const r = difficolta5e(n, pg);
  return `<p class="verifica">Controllo regole 5e: ${r.peAdattati} PE adattati (soglie ${r.soglie.join(" / ")}), <strong>${r.livello}</strong>. ${r.pePerPG} PE a testa.</p>`;
}

export function scena(s, contesto) {
  return `<article class="scena">
    <h4>${ICONE_SCENA[s.tipo] || "📜"} ${esc(s.titolo)} <small>${esc(s.tipo || "")}</small></h4>
    ${daLeggere(s.testoDaLeggere)}
    <p>${esc(s.descrizione)}</p>
    ${s.prove?.length ? `<div class="prove"><h5>🎲 Prove</h5>${lista(s.prove, (p) => `<strong>${esc(p.abilita)} CD ${esc(p.cd)}</strong>: ${esc(p.esito)}`)}</div>` : ""}
    ${incontroBreve(s.incontro, contesto)}${enigmaBreve(s.enigma)}${trappolaBreve(s.trappola)}
    ${bloccoMusica(s.musica)}
  </article>`;
}

const pngBreve = (p) => `<div class="scheda-png">
  <h4>${esc(p.nome)} <small>${esc(p.ruolo || "")}</small></h4>
  ${riga("Aspetto", p.aspetto)}${riga("Carattere", p.carattere)}${riga("Come interpretarlo", p.voce)}
  ${segreto("Segreto", `<p>${esc(p.segreto)}</p>`)}
</div>`;

function avventura(r, voce) {
  const d = voce.dati;
  const campagna = d.formato === "campagna";
  const sessioni = voce.sessioni || {};
  const parti = (r.struttura || []).map((parte) => {
    const sviluppata = sessioni[parte.numero];
    const corpo = campagna && sviluppata
      ? `${daLeggere(sviluppata.riassuntoIniziale)}${riga("Obiettivo", sviluppata.obiettivo)}
         ${(sviluppata.scene || []).map((s) => scena(s, d)).join("")}
         ${sviluppata.png?.length ? `<h5>Personaggi di questa sessione</h5>${sviluppata.png.map(pngBreve).join("")}` : ""}
         ${sviluppata.tesori?.length ? `<h5>Tesori</h5>${lista(sviluppata.tesori, (t) => `<strong>${esc(t.nome)}</strong> (${esc(t.dove)}): ${esc(t.descrizione)}`)}` : ""}
         ${riga("Chiusura", sviluppata.finaleSessione)}${sviluppata.consigli?.length ? `<h5>Consigli</h5>${lista(sviluppata.consigli)}` : ""}`
      : (parte.scene || []).map((s) => scena(s, d)).join("");
    const azioni = campagna
      ? `<div class="azioni-sessione">
          <button type="button" class="pulsante${sviluppata ? " secondario" : ""}" data-azione="sviluppa-sessione" data-numero="${parte.numero}">
            ${sviluppata ? "Rigenera questa sessione" : "Sviluppa questa sessione in dettaglio"}</button>
          <label class="campo"><span>Cosa è successo al tavolo</span>
            <textarea rows="3" data-diario="${parte.numero}" placeholder="Appunti dopo la partita: scelte dei giocatori, PNG incontrati, filoni aperti. Verranno usati per sviluppare le sessioni successive.">${esc(voce.diario?.[parte.numero] || "")}</textarea></label>
        </div>`
      : "";
    return `<details class="parte"${parte.numero === 1 ? " open" : ""}>
      <summary><span class="numero">${esc(parte.numero)}</span> ${esc(sviluppata?.titolo || parte.titolo)} <small>${esc(parte.durata || "")}</small></summary>
      ${riga("Obiettivo", parte.obiettivo)}${corpo}${azioni}
    </details>`;
  });

  const a = r.antagonista;
  return `
    <p class="sinossi">${esc(r.sinossi)}</p>
    ${riga("Come coinvolgere i personaggi", r.gancio)}
    <h3>${campagna ? "Sessioni" : "Atti"}</h3>${parti.join("")}
    ${a ? `<h3>Antagonista</h3><div class="scheda-png antagonista"><h4>${esc(a.nome)}</h4>
      ${riga("Chi è", a.chiE)}${riga("Obiettivo", a.obiettivo)}${riga("Metodi", a.metodi)}${riga("Statistiche", a.statistiche)}
      ${segreto("Segreto", `<p>${esc(a.segreto)}</p>`)}${bloccoMusica(a.musica)}</div>` : ""}
    ${r.png?.length ? `<h3>Personaggi non giocanti</h3>${r.png.map(pngBreve).join("")}` : ""}
    ${r.luoghi?.length ? `<h3>Luoghi</h3>${r.luoghi.map((l) => `<div class="luogo"><h4>${esc(l.nome)}</h4>${riquadroImmagine(l.promptImmagine, l.nome)}<p>${esc(l.descrizione)}</p>${lista(l.dettagli)}</div>`).join("")}` : ""}
    ${r.tesori?.length ? `<h3>Tesori</h3>${lista(r.tesori, (t) => `<strong>${esc(t.nome)}</strong> (${esc(t.dove)}): ${esc(t.descrizione)}`)}` : ""}
    ${r.finali?.length ? `<h3>Finali possibili</h3>${lista(r.finali, (f) => `<strong>${esc(f.condizione)}</strong> ${esc(f.esito)}`)}` : ""}
    ${r.consigli?.length ? `<h3>Consigli per il master</h3>${lista(r.consigli)}` : ""}
    ${r.seguiti?.length ? `<h3>Come continuare</h3>${lista(r.seguiti)}` : ""}`;
}

function png(r) {
  return (r.png || []).map((p) => {
    const s = p.statistiche || {};
    const c = s.caratteristiche || {};
    const mod = (v) => { const m = Math.floor((Number(v) - 10) / 2); return `${v} (${m >= 0 ? "+" : ""}${m})`; };
    return `<article class="scheda-png">
      <h3>${esc(p.nome)} <small>${esc([p.razza, p.ruolo, p.allineamento].filter(Boolean).join(" · "))}</small></h3>
      ${riquadroImmagine(p.promptImmagine, p.nome)}
      ${riga("Aspetto", p.aspetto)}${riga("Personalità", p.personalita)}${riga("Come interpretarlo", p.voce)}${riga("Cosa vuole", p.motivazione)}
      ${p.frasi?.length ? `<div class="frasi">${p.frasi.map((f) => `<q>${esc(String(f).replace(/^["“«]|["”»]$/g, ""))}</q>`).join("")}</div>` : ""}
      ${riga("Come usarlo", p.gancio)}
      ${segreto("Segreto", `<p>${esc(p.segreto)}</p>`)}
      <div class="statistiche">
        <div class="stat-riga"><span>CA <b>${esc(s.ca)}</b></span><span>PF <b>${esc(s.pf)}</b></span><span>Vel. <b>${esc(s.velocita)}</b></span><span>GS <b>${esc(s.gs)}</b></span></div>
        <div class="caratteristiche">${["for", "des", "cos", "int", "sag", "car"].map((k) => `<div><small>${k.toUpperCase()}</small><b>${c[k] != null ? mod(c[k]) : "–"}</b></div>`).join("")}</div>
        ${s.attacchi?.length ? `<p><strong>Attacchi:</strong> ${esc(s.attacchi.join("; "))}</p>` : ""}
        ${s.abilita?.length ? `<p><strong>Abilità:</strong> ${esc(s.abilita.join(", "))}</p>` : ""}
        ${s.capacita?.length ? `<p><strong>Capacità:</strong> ${esc(s.capacita.join("; "))}</p>` : ""}
      </div>
    </article>`;
  }).join("");
}

function luogo(r) {
  return `${riquadroImmagine(r.promptImmagine, r.nome)}
    ${daLeggere(r.testoDaLeggere)}<p>${esc(r.descrizione)}</p>${bloccoMusica(r.musica)}
    <h3>Zone</h3>${(r.zone || []).map((z) => `<div class="riquadro"><h4>${esc(z.nome)}</h4><p>${esc(z.descrizione)}</p>${riga("Cosa si trova", z.cosaSiTrova)}${riga("Pericoli", z.pericoli)}</div>`).join("")}
    ${r.png?.length ? `<h3>Chi si incontra</h3>${lista(r.png, (p) => `<strong>${esc(p.nome)}</strong>, ${esc(p.ruolo)}: ${esc(p.carattere)}`)}` : ""}
    ${r.voci?.length ? `<h3>Voci e dicerie</h3>${lista(r.voci)}` : ""}
    ${segreto("Segreti del luogo", lista(r.segreti))}`;
}

function enigma(r) {
  return (r.enigmi || []).map((e) => `<article class="riquadro enigma">
    <h3>🧩 ${esc(e.titolo)} <small>${esc(e.tipo)}</small></h3>
    <blockquote class="da-leggere"><span>Da mostrare ai giocatori</span>${esc(e.testoPerGiocatori)}</blockquote>
    ${segreto("Indizio 1 (leggero)", `<p>${esc(e.indizi?.[0])}</p>`)}
    ${segreto("Indizio 2 (medio)", `<p>${esc(e.indizi?.[1])}</p>`)}
    ${segreto("Indizio 3 (quasi la soluzione)", `<p>${esc(e.indizi?.[2])}</p>`)}
    ${e.aiutoConDadi ? `<p><strong>Aiuto con i dadi:</strong> ${esc(e.aiutoConDadi.abilita)} CD ${esc(e.aiutoConDadi.cd)}, ${esc(e.aiutoConDadi.effetto)}</p>` : ""}
    ${segreto("Soluzione", `<p><strong>${esc(e.soluzione)}</strong></p><p>${esc(e.spiegazione)}</p>`)}
    ${riga("Se sbagliano", e.seSbagliano)}${riga("Ricompensa", e.ricompensa)}
  </article>`).join("");
}

function trappola(r) {
  return (r.trappole || []).map((t) => `<article class="riquadro trappola">
    <h3>⚠️ ${esc(t.nome)}</h3><p>${esc(t.descrizione)}</p>
    ${riga("Innesco", t.innesco)}
    <p><strong>Individuare:</strong> ${esc(t.individuare?.abilita)} CD ${esc(t.individuare?.cd)} · <strong>Disattivare:</strong> ${esc(t.disattivare?.abilita)} CD ${esc(t.disattivare?.cd)}</p>
    ${riga("Tiro salvezza", t.tiroSalvezza)}${riga("Effetto", t.effetto)}${riga("Danni", t.danni)}${riga("Come aggirarla", t.aggirare)}${riga("Varianti", t.varianti)}
  </article>`).join("");
}

function tesoro(r) {
  return `${riga("Monete", r.monete)}
    ${r.gemmeEArte?.length ? `<h3>Gemme e oggetti d'arte</h3>${lista(r.gemmeEArte, (g) => `${esc(g.nome)} <small>(${esc(g.valore)})</small>`)}` : ""}
    ${r.oggettiMagici?.length ? `<h3>Oggetti magici</h3>${r.oggettiMagici.map((o) => `<div class="riquadro"><h4>✨ ${esc(o.nome)} <small>${esc([o.tipo, o.rarita, o.sintonia ? "richiede sintonia" : ""].filter(Boolean).join(" · "))}</small></h4><p>${esc(o.descrizione)}</p><p><strong>Effetto:</strong> ${esc(o.effetto)}</p></div>`).join("")}` : ""}
    ${r.curiosita?.length ? `<h3>Curiosità</h3>${lista(r.curiosita)}` : ""}
    ${r.ganci?.length ? `<h3>Storie legate al tesoro</h3>${lista(r.ganci)}` : ""}`;
}

function incontro(r, voce) {
  return `${daLeggere(r.testoDaLeggere)}<p>${esc(r.descrizione)}</p>${bloccoMusica(r.musica)}
    <h3>Nemici</h3>
    ${(r.nemici || []).map((n) => `<div class="riquadro"><h4>${esc(n.quantita)} × ${esc(n.nome)} <small>GS ${esc(n.gs)} · CA ${esc(n.ca)} · PF ${esc(n.pf)}</small></h4>
      ${riga("Attacchi", n.attacchi)}${riga("Capacità", n.capacita)}${riga("Tattiche", n.tattiche)}
      <button type="button" class="pulsante piccolo secondario" data-azione="in-iniziativa" data-nome="${esc(n.nome)}" data-quantita="${esc(n.quantita)}" data-pf="${esc(n.pf)}" data-ca="${esc(n.ca)}">Aggiungi all'iniziativa</button></div>`).join("")}
    ${verificaDifficolta(r.nemici, voce.dati)}
    ${r.terreno?.length ? `<h3>Campo di battaglia</h3>${lista(r.terreno)}` : ""}
    ${r.svolte?.length ? `<h3>Svolte</h3>${lista(r.svolte)}` : ""}
    ${riga("Se fuggono", r.seFuggono)}${riga("Ricompense", r.ricompense)}`;
}

function mappa(r, voce) {
  const descr = voce.risultato;
  return `<div class="mappa-contenitore"><canvas class="mappa" data-mappa></canvas></div>
    <div class="azioni-mappa">
      <button type="button" class="pulsante piccolo" data-azione="scarica-mappa" data-tema="pergamena">Scarica a colori</button>
      <button type="button" class="pulsante piccolo secondario" data-azione="scarica-mappa" data-tema="stampa">Scarica da stampare</button>
      <button type="button" class="pulsante piccolo secondario" data-azione="scarica-mappa" data-tema="stampa" data-senza-numeri="1">Versione per i giocatori</button>
    </div>
    <p class="nota">Ogni quadretto vale 1,5 metri. La versione per i giocatori non ha i numeri delle aree.</p>
    ${descr ? `<p>${esc(descr.storia)}</p>${bloccoMusica(descr.musica)}
      <h3>Aree</h3>${(descr.aree || []).map((a) => `<div class="riquadro"><h4><span class="numero">${esc(a.numero)}</span> ${esc(a.nome)}</h4>
        ${daLeggere(a.testoDaLeggere)}<p>${esc(a.contenuto)}</p>${riga("⚔️ Incontro", a.incontro)}${riga("⚠️ Trappola", a.trappola)}${riga("💰 Tesoro", a.tesoro)}</div>`).join("")}`
      : `<button type="button" class="pulsante" data-azione="descrivi-mappa">Riempi le aree con l'AI</button>
         <p class="nota">Usa una generazione: crea nome, storia e contenuto di ogni area numerata.</p>`}`;
}

const RENDER = { avventura, png, luogo, enigma, trappola, tesoro, incontro, mappa };

export const ETICHETTE = {
  avventura: "Avventura", png: "Personaggi", luogo: "Luogo", enigma: "Enigmi", trappola: "Trappole",
  tesoro: "Tesoro", incontro: "Incontro", mappa: "Mappa",
};

export function titoloVoce(voce) {
  const r = voce.risultato || {};
  return voce.titolo || r.titolo || r.nome || r.png?.map((p) => p.nome).join(", ") || r.enigmi?.[0]?.titolo || r.trappole?.[0]?.nome || ETICHETTE[voce.tipo];
}

export function renderVoce(voce) {
  const d = voce.dati || {};
  const sottotitolo = [d.edizione === "3.5" ? "Edizione 3.5" : "5ª edizione", d.numeroPG && `${d.numeroPG} PG`, d.livello && `livello ${d.livello}`, d.formato === "campagna" ? `campagna di ${d.sessioni} sessioni` : voce.tipo === "avventura" ? "one shot" : ""]
    .filter(Boolean).join(" · ");
  return `<header class="testata-voce">
      <p class="etichetta">${ETICHETTE[voce.tipo]}</p>
      <h2>${esc(titoloVoce(voce))}</h2>
      <p class="sottotitolo">${esc(sottotitolo)}</p>
    </header>
    <div class="corpo-voce">${RENDER[voce.tipo]?.(voce.risultato || {}, voce) ?? ""}</div>`;
}
