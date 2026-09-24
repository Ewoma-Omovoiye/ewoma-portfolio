document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const nav = document.querySelector("nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".navlinks");
  const scrim = document.querySelector(".nav-scrim");

  const initialiseMenu = () => {
    if (!toggle || !links) return;
    const menuLinks = [...links.querySelectorAll("a")];
    const lockPage = () => {
      document.documentElement.classList.add("menu-open");
      body.classList.add("menu-open");
    };
    const unlockPage = () => {
      document.documentElement.classList.remove("menu-open");
      body.classList.remove("menu-open");
    };
    const closeMenu = ({ restoreFocus = false } = {}) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      links.classList.remove("open");
      links.setAttribute("aria-hidden", "true");
      links.inert = true;
      scrim?.classList.remove("open");
      unlockPage();
      if (restoreFocus) toggle.focus();
    };
    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      links.classList.add("open");
      links.setAttribute("aria-hidden", "false");
      links.inert = false;
      scrim?.classList.add("open");
      lockPage();
      menuLinks[0]?.focus();
    };

    closeMenu();
    toggle.addEventListener("click", () => toggle.getAttribute("aria-expanded") === "true" ? closeMenu({ restoreFocus: true }) : openMenu());
    scrim?.addEventListener("click", () => closeMenu({ restoreFocus: true }));
    menuLinks.forEach(link => link.addEventListener("click", () => closeMenu()));
    document.addEventListener("touchmove", event => {
      if (body.classList.contains("menu-open") && !links.contains(event.target)) event.preventDefault();
    }, { passive: false });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu({ restoreFocus: true });
        return;
      }
      if (event.key !== "Tab" || toggle.getAttribute("aria-expanded") !== "true" || !menuLinks.length) return;
      const first = menuLinks[0];
      const last = menuLinks[menuLinks.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const mobile = window.matchMedia("(max-width: 820px)");
    const syncMenu = () => {
      if (mobile.matches) closeMenu();
      else {
        links.inert = false;
        links.removeAttribute("aria-hidden");
        unlockPage();
      }
    };
    mobile.addEventListener?.("change", syncMenu);
    syncMenu();
  };

  const progress = document.createElement("div");
  progress.className = "page-progress";
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", "Page reading progress");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", "0");
  progress.innerHTML = '<div class="page-progress-bar"></div>';
  nav?.append(progress);
  const progressBar = progress.querySelector(".page-progress-bar");

  const clamp = value => Math.max(0, Math.min(1, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const aboutHero = document.querySelector(".about-hero-new");
  const aboutSticky = aboutHero?.querySelector(".about-hero-sticky");
  const aboutPortrait = aboutHero?.querySelector(".about-portrait-frame");

  const updateAboutHero = () => {
    if (!aboutHero || !aboutSticky || !aboutPortrait) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navHeight = nav?.offsetHeight || 0;
    const heroStart = aboutHero.offsetTop - navHeight;
    const scrollRange = Math.max(1, aboutHero.offsetHeight - aboutSticky.offsetHeight);
    const rawProgress = reducedMotion ? 1 : clamp((window.scrollY - heroStart) / scrollRange);
    const layoutProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const width = aboutSticky.clientWidth;
    const height = aboutSticky.clientHeight;
    const mobile = width <= 820;
    if (mobile) {
      ["width", "height", "left", "top"].forEach(property => aboutPortrait.style.removeProperty(property));
      ["--about-name-first-top", "--about-name-second-top", "--about-name-front", "--about-name-back", "--about-portrait-opacity", "--about-details-opacity", "--about-details-y"].forEach(property => aboutSticky.style.removeProperty(property));
      return;
    }
    const finalWidth = Math.min(470, Math.max(300, width * 0.31));
    const finalHeight = Math.min(660, height * 0.76);
    const finalLeft = (width - finalWidth) / 2;
    const finalTop = height * 0.07;
    const mediaWidth = lerp(width, finalWidth, layoutProgress);
    const mediaHeight = lerp(height, finalHeight, layoutProgress);
    const mediaLeft = lerp(0, finalLeft, layoutProgress);
    const mediaTop = lerp(0, finalTop, layoutProgress);
    const handoff = clamp((rawProgress - 0.34) / 0.3);
    const portraitOpacity = clamp((rawProgress - 0.2) / 0.5);
    const details = clamp((rawProgress - 0.68) / 0.32);

    aboutPortrait.style.width = `${mediaWidth}px`;
    aboutPortrait.style.height = `${mediaHeight}px`;
    aboutPortrait.style.left = `${mediaLeft}px`;
    aboutPortrait.style.top = `${mediaTop}px`;
    aboutSticky.style.setProperty("--about-name-first-top", `${finalTop}px`);
    aboutSticky.style.setProperty("--about-name-second-top", `${finalTop + finalHeight * 0.4}px`);
    aboutSticky.style.setProperty("--about-name-front", String(1 - handoff));
    aboutSticky.style.setProperty("--about-name-back", String(handoff));
    aboutSticky.style.setProperty("--about-portrait-opacity", String(portraitOpacity));
    aboutSticky.style.setProperty("--about-details-opacity", String(details));
    aboutSticky.style.setProperty("--about-details-y", `${(1 - details) * 28}px`);
  };

  const updateScrollState = () => {
    if (body.classList.contains("menu-open")) return;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = clamp(window.scrollY / scrollable);
    if (progressBar) progressBar.style.transform = `scaleX(${pageProgress})`;
    progress.classList.toggle("is-visible", window.scrollY > 2);
    progress.setAttribute("aria-valuenow", String(Math.round(pageProgress * 100)));
    nav?.classList.toggle("is-scrolled", window.scrollY > 3);

    updateAboutHero();

    const caseHero = document.querySelector("[data-case-hero]");
    if (!caseHero) return;
    if (body.classList.contains("is-case-entering")) {
      body.style.setProperty("--case-dim", "0");
      body.style.setProperty("--case-copy", "0");
      body.style.setProperty("--case-copy-y", "48px");
      return;
    }
    const heroTop = caseHero.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, window.scrollY - heroTop);
    const dim = clamp(distance / (window.innerHeight * 0.62));
    const copy = clamp((distance - window.innerHeight * 0.08) / (window.innerHeight * 0.34));
    body.style.setProperty("--case-dim", (dim * 0.82).toFixed(3));
    body.style.setProperty("--case-copy", copy.toFixed(3));
    body.style.setProperty("--case-copy-y", `${(1 - copy) * 48}px`);
  };

  let caseEntryReady = true;
  const unlockCaseEntry = () => {
    if (!caseEntryReady || !body.classList.contains("is-case-entering")) return;
    body.classList.remove("is-case-entering");
    updateScrollState();
  };
  window.addEventListener("wheel", unlockCaseEntry, { passive: true });
  window.addEventListener("touchstart", unlockCaseEntry, { passive: true });
  window.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) unlockCaseEntry();
  });
  window.addEventListener("pointerdown", event => {
    if (event.clientX >= window.innerWidth - 24) unlockCaseEntry();
  }, { passive: true });

  const initialiseReveals = () => {
    const items = document.querySelectorAll(".reveal-on-scroll, .editorial-media");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    items.forEach(item => observer.observe(item));
  };

  const initialiseProjectPreviews = () => {
    const continuousCases = {
      k33p: {
        bodyClass: "k33p-case",
        heroLabel: "K33P product and identity film"
      },
      dietbloom: {
        bodyClass: "dietbloom-case",
        heroLabel: "DietBloom app marketing film"
      },
      luxmirae: {
        bodyClass: "luxmirae-case",
        heroLabel: "Luxmirae logo animation"
      },
      brail: {
        bodyClass: "brail-case",
        heroLabel: "Animated Brail directional symbol"
      }
    };

    const fetchContinuousCasePage = async (link, config) => {
      const cleanURL = new URL(link.href);
      const urls = [cleanURL.href, `${cleanURL.origin}${cleanURL.pathname}.html`];
      for (const url of urls) {
        try {
          const response = await fetch(url, { credentials: "same-origin" });
          if (!response.ok) continue;
          const page = new DOMParser().parseFromString(await response.text(), "text/html");
          if (page.body.classList.contains(config.bodyClass) && page.querySelector("[data-project-hero] video")) return page;
        } catch (_) {
          // The normal link remains the fallback when the page cannot be fetched.
        }
      }
      throw new Error("Case study unavailable for the continuous transition");
    };

    const waitForPaintedVideoFrame = (video, timeout = 650) => new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(finish, timeout);
      video.play().catch(() => {});
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(finish);
      } else {
        requestAnimationFrame(() => requestAnimationFrame(finish));
      }
    });

    const openCaseWithLiveVideo = async (link, visual, video, pagePromise, slug, config) => {
      const rect = visual.getBoundingClientRect();
      const flight = document.createElement("div");
      const startingTransform = getComputedStyle(video).transform;
      let resumeFrame = 0;
      video.addEventListener("pause", () => {
        if (resumeFrame || document.hidden || !video.closest("[data-project-hero]")) return;
        const heroRect = video.getBoundingClientRect();
        if (heroRect.bottom <= 0 || heroRect.top >= window.innerHeight) return;
        resumeFrame = requestAnimationFrame(() => {
          resumeFrame = 0;
          if (!document.hidden && video.closest("[data-project-hero]")) video.play().catch(() => {});
        });
      });
      flight.className = "project-flight project-flight--live";
      Object.assign(flight.style, {
        top: `${rect.top}px`, left: `${rect.left}px`,
        width: `${rect.width}px`, height: `${rect.height}px`
      });

      // Keep one decoder and one painted video element throughout the transition.
      video.className = "project-flight-media";
      video.style.animation = "none";
      video.style.transition = "none";
      video.style.opacity = "1";
      video.style.transform = startingTransform === "none" ? "none" : startingTransform;
      flight.append(video);
      body.append(flight);
      visual.classList.add("is-flight-source");
      body.classList.add("is-project-transitioning-live");
      video.play().catch(() => {});

      try {
        const duration = 1050;
        const easing = "cubic-bezier(.76,0,.24,1)";
        const expansion = flight.animate([
          { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px` },
          { top: "0px", left: "0px", width: `${window.innerWidth}px`, height: `${window.innerHeight}px` }
        ], { duration, easing, fill: "forwards" });
        const videoExpansion = video.animate([
          { transform: startingTransform === "none" ? "none" : startingTransform },
          { transform: "none" }
        ], { duration, easing, fill: "forwards" });

        await expansion.finished;
        const page = await pagePromise;
        const incomingMain = page.querySelector("main");
        const incomingVideo = incomingMain?.querySelector("[data-project-hero] video");
        if (!incomingMain || !incomingVideo) throw new Error("Case-study hero missing");

        document.querySelector("main")?.replaceWith(document.importNode(incomingMain, true));
        const heroMedia = document.querySelector("[data-project-hero]");
        heroMedia.replaceWith(flight);
        flight.setAttribute("data-project-hero", "");
        document.querySelector(".project-cursor")?.remove();
        caseEntryReady = false;
        body.className = `case-page ${config.bodyClass} is-case-entering`;
        body.style.setProperty("--case-dim", "0");
        body.style.setProperty("--case-copy", "0");
        body.style.setProperty("--case-copy-y", "48px");
        document.title = page.title;
        for (const selector of ["meta[name='description']", "meta[property='og:title']", "meta[property='og:description']", "meta[property='og:type']", "meta[property='og:url']", "meta[property='og:image']", "meta[name='twitter:card']", "meta[name='twitter:title']", "meta[name='twitter:description']", "meta[name='theme-color']", "link[rel='canonical']"]) {
          const current = document.head.querySelector(selector);
          const incoming = page.head.querySelector(selector);
          if (incoming) {
            const replacement = document.importNode(incoming, true);
            if (current) current.replaceWith(replacement);
            else document.head.append(replacement);
          }
        }
        const logo = document.querySelector(".logo-img");
        if (logo) logo.src = new URL("/images/brand/logo-light.svg", location.origin).href;
        document.querySelector("nav a[href='#work']")?.setAttribute("href", "/#work");
        const localPreview = ["127.0.0.1", "localhost"].includes(location.hostname);
        const destination = localPreview ? `${new URL(link.href).pathname}.html` : link.href;
        history.pushState({ project: slug }, "", destination);
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = previousScrollBehavior;

        video.className = "project-flight-media is-continuous-video";
        video.removeAttribute("style");
        video.removeAttribute("poster");
        video.setAttribute("aria-label", incomingVideo.getAttribute("aria-label") || config.heroLabel);
        video.removeAttribute("aria-hidden");
        video.autoplay = true;
        Object.assign(flight.style, {
          top: "0px", left: "0px", width: `${window.innerWidth}px`, height: `${window.innerHeight}px`
        });
        expansion.cancel();
        videoExpansion.cancel();
        await waitForPaintedVideoFrame(video);
        flight.className = "immersive-media";
        flight.removeAttribute("style");
        video.className = "is-continuous-video";
        initialiseReveals();
        initialiseMediaLoading();
        initialiseProjectCursor();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          // Wait until the new document has settled at the top before allowing
          // its scroll-driven headline to become visible.
          if (window.scrollY !== 0) {
            const scrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = scrollBehavior;
          }
          caseEntryReady = true;
          updateScrollState();
        }));
        window.addEventListener("popstate", () => window.location.reload(), { once: true });
      } catch (_) {
        window.location.assign(link.href);
      }
    };

    document.querySelectorAll(".project-link").forEach(link => {
      const visual = link.querySelector(".project-visual");
      const video = visual?.querySelector("video");
      const slug = new URL(link.href).pathname.replace(/\/$/, "").split("/").pop();
      const continuousCase = video ? continuousCases[slug] : null;
      let prefetchedPage;
      const preparePage = () => {
        if (continuousCase && !prefetchedPage) prefetchedPage = fetchContinuousCasePage(link, continuousCase).catch(() => null);
      };
      const play = () => {
        video?.play().catch(() => {});
        preparePage();
      };
      const pause = () => {
        if (video?.closest(".project-visual") === visual) video.pause();
      };
      link.addEventListener("mouseenter", play);
      link.addEventListener("focus", play);
      link.addEventListener("mouseleave", pause);
      link.addEventListener("blur", pause);
      link.addEventListener("click", event => {
        const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        if (modified || reducedMotion || !visual) return;
        if (body.classList.contains("is-project-transitioning-live")) return;
        if (continuousCase) {
          event.preventDefault();
          preparePage();
          const beginTransition = () => {
            waitForPaintedVideoFrame(video).then(() => {
              openCaseWithLiveVideo(link, visual, video, prefetchedPage, slug, continuousCase);
            });
          };
          if (video.readyState >= 2) {
            beginTransition();
          } else {
            let settled = false;
            const cleanup = () => {
              clearTimeout(fallbackTimer);
              video.removeEventListener("loadeddata", startWhenReady);
              video.removeEventListener("error", useNormalNavigation);
            };
            const startWhenReady = () => {
              if (settled) return;
              settled = true;
              cleanup();
              beginTransition();
            };
            const useNormalNavigation = () => {
              if (settled) return;
              settled = true;
              cleanup();
              window.location.assign(link.href);
            };
            const fallbackTimer = window.setTimeout(useNormalNavigation, 2500);
            video.addEventListener("loadeddata", startWhenReady, { once: true });
            video.addEventListener("error", useNormalNavigation, { once: true });
            video.play().catch(() => {});
          }
          return;
        }
        if (!finePointer) return;
        event.preventDefault();

        const source = visual.querySelector(".project-motion:not(video)") || visual.querySelector(".project-still") || visual.querySelector("img");
        if (!source || body.classList.contains("is-project-transitioning")) {
          window.location.assign(link.href);
          return;
        }

        const rect = visual.getBoundingClientRect();
        const flight = document.createElement("div");
        const flightMedia = source.cloneNode(true);
        const sourceTransform = getComputedStyle(source).transform;
        flight.className = "project-flight";
        flightMedia.className = "project-flight-media";
        flightMedia.removeAttribute("aria-hidden");
        flight.append(flightMedia);
        Object.assign(flight.style, {
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`
        });
        body.append(flight);
        visual.classList.add("is-flight-source");
        body.classList.add("is-project-transitioning");

        if (flightMedia instanceof HTMLVideoElement) {
          flightMedia.muted = true;
          flightMedia.playsInline = true;
          const syncAndPlay = () => {
            if (video && Number.isFinite(video.currentTime)) flightMedia.currentTime = video.currentTime;
            flightMedia.play().catch(() => {});
          };
          if (flightMedia.readyState >= 1) syncAndPlay();
          else flightMedia.addEventListener("loadedmetadata", syncAndPlay, { once: true });
        }

        const duration = 1100;
        const easing = "cubic-bezier(.76,0,.24,1)";
        const flightAnimation = flight.animate([
          { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px` },
          { top: "0px", left: "0px", width: `${window.innerWidth}px`, height: `${window.innerHeight}px` }
        ], { duration, easing, fill: "forwards" });
        flightMedia.animate([
          { transform: sourceTransform === "none" ? "scale(1.03)" : sourceTransform },
          { transform: "scale(1.08) translate3d(-1.2%,0,0)" }
        ], { duration, easing, fill: "forwards" });

        flightAnimation.finished.then(() => {
          const activeVideo = flightMedia instanceof HTMLVideoElement ? flightMedia : video;
          if (activeVideo) {
            sessionStorage.setItem("ewoma-project-video-time", String(activeVideo.currentTime));
            sessionStorage.setItem("ewoma-project-video-src", activeVideo.currentSrc || activeVideo.src);
          }
          window.location.assign(link.href);
        }).catch(() => window.location.assign(link.href));
      });
    });

    const heroVideo = document.querySelector("[data-project-hero] video");
    if (!heroVideo) return;
    const savedTime = Number(sessionStorage.getItem("ewoma-project-video-time"));
    const savedSource = sessionStorage.getItem("ewoma-project-video-src");
    const restoreVideo = () => {
      if (savedSource && heroVideo.currentSrc && !heroVideo.currentSrc.endsWith(savedSource.split("/").pop())) return;
      if (Number.isFinite(savedTime)) heroVideo.currentTime = savedTime;
      heroVideo.play().catch(() => {});
      sessionStorage.removeItem("ewoma-project-video-time");
      sessionStorage.removeItem("ewoma-project-video-src");
    };
    if (heroVideo.readyState >= 1) restoreVideo();
    else heroVideo.addEventListener("loadedmetadata", restoreVideo, { once: true });
  };

  const initialiseSharedMotion = () => {
    const targets = [
      ...document.querySelectorAll(".home-hero h1, .section-head, .home-profile p, .home-profile-link, .about-biography-new > div, .about-capabilities-new h2, .about-capability-grid p, .about-experience-new > h2, .experience-list article, .resume-link, footer .footer-top, footer .footer-bottom, .error-copy")
    ];
    if (!targets.length) return;
    targets.forEach((target, index) => {
      target.classList.add("site-reveal");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 45}ms`);
    });
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(target => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(target => observer.observe(target));
  };

  const initialiseMediaLoading = () => {
    const media = [
      ...document.querySelectorAll(".project-visual .project-still, .editorial-media img, .immersive-media img, .editorial-media video, .immersive-media video")
    ];
    if (!media.length) return;
    const critical = media.filter(item => item.closest(".immersive-media") || item.matches(".project-still") && item.closest(".project-card") === document.querySelector(".project-card"));
    let criticalRemaining = critical.length;
    let slowTimer;

    const finishCritical = item => {
      if (!critical.includes(item)) return;
      criticalRemaining = Math.max(0, criticalRemaining - 1);
      if (criticalRemaining) return;
      clearTimeout(slowTimer);
      body.classList.remove("is-loading-media");
    };

    const settle = (item, succeeded) => {
      const frame = item.closest(".project-visual, .editorial-media, .immersive-media");
      frame?.classList.remove("media-loading");
      frame?.classList.add(succeeded ? "media-ready" : "media-error");
      finishCritical(item);
    };

    media.forEach(item => {
      const frame = item.closest(".project-visual, .editorial-media, .immersive-media");
      const isImageReady = item instanceof HTMLImageElement && item.complete;
      const isVideoReady = item instanceof HTMLVideoElement && item.readyState >= 2;
      if (isImageReady || isVideoReady) {
        settle(item, !(item instanceof HTMLImageElement) || item.naturalWidth > 0);
        return;
      }
      frame?.classList.add("media-loading");
      const readyEvent = item instanceof HTMLVideoElement ? "loadeddata" : "load";
      item.addEventListener(readyEvent, () => settle(item, true), { once: true });
      item.addEventListener("error", () => settle(item, false), { once: true });
    });

    if (criticalRemaining) {
      slowTimer = window.setTimeout(() => body.classList.add("is-loading-media"), 450);
    }
  };

  const initialiseManagedVideos = () => {
    const videos = [...document.querySelectorAll("video")];
    if (!videos.length) return;
    const saveData = navigator.connection?.saveData;
    videos.forEach(video => {
      video.playsInline = true;
      if (saveData) {
        video.preload = "none";
        video.autoplay = false;
      } else if (!video.hasAttribute("preload")) {
        video.preload = "metadata";
      }
      if (video.closest(".project-visual")) {
        video.muted = true;
        video.loop = true;
      }
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        const rect = entry.target.getBoundingClientRect();
        const visibleNow = rect.bottom > 0 && rect.top < window.innerHeight;
        if (entry.isIntersecting || visibleNow) {
          if (entry.target.autoplay && !document.hidden) entry.target.play().catch(() => {});
        } else if (!entry.target.closest(".project-flight")) {
          entry.target.pause();
        }
      }), { threshold: 0.05 });
      // Card previews are already managed by hover/focus. Observing them here
      // can dispatch a stale offscreen pause after one moves into a case hero.
      videos.filter(video => !video.closest(".project-visual")).forEach(video => observer.observe(video));
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) videos.forEach(video => video.pause());
    });
  };

  const initialiseProjectCursor = () => {
    const allowed = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [...document.querySelectorAll(".project-link, .next-project-card, .case-project-link")];
    if (!allowed || !targets.length) return;
    const cursor = document.createElement("div");
    cursor.className = "project-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "View";
    body.append(cursor);
    body.classList.add("has-project-cursor");
    let x = -100;
    let y = -100;
    let targetX = x;
    let targetY = y;
    let cursorFrame = 0;
    const draw = () => {
      cursorFrame = 0;
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      cursor.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${cursor.classList.contains("is-visible") ? 1 : 0.72})`;
      const isMoving = Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2;
      if (cursor.classList.contains("is-visible") || isMoving) cursorFrame = requestAnimationFrame(draw);
    };
    const requestCursorDraw = () => {
      if (!cursorFrame) cursorFrame = requestAnimationFrame(draw);
    };
    document.addEventListener("pointermove", event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (cursor.classList.contains("is-visible")) requestCursorDraw();
    }, { passive: true });
    targets.forEach(target => {
      target.classList.add("cursor-target");
      target.addEventListener("pointerenter", () => {
        cursor.textContent = target.dataset.cursorLabel || (target.classList.contains("next-project-card") ? "Next" : "View");
        cursor.classList.add("is-visible");
        requestCursorDraw();
      });
      target.addEventListener("pointerleave", () => {
        cursor.classList.remove("is-visible");
        requestCursorDraw();
      });
    });
    window.addEventListener("blur", () => {
      cursor.classList.remove("is-visible");
      requestCursorDraw();
    });
  };

  window.addEventListener("pageshow", () => {
    body.classList.remove("is-project-transitioning");
    document.querySelectorAll(".project-visual.is-flight-source").forEach(item => item.classList.remove("is-flight-source"));
    document.querySelectorAll(".project-flight").forEach(item => item.remove());
  });

  initialiseMenu();
  initialiseReveals();
  initialiseProjectPreviews();
  initialiseSharedMotion();
  initialiseMediaLoading();
  initialiseManagedVideos();
  initialiseProjectCursor();
  updateScrollState();
  let scrollFrame = 0;
  const scheduleScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateScrollState();
    });
  };
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
});
