# Luna's World website

Four self-contained, bilingual (Arabic/English) static pages — every font and
image is inlined, so there are no build steps and no external requests.
Arabic is the default language (matching the app itself), with an EN/عربي
toggle in the nav that switches text direction and remembers your choice.

- `index.html` — landing page
- `terms.html` — Terms of Use
- `privacy.html` — Privacy Policy
- `support.html` — Support / FAQ


## Content notes

- App Store link: https://apps.apple.com/us/app/lunas-world/id6449742649
- Legal pages reflect what the app actually collects (Firebase Auth/Firestore/
  Storage/Analytics, camera & photo library access, user-selected city — not
  GPS location, and on-device breed detection that doesn't upload photos
  unless you separately post them).
- Translations were written directly in Arabic, not machine-translated from
  the English — if anything reads off to a native speaker, flag it and it can
  be adjusted.
