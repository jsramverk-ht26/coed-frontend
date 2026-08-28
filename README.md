# coed-frontend

Frontend for en kollaborativ kodeditor, skapad som kursreferens for DV1677 HT26 vid Blekinge Tekniska Hogskola. Byggd med React 18, Vite och Monaco Editor och stoder realtidsredigering, kommentarer och autentisering.

Live: https://jsramverk-ht26.github.io/coed-frontend/

## Krav och demonstration

| Krav | Demonstration | Var i koden |
|------|---------------|-------------|
| Krav 1 | Login/registrering, skyddade rutter | `src/context/AuthContext.jsx`, `src/components/auth/` |
| Krav 2 | Realtidsredigering, cursors, aktiva anvandare | `src/hooks/useCollaboration.js` |
| Krav 4 | Radbaserade kommentarer | `src/components/comments/CommentPanel.jsx` |
| Krav 6 | Monaco Editor, syntax highlighting, autosave | `src/pages/EditorPage.jsx` |

## Kor lokalt

```bash
cp .env.example .env
# Satt VITE_API_URL i .env
npm install
npm run dev
```

## Miljovariabler

| Variabel | Beskrivning |
|----------|-------------|
| `VITE_API_URL` | URL till backend-API |

## Driftsattning

GitHub Actions bygger och driftsatter till GitHub Pages vid push till `main`.
Satt `VITE_API_URL` som repo-hemlighet under Settings > Secrets and variables > Actions.
