/* Luna's World — site.js
   Preferences (language + theme), nav + drawer, and all the playful bits:
   aurora spotlight, scroll-driven phone story, tilt cards, draggable strip,
   count-ups, hearts, paw prints and a cat whose eyes follow your cursor.
   Every block is wrapped so one failing never breaks the rest. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.warn("[luna]", e); } };
  var isAr = function () { return root.lang === "ar"; };

  /* ---------------------------------------------------------------- prefs */
  function setLang(lang, persist) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    $$(".lang-toggle button").forEach(function (b) { b.classList.toggle("active", b.dataset.lang === lang); });
    if (persist !== false) { try { localStorage.setItem("lunasworld-lang-v2", lang); } catch (e) {} }
  }
  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    $$("[data-theme-btn]").forEach(function (b) { b.classList.toggle("active", b.dataset.themeBtn === theme); });
    if (persist !== false) { try { localStorage.setItem("lunasworld-theme-v2", theme); } catch (e) {} }
  }
  window.setLunaLang = setLang;
  window.setLunaTheme = setTheme;
  setLang(root.lang === "en" ? "en" : "ar", false);
  setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

  d.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-lang-flip],[data-theme-flip],.lang-toggle button,[data-theme-btn]") : null;
    if (!t) return;
    if (t.hasAttribute("data-lang-flip")) setLang(isAr() ? "en" : "ar");
    else if (t.hasAttribute("data-theme-flip")) setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    else if (t.dataset.lang) setLang(t.dataset.lang);
    else if (t.dataset.themeBtn) setTheme(t.dataset.themeBtn);
  });

  /* ---------------------------------------------------------------- toast + bursts */
  var toastEl;
  function toast(ar, en) {
    if (!toastEl) { toastEl = d.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); d.body.appendChild(toastEl); }
    toastEl.textContent = isAr() ? ar : en;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function burst(x, y, chars, n, cls) {
    if (reduce) return;
    for (var i = 0; i < n; i++) {
      (function () {
        var e = d.createElement("span");
        e.className = cls || "heart-f";
        e.textContent = chars[Math.floor(Math.random() * chars.length)];
        e.style.left = x + "px"; e.style.top = y + "px";
        d.body.appendChild(e);
        var dx = (Math.random() - .5) * 190, dy = -(70 + Math.random() * 150), s = .9 + Math.random() * .8, r = (Math.random() - .5) * 70;
        var a = e.animate([
          { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
          { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(" + s + ") rotate(" + r + "deg)", opacity: 0 }
        ], { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)", delay: Math.random() * 120 });
        a.onfinish = function () { e.remove(); };
      })();
    }
  }
  function centerOf(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ---------------------------------------------------------------- intro splash (home, first visit of the session) */
  var introDone = Promise.resolve();
  safe(function () {
    if (!d.body.hasAttribute("data-intro") || reduce) return;
    var seen = false;
    try { seen = sessionStorage.getItem("luna-intro") === "1"; sessionStorage.setItem("luna-intro", "1"); } catch (e) {}
    if (seen || (location.hash && location.hash.length > 1)) return;
    var el = d.createElement("div");
    el.className = "intro";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="intro-glow"></div><div class="intro-in"><img src="assets/img/app-icon.png" alt="" width="120" height="120"><b><span class="en">Luna’s World</span><span class="ar">عالم لونا</span></b></div>';
    d.body.appendChild(el);
    root.classList.add("intro-lock");
    introDone = new Promise(function (res) {
      setTimeout(function () { el.classList.add("out"); root.classList.remove("intro-lock"); res(); }, 1150);
      setTimeout(function () { el.remove(); }, 1900);
    });
  });

  /* ---------------------------------------------------------------- aurora spotlight + pointer parallax */
  var spot = $(".aurora .spot");
  var ptTargets = $$(".hero, .story-stage, .adopt-art");
  var P = { tx: 0, ty: 0, cx: 0, cy: 0, gx: 50, gy: 35, raf: 0 };
  safe(function () {
    if (!fine || reduce) return;
    function loop() {
      P.cx += (P.tx - P.cx) * .08; P.cy += (P.ty - P.cy) * .08;
      var vx = P.cx.toFixed(3), vy = P.cy.toFixed(3);
      ptTargets.forEach(function (el) { el.style.setProperty("--mx", vx); el.style.setProperty("--my", vy); });
      if (spot) { spot.style.setProperty("--gx", P.gx + "%"); spot.style.setProperty("--gy", P.gy + "%"); }
      eyes();
      if (Math.abs(P.tx - P.cx) > .002 || Math.abs(P.ty - P.cy) > .002) P.raf = requestAnimationFrame(loop); else P.raf = 0;
    }
    d.addEventListener("pointermove", function (e) {
      P.tx = (e.clientX / innerWidth - .5) * 2; P.ty = (e.clientY / innerHeight - .5) * 2;
      P.gx = e.clientX / innerWidth * 100; P.gy = e.clientY / innerHeight * 100;
      P.px = e.clientX; P.py = e.clientY;
      if (!P.raf) P.raf = requestAnimationFrame(loop);
    }, { passive: true });
  });

  /* cat eyes that follow the pointer */
  var pupils = $$("[data-pupil]");
  function eyes() {
    if (P.px == null) return;
    pupils.forEach(function (p) {
      var eye = p.parentNode, r = eye.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = P.px - cx, dy = P.py - cy, dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 220);
      p.style.transform = "translate(" + (dx / dist * 5.2 * k).toFixed(2) + "px," + (dy / dist * 6.5 * k).toFixed(2) + "px)";
    });
  }

  /* ---------------------------------------------------------------- scroll: progress, nav, story, spy */
  var progress = $(".progress"), nav = $("#nav"), story = $(".story");
  var spyLinks = $$(".nav-links a[data-spy]").map(function (a) { return { a: a, s: d.getElementById(a.dataset.spy) }; }).filter(function (x) { return x.s; });
  var footBig = $(".foot-big"), dock = $(".dock");
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var y = window.pageYOffset, h = root.scrollHeight - innerHeight;
    if (progress) progress.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
    if (nav) nav.classList.toggle("scrolled", y > 10);
    storyUpdate();
    if (dock) dock.classList.toggle("show", y > 480 && h - y > 320);
    if (spyLinks.length) {
      var cur = null;
      spyLinks.forEach(function (x) { if (x.s.getBoundingClientRect().top < innerHeight * .45) cur = x; });
      if (cur && cur.s.getBoundingClientRect().bottom < innerHeight * .3) cur = null;
      spyLinks.forEach(function (x) { x.a.classList.toggle("on", x === cur); });
    }
    if (footBig && !reduce) { var r = footBig.getBoundingClientRect(); footBig.style.setProperty("--fy", clamp((innerHeight - r.top) * -.04, -40, 0).toFixed(1)); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------------------------------------------------------------- phone screens from <template>s */
  var tpl = {};
  $$("template[data-scr]").forEach(function (t) { tpl[t.dataset.scr] = t; });
  function screenFor(name) { var t = tpl[name]; return t ? t.content.firstElementChild.cloneNode(true) : null; }
  safe(function () {
    $$(".screen[data-scr]").forEach(function (host) {
      var s = screenFor(host.dataset.scr);
      if (s) { s.classList.add("on"); host.appendChild(s); }
    });
  });
  // The screens are laid out at the app's real 393pt width and scaled to fit each phone.
  function fitPhones() {
    $$(".phone").forEach(function (p) {
      var w = p.offsetWidth;
      if (w) p.style.setProperty("--s", ((w * 0.952) / 393).toFixed(4));
    });
  }
  safe(function () {
    fitPhones();
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(fitPhones);
      $$(".phone").forEach(function (p) { ro.observe(p); });
    } else window.addEventListener("resize", fitPhones);
    // flip the big phone between the app's light and dark mode
    var modeHtml = {
      dark: '<span class="en">☀️ Back to light</span><span class="ar">☀️ الوضع الفاتح</span>',
      light: '<span class="en">🌙 Try dark mode</span><span class="ar">🌙 جرّب الوضع الداكن</span>'
    };
    d.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-app-flip]") : null;
      if (!b) return;
      var ph = $(".stage-phone .phone"); if (!ph) return;
      b.innerHTML = ph.classList.toggle("app-dark") ? modeHtml.dark : modeHtml.light;
    });
  });

  /* ---------------------------------------------------------------- the pinned story */
  var steps = [], scrs = [], cur = -1, names = [], auto = null, userAt = 0, progScroll = false;
  var phoneMq = window.matchMedia("(max-width: 720px)");
  var wide = window.matchMedia("(min-width: 961px)");
  safe(function () {
    if (!story) return;
    steps = $$(".st", story);
    var host = $(".story-stage .screen", story);
    names = steps.map(function (s) { return s.dataset.step; });
    names.forEach(function (n) {
      var s = screenFor(n); if (!s) return;
      s.dataset.name = n;
      $$(".a-tabs i", s).forEach(function (i) { i.dataset.go = i.dataset.t; });
      host.appendChild(s); scrs.push(s);
    });
    steps.forEach(function (s, i) { s.addEventListener("click", function () { goStep(i); }); });
    setStep(0, 0);
    // phones: the cards are a swipe row, the phone follows whichever card is centred
    var list = $(".steps-list", story), pick = 0;
    if (list) list.addEventListener("scroll", function () {
      if (!phoneMq.matches || progScroll || pick) return;
      pick = requestAnimationFrame(function () {
        pick = 0;
        var r = list.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, bd = 1e9;
        steps.forEach(function (c, k) { var bb = c.getBoundingClientRect(), dd = Math.abs(bb.left + bb.width / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
        userAt = Date.now();
        if (best !== cur) setStep(best, 1, true);
      });
    }, { passive: true });
    // tablets (no pinning, no swipe row): cycle through the screens on a timer
    if (!reduce) {
      auto = setInterval(function () {
        if (wide.matches || phoneMq.matches || Date.now() - userAt < 9000) return;
        var r = story.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        setStep((cur + 1) % steps.length, 1);
      }, 4200);
    }
  });
  function setStep(i, sp, fromList) {
    if (!steps.length) return;
    if (i !== cur) {
      cur = i; story.dataset.i = i;
      steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      scrs.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      if (phoneMq.matches && !fromList) {
        progScroll = true; clearTimeout(setStep._t);
        steps[i].scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
        setStep._t = setTimeout(function () { progScroll = false; }, 700);
      }
    }
    steps[i].style.setProperty("--sp", sp.toFixed(3));
  }
  function storyUpdate() {
    if (!story || !steps.length || !wide.matches) return;
    var r = story.getBoundingClientRect(), total = story.offsetHeight - innerHeight;
    if (total <= 0) return;
    var f = clamp(-r.top / total, 0, .9999) * steps.length, i = Math.floor(f);
    setStep(i, f - i);
  }
  function goStep(i) {
    userAt = Date.now();
    if (wide.matches) {
      var total = story.offsetHeight - innerHeight, top = story.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top + total * ((i + .5) / steps.length), behavior: reduce ? "auto" : "smooth" });
    } else {
      setStep(i, 1);
      var st = $(".story-stage", story); if (st) st.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }
  // tabs in the big phone + the hero phones jump to a story step
  d.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-go]") : null;
    if (!t || !story) return;
    var i = names.indexOf(t.dataset.go);
    if (i > -1) { e.preventDefault(); goStep(i); }
  });
  d.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".fan-card[data-go]")) { e.preventDefault(); e.target.click(); }
  });

  /* ---------------------------------------------------------------- reveal on scroll */
  function initReveal() {
    var items = $$(".reveal, .steps3");
    $$("[data-stagger]").forEach(function (p) { $$(".reveal", p).forEach(function (el, i) { el.style.setProperty("--d", (i * .08).toFixed(2) + "s"); }); });
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add("in"); }); }, 2500);
  }

  /* ---------------------------------------------------------------- count-ups */
  function initCounts() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window) || reduce) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1500;
        (function step(t) {
          var k = clamp((t - t0) / dur, 0, 1), v = to * (1 - Math.pow(1 - k, 3));
          el.textContent = pre + Math.round(v).toLocaleString("en-US") + suf;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .6 });
    els.forEach(function (el) { el.textContent = (el.dataset.prefix || "") + "0" + (el.dataset.suffix || ""); io.observe(el); });
  }

  /* ---------------------------------------------------------------- marquee */
  safe(function () {
    $$(".marquee-track").forEach(function (tr) {
      var clone = tr.cloneNode(true); clone.removeAttribute("class");
      Array.prototype.slice.call(clone.children).forEach(function (c) { tr.appendChild(c); c.setAttribute("aria-hidden", "true"); });
    });
  });

  /* ---------------------------------------------------------------- tilt + spotlight on cards */
  safe(function () {
    if (!fine) return;
    $$(".tile, .nc").forEach(function (el) {
      var tilt = el.classList.contains("tile") && !reduce;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--px", x + "px"); el.style.setProperty("--py", y + "px");
        if (tilt) { el.style.setProperty("--ry", ((x / r.width - .5) * 9).toFixed(2) + "deg"); el.style.setProperty("--rx", ((y / r.height - .5) * -9).toFixed(2) + "deg"); }
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
    // magnetic buttons
    if (!reduce) $$("[data-magnet]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  });

  /* ---------------------------------------------------------------- draggable strip */
  safe(function () {
    var strip = $(".strip"); if (!strip) return;
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener("pointerdown", function (e) { if (e.pointerType === "touch") return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) { strip.classList.add("drag"); strip.scrollLeft = sl - dx; }
    });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; strip.classList.remove("drag"); });
    $$("[data-strip]").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = $(".nc", strip), w = (card ? card.offsetWidth : 320) + 18, dir = parseInt(b.dataset.strip, 10) * (getComputedStyle(strip).direction === "rtl" ? -1 : 1);
        strip.scrollBy({ left: dir * w, behavior: reduce ? "auto" : "smooth" });
      });
    });
  });

  /* ---------------------------------------------------------------- hearts, purrs, paws */
  safe(function () {
    var art = $(".adopt-art img");
    if (art) art.addEventListener("click", function (e) { var c = centerOf(art); burst(c.x, c.y, ["❤️", "💗", "🧡", "💖"], 9); });
    var peek = $(".peek");
    if (peek) peek.addEventListener("click", function () {
      var c = centerOf(peek); burst(c.x, c.y - 10, ["💖", "🐾", "❤️", "😻"], 12);
      peek.classList.add("purr"); clearTimeout(peek._t); peek._t = setTimeout(function () { peek.classList.remove("purr"); }, 1800);
    });
    var hang = $(".hang");
    if (hang) hang.addEventListener("click", function () {
      var c = centerOf(hang); burst(c.x, c.y + 10, ["🐾", "💖", "😺"], 6);
      toast("مياااو 🐱", "Meeeow 🐱");
    });
    // a paw print wherever you tap on empty space
    if (!reduce) d.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      var t = e.target;
      if (t.closest && t.closest("a, button, input, textarea, select, summary, label, form, .legal-body, [data-go], .strip, .phone, .peek, .adopt-art")) return;
      burst(e.clientX, e.clientY, ["🐾"], 1, "paw");
    });
  });


  /* ---------------------------------------------------------------- expo: video plays when seen, tap-to-zoom photos */
  safe(function () {
    var v = $(".ex-video video");
    if (v && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      }, { threshold: .35 }).observe(v);
    }
    var snd = $("[data-sound]");
    if (snd && v) snd.addEventListener("click", function () { v.muted = !v.muted; snd.classList.toggle("unmuted", !v.muted); });
    var box = null;
    function closeBox() {
      if (!box) return;
      var b = box; box = null; b.classList.remove("open");
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 300);
    }
    $$(".ex img").forEach(function (img) {
      img.addEventListener("click", function () {
        closeBox();
        box = d.createElement("div"); box.className = "lightbox"; box.setAttribute("role", "dialog");
        var im = d.createElement("img"); im.src = img.currentSrc || img.src; im.alt = img.alt; box.appendChild(im);
        box.addEventListener("click", closeBox); d.body.appendChild(box);
        requestAnimationFrame(function () { box.classList.add("open"); });
      });
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBox(); });
  });

  /* ---------------------------------------------------------------- drawer */
  safe(function () {
    var drawer = $("#site-drawer"), scrim = $("#drawer-scrim"), burger = $(".nav-burger");
    if (!drawer || !scrim || !burger) return;
    var closeBtn = $(".drawer-close", drawer);
    var file = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
    $$("a.d-row[data-page]", drawer).forEach(function (a) { if (a.getAttribute("data-page") === file) a.setAttribute("aria-current", "page"); });
    $$(".nav-links a[data-page]").forEach(function (a) { if (a.getAttribute("data-page") === file) a.setAttribute("aria-current", "page"); });
    function open() {
      drawer.removeAttribute("inert"); drawer.setAttribute("aria-hidden", "false");
      drawer.classList.add("open"); scrim.classList.add("open"); root.classList.add("drawer-open");
      burger.setAttribute("aria-expanded", "true"); closeBtn.focus();
    }
    function close(keepFocus) {
      drawer.classList.remove("open"); scrim.classList.remove("open"); root.classList.remove("drawer-open");
      drawer.setAttribute("aria-hidden", "true"); drawer.setAttribute("inert", "");
      burger.setAttribute("aria-expanded", "false");
      if (keepFocus !== true) burger.focus();
    }
    burger.addEventListener("click", open);
    closeBtn.addEventListener("click", function () { close(); });
    scrim.addEventListener("click", function () { close(); });
    drawer.addEventListener("click", function (e) { var a = e.target.closest ? e.target.closest("a[href]") : null; if (a && drawer.contains(a)) close(true); });
    d.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var f = $$("a[href], button", drawer), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var mq = window.matchMedia("(min-width: 981px)");
    var onWide = function (m) { if (m.matches && drawer.classList.contains("open")) close(true); };
    if (mq.addEventListener) mq.addEventListener("change", onWide); else if (mq.addListener) mq.addListener(onWide);
  });

  /* ---------------------------------------------------------------- go */
  safe(update);
  introDone.then(function () {
    root.classList.add("ready");
    safe(initReveal);
    safe(initCounts);
    onScroll();
  });
})();
