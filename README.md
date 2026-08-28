# coed-frontend

Frontend till en kollaborativ kodeditor, skapad som kursreferens för DV1677 HT26 vid Blekinge Tekniska Högskola.
Byggd med React 18, Vite och Monaco Editor — stödjer realtidsredigering, kommentarer och autentisering.

Live: https://jsramverk-ht26.github.io/coed-frontend/

## Projektkrav som demonstreras

| Krav | Demonstration | Var i koden |
|------|---------------|-------------|
| Krav 1 – Autentisering | Inloggning, registrering, skyddade rutter | `src/context/AuthContext.jsx`, `src/components/auth/` |
| Krav 2 – Realtid | Realtidsredigering, cursors, aktiva användare | `src/hooks/useCollaboration.js` |
| Krav 4 – Kommentarer | Radbaserade kommentarer i realtid | `src/components/comments/CommentPanel.jsx` |
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
