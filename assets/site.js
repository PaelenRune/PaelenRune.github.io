(() => {
  const lang = document.documentElement.lang === "en" ? "en" : "tr";
  const tr = lang === "tr";
  const chapterPath = `${location.origin}/${lang}/series/kaderin-cizdigi-runler/chapter/1/`;
  const key = "paelen:chapter:1:page";
  const $ = selector => document.querySelector(selector);
  const pages = [...document.querySelectorAll(".reader-pages img")];
  const make = (tag, className, label) => {
    const element = document.createElement(tag);
    element.className = className;
    if (label) element.textContent = label;
    return element;
  };
  const safeGet = (name, fallback = "") => { try { return localStorage.getItem(name) ?? fallback; } catch { return fallback; } };
  const safeSet = (name, value) => { try { localStorage.setItem(name, value); } catch {} };
  const surprise = make("dialog", "reader-dialog easter-dialog");
  const surpriseClose = make("button", "reader-tool", tr ? "Kapat ×" : "Close ×");
  const surpriseTitle = make("h2", "");
  const surpriseText = make("p", "");
  const surpriseImage = make("img", "easter-image");
  surpriseClose.type = "button";
  surpriseClose.addEventListener("click", () => surprise.close());
  surprise.append(surpriseClose, surpriseTitle, surpriseText, surpriseImage);
  document.body.append(surprise);
  const showSurprise = kind => {
    const cat = kind === "cat";
    surpriseTitle.textContent = cat ? (tr ? "Miyav! Beni buldun." : "Meow! You found me.") : (tr ? "Gizli çizim: Turkuaz Eşik" : "Hidden art: Turkuaz Eşik");
    surpriseText.textContent = cat ? (tr ? "Paelen, çizim masasının başında sana eşlik ediyor. Birinci bölümdeki dünyaya göz atmak ister misin?" : "Paelen is keeping you company at the drawing desk. Take a peek at the world of Chapter One.") : (tr ? "Birinci bölümün mekânları için hazırlanan konsept çizimleri. Avlu, pazar, liman ve han sahnelerine yakından bak." : "Concept art for Chapter One's courtyard, market, harbor and inn scenes.");
    surpriseImage.src = cat ? "/mascot/cat-canonical.png" : "/lore/turkuaz-esik-concepts.webp";
    surpriseImage.alt = cat ? "Paelen" : (tr ? "Turkuaz Eşik mekân konseptleri" : "Turkuaz Eşik location concepts");
    surprise.showModal();
  };
  document.querySelector(".hero-cat-button")?.addEventListener("click", () => showSurprise("cat"));
  const saved = Math.max(1, Number(safeGet(key, "1")) || 1);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

  if (!pages.length) {
    if (saved > 1) {
      const target = $(".hero-ctas") || $(".series-detail .button.primary")?.parentElement;
      if (target) {
        const link = make("a", "button outline resume-link", tr ? `KALDIĞIN YERDEN DEVAM ET · ${saved}. SAYFA` : `CONTINUE READING · PAGE ${saved}`);
        link.href = `${chapterPath}#page-${saved}`;
        target.append(link);
      }
    }
    return;
  }

  pages.forEach((img, index) => {
    img.id = `page-${index + 1}`;
    img.dataset.page = String(index + 1);
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", tr ? `${index + 1}. sayfayı büyüt` : `Enlarge page ${index + 1}`);
  });

  const achievementBox = make("section", "reader-achievements");
  achievementBox.setAttribute("aria-label", tr ? "Başarımlar" : "Achievements");
  const achievementTitle = make("h2", "", tr ? "BAŞARIMLAR" : "ACHIEVEMENTS");
  const achievementNote = make("p", "achievement-note", tr ? "Rozetler yalnızca bu tarayıcıda saklanır." : "Badges are saved only in this browser.");
  const achievementList = make("div", "achievement-list");
  achievementBox.append(achievementTitle, achievementNote, achievementList);
  $(".reader-end")?.append(achievementBox);
  const achievementData = [
    { id: "chapter-1-complete", icon: "✦", name: tr ? "İlk Bölüm" : "First Chapter", detail: tr ? "Bölüm 1'in sonuna ulaştın." : "Reached the end of Chapter One." },
    { id: "night-owl", icon: "☾", name: tr ? "Gece Kuşu" : "Night Owl", detail: tr ? "02.00–04.59 arasında bir sayfa okudun." : "Read a page between 02:00 and 04:59." },
  ];
  const achievementCards = new Map();
  for (const item of achievementData) {
    const card = make("div", "achievement-card");
    const icon = make("span", "achievement-icon", item.icon);
    const copy = make("div", "achievement-copy");
    copy.append(make("strong", "", item.name), make("span", "", item.detail));
    card.append(icon, copy);
    achievementList.append(card);
    achievementCards.set(item.id, card);
  }
  const unlock = id => {
    const card = achievementCards.get(id);
    if (!card || card.classList.contains("is-unlocked")) return;
    card.classList.add("is-unlocked");
    card.setAttribute("aria-label", `${card.querySelector("strong").textContent}: ${tr ? "Kazanıldı" : "Unlocked"}`);
    safeSet(`paelen:achievement:${id}`, "true");
  };
  for (const item of achievementData) if (safeGet(`paelen:achievement:${item.id}`) === "true") unlock(item.id);
  const checkNightOwl = () => {
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5 && document.visibilityState === "visible") unlock("night-owl");
  };

  const toolbar = make("div", "reader-tools");
  toolbar.setAttribute("aria-label", tr ? "Okuyucu araçları" : "Reader tools");
  const mode = make("button", "reader-tool", "");
  const prev = make("button", "reader-tool page-nav", tr ? "← Önceki" : "← Previous");
  const counter = make("span", "reader-counter");
  const next = make("button", "reader-tool page-nav", tr ? "Sonraki →" : "Next →");
  const chapters = make("button", "reader-tool", tr ? "Bölümler" : "Chapters");
  const zen = make("button", "reader-tool", tr ? "Odak modu" : "Focus mode");
  const zenExit = make("button", "reader-zen-exit", tr ? "Odak modundan çık ×" : "Exit focus ×");
  zenExit.type = "button";
  document.body.append(zenExit);
  const share = make("button", "reader-tool", tr ? "Paylaş" : "Share");
  const offline = make("button", "reader-tool", tr ? "Çevrimdışı kaydet" : "Save offline");
  [mode, prev, counter, next, chapters, zen, share, offline].forEach(item => toolbar.append(item));
  $(".reader-header")?.after(toolbar);

  const progress = make("div", "reading-progress");
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", tr ? "Okuma ilerlemesi" : "Reading progress");
  const fill = make("div", "reading-progress-fill");
  progress.append(fill);
  toolbar.after(progress);

  let current = Math.min(pages.length, saved);
  let classic = safeGet("paelen:reader:mode", "webtoon") === "classic";
  const render = () => {
    document.body.classList.toggle("classic-reader", classic);
    mode.textContent = classic ? (tr ? "Dikey kaydırma" : "Vertical scroll") : (tr ? "Sayfa çevirme" : "Page turn");
    pages.forEach((img, index) => { img.hidden = classic && index !== current - 1; });
    counter.textContent = `${current} / ${pages.length}`;
    prev.disabled = current === 1;
    next.disabled = current === pages.length;
    const percent = Math.round(current / pages.length * 100);
    fill.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(percent));
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    safeSet(key, String(current));
  };
  const go = page => {
    current = Math.max(1, Math.min(pages.length, page));
    render();
    checkNightOwl();
    pages[current - 1].scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  mode.addEventListener("click", () => { classic = !classic; safeSet("paelen:reader:mode", classic ? "classic" : "webtoon"); go(current); });
  prev.addEventListener("click", () => go(current - 1));
  next.addEventListener("click", () => go(current + 1));
  const setZen = async enabled => {
    document.body.classList.toggle("zen-reader", enabled);
    zen.textContent = enabled ? (tr ? "Odaktan çık" : "Exit focus") : (tr ? "Odak modu" : "Focus mode");
    if (enabled && document.fullscreenEnabled && !document.fullscreenElement) {
      try { await document.documentElement.requestFullscreen(); } catch {}
    } else if (!enabled && document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
  };
  zen.addEventListener("click", () => setZen(!document.body.classList.contains("zen-reader")));
  zenExit.addEventListener("click", () => setZen(false));
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && document.body.classList.contains("zen-reader")) setZen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("zen-reader")) setZen(false);
    if (!classic || $("dialog[open]") || /input|textarea/i.test(document.activeElement?.tagName || "")) return;
    if (event.key === "ArrowRight") go(current + 1);
    if (event.key === "ArrowLeft") go(current - 1);
  });

  const drawer = make("dialog", "reader-dialog chapter-drawer");
  const drawerTitle = make("h2", "", tr ? "Bölümler" : "Chapters");
  const drawerClose = make("button", "reader-tool", tr ? "Kapat" : "Close");
  drawerClose.addEventListener("click", () => drawer.close());
  const chapterLink = make("a", "chapter-drawer-link", tr ? "Bölüm 1 · Altın Kadeh Günü" : "Chapter 1 · The Day of the Golden Goblet");
  chapterLink.href = chapterPath;
  drawer.append(drawerClose, drawerTitle, chapterLink);
  document.body.append(drawer);
  chapters.addEventListener("click", () => drawer.showModal());

  const sharing = make("dialog", "reader-dialog share-dialog");
  const shareTitle = make("h2", "", tr ? "Bölümü paylaş" : "Share this chapter");
  const shareClose = make("button", "reader-tool", tr ? "Kapat" : "Close");
  shareClose.addEventListener("click", () => sharing.close());
  const copy = make("button", "reader-tool", tr ? "WhatsApp / Discord için bağlantıyı kopyala" : "Copy link for WhatsApp / Discord");
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(chapterPath); copy.textContent = tr ? "Kopyalandı" : "Copied"; }
    catch { copy.textContent = chapterPath; }
  });
  const x = make("a", "reader-tool", tr ? "X'te paylaş" : "Share on X");
  x.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(chapterPath)}&text=${encodeURIComponent(tr ? "Kaderin Çizdiği Rünler · Bölüm 1" : "Runes Drawn by Fate · Chapter 1")}`;
  x.target = "_blank"; x.rel = "noopener noreferrer";
  const whatsapp = make("a", "reader-tool", "WhatsApp");
  whatsapp.href = `https://wa.me/?text=${encodeURIComponent(chapterPath)}`;
  whatsapp.target = "_blank"; whatsapp.rel = "noopener noreferrer";
  sharing.append(shareClose, shareTitle, copy, x, whatsapp);
  document.body.append(sharing);
  share.addEventListener("click", () => sharing.showModal());
  if (!("caches" in window) || !("serviceWorker" in navigator)) offline.hidden = true;
  offline.addEventListener("click", async () => {
    offline.disabled = true;
    offline.textContent = tr ? "Kaydediliyor…" : "Saving…";
    try {
      await navigator.serviceWorker.ready;
      const cache = await caches.open(`paelen-chapter-1-${lang}-v1`);
      const urls = [location.pathname, `/${lang}/`, `/${lang}/series/kaderin-cizdigi-runler/`, ...[...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map(item => item.href || item.src).filter(url => new URL(url).origin === location.origin), ...pages.map(img => img.src)];
      for (const url of [...new Set(urls)]) await cache.add(url);
      offline.textContent = tr ? "Bölüm kaydedildi ✓" : "Chapter saved ✓";
    } catch {
      offline.textContent = tr ? "Kaydedilemedi · Tekrar dene" : "Could not save · Retry";
      offline.disabled = false;
    }
  });

  const lightbox = make("dialog", "reader-lightbox");
  const lightboxClose = make("button", "reader-lightbox-close", tr ? "Kapat ×" : "Close ×");
  const zoomOut = make("button", "reader-lightbox-control", "−");
  const zoomIn = make("button", "reader-lightbox-control", "+");
  const zoomReset = make("button", "reader-lightbox-control", tr ? "Sığdır" : "Fit");
  const controls = make("div", "reader-lightbox-controls");
  const secretRune = make("button", "reader-lightbox-control secret-rune", "✦");
  secretRune.type = "button";
  secretRune.setAttribute("aria-label", tr ? "Gizli çizimi aç" : "Reveal hidden art");
  secretRune.hidden = true;
  controls.append(secretRune, zoomOut, zoomReset, zoomIn, lightboxClose);
  const viewport = make("div", "reader-lightbox-viewport");
  const zoomed = make("img", "reader-lightbox-image");
  const lightboxHint = make("p", "reader-lightbox-hint", tr ? "Dokunarak veya iki parmakla yakınlaştır" : "Tap or pinch with two fingers to zoom");
  viewport.append(zoomed);
  lightbox.append(controls, viewport, lightboxHint);
  document.body.append(lightbox);
  lightboxClose.addEventListener("click", () => lightbox.close());
  secretRune.addEventListener("click", () => { lightbox.close(); showSurprise("art"); });
  let zoomScale = 1;
  let fittedWidth = 0;
  const setZoom = value => {
    if (!fittedWidth) fittedWidth = zoomed.getBoundingClientRect().width || viewport.clientWidth;
    zoomScale = Math.max(1, Math.min(4, value));
    zoomed.style.width = zoomScale === 1 ? "" : `${fittedWidth * zoomScale}px`;
    zoomed.classList.toggle("is-zoomed", zoomScale > 1);
  };
  zoomIn.addEventListener("click", () => setZoom(zoomScale + 0.5));
  zoomOut.addEventListener("click", () => setZoom(zoomScale - 0.5));
  zoomReset.addEventListener("click", () => setZoom(1));
  let pinched = false;
  zoomed.addEventListener("click", () => {
    if (pinched) { pinched = false; return; }
    setZoom(zoomScale === 1 ? 2 : 1);
  });
  const distance = touches => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  let pinchStart = 0;
  let pinchScale = 1;
  viewport.addEventListener("touchstart", event => {
    if (event.touches.length === 2) { pinchStart = distance(event.touches); pinchScale = zoomScale; }
  }, { passive: true });
  viewport.addEventListener("touchmove", event => {
    if (event.touches.length !== 2 || !pinchStart) return;
    event.preventDefault();
    pinched = true;
    setZoom(pinchScale * distance(event.touches) / pinchStart);
  }, { passive: false });
  viewport.addEventListener("touchend", event => { if (event.touches.length < 2) pinchStart = 0; });
  const openImage = img => {
    checkNightOwl();
    fittedWidth = 0;
    pinched = false;
    zoomed.src = img.src;
    zoomed.alt = img.alt;
    secretRune.hidden = img.dataset.page !== "7";
    setZoom(1);
    lightbox.showModal();
    requestAnimationFrame(() => { fittedWidth = zoomed.getBoundingClientRect().width; });
  };
  zoomed.addEventListener("load", () => { if (lightbox.open && zoomScale === 1) fittedWidth = zoomed.getBoundingClientRect().width; });
  pages.forEach(img => {
    img.addEventListener("click", () => openImage(img));
    img.addEventListener("keydown", event => { if (event.key === "Enter") openImage(img); });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) checkNightOwl();
      if (classic) return;
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) { current = Number(visible.target.dataset.page); render(); }
    }, { threshold: [0.25, 0.5, 0.75] });
    pages.forEach(img => observer.observe(img));
    const end = $(".reader-end");
    if (end) new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) unlock("chapter-1-complete");
    }, { threshold: 0.2 }).observe(end);
  }
  render();
  if (location.hash.startsWith("#page-")) {
    const page = Number(location.hash.slice(6));
    if (Number.isFinite(page)) window.addEventListener("load", () => go(page), { once: true });
  } else if (saved > 1) {
    const resume = make("button", "reader-resume", tr ? `Kaldığın yerden devam et · ${saved}. sayfa` : `Continue reading · page ${saved}`);
    resume.addEventListener("click", () => { go(saved); resume.remove(); });
    toolbar.after(resume);
  }
})();
