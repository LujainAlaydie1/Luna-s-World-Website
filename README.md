# Luna's World website

Four self-contained, bilingual (Arabic/English) static pages — every font and
image is inlined, so there are no build steps and no external requests.
Arabic is the default language (matching the app itself), with an EN/عربي
toggle in the nav that switches text direction and remembers your choice.

- `index.html` — landing page
- `terms.html` — Terms of Use
- `privacy.html` — Privacy Policy
- `support.html` — Support / FAQ

## Deploy to Vercel via GitHub

1. Create a new GitHub repo and push this folder to it:
   ```
   git init
   git add .
   git commit -m "Luna's World website"
   git remote add origin <your-new-repo-url>
   git push -u origin main
   ```
2. In Vercel: **Add New Project** → import that GitHub repo. No framework/build
   command needed — Vercel serves the static files as-is.
3. In the Vercel project's **Settings → Domains**, add a subdomain (e.g.
   `lunasworld.lsquared.sa`, matching the `liyoplanet.lsquared.sa` pattern)
   and point your DNS for that subdomain at Vercel as instructed on that screen.
4. `vercel.json` enables clean URLs (`/terms` instead of `/terms.html`).

## Content notes

- App Store link: https://apps.apple.com/us/app/lunas-world/id6449742649
- Legal pages reflect what the app actually collects (Firebase Auth/Firestore/
  Storage/Analytics, camera & photo library access, user-selected city — not
  GPS location, and on-device breed detection that doesn't upload photos
  unless you separately post them).
- Translations were written directly in Arabic, not machine-translated from
  the English — if anything reads off to a native speaker, flag it and it can
  be adjusted.
