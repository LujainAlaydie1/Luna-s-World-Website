# Luna's World website

Bilingual (Arabic/English) static pages sharing one stylesheet and one script —
fonts and images live in `assets/`, with no external requests and no bundler.
The look follows lsquared.sa (aurora background, glass nav, scroll-driven phone
story, tilt cards) in Luna's forest/gold/rose palette, dark by default with a
light mode.
Arabic is the default language (matching the app itself), with an EN/عربي
toggle in the nav that switches text direction and remembers your choice.

- `index.html` — landing page
- `terms.html` — Terms of Use
- `privacy.html` — Privacy Policy
- `support.html` — Support / FAQ
- `partners.html` — Partner enquiry form
- `assets/site.css`, `assets/site.js` — all styling and interactions
- `tools/build_chrome.py` — re-stamps the shared nav, drawer and footer into every page
  (`python3 tools/build_chrome.py`); edit chrome there, not per page


## Content notes

- App Store link: https://apps.apple.com/us/app/lunas-world/id6449742649
- Legal pages reflect what the app actually collects (Firebase Auth/Firestore/
  Storage/Analytics, camera & photo library access, user-selected city — not
  GPS location, and on-device breed detection that doesn't upload photos
  unless you separately post them).
- Translations were written directly in Arabic, not machine-translated from
  the English — if anything reads off to a native speaker, flag it and it can
  be adjusted.
