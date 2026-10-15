/* Tiri di dado: espressioni come "2d6+3", "1d20-1", "4d6k3" (tiene i 3 più alti). */

const d = (facce) => 1 + Math.floor(Math.random() * facce);

export function tira(espressione) {
  const pulita = espressione.toLowerCase().replace(/\s+/g, "");
  if (!/^[+-]?(\d*d\d+(k\d+)?|\d+)([+-](\d*d\d+(k\d+)?|\d+))*$/.test(pulita)) throw new Error("espressione_non_valida");
  const parti = pulita.match(/[+-]?[^+-]+/g);
  let totale = 0;
  const dettagli = [];
  for (const parte of parti) {
    const segno = parte.startsWith("-") ? -1 : 1;
    const corpo = parte.replace(/^[+-]/, "");
    const m = corpo.match(/^(\d*)d(\d+)(?:k(\d+))?$/);
    if (!m) {
      totale += segno * Number(corpo);
      dettagli.push(`${segno < 0 ? "−" : "+"}${corpo}`);
      continue;
    }
    const quanti = Math.min(Number(m[1] || 1), 100), facce = Math.min(Number(m[2]), 1000);
    if (!quanti || !facce) throw new Error("espressione_non_valida");
    const tiri = Array.from({ length: quanti }, () => d(facce));
    let tenuti = tiri;
    if (m[3]) tenuti = [...tiri].sort((a, b) => b - a).slice(0, Number(m[3]));
    const somma = tenuti.reduce((s, v) => s + v, 0);
    totale += segno * somma;
    dettagli.push(`${segno < 0 ? "−" : ""}${quanti}d${facce}${m[3] ? `k${m[3]}` : ""} [${tiri.join(", ")}]`);
  }
  return { espressione, totale, dettagli: dettagli.join(" ") };
}

/* Vantaggio e svantaggio della 5e: due d20, si tiene il migliore o il peggiore. */
export function tiraD20(modo = "normale", bonus = 0) {
  const a = d(20), b = d(20);
  const scelto = modo === "vantaggio" ? Math.max(a, b) : modo === "svantaggio" ? Math.min(a, b) : a;
  return { totale: scelto + bonus, naturale: scelto, tiri: modo === "normale" ? [a] : [a, b] };
}

/* Caratteristiche: 4d6, si scarta il più basso, sei volte. */
export const tiraCaratteristiche = () =>
  Array.from({ length: 6 }, () => [d(6), d(6), d(6), d(6)].sort((x, y) => y - x).slice(0, 3).reduce((s, v) => s + v, 0));
