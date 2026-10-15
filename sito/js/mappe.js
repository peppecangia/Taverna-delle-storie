/*
 * Mappe tattiche a griglia, generate con un algoritmo (niente AI): ogni quadretto
 * vale 1,5 metri (5 piedi). Lo stesso seme ridà sempre la stessa mappa,
 * quindi in archivio basta salvare tipo, dimensioni e seme.
 */
import { generatore } from "./caso.js";

export const CELLA = { ROCCIA: 0, PAVIMENTO: 1, PORTA: 2, COLONNA: 3, ACQUA: 4, MACERIE: 5, SCALE: 6 };

export const DIMENSIONI = {
  piccola: { l: 30, a: 22, stanze: 5 },
  media: { l: 40, a: 30, stanze: 8 },
  grande: { l: 56, a: 40, stanze: 12 },
};

function vuota(l, a) {
  return { l, a, celle: new Uint8Array(l * a) };
}
const idx = (m, x, y) => y * m.l + x;
const dentro = (m, x, y) => x >= 0 && y >= 0 && x < m.l && y < m.a;
const leggi = (m, x, y) => (dentro(m, x, y) ? m.celle[idx(m, x, y)] : CELLA.ROCCIA);
const metti = (m, x, y, v) => dentro(m, x, y) && (m.celle[idx(m, x, y)] = v);

/* Dungeon: stanze rettangolari collegate da corridoi a L. */
function dungeon(dim, rnd) {
  const m = vuota(dim.l, dim.a);
  const stanze = [];
  for (let tentativi = 0; tentativi < 400 && stanze.length < dim.stanze; tentativi++) {
    const l = rnd.intero(4, 9), a = rnd.intero(4, 8);
    const x = rnd.intero(1, m.l - l - 2), y = rnd.intero(1, m.a - a - 2);
    // Almeno 2 quadretti di roccia tra una stanza e l'altra
    if (stanze.some((s) => x < s.x + s.l + 2 && x + l + 2 > s.x && y < s.y + s.a + 2 && y + a + 2 > s.y)) continue;
    stanze.push({ x, y, l, a });
  }
  // Ordina da sinistra a destra: l'ingresso è a ovest, il cuore del luogo a est
  stanze.sort((p, q) => p.x + p.y * 0.3 - (q.x + q.y * 0.3));
  for (const s of stanze) for (let yy = s.y; yy < s.y + s.a; yy++) for (let xx = s.x; xx < s.x + s.l; xx++) metti(m, xx, yy, CELLA.PAVIMENTO);

  const centro = (s) => ({ x: s.x + Math.floor(s.l / 2), y: s.y + Math.floor(s.a / 2) });
  const corridoio = (da, a) => {
    const p = centro(da), q = centro(a);
    // Due tratti dritti che si incontrano in un angolo
    const angolo = rnd() < 0.5 ? { x: q.x, y: p.y } : { x: p.x, y: q.y };
    const passi = [];
    const tratto = (da, a) => {
      let { x, y } = da;
      passi.push([x, y]);
      while (x !== a.x || y !== a.y) {
        x += Math.sign(a.x - x);
        y += Math.sign(a.y - y);
        passi.push([x, y]);
      }
    };
    tratto(p, angolo);
    tratto(angolo, q);
    for (const [x, y] of passi) {
      const prima = leggi(m, x, y);
      if (prima === CELLA.ROCCIA) metti(m, x, y, CELLA.PAVIMENTO | 0x10); // 0x10 = corridoio
    }
  };
  // Ogni stanza si collega alla più vicina tra quelle già collegate, più qualche anello
  for (let i = 1; i < stanze.length; i++) {
    let migliore = 0, distanza = Infinity;
    for (let j = 0; j < i; j++) {
      const d = Math.abs(centro(stanze[i]).x - centro(stanze[j]).x) + Math.abs(centro(stanze[i]).y - centro(stanze[j]).y);
      if (d < distanza) [distanza, migliore] = [d, j];
    }
    corridoio(stanze[migliore], stanze[i]);
  }
  for (let k = 0; k < Math.floor(stanze.length / 4); k++) corridoio(rnd.scegli(stanze), rnd.scegli(stanze));

  // Porte: corridoio che tocca il bordo di una stanza
  for (let y = 0; y < m.a; y++)
    for (let x = 0; x < m.l; x++) {
      if (leggi(m, x, y) !== (CELLA.PAVIMENTO | 0x10)) continue;
      const vicinoStanza = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => leggi(m, x + dx, y + dy) === CELLA.PAVIMENTO);
      const strozzatura =
        (leggi(m, x - 1, y) === CELLA.ROCCIA && leggi(m, x + 1, y) === CELLA.ROCCIA) ||
        (leggi(m, x, y - 1) === CELLA.ROCCIA && leggi(m, x, y + 1) === CELLA.ROCCIA);
      if (vicinoStanza && strozzatura && rnd() < 0.7) metti(m, x, y, CELLA.PORTA);
    }
  for (let i = 0; i < m.celle.length; i++) if (m.celle[i] & 0x10) m.celle[i] = CELLA.PAVIMENTO;

  // Dettagli: scale all'ingresso, colonne nelle sale grandi, acqua e macerie qua e là
  stanze.forEach((s, i) => {
    if (i === 0) metti(m, s.x, s.y, CELLA.SCALE);
    if (s.l >= 7 && s.a >= 6 && rnd() < 0.7)
      for (let yy = s.y + 1; yy < s.y + s.a - 1; yy += 3) {
        metti(m, s.x + 1, yy, CELLA.COLONNA);
        metti(m, s.x + s.l - 2, yy, CELLA.COLONNA);
      }
    if (i > 0 && rnd() < 0.25) {
      const cx = s.x + rnd.intero(1, s.l - 3), cy = s.y + rnd.intero(1, s.a - 3);
      for (let yy = cy; yy < cy + 2; yy++) for (let xx = cx; xx < cx + 2; xx++) metti(m, xx, yy, CELLA.ACQUA);
    }
    if (rnd() < 0.35)
      for (let n = 0; n < 3; n++) {
        const xx = s.x + rnd.intero(0, s.l - 1), yy = s.y + rnd.intero(0, s.a - 1);
        if (leggi(m, xx, yy) === CELLA.PAVIMENTO) metti(m, xx, yy, CELLA.MACERIE);
      }
  });

  m.stanze = stanze.map((s, i) => ({ numero: i + 1, larghezza: s.l, altezza: s.a, cx: s.x + s.l / 2, cy: s.y + s.a / 2 }));
  return m;
}

