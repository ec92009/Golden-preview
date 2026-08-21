(() => {
  const SETTINGS_STORAGE_KEY = "golden-liquid-glass-settings";
  const DEFAULT_SETTINGS = { theme: "day", opacity: 64, blur: 20 };

  const clamp = (value, minimum, maximum, fallback) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.min(maximum, Math.max(minimum, numeric)) : fallback;
  };

  const loadSettings = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
      return {
        theme: saved.theme === "night" ? "night" : DEFAULT_SETTINGS.theme,
        opacity: clamp(saved.opacity, 42, 82, DEFAULT_SETTINGS.opacity),
        blur: clamp(saved.blur, 12, 32, DEFAULT_SETTINGS.blur),
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  };

  const saveSettings = (settings) => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings still apply for this visit when storage is unavailable.
    }
  };

  const revealSelectors = [
    ".hero__content",
    ".hero__facts > div",
    ".section-heading",
    ".service-card",
    ".answer-item",
    ".fit-card",
    ".testimonial-card",
    ".founder-image",
    ".founder-copy",
    ".video-card",
    ".video-cta",
    ".concept-footer .footer-content",
  ];

  const tapTargets = [
    ".button",
    ".nav-cta",
    ".hero__facts div",
    ".service-card",
    ".answer-item",
    ".fit-card",
    ".testimonial-card",
    ".founder-image",
    ".video-card",
    ".mobile-sticky-cta",
  ].join(",");

  const bootReveal = () => {
    const items = Array.from(document.querySelectorAll(revealSelectors.join(",")));
    const serviceCards = Array.from(document.querySelectorAll(".service-card"));

    items.forEach((item, index) => {
      const serviceIndex = serviceCards.indexOf(item);
      const delay = serviceIndex >= 0 ? 140 + serviceIndex * 130 : Math.min(index % 6, 5) * 70;
      item.classList.add("liquid-appear");
      item.style.setProperty("--appear-delay", `${delay}ms`);
      item.style.setProperty("--sheen-delay", `${delay + 170}ms`);
    });

    document.body.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    });

    items.forEach((item) => observer.observe(item));
  };

  const bootMobileCta = () => {
    const stickyCta = document.querySelector(".mobile-sticky-cta");
    const hero = document.querySelector(".hero");
    if (!stickyCta || !hero) return;

    const updateCta = () => {
      const show = window.matchMedia("(max-width: 760px)").matches && hero.getBoundingClientRect().bottom < 110;
      stickyCta.classList.toggle("is-visible", show);
      document.body.classList.toggle("has-mobile-cta", show);
    };

    updateCta();
    window.addEventListener("scroll", updateCta, { passive: true });
    window.addEventListener("resize", updateCta);
  };

  const bootTapFeedback = () => {
    document.querySelectorAll(tapTargets).forEach((item) => {
      const clear = () => item.classList.remove("is-tapping");
      item.addEventListener("pointerdown", () => item.classList.add("is-tapping"));
      item.addEventListener("pointerup", clear);
      item.addEventListener("pointercancel", clear);
      item.addEventListener("pointerleave", clear);
    });
  };

  const bootSettings = () => {
    const panel = document.querySelector("#settings-panel");
    const toggle = document.querySelector("[data-settings-toggle]");
    const closeButton = document.querySelector("[data-settings-close]");
    const backdrop = document.querySelector("[data-settings-backdrop]");
    if (!panel || !toggle || !closeButton || !backdrop) return;

    const themeChoices = Array.from(document.querySelectorAll("[data-theme-choice]"));
    const opacityInput = document.querySelector("[data-glass-opacity]");
    const blurInput = document.querySelector("[data-glass-blur]");
    const opacityOutput = document.querySelector("[data-opacity-output]");
    const blurOutput = document.querySelector("[data-blur-output]");
    const versionOutput = document.querySelector("[data-settings-version]");
    const settings = loadSettings();

    const applySettings = () => {
      document.body.dataset.theme = settings.theme;
      document.documentElement.style.setProperty("--glass-alpha", (settings.opacity / 100).toFixed(2));
      document.documentElement.style.setProperty("--glass-strong-alpha", Math.min(0.92, settings.opacity / 100 + 0.14).toFixed(2));
      document.documentElement.style.setProperty("--glass-nav-alpha", Math.min(0.88, settings.opacity / 100 + 0.08).toFixed(2));
      document.documentElement.style.setProperty("--glass-blur", `${settings.blur}px`);
      themeChoices.forEach((choice) => {
        choice.checked = choice.value === settings.theme;
      });
      if (opacityInput) opacityInput.value = String(settings.opacity);
      if (blurInput) blurInput.value = String(settings.blur);
      if (opacityOutput) opacityOutput.textContent = `${settings.opacity}%`;
      if (blurOutput) blurOutput.textContent = `${settings.blur}px`;
      if (versionOutput) {
        const versionScript = Array.from(document.scripts).find((script) => script.src.includes("site-version.js"));
        const version = versionScript ? new URL(versionScript.src, window.location.href).searchParams.get("v") : null;
        if (version) versionOutput.textContent = `v${version}`;
      }
    };

    const focusableElements = () => Array.from(panel.querySelectorAll("button, input")).filter((element) => !element.disabled);
    const closeSettings = (restoreFocus = true) => {
      panel.hidden = true;
      backdrop.hidden = true;
      document.body.classList.remove("settings-open");
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus();
    };
    const openSettings = () => {
      panel.hidden = false;
      backdrop.hidden = false;
      document.body.classList.add("settings-open");
      toggle.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(() => closeButton.focus());
    };

    themeChoices.forEach((choice) => choice.addEventListener("change", () => {
      settings.theme = choice.value === "night" ? "night" : "day";
      applySettings();
      saveSettings(settings);
    }));
    opacityInput?.addEventListener("input", () => {
      settings.opacity = clamp(opacityInput.value, 42, 82, DEFAULT_SETTINGS.opacity);
      applySettings();
      saveSettings(settings);
    });
    blurInput?.addEventListener("input", () => {
      settings.blur = clamp(blurInput.value, 12, 32, DEFAULT_SETTINGS.blur);
      applySettings();
      saveSettings(settings);
    });
    toggle.addEventListener("click", openSettings);
    closeButton.addEventListener("click", () => closeSettings());
    backdrop.addEventListener("click", () => closeSettings());
    document.addEventListener("keydown", (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    applySettings();
  };

  const bootBackToTop = () => {
    const button = document.querySelector("[data-back-to-top]");
    if (!button) return;

    const updateVisibility = () => {
      const show = window.scrollY > Math.max(480, window.innerHeight * 0.72);
      button.hidden = !show;
      button.setAttribute("aria-hidden", String(!show));
    };
    button.addEventListener("click", () => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior });
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    updateVisibility();
  };

  const boot = () => {
    bootReveal();
    bootMobileCta();
    bootTapFeedback();
    bootSettings();
    bootBackToTop();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
