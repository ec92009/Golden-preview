const conceptButtons = document.querySelectorAll("[data-select]");
const concepts = document.querySelectorAll("[data-concept]");

function setConcept(id, pushHash = true) {
  const target = document.querySelector(`[data-concept="${id}"]`);
  if (!target) return;

  concepts.forEach((concept) => {
    concept.classList.toggle("is-active", concept.dataset.concept === id);
  });

  conceptButtons.forEach((button) => {
    const active = button.dataset.select === id;
    button.classList.toggle("is-active", active);
    if (button.tagName === "BUTTON") {
      button.setAttribute("aria-pressed", String(active));
    }
  });

  if (pushHash) {
    history.replaceState(null, "", `#${id}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

conceptButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setConcept(button.dataset.select);
  });
});

const initial = window.location.hash.replace("#", "") || "best-mix";
setConcept(initial, false);

if (window.lucide) {
  window.lucide.createIcons();
} else {
  window.addEventListener("load", () => window.lucide && window.lucide.createIcons());
}