/* Caverna: automa cellulare, poi si tiene solo la grotta più grande. */
function caverna(dim, rnd) {
  const m = vuota(dim.l, dim.a);
  for (let y = 1; y < m.a - 1; y++) for (let x = 1; x < m.l - 1; x++) m.celle[idx(m, x, y)] = rnd() < 0.55 ? CELLA.PAVIMENTO : CELLA.ROCCIA;
  for (let giro = 0; giro < 5; giro++) {
    const copia = m.celle.slice();
    for (let y = 1; y < m.a - 1; y++)
      for (let x = 1; x < m.l - 1; x++) {
        let roccia = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (leggi(m, x + dx, y + dy) === CELLA.ROCCIA) roccia++;
        copia[idx(m, x, y)] = roccia >= 5 ? CELLA.ROCCIA : CELLA.PAVIMENTO;
      }
    m.celle = copia;
  }
  // Riempimento per trovare la regione più grande
  const regione = new Int32Array(m.celle.length).fill(-1);
  let migliore = -1, dimMigliore = 0;
  for (let i = 0, r = 0; i < m.celle.length; i++) {
    if (m.celle[i] !== CELLA.PAVIMENTO || regione[i] >= 0) continue;
    const coda = [i];
    regione[i] = r;
    let n = 0;
    while (coda.length) {
      const c = coda.pop();
      n++;
      const x = c % m.l, y = (c / m.l) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const j = idx(m, x + dx, y + dy);
        if (dentro(m, x + dx, y + dy) && m.celle[j] === CELLA.PAVIMENTO && regione[j] < 0) {
          regione[j] = r;
          coda.push(j);
        }
      }
    }
    if (n > dimMigliore) [dimMigliore, migliore] = [n, r];
    r++;
  }
  const libere = [];
  for (let i = 0; i < m.celle.length; i++) {
    if (m.celle[i] === CELLA.PAVIMENTO && regione[i] !== migliore) m.celle[i] = CELLA.ROCCIA;
    else if (m.celle[i] === CELLA.PAVIMENTO) libere.push(i);
  }
  // Pozze d'acqua e massi
  for (let n = 0; n < 3; n++) {
    const c = rnd.scegli(libere), x = c % m.l, y = (c / m.l) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (leggi(m, x + dx, y + dy) === CELLA.PAVIMENTO && rnd() < 0.8) metti(m, x + dx, y + dy, CELLA.ACQUA);
  }
  for (let n = 0; n < libere.length / 40; n++) {
    const c = rnd.scegli(libere);
    if (m.celle[c] === CELLA.PAVIMENTO) m.celle[c] = CELLA.MACERIE;
  }
  // Aree numerate: punti il più possibile lontani tra loro, da ovest a est
  const punti = [];
  let primo = libere.reduce((a, b) => ((a % m.l) < (b % m.l) ? a : b));
  punti.push(primo);
  while (punti.length < dim.stanze) {
    let lontano = libere[0], dMax = -1;
    for (const c of libere) {
      const d = Math.min(...punti.map((p) => Math.hypot((p % m.l) - (c % m.l), ((p / m.l) | 0) - ((c / m.l) | 0))));
      if (d > dMax) [dMax, lontano] = [d, c];
    }
    punti.push(lontano);
  }
  m.celle[primo] = CELLA.SCALE;
  punti.sort((p, q) => (p % m.l) - (q % m.l));
  m.stanze = punti.map((c, i) => ({ numero: i + 1, larghezza: 6, altezza: 6, cx: (c % m.l) + 0.5, cy: ((c / m.l) | 0) + 0.5 }));
  return m;
}

