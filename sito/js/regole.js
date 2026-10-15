/*
 * Calcolo della difficoltà degli incontri, fatto nel telefono senza AI.
 * 5e: soglie di PE e moltiplicatori del manuale del master 2014 (SRD 5.1).
 * 3.5: livello incontro (LI) a confronto con il livello medio del gruppo.
 */

// Soglie per personaggio: [facile, media, difficile, letale], indice = livello - 1
const SOGLIE_5E = [
  [25, 50, 75, 100], [50, 100, 150, 200], [75, 150, 225, 400], [125, 250, 375, 500],
  [250, 500, 750, 1100], [300, 600, 900, 1400], [350, 750, 1100, 1700], [450, 900, 1400, 2100],
  [550, 1100, 1600, 2400], [600, 1200, 1900, 2800], [800, 1600, 2400, 3600], [1000, 2000, 3000, 4500],
  [1100, 2200, 3400, 5100], [1250, 2500, 3800, 5700], [1400, 2800, 4300, 6400], [1600, 3200, 4800, 7200],
  [2000, 3900, 5900, 8800], [2100, 4200, 6300, 9500], [2400, 4900, 7300, 10900], [2800, 5700, 8500, 12700],
];

const PE_PER_GS = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900, "11": 7200, "12": 8400, "13": 10000,
  "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000,
  "28": 120000, "29": 135000, "30": 155000,
};

export const GRADI_SFIDA = Object.keys(PE_PER_GS);
export const DIFFICOLTA = ["facile", "media", "difficile", "letale"];

export function gsInNumero(gs) {
  const s = String(gs).trim();
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return b ? a / b : 0;
  }
  return Number(s) || 0;
}

function moltiplicatore5e(numeroNemici, numeroPG) {
  const scala = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
  let i = numeroNemici <= 1 ? 1 : numeroNemici === 2 ? 2 : numeroNemici <= 6 ? 3 : numeroNemici <= 10 ? 4 : numeroNemici <= 14 ? 5 : 6;
  // Gruppi piccoli rendono gli scontri più duri, gruppi grandi più facili.
  if (numeroPG < 3) i += 1;
  else if (numeroPG >= 6) i -= 1;
  return scala[Math.max(0, Math.min(scala.length - 1, i))];
}

/* nemici: [{gs, quantita}], pg: [livelli] */
export function difficolta5e(nemici, livelliPG) {
  const soglie = [0, 0, 0, 0];
  for (const l of livelliPG) SOGLIE_5E[Math.min(20, Math.max(1, l)) - 1].forEach((v, i) => (soglie[i] += v));
  const totaleNemici = nemici.reduce((s, n) => s + n.quantita, 0);
  const peBase = nemici.reduce((s, n) => s + (PE_PER_GS[String(n.gs)] ?? 0) * n.quantita, 0);
  const molt = moltiplicatore5e(totaleNemici, livelliPG.length);
  const peAdattati = Math.round(peBase * molt);
  let livello = "banale";
  soglie.forEach((s, i) => {
    if (peAdattati >= s) livello = DIFFICOLTA[i];
  });
  return { peBase, moltiplicatore: molt, peAdattati, soglie, livello, pePerPG: Math.round(peBase / Math.max(1, livelliPG.length)) };
}

/*
 * 3.5: ogni creatura vale 2^(GS/2); il LI è 2·log2 della somma.
 * È la regola pratica del manuale (due creature di GS X = LI X+2).
 */
export function difficolta35(nemici, livelliPG) {
  const potenza = nemici.reduce((s, n) => s + Math.pow(2, gsInNumero(n.gs) / 2) * n.quantita, 0);
  const li = potenza > 0 ? Math.round(2 * Math.log2(potenza)) : 0;
  const media = livelliPG.reduce((s, l) => s + l, 0) / Math.max(1, livelliPG.length);
  let lmg = Math.round(media);
  if (livelliPG.length <= 3) lmg -= 1;
  else if (livelliPG.length >= 6) lmg += 1;
  const scarto = li - lmg;
  // Tabella del manuale del master 3.5: sotto il livello facile, pari impegnativo, +1/+4 molto difficile, +5 schiacciante.
  const livello = scarto < 0 ? "facile" : scarto === 0 ? "impegnativo" : scarto <= 4 ? "molto difficile" : "schiacciante";
  return { li, livelloMedio: lmg, scarto, livello };
}

/* Budget di PE da spendere per una certa difficoltà (5e). */
export function budget5e(numeroPG, livello, difficolta) {
  const i = Math.max(0, DIFFICOLTA.indexOf(difficolta));
  return SOGLIE_5E[Math.min(20, Math.max(1, livello)) - 1][i] * numeroPG;
}
