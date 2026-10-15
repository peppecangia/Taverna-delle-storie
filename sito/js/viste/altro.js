/* Archivio, impostazioni, strumenti per la sessione zero e informazioni. */
import { esc, campo, numero, scelte } from "../ui.js";
import { elenco, preferenze } from "../archivio.js";
import { ETICHETTE, titoloVoce } from "./risultati.js";

export function paginaArchivio(filtro = "") {
  const voci = elenco().filter((v) => !filtro || v.tipo === filtro);
  const data = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  return `<section class="pagina">
    <h2>Archivio</h2>
    <nav class="filtri">
      <a href="#/archivio" class="${filtro ? "" : "attiva"}">Tutto</a>
      ${Object.entries(ETICHETTE).map(([k, n]) => `<a href="#/archivio/${k}" class="${filtro === k ? "attiva" : ""}">${n}</a>`).join("")}
    </nav>
    ${voci.length
      ? `<ul class="elenco-archivio">${voci.map((v) => `<li><a href="#/voce/${v.id}">
          <span class="tipo">${esc(ETICHETTE[v.tipo])}</span>
          <span class="titolo">${esc(titoloVoce(v))}</span>
          <span class="data">${data(v.modificato || v.creato)}</span></a></li>`).join("")}</ul>`
      : `<p class="vuoto">Ancora niente qui. Tutto quello che generi viene salvato automaticamente sul telefono.</p>`}
  </section>`;
}

export function paginaAltro() {
  const p = preferenze();
  return `<section class="pagina">
    <h2>Altro</h2>

    <details class="sezione" open><summary>Impostazioni predefinite</summary>
      <form data-form="preferenze">
        ${campo("Edizione", scelte("edizione", [["5e", "5ª edizione"], ["3.5", "Edizione 3.5"]], p.edizione))}
        <div class="due">${campo("Personaggi giocanti", numero("numeroPG", p.numeroPG, 1, 10))}${campo("Livello", numero("livello", p.livello, 1, 20))}</div>
        ${campo("Codice di accesso", `<input type="text" name="codice" value="${esc(p.codice)}" autocomplete="off" maxlength="80">`, "Solo se ne hai ricevuto uno. Toglie il limite giornaliero.")}
        <button class="pulsante">Salva</button>
      </form>
    </details>

    <details class="sezione"><summary>Copia di sicurezza</summary>
      <p>Le tue avventure sono salvate solo su questo telefono. Se lo cambi o cancelli i dati del browser, le perdi.
      Scarica una copia ogni tanto e conservala su Drive o inviala a te stesso.</p>
      <div class="azioni">
        <button class="pulsante" data-azione="esporta">Scarica una copia</button>
        <label class="pulsante secondario">Carica una copia<input type="file" accept="application/json,.json" data-azione="importa" hidden></label>
      </div>
    </details>

    <details class="sezione"><summary>Sessione zero e sicurezza al tavolo</summary>
      <p>Prima di una campagna conviene dedicare una sessione a mettersi d'accordo. Ecco cosa chiedere al gruppo:</p>
      <ul>
        <li><strong>Tono e aspettative:</strong> più combattimenti, più interpretazione o più esplorazione? Serio o leggero?</li>
        <li><strong>Linee:</strong> argomenti che non devono mai comparire nella storia.</li>
        <li><strong>Veli:</strong> argomenti che possono esistere, ma "fuori scena", senza descrizioni.</li>
        <li><strong>Carta X:</strong> un cartoncino al centro del tavolo. Chiunque può toccarlo per saltare una scena senza dover spiegare il motivo.</li>
        <li><strong>Legami tra i personaggi:</strong> come si conoscono e perché viaggiano insieme.</li>
        <li><strong>Regole della casa:</strong> morte dei personaggi, ritardi, telefoni, cibo, frequenza delle sessioni.</li>
      </ul>
    </details>

    <details class="sezione"><summary>Come funziona</summary>
      <p>I testi sono scritti da un'intelligenza artificiale (Claude, di Anthropic). Sono di solito corretti,
      ma su calcoli insoliti o livelli alti può sbagliare: dai un'occhiata ai numeri prima della partita.
      Per gli incontri l'app ricalcola la difficoltà con le tabelle delle regole, senza AI.</p>
      <p>Le mappe tattiche, i dadi, l'iniziativa e i generatori "Al volo" funzionano anche senza connessione e non consumano generazioni.</p>
      <p>Le illustrazioni sono create dal servizio gratuito Pollinations e possono richiedere qualche secondo.</p>
    </details>

    <details class="sezione"><summary>Note legali</summary>
      <p>Taverna delle storie è un progetto indipendente, non affiliato a Wizards of the Coast né approvato da essa.
      Dungeons &amp; Dragons è un marchio registrato di Wizards of the Coast LLC.</p>
      <p>This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC,
      available at <a href="https://dnd.wizards.com/resources/systems-reference-document" target="_blank" rel="noopener">dnd.wizards.com</a>.
      The SRD 5.1 is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener">Creative Commons Attribution 4.0 International License</a>.</p>
      <p>Per l'edizione 3.5 l'app usa solo meccaniche di gioco e non riproduce testi del relativo System Reference Document.</p>
      <p><a href="privacy.html">Informativa sulla privacy</a></p>
    </details>
  </section>`;
}
