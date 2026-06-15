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

  const bootReveal = () => {
    const items = Array.from(document.querySelectorAll(revealSelectors.join(",")));

    items.forEach((item, index) => {
      item.classList.add("liquid-appear");
      item.style.setProperty("--appear-delay", `${Math.min(index % 6, 5) * 70}ms`);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootReveal, { once: true });
  } else {
    bootReveal();
  }
})();
