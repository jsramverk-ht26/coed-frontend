# coed-frontend

Referensimplementation för **DV1677 HT26** — frontend till en kollaborativ kodredigerare.
Byggd med React 18, Vite och Monaco Editor.

> **OBS — läs detta först**
>
> Det här repot är ett *referensexempel*, inte en facit eller mall att kopiera.
> Det visar ett sätt att implementera flera av kursens projektkrav, men exakt
> hur ni löser dem i ert eget projekt är upp till er. Viss funktionalitet kan
> saknas, vara förenklad eller skilja sig från vad kursens krav specifikt efterfrågar.
>
> Krav 5 (notifieringar) är **inte implementerat** i det här repot.
> Krav 6 (kodeditor) är implementerat med Monaco genomgående — i ert projekt
> ska det läggas till som ett *togglebart kodläge* på ett befintligt dokument.

Live: https://jsramverk-ht26.github.io/coed-frontend/

## Projektkrav som demonstreras

| Krav | Demonstration | Var i koden |
|------|---------------|-------------|
| Krav 1 – Autentisering | Inloggning, registrering, skyddade rutter | `src/context/AuthContext.jsx`, `src/components/auth/` |
| Krav 2 – Realtid | Realtidsredigering, cursors, aktiva användare | `src/hooks/useCollaboration.js` |
| Krav 4 – Kommentarer | Radbaserade kommentarer i realtid | `src/components/comments/CommentPanel.jsx` |
| Krav 5 – Notifieringar | **Ej implementerat** | — |
| Krav 6 – Kodeditor | Monaco Editor, syntax highlighting, autosave | `src/pages/EditorPage.jsx` |

## Kör lokalt

```bash
cp .env.example .env
# Sätt VITE_API_URL i .env
npm install
npm run dev
```

## Miljövariabler

| Variabel | Beskrivning |
|----------|-------------|
| `VITE_API_URL` | URL till backend-API (t.ex. `http://localhost:3001`) |

## Driftsättning

GitHub Actions bygger och driftsätter till GitHub Pages vid push till `main`.
Sätt `VITE_API_URL` som repo-hemlighet under Settings → Secrets and variables → Actions.
