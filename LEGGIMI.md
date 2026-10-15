# 🎲 Taverna delle storie

App per master di giochi di ruolo fantasy, compatibile con la 5ª edizione e con la 3.5.
Funziona sul telefono come un'app installata (PWA) e si può pubblicare sul Play Store.

---

## Cosa fa

**Con l'AI** (consumano generazioni, il limite gratuito è giornaliero):

| Generatore | Cosa produce |
|---|---|
| Avventura | One shot da 3-4 ore divisa in atti, oppure campagna a più sessioni. Scene con testo da leggere ai giocatori, prove con CD, incontri, enigmi, trappole, antagonista, PNG, luoghi, tesori, finali alternativi |
| Sessione di campagna | Ogni sessione si sviluppa in dettaglio quando serve, tenendo conto del diario di quello che è successo al tavolo |
| Personaggi non giocanti | Carattere, voce, segreto, frasi tipiche, statistiche, ritratto |
| Luogo illustrato | Zone, dicerie, segreti, illustrazione |
| Incontro | Nemici bilanciati sul gruppo, tattiche, svolte; si aggiungono all'iniziativa con un tocco |
| Enigmi e indovinelli | Tre indizi graduati e soluzione nascosta |
| Trappole | CD per individuarle e disattivarle, danni, modi per aggirarle |
| Tesoro | Monete, gemme, oggetti magici adatti al livello |
| Aree della mappa | Riempie le aree numerate di una mappa tattica |

**Senza AI** (illimitati e funzionanti anche offline):

- **Mappe tattiche a griglia**: dungeon e caverne, da scaricare a colori, in versione da stampare o senza numeri per i giocatori.
- **Iniziativa**: ordine automatico, punti ferita, condizioni, round.
- **Dadi**: tasti rapidi, vantaggio e svantaggio, espressioni come `2d6+3` o `4d6k3`.
- **Calcolo della difficoltà** degli incontri con le tabelle delle regole (5e e 3.5).
- **Al volo**: nomi, taverne, dicerie, incontri in viaggio, meteo, complicazioni, oggetti curiosi.
- **Musica**: atmosfere pronte con ricerca su YouTube e Spotify.
- **Archivio** sul telefono, con copia di sicurezza da scaricare e ricaricare.
- **Stampa o PDF** di qualsiasi contenuto.
- **Sessione zero**: promemoria su linee, veli e carta X.

### Due scelte di progetto da conoscere

- **Musica**: i pulsanti aprono una *ricerca* su YouTube e Spotify, non un brano preciso.
  Un'AI che scrive link a brani specifici li inventa, e porterebbero a pagine inesistenti.
- **Illustrazioni**: le crea il servizio gratuito Pollinations, che senza registrazione accetta circa
  una richiesta ogni 15 secondi. Per questo si caricano solo quando premi "Mostra illustrazione".
  Finché non arrivano si vede una scena disegnata dall'app.

---

## Metterla online

