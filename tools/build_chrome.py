#!/usr/bin/env python3
"""Stamps the shared page chrome (head assets, aurora, nav, drawer, footer, script tag)
into every page, so the markup lives in one place.

    python3 tools/build_chrome.py            # re-stamp chrome on all pages
    python3 tools/build_chrome.py --migrate  # first run on the old self-contained pages

Idempotent: it replaces the blocks between the CHROME / FOOTER / HEAD-ASSETS markers.
Page content between the nav and the footer is never touched.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index", "partners", "support", "privacy", "terms"]
APPSTORE = "https://apps.apple.com/us/app/lunas-world/id6449742649"
ICONS = json.loads((ROOT / "tools" / "drawer-icons.json").read_text(encoding="utf-8"))


def t(en, ar):
    return '<span class="en">%s</span><span class="ar">%s</span>' % (en, ar)


HEAD = """<!-- HEAD-ASSETS:START (managed by tools/build_chrome.py) -->
<link rel="icon" type="image/png" href="assets/img/app-icon.png">
<link rel="apple-touch-icon" href="assets/img/app-icon.png">
<meta name="theme-color" content="#080b06">
<script>(function(){var d=document.documentElement,l="ar",h="dark";d.classList.add("js");try{l=localStorage.getItem("lunasworld-lang")||"ar";h=localStorage.getItem("lunasworld-theme-v2")||"dark"}catch(e){}d.lang=l;d.dir=l==="ar"?"rtl":"ltr";d.setAttribute("data-theme",h)})();</script>
<link rel="stylesheet" href="assets/site.css">
<!-- HEAD-ASSETS:END -->"""

NAV_LINKS = [
    ("index.html#features", "features", None, t("Features", "المزايا")),
    ("index.html#whats-new", "whats-new", None, t("What's new", "الجديد")),
    ("partners.html", None, "partners", t("Partners", "الشراكات")),
    ("support.html", None, "support", t("Support", "الدعم")),
    ("privacy.html", None, "privacy", t("Privacy", "الخصوصية")),
]
DRAWER_LINKS = [
    ("index.html#features", None, t("Features", "المزايا")),
    ("index.html#whats-new", None, t("What's new", "الجديد")),
    ("partners.html", "partners", t("Partners", "الشراكات")),
    ("support.html", "support", t("Support &amp; FAQ", "الدعم والأسئلة")),
    ("privacy.html", "privacy", t("Privacy Policy", "سياسة الخصوصية")),
    ("terms.html", "terms", t("Terms of Use", "شروط الاستخدام")),
]


def chrome():
    links = ""
    for href, spy, page, label in NAV_LINKS:
        attrs = ""
        if spy:
            attrs += ' data-spy="%s"' % spy
        if page:
            attrs += ' data-page="%s"' % page
        links += '<a href="%s"%s>%s</a>' % (href, attrs, label)
    rows = ""
    for (href, page, label), icon in zip(DRAWER_LINKS, ICONS):
        rows += ('<a class="d-row" href="%s"%s><span class="d-ico" aria-hidden="true">%s</span>'
                 '<span class="d-label">%s</span><span class="d-chev" aria-hidden="true"></span></a>\n        '
                 % (href, ' data-page="%s"' % page if page else "", icon, label))
    brand = ('<a class="brand" href="index.html" aria-label="Luna\'s World">'
             '<img class="brand-mark logo-light" src="assets/img/app-icon.png" alt="" width="36" height="36">'
             '<img class="brand-mark logo-dark" src="assets/img/app-icon-dark.png" alt="" width="36" height="36">'
             '<span class="brand-name">%s</span></a>' % t("Luna's World", "عالم لونا"))
    dock = ('<a class="dock" href="APPSTORE"><img src="assets/img/app-icon.png" alt="" width="40" height="40"><span class="tx"><b>%s</b><small>%s</small></span><span class="go">%s</span></a>'
            % (t("Luna's World", "عالم لونا"), t("Free on the App Store", "مجاني على App Store"), t("Get", "حمّل")))
    return """<!-- CHROME:START (managed by tools/build_chrome.py) -->
