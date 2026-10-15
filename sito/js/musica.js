/*
 * Suggerimenti musicali. L'AI propone l'atmosfera e una frase di ricerca;
 * i pulsanti aprono la ricerca su YouTube e Spotify. Niente link a brani precisi:
 * un modello linguistico li inventerebbe e porterebbero a pagine inesistenti.
 */
import { esc } from "./ui.js";

export const linkYouTube = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const linkSpotify = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}/playlists`;

export function bloccoMusica(m) {
  if (!m?.ricerca) return "";
  return `<div class="musica">
    <span class="musica-icona" aria-hidden="true">♪</span>
    <span class="musica-testo">${esc(m.atmosfera || m.ricerca)}</span>
    <a class="pulsante piccolo yt" href="${linkYouTube(m.ricerca)}" target="_blank" rel="noopener">YouTube</a>
    <a class="pulsante piccolo sp" href="${linkSpotify(m.ricerca)}" target="_blank" rel="noopener">Spotify</a>
  </div>`;
}

/* Atmosfere pronte, per il tavolo. Le frasi di ricerca sono in inglese perché trovano più risultati. */
export const ATMOSFERE = [
  ["Taverna", "medieval tavern music"],
  ["Città e mercato", "medieval town market ambience"],
  ["Viaggio e strada", "fantasy travel music adventure"],
  ["Foresta", "enchanted forest ambience fantasy"],
  ["Dungeon", "dark dungeon ambience"],
  ["Caverna", "cave ambience dripping water"],
  ["Mistero e indagine", "mystery investigation music fantasy"],
  ["Orrore", "horror ambience dark fantasy"],
  ["Combattimento", "epic battle music fantasy"],
  ["Scontro finale", "epic orchestral boss battle music"],
  ["Tempio e sacro", "sacred choir ambient fantasy"],
  ["Mare e porto", "pirate port ambience sea shanty"],
  ["Montagna e neve", "winter mountain wind ambience"],
  ["Accampamento notturno", "campfire night ambience"],
  ["Corte nobiliare", "baroque court music"],
  ["Vittoria", "triumphant fantasy music victory"],
  ["Tristezza", "sad emotional fantasy music"],
];