### 1. Collega Netlify al repository
Su [netlify.com](https://netlify.com): **Add new site → Import from Git** → scegli questo repository → **Deploy**.
Le impostazioni le legge da `netlify.toml`, non serve toccarle.

### 2. Inserisci le variabili d'ambiente
**Site configuration → Environment variables → Add a variable**:

| Nome | Obbligatoria | Cosa mettere |
|---|---|---|
| `ANTHROPIC_API_KEY` | sì | la chiave presa su [console.anthropic.com](https://console.anthropic.com) (comincia con `sk-ant-`) |
| `LIMITE_GIORNALIERO` | no | generazioni gratuite al giorno per dispositivo, predefinito `5` |
| `CODICE_ILLIMITATO` | no | una parola segreta tua. Scritta in **Altro → Impostazioni → Codice di accesso** toglie il limite: serve a te per provare l'app |
| `MODELLO` | no | modello Claude, predefinito `claude-opus-5-5` (vedi i costi qui sotto) |
| `IMPEGNO` | no | quanto ragiona il modello: `low`, `medium` (predefinito), `high` |

Poi **Deploys → Trigger deploy** per ripartire con le variabili attive.

### 3. Prima della pubblicazione sostituisci i segnaposto
- `INDIRIZZO_EMAIL_DI_CONTATTO` in `sito/privacy.html` e `sito/js/config.js`: un indirizzo email per i contatti e le segnalazioni.
- In `sito/.well-known/assetlinks.json`: il nome del pacchetto e l'impronta della firma (vedi il Play Store qui sotto).

---

## Costi

| Voce | Costo |
|---|---|
| Netlify (sito, funzioni, archivio dei contatori) | gratuito nei limiti del piano base |
| Illustrazioni Pollinations | gratuite |
| Account sviluppatore Google Play | 25 $ una tantum |
| Generazioni AI | dipende dal modello, vedi sotto |

**Il costo delle generazioni è la voce da tenere d'occhio**, perché lo paghi tu per ogni utente.
Stima indicativa per una one shot completa (circa 2.000 parole in ingresso e 6.000-10.000 in uscita, ragionamento compreso):

| Modello | Prezzo per milione di token (ingresso / uscita) | Una one shot, circa |
|---|---|---|
| `claude-opus-5-5` (predefinito, qualità migliore) | 4 $ / 20 $ | 0,15-0,25 $ |
| `claude-sonnet-5-5` | 2 $ / 10 $ | 0,07-0,12 $ |
| `claude-haiku-5-5` | 0,10 $ / 0,50 $ | meno di 1 centesimo |

PNG, enigmi e trappole costano molto meno di un'avventura. Sono stime: i costi reali li vedi su console.anthropic.com
dopo le prime prove. Con 5 generazioni gratuite al giorno, un utente molto attivo può costarti fino a circa 1 $ al giorno con Opus.
Su console.anthropic.com imposta un **limite di spesa mensile**, così non hai sorprese.

---

## Pubblicarla sul Play Store

L'app è una PWA: per Android si "impacchetta" in una Trusted Web Activity, cioè un'app che apre il sito a schermo intero.

1. Pubblica il sito su Netlify e, se puoi, collega un dominio tuo (es. `tavernadellestorie.it`). Va bene anche l'indirizzo `.netlify.app`.
2. Vai su [pwabuilder.com](https://www.pwabuilder.com), inserisci l'indirizzo del sito e scegli **Package for stores → Android**.
   Come nome del pacchetto usa `it.tavernadellestorie.app` (o cambialo anche in `assetlinks.json`).
3. PWABuilder ti dà un file `.aab` da caricare sul Play Store e un file `assetlinks.json`.
   Copia l'impronta `sha256_cert_fingerprints` nel file `sito/.well-known/assetlinks.json` e ripubblica il sito.
   Se lo salti, l'app mostra una barra con l'indirizzo in alto.
4. Su [play.google.com/console](https://play.google.com/console) crea l'app e compila:
   - **Informativa sulla privacy**: `https://<tuo-sito>/privacy.html`
   - **Sicurezza dei dati**: l'app non raccoglie dati personali; invia un identificativo casuale del dispositivo e l'IP cifrato solo per il limite giornaliero.
   - **Contenuti generati dall'AI**: l'app ha il link "Segnala un contenuto offensivo" sotto ogni risultato, come richiesto da Google.
5. **Attenzione**: per gli account sviluppatore personali creati di recente, Google chiede un test chiuso con
   almeno 12 tester per 14 giorni consecutivi prima di poter pubblicare. Verifica il requisito aggiornato nella console.

### Nome e marchi
"Dungeons & Dragons" e "D&D" sono marchi registrati di Wizards of the Coast: non usarli nel nome dell'app,
nell'icona o nel titolo della scheda del Play Store. Nella descrizione si può scrivere "compatibile con la 5ª edizione".
L'app nomina solo creature e regole dei documenti SRD o inventate. Questa non è una consulenza legale:
se l'app inizia a guadagnare, conviene una verifica con un esperto.

---

## Struttura del progetto

```
sito/                     tutto quello che vede l'utente (pubblicato da Netlify)
  index.html              pagina dell'app
  css/app.css             grafica
  js/main.js              navigazione e azioni
  js/viste/               pagine: crea, risultati, al tavolo, archivio e altro
  js/mappe.js             generatore di mappe tattiche
  js/regole.js            calcolo della difficoltà 5e e 3.5
  js/tabelle.js           generatori "Al volo"
  js/archivio.js          salvataggio sul telefono
  js/api.js               comunicazione con il server
  privacy.html            informativa sulla privacy
  sw.js, manifest.json    installazione e funzionamento offline
netlify/functions/        server
  avvia.mjs               controlla il limite giornaliero e avvia la generazione
  genera-background.mjs   chiama Claude (può durare fino a 15 minuti)
  stato.mjs               il telefono chiede se il risultato è pronto
netlify/lib/prompt.mjs    istruzioni per Claude, una per ogni tipo di contenuto
scripts/verifica.mjs      controlli automatici sui calcoli
```

Per i controlli automatici: `npm install` e poi `npm run verifica`.

### Perché la generazione passa da una funzione "in background"
Le funzioni normali di Netlify si fermano dopo pochi secondi, troppo pochi per scrivere un'avventura completa.
La generazione parte quindi in una funzione in background, il risultato viene salvato per pochi minuti
e il telefono lo scarica appena è pronto. Dopo la consegna viene cancellato dal server.

---

## Se qualcosa non va

L'app spiega sempre cosa è successo, in italiano:

- **"Il servizio non è ancora configurato"**: manca `ANTHROPIC_API_KEY` (passo 2).
- **"La chiave API sul server non è valida"**: ricontrolla di averla copiata per intero.
- **"Hai usato tutte le generazioni gratuite di oggi"**: il limite si azzera ogni giorno (ora UTC).
- **"La risposta non era nel formato atteso"**: riprova; il server ritenta già una volta da solo.
- **"La generazione ha impiegato troppo tempo"**: riprova; se succede spesso, controlla i registri delle funzioni su Netlify.

I testi li scrive un'AI: sono quasi sempre corretti, ma su calcoli insoliti o livelli alti può sbagliare.
Per gli incontri l'app ricalcola la difficoltà con le tabelle delle regole e mostra il risultato sotto i nemici.