<div class="aurora" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><div class="spot"></div><div class="grain"></div></div>
<div class="progress" aria-hidden="true"><i></i></div>
<header class="nav" id="nav">
  <div class="nav-pill">
    BRAND
    <nav class="nav-links" aria-label="Main">LINKS</nav>
    <div class="nav-right">
      <button class="nav-lang" type="button" data-lang-flip aria-label="Language / اللغة"><span class="en">عربي</span><span class="ar">EN</span></button>
      <button class="nav-theme" type="button" data-theme-flip aria-label="Light / dark"><span class="moon" aria-hidden="true">🌙</span><span class="sun" aria-hidden="true">☀️</span></button>
      <a class="nav-cta" href="APPSTORE">GETAPP</a>
      <button class="nav-burger" type="button" aria-label="القائمة / Menu" aria-expanded="false" aria-controls="site-drawer"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
    </div>
    <button class="hang" type="button" aria-label="Meow"><img class="logo-light" src="assets/img/luna-mark.png" alt="" width="20" height="46"><img class="logo-dark" src="assets/img/luna-mark-dark.png" alt="" width="46" height="66"></button>
  </div>
</header>
<div class="drawer-scrim" id="drawer-scrim"></div>
<aside class="drawer" id="site-drawer" role="dialog" aria-modal="true" aria-label="القائمة / Menu" aria-hidden="true" inert>
  <div class="drawer-head">
    BRAND
    <button class="drawer-close" type="button" aria-label="إغلاق / Close"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
  </div>
  <div class="drawer-body">
    <section class="d-sec">
      <p class="d-title">EXPLORE</p>
      <div class="d-card">
        ROWS</div>
    </section>
    <section class="d-sec">
      <p class="d-title">PREFS</p>
      <div class="d-card">
        <div class="d-pref">
          <span class="d-pref-label">LANGUAGE</span>
          <div class="lang-toggle"><button type="button" data-lang="en">EN</button><button type="button" data-lang="ar">عربي</button></div>
        </div>
        <div class="d-pref">
          <span class="d-pref-label">APPEARANCE</span>
          <div class="theme-toggle" role="group" aria-label="Light or dark theme">
            <button type="button" data-theme-btn="light">☀️ LIGHT</button>
            <button type="button" data-theme-btn="dark">🌙 DARK</button>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div class="drawer-foot">
    <a class="d-cta" href="APPSTORE">GETAPP</a>
    <div class="d-credit"><div class="lsquared-line"><img src="assets/img/lsquared-mark.png" alt="" width="28" height="28"><span>BY <a href="https://lsquared.sa">LSquared</a></span></div></div>
  </div>
</aside>
DOCK
<!-- CHROME:END -->""".replace("DOCK", dock).replace("BRAND", brand).replace("LINKS", links).replace("ROWS", rows) \
        .replace("APPSTORE", APPSTORE).replace("GETAPP", t("Get the App", "حمّل التطبيق")) \
        .replace("EXPLORE", t("Explore", "تصفّح")).replace("PREFS", t("Preferences", "التفضيلات")) \
        .replace("LANGUAGE", t("Language", "اللغة")).replace("APPEARANCE", t("Appearance", "المظهر")) \
        .replace("LIGHT", t("Light", "فاتح")).replace("DARK", t("Dark", "داكن")) \
        .replace("BY ", t("A product by", "منتج من") + " ")


def footer():
    f = lambda href, label, ext="": '<a href="%s"%s>%s</a>' % (href, ext, label)
    return """<!-- FOOTER:START (managed by tools/build_chrome.py) -->
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-col">
        <div class="lsquared-line"><img src="assets/img/lsquared-mark.png" alt="LSquared mark" width="28" height="28" loading="lazy"><span>%(by)s <a href="https://lsquared.sa">LSquared</a></span></div>
        <a href="mailto:support@lsquared.sa">support@lsquared.sa</a>
      </div>
      <div class="foot-col"><h4>%(explore)s</h4>%(l1)s%(l2)s%(l3)s</div>
      <div class="foot-col"><h4>%(help)s</h4>%(l4)s%(l5)s%(l6)s</div>
      <div class="foot-col"><h4>%(get)s</h4>%(l7)s</div>
    </div>
    <div class="foot-big" aria-hidden="true">%(big)s</div>
    <div class="copyright">
      <span class="en">&copy; 2026 L Squared Est. All rights reserved. Luna's World is a product of <a href="https://lsquared.sa" target="_blank" rel="noopener">LSquared</a>.</span>
      <span class="ar">&copy; 2026 شركة لام تربيع. جميع الحقوق محفوظة. عالم لونا منتج من <a href="https://lsquared.sa" target="_blank" rel="noopener">LSquared</a>.</span>
    </div>
  </div>
