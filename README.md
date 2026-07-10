# Vinkjeller

Personlig vinkjeller-PWA: søk opp viner fra Vinmonopolet (eller skann strekkode / legg inn manuelt), gi dine egne korkpoeng og smaksnotater, hold styr på lageret ditt og ønskelista. Alt lagres lokalt på enheten i IndexedDB — ingen konto, ingen server.

## Stack

- React + Vite
- PWA (offline app-shell via `vite-plugin-pwa`)
- IndexedDB for all lagring
- GitHub Pages for hosting (base-URL `/vinkjeller/`)
- Cloudflare Worker som proxy mot Vinmonopolet-API-et

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:5173/vinkjeller/

## Vinmonopolet-API og proxy

Vinmonopolets produkt-API krever en abonnementsnøkkel (`Ocp-Apim-Subscription-Key`) og tillater ikke direkte kall fra nettleseren (CORS). Derfor går alle API-kall gjennom en **Cloudflare Worker** som holder nøkkelen skjult og legger på riktige CORS-headere.

### 1. Skaff gratis API-nøkkel

1. Gå til https://developer.vinmonopolet.no
2. Opprett bruker og logg inn
3. Abonner på produkt-API-et («Vinmonopolet API»)
4. Kopier `Ocp-Apim-Subscription-Key`

### 2. Sett opp proxy

Nøkkelen legges **aldri** i `.env` i dette prosjektet — den bor kun i Workeren:

```bash
# i proxy-mappa (egen Worker)
wrangler secret put VINMONOPOLET_KEY   # lim inn API-nøkkelen
wrangler secret put CLIENT_TOKEN       # samme verdi som VITE_APP_TOKEN under
wrangler deploy
```

Workeren videresender til `https://apis.vinmonopolet.no/products/v0/details-normal` og krever at klienten sender riktig `CLIENT_TOKEN`.

### 3. Klient-miljø

Kopier `.env.example` til `.env` og fyll inn:

```
VITE_PROXY_URL=https://vinkjeller-proxy.DITTBRUKERNAVN.workers.dev
VITE_APP_TOKEN=<samme token som CLIENT_TOKEN i Workeren>
```

`.env` er git-ignorert. I GitHub Actions settes `VITE_PROXY_URL` og `VITE_APP_TOKEN` som repository secrets.

## Datamodell

Én vin følger `src/data/wineSchema.js`. I tillegg til Vinmonopolet-feltene og dine egne smaksnotater har appen lagerstyring: `quantity` (antall flasker), `cellarLocation` (hylle/rom), `drinkFrom` / `drinkBy` (drikkevindu).

## Eksport / import

Under Innstillinger kan du eksportere hele kjelleren til én JSON-fil (`vinkjeller-eksport-YYYY-MM-DD.json`) — etikettbilder er inkludert som base64, så ingenting går tapt. Import validerer fila og fletter inn på `id` (ny vin legges til, eksisterende overskrives).

## Deploy

Push til `main` → GitHub Actions bygger og publiserer til GitHub Pages automatisk (`.github/workflows/deploy.yml`).
