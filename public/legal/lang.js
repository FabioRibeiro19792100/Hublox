(function () {
  var languages = ["pt", "es", "en"];

  function storedLanguage() {
    try { return localStorage.getItem("hublox-lang"); } catch (e) { return null; }
  }

  function pickLanguage() {
    var fromHash = location.hash.replace("#", "");
    if (languages.indexOf(fromHash) !== -1) return fromHash;
    var stored = storedLanguage();
    if (languages.indexOf(stored) !== -1) return stored;
    var browser = (navigator.language || "pt").slice(0, 2);
    return languages.indexOf(browser) !== -1 ? browser : "pt";
  }

  function show(language) {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language;
    document.querySelectorAll("section[lang]").forEach(function (section) {
      section.classList.toggle("is-active", section.getAttribute("lang").slice(0, 2) === language);
    });
    document.querySelectorAll(".lang-switch a").forEach(function (link) {
      link.setAttribute("aria-current", String(link.getAttribute("href") === "#" + language));
    });
  }

  document.documentElement.classList.add("js-lang");
  show(pickLanguage());
  window.addEventListener("hashchange", function () { show(pickLanguage()); });
})();
