# Nishtha Arora — Portfolio

A portfolio site with a resume, projects, and an AI-powered "Ask" chatbox,
hosted on Vercel and deployed from `main` via the Vercel GitHub integration.

## Stack

- **App**: Next.js (App Router), TypeScript
- **Chat**: Gemini API via the `/api/chat` route handler
- **Hosting**: Vercel (Hobby plan). Pushes to a branch get a preview deployment;
  merging to `main` deploys to production
- **Videos**: Cloudflare R2
- **Analytics**: Google Analytics (GA4)

## Environment variables

Set these in the Vercel project settings (see `.env.example`):

- `GEMINI_API_KEY` — used by `/api/chat`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — read at build time

## Design docs

Full design spec and implementation plans are in `docs/superpowers/`.

## Local development

```bash
npm install
npm run dev
```
