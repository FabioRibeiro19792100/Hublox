(function () {
  if (!("IntersectionObserver" in window)) return;

  var MAX_STAGGERED = 6;
  var variants = [
    [".section > .wrap > .kicker, .section > .wrap > .section-title, .section-lead, .sub-title, .note-card, .idea-card, .community-card, .rules-card", "rise"],
    [".prize-card", "unfold"],
    [".grid-3, .calendar, .prize-points, .rules-card .bullets, .steps, .faq, .final-cta .wrap", "stagger"],
  ];

  document.documentElement.classList.add("motion");

  var targets = [];
  variants.forEach(function (entry) {
    document.querySelectorAll(entry[0]).forEach(function (element) {
      element.setAttribute("data-reveal", entry[1]);
      if (entry[1] === "stagger") {
        Array.prototype.forEach.call(element.children, function (child, index) {
          child.style.setProperty("--i", Math.min(index, MAX_STAGGERED - 1));
        });
      }
      targets.push(element);
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

  targets.forEach(function (element) { observer.observe(element); });
})();
