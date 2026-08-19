# ⚔️ Forgia delle Avventure

Generatore per Dungeon Master con AI. D&D 3.5 e 5e.

---

## Cosa è cambiato in questa versione

**Creazione personaggi completa.** Scegli razza, classe e livello: la scheda esce
con caratteristiche e modificatori, punti ferita, classe armatura, bonus di competenza,
tiri salvezza, abilità, tratti razziali, privilegi di classe, **talenti**, incantesimi
(se la classe ne ha), equipaggiamento, storia e un consiglio su come interpretarlo.

**Luoghi illustrati.** Ogni luogo e le zone più memorabili hanno un'immagine.
Se il servizio di generazione non risponde, compare comunque una scena disegnata
dall'app stessa: non resta mai un riquadro vuoto.

**Musica dentro le scene.** Non c'è più una sezione audio separata. Il suggerimento
musicale compare dove serve: nell'apertura, in ogni atto, allo scontro con l'antagonista,
all'ingresso di un luogo, durante l'esplorazione, all'inizio di un combattimento.
Ogni blocco ha due pulsanti che aprono la ricerca su YouTube e su Spotify.

---

## Metterla online — 3 passi

### 1. Carica su GitHub
Crea un repository su [github.com/new](https://github.com/new) e caricaci
tutti i file di questa cartella (trascinandoli dalla pagina web va benissimo).

### 2. Collega Netlify
Su [netlify.com](https://netlify.com) → **Add new site** → **Import from Git** →
scegli il repository → **Deploy**.
Non toccare le impostazioni di build: il file `netlify.toml` le configura da solo.

### 3. Inserisci la chiave API — obbligatorio
Senza questo passo l'app si apre ma non genera nulla.

1. Prendi la chiave su [console.anthropic.com](https://console.anthropic.com)
   → **API Keys** → **Create Key** (comincia con `sk-ant-`)
2. Su Netlify: **Site configuration → Environment variables → Add a variable**
   - Key: `ANTHROPIC_API_KEY`
   - Value: la tua chiave
3. **Deploys → Trigger deploy** per riavviare con la chiave attiva

La chiave resta sul server. Chi usa l'app non può vederla.

---

## Installarla sul telefono

Apri l'indirizzo Netlify con Chrome → menu ⋮ → **Installa app**.
Comparirà l'icona nella schermata Home.

---

## Costi

| Voce | Costo |
|---|---|
| Netlify (hosting + funzioni) | Gratuito nei limiti d'uso normali |
| Immagini | Gratuite, nessuna chiave |
| API Anthropic | Circa 1-3 centesimi per generazione |
| Play Store (solo se vuoi pubblicarla lì) | 25 $ una tantum |

---

## Se qualcosa non va

L'app dice sempre cosa è successo, in italiano:

- **"La chiave API non è ancora configurata"** → manca il passo 3 qui sopra
- **"Chiave API non valida o scaduta"** → ricontrolla di averla copiata per intero
- **"Troppe richieste ravvicinate"** → aspetta qualche secondo
- **"Il servizio è sovraccarico"** → riprova tra un minuto
- **"La risposta non era nel formato atteso"** → premi Rigenera, capita di rado

La sezione **Dadi** funziona sempre, anche senza connessione e senza chiave.

---

## Contenuto della cartella

```
index.html               l'applicazione
netlify.toml             configurazione (non modificare)
netlify/functions/       il proxy che custodisce la chiave
manifest.json, sw.js     per l'installazione come app
icons/                   icone
LEGGIMI.md               questo file
```

---

## Nota sulle regole

Le schede personaggio le compila l'AI: sono corrette nella grande maggioranza dei casi,
ma su combinazioni insolite o ad alto livello può sbagliare un calcolo.
Prima di usare un personaggio in una partita importante, dai un'occhiata ai numeri.
