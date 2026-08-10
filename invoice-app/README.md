# Master Kukibo Invoices

A single-user invoicing web app for Grandmaster Bryan Campbell and Kukibo Martial Arts & Fitness.

## Included

- Dashboard with invoice totals and revenue overview
- Invoices and estimates in JMD or USD
- Customer and service management
- Live invoice preview
- Print or save as PDF
- Local browser storage
- JSON export
- Responsive desktop and mobile interface

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Deploy the generated `dist` directory to Vercel, Netlify, Cloudflare Pages, or another static host.

### Vercel

This project includes `vercel.json` with the Vite build settings and security
headers. When importing it from a monorepo, set the Vercel Root Directory to
`invoice-app`. Vercel will build with `npm run build` and publish `dist`.

## Data note

Data is stored in the browser on the device being used. This version is designed for one user and does not include cloud sync or account login.

The deployment URL is not a login credential. Anyone who receives the URL can
open the app, although invoice data remains in the local browser and is not
stored in GitHub or Vercel.
