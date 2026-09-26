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
    const filters = [...document.querySelectorAll(".series-filters select")];
    if (filters.length) {
      const cards = [...document.querySelectorAll(".series-grid .series-card")];
      const applyFilters = () => {
        const selected = Object.fromEntries(filters.map(filter => [filter.dataset.filter, filter.value]));
        let count = 0;
        for (const card of cards) {
          card.hidden = Object.entries(selected).some(([field, value]) => value && card.dataset[field] !== value);
          if (!card.hidden) count++;
        }
        $(".series-filter-count").textContent = tr ? `${count} seri gösteriliyor` : `${count} series shown`;
        $(".series-filter-empty").hidden = count !== 0;
      };
      filters.forEach(filter => filter.addEventListener("change", applyFilters));
      applyFilters();
    }
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

  // Each row gives its vertical bounds and panel dividers, in reading order.
  const panelRows = {
    1: [[0,.364,[]],[.364,.674,[]],[.674,1,[.5]]],
    2: [[0,.47,[.37,.64]],[.47,1,[.58]]],
    3: [[0,.48,[.58]],[.48,1,[.33,.66]]],
    4: [[0,.232,[]],[.232,.418,[]],[.418,.57,[]],[.57,.75,[]],[.75,1,[]]],
    5: [[0,.272,[]],[.272,.50,[]],[.50,.75,[]],[.75,1,[]]],
    6: [[0,.358,[.5]],[.358,.626,[.25,.5,.75]],[.626,1,[.42,.67]]],
    7: [[0,.29,[]],[.29,.48,[]],[.48,.71,[]],[.71,1,[.5]]],
    8: [[0,.338,[]],[.338,.658,[.5]],[.658,1,[.5]]],
    9: [[0,.356,[.5]],[.356,.698,[.5]],[.698,1,[.5]]],
    10: [[0,.294,[]],[.294,.54,[]],[.54,.768,[]],[.768,1,[]]],
    11: [[0,.336,[.5]],[.336,.676,[.5]],[.676,1,[]]],
    12: [[0,.366,[.55]],[.366,.678,[.46]],[.678,1,[.5]]],
    13: [[0,.248,[]],[.248,.44,[]],[.44,.688,[.5]],[.688,1,[]]],
    14: [[0,.5,[.5]],[.5,1,[.5]]],
    15: [[0,.5,[.4,.72]],[.5,1,[.58]]],
    16: [[0,.26,[]],[.26,.43,[]],[.43,.636,[]],[.636,.80,[]],[.80,1,[]]],
    17: [[0,.5,[.33,.66]],[.5,1,[.5]]],
    18: [[0,.5,[.45,.76]],[.5,1,[.5]]],
    19: [[0,.52,[.5]],[.52,1,[.34,.67]]],
    20: [[0,.27,[]],[.27,.494,[.37]],[.494,.7,[]],[.7,1,[]]],
    21: [[0,.318,[.5]],[.318,.635,[.5]],[.635,1,[.5]]],
  };
  const panelStops = pages.flatMap((img, index) => (panelRows[index + 1] || [[0,1,[]]]).flatMap(([top, bottom, cuts]) => {
    const edges = [0, ...cuts, 1];
    return edges.slice(0, -1).map((left, part) => ({ page: index + 1, src: img.src, x: left, y: top, w: edges[part + 1] - left, h: bottom - top }));
  }));

  const achievementToast = make("div", "achievement-toast");
  achievementToast.setAttribute("role", "status");
  achievementToast.setAttribute("aria-live", "polite");
  achievementToast.hidden = true;
  document.body.append(achievementToast);
  const achievementData = [
    { id: "chapter-1-complete", icon: "✦", name: tr ? "İlk Bölüm" : "First Chapter", detail: tr ? "Bölüm 1'in sonuna ulaştın." : "Reached the end of Chapter One." },
    { id: "night-owl", icon: "☾", name: tr ? "Gece Kuşu" : "Night Owl", detail: tr ? "02.00–04.59 arasında bir sayfa okudun." : "Read a page between 02:00 and 04:59." },
  ];
  const achievementQueue = [];
  let achievementTimer = null;
  const showNextAchievement = () => {
    if (achievementTimer || !achievementQueue.length) return;
    const item = achievementQueue.shift();
    achievementToast.replaceChildren(make("span", "achievement-toast-icon", item.icon), make("strong", "", tr ? `Başarım kazandın: ${item.name}` : `Achievement unlocked: ${item.name}`), make("span", "", item.detail));
    achievementToast.hidden = false;
    achievementTimer = setTimeout(() => {
      achievementToast.hidden = true;
      achievementTimer = null;
      showNextAchievement();
    }, 5000);
  };
  const unlock = id => {
    const item = achievementData.find(achievement => achievement.id === id);
    if (!item || safeGet(`paelen:achievement:${id}`) === "true") return;
    safeSet(`paelen:achievement:${id}`, "true");
    achievementQueue.push(item);
    showNextAchievement();
  };
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
  const guided = make("button", "reader-tool", tr ? "Kare modu" : "Panel mode");
  const compare = make("button", "reader-tool", tr ? "İki dil: Kapalı" : "Compare: Off");
  const effects = make("button", "reader-tool", tr ? "Efekt sesi: Kapalı" : "Effects: Off");
  const zen = make("button", "reader-tool", tr ? "Odak modu" : "Focus mode");
  const zenExit = make("button", "reader-zen-exit", tr ? "Odak modundan çık ×" : "Exit focus ×");
  zenExit.type = "button";
  document.body.append(zenExit);
  const share = make("button", "reader-tool", tr ? "Paylaş" : "Share");
  const offline = make("button", "reader-tool", tr ? "Çevrimdışı kaydet" : "Save offline");
  [mode, prev, counter, next, guided, compare, effects, chapters, zen, share, offline].forEach(item => toolbar.append(item));
  $(".reader-header")?.after(toolbar);

  const progress = make("div", "reading-progress");
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", tr ? "Okuma ilerlemesi" : "Reading progress");
  const fill = make("div", "reading-progress-fill");
  progress.append(fill);
  toolbar.after(progress);

  let current = Math.min(pages.length, saved);
  let classic = safeGet("paelen:reader:mode", "webtoon") === "classic";
  let compareEnabled = false;
  const compareLens = make("div", "compare-lens");
  const compareLabel = make("span", "compare-label", tr ? "İNGİLİZCE" : "TÜRKÇE");
  const compareImage = make("div", "compare-image");
  compareLens.append(compareLabel, compareImage);
  compareLens.hidden = true;
  document.body.append(compareLens);
  compare.setAttribute("aria-pressed", "false");
  compare.addEventListener("click", () => {
    compareEnabled = !compareEnabled;
    compare.setAttribute("aria-pressed", String(compareEnabled));
    compare.textContent = compareEnabled ? (tr ? "İki dil: Açık" : "Compare: On") : (tr ? "İki dil: Kapalı" : "Compare: Off");
    compareLens.hidden = true;
  });
  pages.forEach(img => {
    img.addEventListener("pointermove", event => {
      if (!compareEnabled || event.pointerType !== "mouse") return;
      const rect = img.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const zoom = 1.5;
      const alternate = img.src.replace(/\/(tr|en)-(\d+)\.webp$/, (_, code, number) => `/${code === "tr" ? "en" : "tr"}-${number}.webp`);
      compareImage.style.backgroundImage = `url("${alternate}")`;
      compareImage.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
      compareImage.style.backgroundPosition = `${115 - x * zoom}px ${70 - y * zoom}px`;
      compareLens.style.left = `${Math.min(window.innerWidth - 250, event.clientX + 16)}px`;
      compareLens.style.top = `${Math.max(8, Math.min(window.innerHeight - 185, event.clientY + 16))}px`;
      compareLens.hidden = false;
    });
    img.addEventListener("pointerleave", () => { compareLens.hidden = true; });
  });
  let effectsEnabled = false;
  let audioContext;
  effects.setAttribute("aria-pressed", "false");
  effects.addEventListener("click", async () => {
    effectsEnabled = !effectsEnabled;
    effects.setAttribute("aria-pressed", String(effectsEnabled));
    effects.textContent = effectsEnabled ? (tr ? "Efekt sesi: Açık" : "Effects: On") : (tr ? "Efekt sesi: Kapalı" : "Effects: Off");
    if (effectsEnabled) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) { audioContext ||= new AudioContextClass(); try { await audioContext.resume(); } catch {} }
    }
  });
  const playRune = () => {
    if (!effectsEnabled || !audioContext || document.visibilityState !== "visible") return;
    try {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(392, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + .45);
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.035, audioContext.currentTime + .04);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .65);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .7);
    } catch {}
  };

  const guidedDialog = make("dialog", "guided-dialog");
  const guidedBar = make("div", "guided-bar");
  const guidedPrev = make("button", "reader-tool", tr ? "← Önceki kare" : "← Previous panel");
  const guidedCount = make("span", "guided-count");
  const guidedNext = make("button", "reader-tool", tr ? "Sonraki kare →" : "Next panel →");
  const guidedCompare = make("button", "reader-tool", tr ? "Diğer dil" : "Other language");
  const guidedClose = make("button", "reader-tool", tr ? "Kapat ×" : "Close ×");
  const guidedStage = make("div", "guided-stage");
  const guidedFrame = make("div", "guided-frame");
  const guidedImage = make("img", "guided-image");
  const guidedHint = make("p", "guided-hint", tr ? "Kareye dokunarak TR / EN karşılaştır" : "Tap the panel to compare TR / EN");
  guidedImage.alt = tr ? "Odaklanan çizgi roman karesi" : "Focused comic panel";
  guidedFrame.append(guidedImage);
  guidedStage.append(guidedFrame);
  guidedBar.append(guidedPrev, guidedCount, guidedNext, guidedCompare, guidedClose);
  guidedDialog.append(guidedBar, guidedStage, guidedHint);
  document.body.append(guidedDialog);
  let guidedIndex = 0;
  let alternateLanguage = false;
  const renderGuided = () => {
    const stop = panelStops[guidedIndex];
    if (!stop) return;
    const source = alternateLanguage ? stop.src.replace(/\/(tr|en)-(\d+)\.webp$/, (_, code, number) => `/${code === "tr" ? "en" : "tr"}-${number}.webp`) : stop.src;
    if (guidedImage.src !== source) guidedImage.src = source;
    const fullW = Number(pages[stop.page - 1].getAttribute("width"));
    const fullH = Number(pages[stop.page - 1].getAttribute("height"));
    const scale = Math.min((window.innerWidth - 30) / (stop.w * fullW), (window.innerHeight - 150) / (stop.h * fullH));
    guidedFrame.style.width = `${stop.w * fullW * scale}px`;
    guidedFrame.style.height = `${stop.h * fullH * scale}px`;
    guidedImage.style.width = `${fullW * scale}px`;
    guidedImage.style.height = `${fullH * scale}px`;
    guidedImage.style.left = `${-stop.x * fullW * scale}px`;
    guidedImage.style.top = `${-stop.y * fullH * scale}px`;
    guidedCount.textContent = `${guidedIndex + 1} / ${panelStops.length} · ${tr ? "Sayfa" : "Page"} ${stop.page}`;
    guidedPrev.disabled = guidedIndex === 0;
    guidedNext.disabled = guidedIndex === panelStops.length - 1;
    guidedCompare.setAttribute("aria-pressed", String(alternateLanguage));
    guidedCompare.textContent = alternateLanguage ? (tr ? "Türkçeye dön" : "Back to English") : (tr ? "İngilizceyi göster" : "Show Turkish");
  };
  const moveGuided = amount => { guidedIndex = Math.max(0, Math.min(panelStops.length - 1, guidedIndex + amount)); alternateLanguage = false; renderGuided(); };
  guided.addEventListener("click", () => { guidedIndex = Math.max(0, panelStops.findIndex(stop => stop.page === current)); alternateLanguage = false; guidedDialog.showModal(); renderGuided(); });
  guidedPrev.addEventListener("click", () => moveGuided(-1));
  guidedNext.addEventListener("click", () => moveGuided(1));
  guidedClose.addEventListener("click", () => guidedDialog.close());
  guidedCompare.addEventListener("click", () => { alternateLanguage = !alternateLanguage; renderGuided(); });
  let swiped = false;
  guidedFrame.addEventListener("click", () => { if (swiped) { swiped = false; return; } alternateLanguage = !alternateLanguage; renderGuided(); });
  let swipeX = null;
  guidedStage.addEventListener("touchstart", event => { swipeX = event.touches.length === 1 ? event.touches[0].clientX : null; }, { passive: true });
  guidedStage.addEventListener("touchend", event => {
    if (swipeX === null || !event.changedTouches.length) return;
    const delta = event.changedTouches[0].clientX - swipeX;
    swipeX = null;
    if (Math.abs(delta) > 55) { swiped = true; moveGuided(delta < 0 ? 1 : -1); setTimeout(() => { swiped = false; }, 350); }
  }, { passive: true });
  guidedDialog.addEventListener("close", () => {
    current = panelStops[guidedIndex].page;
    render();
    pages[current - 1].scrollIntoView({ block: "start" });
  });
  window.addEventListener("resize", () => { if (guidedDialog.open) renderGuided(); });
  guidedDialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") { event.preventDefault(); moveGuided(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); moveGuided(-1); }
  });
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
  const cropOpen = make("button", "reader-lightbox-control", tr ? "Kareyi paylaş" : "Share panel");
  const controls = make("div", "reader-lightbox-controls");
  const secretRune = make("button", "reader-lightbox-control secret-rune", "✦");
  secretRune.type = "button";
  secretRune.setAttribute("aria-label", tr ? "Gizli çizimi aç" : "Reveal hidden art");
  secretRune.hidden = true;
  controls.append(secretRune, cropOpen, zoomOut, zoomReset, zoomIn, lightboxClose);
  const viewport = make("div", "reader-lightbox-viewport");
  const zoomed = make("img", "reader-lightbox-image");
  const lightboxHint = make("p", "reader-lightbox-hint", tr ? "Dokunarak veya iki parmakla yakınlaştır" : "Tap or pinch with two fingers to zoom");
  viewport.append(zoomed);
  lightbox.append(controls, viewport, lightboxHint);
  document.body.append(lightbox);
  lightboxClose.addEventListener("click", () => lightbox.close());
  secretRune.addEventListener("click", () => { lightbox.close(); showSurprise("art"); });
  const cropDialog = make("dialog", "reader-dialog crop-dialog");
  let cropPage = current;
  const cropClose = make("button", "reader-tool", tr ? "Kapat ×" : "Close ×");
  const cropTitle = make("h2", "", tr ? "Kare seç" : "Select a panel");
  const cropHint = make("p", "", tr ? "Paylaşmak istediğin alanı görsel üzerinde sürükleyerek seç." : "Drag over the image to select the area to share.");
  const cropStage = make("div", "crop-stage");
  const cropImage = make("img", "crop-image");
  const cropSelection = make("div", "crop-selection");
  const cropActions = make("div", "crop-actions");
  const cropDownload = make("button", "reader-tool", tr ? "PNG indir" : "Download PNG");
  const cropShare = make("button", "reader-tool", tr ? "Paylaş" : "Share");
  const cropStatus = make("p", "crop-status");
  cropShare.hidden = typeof navigator.share !== "function";
  cropClose.addEventListener("click", () => cropDialog.close());
  cropStage.append(cropImage, cropSelection);
  cropActions.append(cropDownload, cropShare);
  cropDialog.append(cropClose, cropTitle, cropHint, cropStage, cropActions, cropStatus);
  document.body.append(cropDialog);
  let crop = { x: 0.15, y: 0.15, w: 0.7, h: 0.7 };
  let cropStart = null;
  const showCrop = () => {
    cropSelection.style.left = `${crop.x * 100}%`;
    cropSelection.style.top = `${crop.y * 100}%`;
    cropSelection.style.width = `${crop.w * 100}%`;
    cropSelection.style.height = `${crop.h * 100}%`;
  };
  const cropPoint = event => {
    const rect = cropImage.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  cropStage.addEventListener("pointerdown", event => {
    cropStart = cropPoint(event);
    cropStage.setPointerCapture(event.pointerId);
    crop = { ...cropStart, w: 0, h: 0 };
    showCrop();
  });
  cropStage.addEventListener("pointermove", event => {
    if (!cropStart) return;
    const point = cropPoint(event);
    crop = { x: Math.min(cropStart.x, point.x), y: Math.min(cropStart.y, point.y), w: Math.abs(point.x - cropStart.x), h: Math.abs(point.y - cropStart.y) };
    showCrop();
  });
  const finishCrop = () => {
    if (!cropStart) return;
    cropStart = null;
    if (crop.w < 0.02 || crop.h < 0.02) crop = { x: 0.15, y: 0.15, w: 0.7, h: 0.7 };
    showCrop();
  };
  cropStage.addEventListener("pointerup", finishCrop);
  cropStage.addEventListener("pointercancel", finishCrop);
  cropOpen.addEventListener("click", () => {
    cropImage.src = zoomed.src;
    cropImage.alt = zoomed.alt;
    crop = { x: 0.15, y: 0.15, w: 0.7, h: 0.7 };
    showCrop();
    cropStatus.textContent = "";
    lightbox.close();
    cropDialog.showModal();
  });
  const makeCropBlob = () => new Promise((resolve, reject) => {
    if (!cropImage.complete || !cropImage.naturalWidth) { reject(new Error("Image unavailable")); return; }
    const sx = Math.round(crop.x * cropImage.naturalWidth);
    const sy = Math.round(crop.y * cropImage.naturalHeight);
    const sw = Math.max(1, Math.round(crop.w * cropImage.naturalWidth));
    const sh = Math.max(1, Math.round(crop.h * cropImage.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = sw; canvas.height = sh;
    const context = canvas.getContext("2d");
    context.drawImage(cropImage, sx, sy, sw, sh, 0, 0, sw, sh);
    const labelSize = Math.max(14, Math.round(sw * 0.026));
    const bar = Math.max(42, Math.round(labelSize * 2.2));
    context.fillStyle = "#09070dcc";
    context.fillRect(0, sh - bar, sw, bar);
    context.font = `700 ${labelSize}px sans-serif`;
    context.fillStyle = "#ffffff";
    context.fillText("PAELEN COMICS · paelenrune.github.io", Math.max(10, sw * 0.015), sh - bar / 2 + labelSize * 0.35, sw - 20);
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png");
  });
  const cropFileName = () => `paelen-comics-bolum-1-sayfa-${cropPage}.png`;
  const downloadBlob = blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = cropFileName(); link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  cropDownload.addEventListener("click", async () => {
    try { downloadBlob(await makeCropBlob()); cropStatus.textContent = tr ? "Filigranlı kare indirildi." : "Watermarked panel downloaded."; }
    catch { cropStatus.textContent = tr ? "Görsel hazırlanamadı. Tekrar dene." : "Could not prepare the image. Try again."; }
  });
  cropShare.addEventListener("click", async () => {
    try {
      const blob = await makeCropBlob();
      const file = new File([blob], cropFileName(), { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Paelen Comics", url: chapterPath });
      else { downloadBlob(blob); cropStatus.textContent = tr ? "Cihaz görsel paylaşımını desteklemiyor; PNG indirildi." : "Image sharing is unavailable; PNG downloaded."; }
    } catch (error) { if (error.name !== "AbortError") cropStatus.textContent = tr ? "Paylaşım açılamadı. PNG indir düğmesini dene." : "Sharing failed. Try downloading the PNG."; }
  });
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
    cropPage = Number(img.dataset.page);
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
    const runePage = pages[11];
    if (runePage) new IntersectionObserver((entries, observer) => {
      if (classic || !entries.some(entry => entry.isIntersecting)) return;
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) runePage.classList.add("reader-rune-reveal");
      playRune();
      observer.disconnect();
    }, { threshold: 0.15 }).observe(runePage);
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