</footer>
<!-- FOOTER:END -->""" % dict(
        by=t("A product by", "منتج من"), explore=t("Explore", "تصفّح"), help=t("Help", "المساعدة"), get=t("Get the app", "حمّل التطبيق"),
        big=t("Luna's World", "عالم لونا"),
        l1=f("index.html#features", t("Features", "المزايا")), l2=f("index.html#whats-new", t("What's new", "الجديد")),
        l3=f("partners.html", t("Partner with us", "تعاون معنا")),
        l4=f("support.html", t("Support &amp; FAQ", "الدعم والأسئلة")), l5=f("privacy.html", t("Privacy Policy", "سياسة الخصوصية")),
        l6=f("terms.html", t("Terms of Use", "شروط الاستخدام")),
        l7=f(APPSTORE, t("App Store", "App Store")),
    )


def build(name, migrate, main=None):
    p = ROOT / (name + ".html")
    s = p.read_text(encoding="utf-8")

    # head assets
    if "<!-- HEAD-ASSETS:START" in s:
        s = re.sub(r"<!-- HEAD-ASSETS:START.*?<!-- HEAD-ASSETS:END -->", lambda m: HEAD, s, flags=re.S)
    else:
        s, n = re.subn(r'<link rel="icon" type="image/png" href="data:image/png;base64,[^"]+">\s*<style>.*?</style>', lambda m: HEAD, s, count=1, flags=re.S)
        assert n == 1, name + ": head block not found"

    # body chrome
    body_tag = "<body data-intro>" if name == "index" else "<body>"
    if "<!-- CHROME:START" in s:
        s = re.sub(r"<!-- CHROME:START.*?<!-- CHROME:END -->", lambda m: chrome(), s, flags=re.S)
    else:
        s, n = re.subn(r"<body>.*?<!-- NAV-DRAWER:END -->", lambda m: body_tag + "\n" + chrome(), s, count=1, flags=re.S)
        assert n == 1, name + ": nav block not found"

    # footer
    s, n = re.subn(r'(?:<!-- FOOTER:START.*?<!-- FOOTER:END -->|<footer class="site-footer">.*?</footer>)', lambda m: footer(), s, count=1, flags=re.S)
    assert n == 1, name + ": footer not found"

    # old inline scripts -> site.js
    s = re.sub(r"<script>\s*\(function \(\) \{\s*function setLang.*?</script>\s*", "", s, flags=re.S)
    s = re.sub(r"<script>\s*/\* NAV-DRAWER-JS \*/.*?</script>\s*", "", s, flags=re.S)
    if 'src="assets/site.js"' not in s:
        s = s.replace("</body>", '<script src="assets/site.js" defer></script>\n</body>')

    if migrate:
        s = s.replace('<section class="legal-header wrap">', '<section class="page-hero wrap">')
        if '<section class="legal-body wrap">' in s:
            a = s.index('<section class="legal-body wrap">')
            b = s.index("</section>", a)
            s = s[:a] + '<div class="wrap narrow"><section class="legal-body panel">' + s[a + len('<section class="legal-body wrap">'):b] + "</section></div>" + s[b + len("</section>"):]
        s = s.replace('<section class="wrap" style="padding-top:0.5rem;">', '<section class="wrap narrow" style="padding-top:.5rem;">')
        if main:
            a = s.index("<!-- CHROME:END -->") + len("<!-- CHROME:END -->")
            b = s.index("<!-- FOOTER:START")
            s = s[:a] + "\n\n" + main + "\n\n" + s[b:]
    p.write_text(s, encoding="utf-8")
    print("stamped", name)


if __name__ == "__main__":
    migrate = "--migrate" in sys.argv
    main = None
    for a in sys.argv:
        if a.startswith("--index-main="):
            main = pathlib.Path(a.split("=", 1)[1]).read_text(encoding="utf-8")
    for n in PAGES:
        build(n, migrate, main if n == "index" else None)