export function generaMappa({ tipo = "dungeon", dimensione = "media", seme = Date.now() }) {
  const dim = DIMENSIONI[dimensione] || DIMENSIONI.media;
  const rnd = generatore(`${tipo}-${dimensione}-${seme}`);
  const m = tipo === "caverna" ? caverna(dim, rnd) : dungeon(dim, rnd);
  return Object.assign(m, { tipo, dimensione, seme });
}

const TEMI = {
  pergamena: { roccia: "#2b2520", tratteggio: "#3a322b", pavimento: "#e9dcc0", griglia: "rgba(80,60,40,.28)", bordo: "#1a1410", porta: "#7a4a22", acqua: "#6f9fb8", macerie: "#9a8a72", colonna: "#4a4038", numero: "#7a1f1f", testoNumero: "#fff" },
  stampa: { roccia: "#ffffff", tratteggio: "#bbbbbb", pavimento: "#ffffff", griglia: "rgba(0,0,0,.35)", bordo: "#000000", porta: "#000000", acqua: "#cfe3ee", macerie: "#999999", colonna: "#333333", numero: "#000000", testoNumero: "#fff" },
};

export function disegnaMappa(canvas, m, { lato = 24, tema = "pergamena", griglia = true, numeri = true } = {}) {
  const t = TEMI[tema] || TEMI.pergamena;
  canvas.width = m.l * lato;
  canvas.height = m.a * lato;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = t.roccia;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Tratteggio della roccia vicino alle pareti, come nelle mappe disegnate a mano
  ctx.strokeStyle = t.tratteggio;
  ctx.lineWidth = Math.max(1, lato / 16);
  for (let y = 0; y < m.a; y++)
    for (let x = 0; x < m.l; x++) {
      if (leggi(m, x, y) !== CELLA.ROCCIA) continue;
      let vicino = false;
      for (let dy = -1; dy <= 1 && !vicino; dy++) for (let dx = -1; dx <= 1; dx++) if (leggi(m, x + dx, y + dy) !== CELLA.ROCCIA) { vicino = true; break; }
      if (!vicino) continue;
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        ctx.moveTo(x * lato + k * (lato / 3), y * lato + lato);
        ctx.lineTo(x * lato + k * (lato / 3) + lato / 3, y * lato);
      }
      ctx.stroke();
    }
  for (let y = 0; y < m.a; y++)
    for (let x = 0; x < m.l; x++) {
      const c = leggi(m, x, y);
      if (c === CELLA.ROCCIA) continue;
      const px = x * lato, py = y * lato;
      ctx.fillStyle = c === CELLA.ACQUA ? t.acqua : t.pavimento;
      ctx.fillRect(px, py, lato, lato);
      if (c === CELLA.COLONNA) {
        ctx.fillStyle = t.colonna;
        ctx.beginPath();
        ctx.arc(px + lato / 2, py + lato / 2, lato * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (c === CELLA.MACERIE) {
        ctx.fillStyle = t.macerie;
        for (const [a, b, r] of [[0.3, 0.35, 0.14], [0.65, 0.6, 0.18], [0.35, 0.72, 0.1]]) {
          ctx.beginPath();
          ctx.arc(px + lato * a, py + lato * b, lato * r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (c === CELLA.SCALE) {
        ctx.strokeStyle = t.bordo;
        ctx.lineWidth = Math.max(1, lato / 14);
        for (let k = 1; k < 5; k++) {
          ctx.beginPath();
          ctx.moveTo(px + (lato * k) / 5, py + lato * 0.15);
          ctx.lineTo(px + (lato * k) / 5, py + lato * 0.85);
          ctx.stroke();
        }
      }
    }
  if (griglia) {
    ctx.strokeStyle = t.griglia;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 0; y < m.a; y++)
      for (let x = 0; x < m.l; x++) {
        if (leggi(m, x, y) === CELLA.ROCCIA) continue;
        ctx.rect(x * lato + 0.5, y * lato + 0.5, lato, lato);
      }
    ctx.stroke();
  }
  // Pareti: linea spessa dove il pavimento confina con la roccia
  ctx.strokeStyle = t.bordo;
  ctx.lineWidth = Math.max(2, lato / 8);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let y = 0; y < m.a; y++)
    for (let x = 0; x < m.l; x++) {
      if (leggi(m, x, y) === CELLA.ROCCIA) continue;
      const px = x * lato, py = y * lato;
      if (leggi(m, x, y - 1) === CELLA.ROCCIA) { ctx.moveTo(px, py); ctx.lineTo(px + lato, py); }
      if (leggi(m, x, y + 1) === CELLA.ROCCIA) { ctx.moveTo(px, py + lato); ctx.lineTo(px + lato, py + lato); }
      if (leggi(m, x - 1, y) === CELLA.ROCCIA) { ctx.moveTo(px, py); ctx.lineTo(px, py + lato); }
      if (leggi(m, x + 1, y) === CELLA.ROCCIA) { ctx.moveTo(px + lato, py); ctx.lineTo(px + lato, py + lato); }
    }
  ctx.stroke();
  // Porte
  for (let y = 0; y < m.a; y++)
    for (let x = 0; x < m.l; x++) {
      if (leggi(m, x, y) !== CELLA.PORTA) continue;
      const orizzontale = leggi(m, x - 1, y) === CELLA.ROCCIA;
      ctx.fillStyle = t.porta;
      ctx.strokeStyle = t.bordo;
      ctx.lineWidth = Math.max(1, lato / 14);
      const [w, h] = orizzontale ? [lato * 0.8, lato * 0.35] : [lato * 0.35, lato * 0.8];
      ctx.fillRect(x * lato + (lato - w) / 2, y * lato + (lato - h) / 2, w, h);
      ctx.strokeRect(x * lato + (lato - w) / 2, y * lato + (lato - h) / 2, w, h);
    }
  if (numeri)
    for (const s of m.stanze) {
      const r = lato * 0.48;
      ctx.fillStyle = t.numero;
      ctx.beginPath();
      ctx.arc(s.cx * lato, s.cy * lato, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.testoNumero;
      ctx.font = `bold ${Math.round(lato * 0.55)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(s.numero), s.cx * lato, s.cy * lato + 1);
    }
}
