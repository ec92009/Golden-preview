(() => {
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

  const boot = () => {
    bootReveal();
    bootMobileCta();
    bootTapFeedback();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
