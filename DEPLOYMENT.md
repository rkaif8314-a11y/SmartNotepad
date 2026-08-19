# SmartNotepad Deployment

## Vercel
- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm ci`
- No custom output directory is required.

## Environment variables
This version does not require a Supabase connection to render the current UI.
Do not commit real secrets. Use Vercel Project Settings for secrets when backend
integration is added.

## Local verification
```bash
npm ci
npm run type-check
npm run build
npm start
```
