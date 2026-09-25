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

  const toolbar = make("div", "reader-tools");
  toolbar.setAttribute("aria-label", tr ? "Okuyucu araçları" : "Reader tools");
  const mode = make("button", "reader-tool", "");
  const prev = make("button", "reader-tool page-nav", tr ? "← Önceki" : "← Previous");
  const counter = make("span", "reader-counter");
  const next = make("button", "reader-tool page-nav", tr ? "Sonraki →" : "Next →");
  const chapters = make("button", "reader-tool", tr ? "Bölümler" : "Chapters");
  const zen = make("button", "reader-tool", tr ? "Odak modu" : "Focus mode");
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
    if (current === pages.length) safeSet("paelen:achievement:first-chapter", "true");
  };
  const go = page => {
    current = Math.max(1, Math.min(pages.length, page));
    render();
    pages[current - 1].scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  mode.addEventListener("click", () => { classic = !classic; safeSet("paelen:reader:mode", classic ? "classic" : "webtoon"); go(current); });
  prev.addEventListener("click", () => go(current - 1));
  next.addEventListener("click", () => go(current + 1));
  zen.addEventListener("click", () => {
    document.body.classList.toggle("zen-reader");
    zen.textContent = document.body.classList.contains("zen-reader") ? (tr ? "Odaktan çık" : "Exit focus") : (tr ? "Odak modu" : "Focus mode");
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { document.body.classList.remove("zen-reader"); zen.textContent = tr ? "Odak modu" : "Focus mode"; }
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
  const copy = make("button", "reader-tool", tr ? "Bağlantıyı kopyala" : "Copy link");
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
  const zoomed = make("img", "reader-lightbox-image");
  const lightboxHint = make("p", "", tr ? "Görseli büyütmek için tekrar dokun" : "Tap the image again to zoom");
  lightbox.append(lightboxClose, zoomed, lightboxHint);
  document.body.append(lightbox);
  lightboxClose.addEventListener("click", () => lightbox.close());
  zoomed.addEventListener("click", () => zoomed.classList.toggle("is-zoomed"));
  const openImage = img => { zoomed.src = img.src; zoomed.alt = img.alt; zoomed.classList.remove("is-zoomed"); lightbox.showModal(); };
  pages.forEach(img => {
    img.addEventListener("click", () => openImage(img));
    img.addEventListener("keydown", event => { if (event.key === "Enter") openImage(img); });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (classic) return;
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) { current = Number(visible.target.dataset.page); render(); }
    }, { threshold: [0.25, 0.5, 0.75] });
    pages.forEach(img => observer.observe(img));
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
