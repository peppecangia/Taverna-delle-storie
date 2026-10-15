/* Controlli rapidi sui calcoli che non dipendono dall'AI. Uso: npm run verifica */
import assert from "node:assert/strict";
import { difficolta5e, difficolta35, budget5e } from "../sito/js/regole.js";
import { tira } from "../sito/js/dadi.js";
import { generaMappa, CELLA } from "../sito/js/mappe.js";
import { costruisciPrompt, pulisciDati, TIPI } from "../netlify/lib/prompt.mjs";

// 5e: 4 PG di livello 3, 2 nemici GS 1 → 400 PE × 1,5 = 600: media (soglie 300/600/900/1600)
const d5 = difficolta5e([{ gs: "1", quantita: 2 }], [3, 3, 3, 3]);
assert.equal(d5.peAdattati, 600);
assert.deepEqual(d5.soglie, [300, 600, 900, 1600]);
assert.equal(d5.livello, "media");
assert.equal(budget5e(4, 1, "letale"), 400);

// 3.5: due creature GS 3 = LI 5; gruppo di 4 livello 3 → molto difficile
const d35 = difficolta35([{ gs: "3", quantita: 2 }], [3, 3, 3, 3]);
assert.equal(d35.li, 5);
assert.equal(d35.livello, "molto difficile");
assert.equal(difficolta35([{ gs: "3", quantita: 1 }], [3, 3, 3, 3]).livello, "impegnativo");

// Dadi
for (let i = 0; i < 200; i++) {
  const r = tira("2d6+3");
  assert.ok(r.totale >= 5 && r.totale <= 15);
  const k = tira("4d6k3");
  assert.ok(k.totale >= 3 && k.totale <= 18);
}
assert.throws(() => tira("2x6"));
assert.equal(tira("10").totale, 10);
assert.equal(tira("1d1-3").totale, -2);

// Mappe: ripetibili, collegate, con il numero di aree atteso
for (const tipo of ["dungeon", "caverna"])
  for (const dimensione of ["piccola", "media", "grande"])
    for (let seme = 1; seme <= 25; seme++) {
      const a = generaMappa({ tipo, dimensione, seme }), b = generaMappa({ tipo, dimensione, seme });
      assert.deepEqual(a.celle, b.celle, "stesso seme, stessa mappa");
      assert.ok(a.stanze.length >= 3, `${tipo} ${dimensione} ${seme}: poche aree`);
      // Tutte le celle calpestabili devono essere raggiungibili dall'ingresso
      const libere = [...a.celle.keys()].filter((i) => a.celle[i] !== CELLA.ROCCIA && a.celle[i] !== CELLA.COLONNA);
      const visti = new Set([libere[0]]), coda = [libere[0]];
      while (coda.length) {
        const c = coda.pop(), x = c % a.l, y = (c / a.l) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, j = ny * a.l + nx;
          if (nx < 0 || ny < 0 || nx >= a.l || ny >= a.a || visti.has(j)) continue;
          if (a.celle[j] === CELLA.ROCCIA || a.celle[j] === CELLA.COLONNA) continue;
          visti.add(j); coda.push(j);
        }
      }
      assert.equal(visti.size, libere.length, `${tipo} ${dimensione} seme ${seme}: zone isolate`);
    }

// Prompt: ogni tipo produce un testo e i dati sporchi vengono ripuliti
const sporchi = pulisciDati({ livello: 99, numeroPG: -3, note: "x".repeat(5000), edizione: "4e", campoStrano: 1 });
assert.equal(sporchi.livello, 20);
assert.equal(sporchi.numeroPG, 1);
assert.equal(sporchi.note.length, 600);
assert.equal(sporchi.edizione, "5e");
assert.ok(!("campoStrano" in sporchi));
for (const t of TIPI) assert.ok(costruisciPrompt(t, sporchi).utente.length > 100, t);
assert.ok(costruisciPrompt("png", { ...sporchi, edizione: "3.5" }).system.includes("Tempra"));

console.log("Tutti i controlli superati.");
