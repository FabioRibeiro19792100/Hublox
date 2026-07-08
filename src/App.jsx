import { useEffect, useRef, useState } from "react";
import badgesCorUrl from "../badges-cor.svg";
import badgesLinhaUrl from "../badges-linha.svg";
import { translations, langOrder, langLabels } from "./i18n";

const palette = {
  red: "#E31837",
  redDark: "#CC1530",
  blue: "#2468B8",
  blueDark: "#1D5499",
  yellow: "#F5C518",
  yellowText: "#B8860B",
  purple: "#5865F2",
  bgDark: "#0D1117",
  page: "#F8F8FA",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  border: "#EBEBEB",
};

const externalLinks = {
  "Studio mobile": "https://exproblox.studio",
  "Studio web": "https://exproblox.studio",
  "Roblox Studio": "https://create.roblox.com/store/asset/125743081126783/Expedio-Roblox",
  "Roblox": "https://create.roblox.com/docs/pt-br/production/publishing/publish-games-and-places#publicar-jogos",
  "Comunidade no Discord": "https://discord.gg/exproblox",
};

// Rough heuristic for whether the machine can comfortably run Roblox Studio.
// The browser can't truly test installability, so we combine CPU cores, device
// memory (Chromium-only) and a tiny timed benchmark into a capable/weak verdict.
function testComputationalPower() {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory; // GB, undefined outside Chromium

  const start = performance.now();
  let acc = 0;
  for (let i = 0; i < 4_000_000; i++) acc += Math.sqrt(i) * 1.0001;
  const elapsed = performance.now() - start; // ms; lower is faster
  if (acc < 0) return "weak"; // keep the loop from being optimized away

  const coresOk = cores >= 4;
  const benchOk = elapsed < 160;
  const memOk = memory === undefined ? benchOk : memory >= 4;
  return coresOk && memOk ? "capable" : "weak";
}

const brazilStates = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const mexicoStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas",
];

const statesByCountry = {
  BR: brazilStates,
  US: usStates,
  MX: mexicoStates,
};

// "Para responsáveis" media (YouTube ids + Google Docs), zipped by index with
// the translated titles/descriptions in t.responsaveis.audiences[*].
const DOC = "https://docs.google.com/document/d/e/";
const responsaveisMedia = {
  responsaveis: {
    videos: ["Gn_s7uwZSVY", "NQAb8ibln8Y", "Te3wD_n9n10", "_S0IslHdWIM", "vKf3Gl6oUUo", "9XC6d1fzB_o"],
    docs: [
      `${DOC}2PACX-1vT5hWL7_iEWnZW5MNfKKbb-Vv3hiH58jVzOQlw2b5saetuznjeozsjae2RwtZJcN_AZ32EbHTRrTZtK/pub`,
      `${DOC}2PACX-1vTLtA9KLoxL9mN0etmw3ezxBSp5p0Ti516KICMbm_5LEjB-BXewpVJabf1eNBvsuBZ6rM2L7ihNqtyp/pub`,
      `${DOC}2PACX-1vSiAvmcWNoNZUDhSlYMYeFnbKm0W-irUtdpwT0-zs1Jzp2OIA4rNEka9m9hSqD3Eu6w0UxHgIqbrkbq/pub`,
    ],
  },
  educadores: {
    videos: ["5y6yjqbD4lw", "iGZW_2bkrzo", "j3jXYj9SFB0", "B1Hau_9L7YM", "-Saml9SlIG4"],
    docs: [
      `${DOC}2PACX-1vSiAvmcWNoNZUDhSlYMYeFnbKm0W-irUtdpwT0-zs1Jzp2OIA4rNEka9m9hSqD3Eu6w0UxHgIqbrkbq/pub`,
      `${DOC}2PACX-1vSB-ikEr648Spl-KGxY9lh5g_JWXBWOvdcew8DaNJ9wFQPB1gc0Xqjwtf_Y2bQeH8_rmjdBYBFzRyrM/pub`,
      `${DOC}2PACX-1vTVqf6J5-HBu_WBpqVFJMfZOIwGIrftsYNc9kUfkuQRaEmm3yFB1PNy_As9HLtY7p9SEMR1hlY-leix/pub`,
    ],
  },
};

// Non-text metadata kept out of the translation dictionary, merged by index.
const sobreMeta = [
  { color: palette.red, icon: "target" },
  { color: palette.blue, icon: "stair" },
  { color: palette.yellowText, icon: "shield" },
  { color: palette.purple, icon: "infinity" },
];

const videoMeta = [
  { color: "linear-gradient(135deg,#0D1117 0%,#1A2233 100%)", accent: palette.red },
  { color: "linear-gradient(135deg,#111827 0%,#1F2D40 100%)", accent: palette.blue },
  { color: "linear-gradient(135deg,#0F1A0F 0%,#1A2E1A 100%)", accent: "#1F8A5B" },
];

// Ecosystem items tracked for the logged-area progress (viewed on expand, done on action).
const ECO_KEYS = ["studiomob", "rstudio", "roblox", "comunidade"];

// Items whose completion requires confirming the Roblox handle actually entered/used
// the tool. "roblox" (publishing) is left optimistic; the rest gate on verification.
const VERIFY_ITEMS = new Set(["studiomob", "rstudio", "comunidade"]);

// Source of truth for "did this Roblox handle actually enter/use `item`?".
// STUB — wire this to a real integration later (e.g. an exproblox.studio status
// endpoint, a Discord bot membership check, or a Roblox Open Cloud lookup). Until
// then it resolves false, so verified items stay "em análise" instead of completing
// falsely. Example:
//   const r = await fetch(`/api/verify?handle=${encodeURIComponent(handle)}&item=${item}`);
//   return (await r.json()).entered === true;
async function verifyEntry(handle, item) {
  void handle; void item;
  return false;
}

// Neutral medal shown until the real badge artwork is dropped in public/uploads
// (badge-creator.png / badge-constructor.png). Grayscaled while locked.
const MEDAL_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path d='M17 5h6l-2 11h-4z' fill='#c94b4b'/><path d='M25 5h6l2 11h-4z' fill='#4b74c9'/><circle cx='24' cy='29' r='14' fill='#e8b84b' stroke='#b8860b' stroke-width='2'/><path d='M24 20.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z' fill='#fff'/></svg>",
  );

// Logged-area achievements. Two plugin badges (image artwork), six Studio mobile
// tutorials and one Bilde milestone (emoji). All locked until the backend reports
// progress for the handle — see the `achievements` state / integration note.
const ACHIEVEMENTS = [
  { id: "creator", kind: "symbol", symbol: "badge-creator", frame: "circle" },
  { id: "constructor", kind: "symbol", symbol: "badge-creator-construtor", frame: "circle" },
  { id: "tut-3d", kind: "symbol", symbol: "badge-construtor-3d", frame: "circle" },
  { id: "tut-plataforma", kind: "symbol", symbol: "badge-plataforma-some", frame: "circle" },
  { id: "tut-porta", kind: "symbol", symbol: "badge-porta-automatica", frame: "circle" },
  { id: "tut-moeda", kind: "symbol", symbol: "badge-moeda-magica", frame: "circle" },
  { id: "tut-clicker", kind: "symbol", symbol: "badge-clicker-meta", frame: "circle" },
  { id: "tut-semaforo", kind: "symbol", symbol: "badge-semaforo", frame: "circle" },
  { id: "bilde-game", kind: "symbol", symbol: "badge-jogo-ia", frame: "circle" },
];

const ACHIEVEMENT_CLUSTERS = [
  {
    id: "identity",
    badgeIds: ["creator", "constructor"],
    style: {
      background: "#EEEDFE",
      borderColor: "#7F77DD33",
      titleColor: "#3C3489",
      textColor: "#534AB7",
    },
  },
  {
    id: "world",
    hidden: true,
    badgeIds: ["tut-3d"],
    style: {
      background: "#FAECE7",
      borderColor: "#D85A3033",
      titleColor: "#712B13",
      textColor: "#993C1D",
    },
  },
  {
    id: "interaction",
    badgeIds: ["tut-plataforma", "tut-porta", "tut-moeda"],
    style: {
      background: "#FAEEDA",
      borderColor: "#BA751733",
      titleColor: "#633806",
      textColor: "#854F0B",
    },
  },
  {
    id: "systems",
    badgeIds: ["tut-clicker", "tut-semaforo", "bilde-game"],
    style: {
      background: "#E1F5EE",
      borderColor: "#1D9E7533",
      titleColor: "#085041",
      textColor: "#0F6E56",
    },
  },
];

const responsaveisDocIcons = ["doc", "checklist", "book-open"];

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("hublox-lang") || "pt");
  const t = translations[lang] || translations.pt;

  const [creatorSession, setCreatorSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hublox-creator-session")) || null; }
    catch { return null; }
  });
  const [ecoProgress, setEcoProgress] = useState(() => {
    const empty = { viewed: {}, done: {}, pending: {} };
    try {
      const saved = JSON.parse(localStorage.getItem("hublox-eco-progress"));
      if (!saved) return empty;
      return { viewed: saved.viewed || {}, done: saved.done || {}, pending: saved.pending || {} };
    } catch { return empty; }
  });
  // Earned achievements map { [id]: true }. Populated by the backend integration
  // later (plugin badges, Studio mobile tutorials, Bilde milestone); all locked now.
  const [achievements, setAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hublox-achievements")) || {}; }
    catch { return {}; }
  });
  const [screen, setScreen] = useState(() => (creatorSession ? "hub" : "entry"));
  const [welcomeBack, setWelcomeBack] = useState(() => !!creatorSession);
  const [robloxHandle, setRobloxHandle] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [idStep, setIdStep] = useState("username"); // "username" | "confirm" | "details"
  const [resolvedHandle, setResolvedHandle] = useState(""); // canonical username from Roblox
  const [resolvedDisplayName, setResolvedDisplayName] = useState("");
  const [resolvedId, setResolvedId] = useState(null); // numeric Roblox ID
  const [resolvedThumbnail, setResolvedThumbnail] = useState(null);
  const [robloxValidating, setRobloxValidating] = useState(false);
  const [robloxError, setRobloxError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regBirthday, setRegBirthday] = useState("");
  const [qDev, setQDev] = useState(null);
  const [pcTest, setPcTest] = useState(null); // null | "running" | "capable" | "weak"
  const [tab, setTab] = useState("sobre");
  const [sub, setSub] = useState("main");
  const [journeyDevice, setJourneyDevice] = useState(null);
  const [journeyView, setJourneyView] = useState("inline");
  const [ecoOpen, setEcoOpen] = useState(null);
  const [ecoSubOpen, setEcoSubOpen] = useState(null);
  const [modal, setModal] = useState(null);
  const [audience, setAudience] = useState("responsaveis");
  const [videoModal, setVideoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 880);
  const activeJourneyDetailRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("hublox-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (creatorSession) localStorage.setItem("hublox-creator-session", JSON.stringify(creatorSession));
  }, [creatorSession]);

  useEffect(() => {
    localStorage.setItem("hublox-eco-progress", JSON.stringify(ecoProgress));
  }, [ecoProgress]);

  useEffect(() => {
    localStorage.setItem("hublox-achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    if (!welcomeBack) return;
    const timer = setTimeout(() => setWelcomeBack(false), 5000);
    return () => clearTimeout(timer);
  }, [welcomeBack]);

  const markEco = (key, level) =>
    setEcoProgress((prev) =>
      prev[level][key] ? prev : { ...prev, [level]: { ...prev[level], [key]: true } },
    );

  const toggleEco = (key) => {
    const opening = ecoOpen !== key;
    setEcoOpen(opening ? key : null);
    if (opening) markEco(key, "viewed");
  };

  // Using an ecosystem action: verified items go "pending" (confirmed later by the
  // background poller); non-verified items complete immediately.
  const runEcoAction = (key) => {
    if (!VERIFY_ITEMS.has(key)) {
      markEco(key, "done");
      return;
    }
    setEcoProgress((prev) =>
      prev.done[key] || prev.pending[key]
        ? prev
        : { ...prev, pending: { ...prev.pending, [key]: true } },
    );
  };

  // Background re-check: while there are pending items, poll the source of truth
  // until each is confirmed; then flip pending → done. Survives reloads.
  useEffect(() => {
    const pendingKeys = ECO_KEYS.filter((k) => ecoProgress.pending[k] && !ecoProgress.done[k]);
    if (!creatorSession || pendingKeys.length === 0) return;
    let cancelled = false;
    const check = async () => {
      for (const key of pendingKeys) {
        const ok = await verifyEntry(creatorSession.handle, key);
        if (ok && !cancelled) {
          setEcoProgress((prev) => ({
            ...prev,
            done: { ...prev.done, [key]: true },
            pending: { ...prev.pending, [key]: false },
          }));
        }
      }
    };
    check();
    const id = setInterval(check, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [ecoProgress, creatorSession]);

  const logout = () => {
    localStorage.removeItem("hublox-creator-session");
    localStorage.removeItem("hublox-eco-progress");
    localStorage.removeItem("hublox-achievements");
    setCreatorSession(null);
    setEcoProgress({ viewed: {}, done: {}, pending: {} });
    setAchievements({});
    setWelcomeBack(false);
    runLoading(() => setScreen("entry"));
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 880);
    window.addEventListener("resize", onResize);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (tab !== "jornada" || sub === "main" || !activeJourneyDetailRef.current) return;
    activeJourneyDetailRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [sub, tab]);

  useEffect(() => {
    if (sub === "mob") setJourneyDevice("mobile");
    if (sub === "bilde" || sub === "tut") setJourneyDevice("computer");
  }, [sub]);

  const API_URL = import.meta.env.VITE_API_URL || "https://roblox-api.mastertech.com.br";

  async function validateRobloxHandle(handle) {
    setRobloxValidating(true);
    setRobloxError("");
    try {
      const res = await fetch(`${API_URL}/api/roblox/user/?username=${encodeURIComponent(handle)}`);
      if (!res.ok) throw new Error("api_error");
      const data = await res.json();
      if (!data.found) {
        setRobloxError("Usuário não encontrado no Roblox. Verifique o username.");
        return;
      }
      setResolvedHandle(data.name);
      setResolvedDisplayName(data.displayName || data.name);
      setResolvedId(data.id);
      setResolvedThumbnail(data.thumbnailUrl || null);
      setIdStep("confirm");
    } catch {
      setRobloxError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setRobloxValidating(false);
    }
  }

  async function registerWithRoblox({ country, state, email, birthday } = {}) {
    setRegisterLoading(true);
    try {
      const body = {
        roblox_username: resolvedHandle.toLowerCase(),
        roblox_id: resolvedId,
        platform: "web",
        ...(email ? { email } : {}),
        ...(birthday ? { birthday } : {}),
        ...(country ? { country } : {}),
        ...(state ? { state } : {}),
      };
      const res = await fetch(`${API_URL}/api/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("register_failed");
      setCreatorSession({ handle: resolvedHandle, pais: country || "", estado: state || "" });
      runLoading(() => setScreen("hub"));
    } catch {
      setRobloxError("Erro ao salvar. Tente novamente.");
    } finally {
      setRegisterLoading(false);
    }
  }

  const runLoading = (cb, duration = 900) => {
    setLoading(true);
    cb();
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => setLoading(false), duration);
  };

  const pcTestTimer = useRef(null);

  const runPcTest = () => {
    setQDev("pc");
    setPcTest("running");
    if (pcTestTimer.current) clearTimeout(pcTestTimer.current);
    pcTestTimer.current = setTimeout(() => {
      setPcTest(testComputationalPower());
    }, 1900);
  };

  const chooseMobile = () => {
    if (pcTestTimer.current) clearTimeout(pcTestTimer.current);
    setPcTest(null);
    setQDev("mob");
  };

  const resetCreatorQ = () => {
    if (pcTestTimer.current) clearTimeout(pcTestTimer.current);
    setQDev(null);
    setPcTest(null);
  };

  const activeNav = [
    { key: "sobre", ...t.nav.sobre },
    { key: "eco", ...t.nav.eco },
    { key: "pais", ...t.nav.pais },
    { key: "jornada", ...t.nav.jornada },
  ];

  const toHub = (nextTab, nextSub = "main", nextJourneyView = "inline") =>
    runLoading(() => {
      setScreen("hub");
      setTab(nextTab);
      setSub(nextSub);
      setJourneyView(nextJourneyView);
      if (nextTab === "jornada") {
        setJourneyDevice(
          nextSub === "mob" ? "mobile" : nextSub === "bilde" || nextSub === "tut" ? "computer" : null,
        );
      }
    });

  const icon = (name, color = "currentColor") => <Icon name={name} color={color} />;

  const detailProps = (kind) => {
    const map = {
      mob: { accent: palette.yellowText, dict: t.detail.mob, actionTheme: "yellow", modalLabel: "Studio mobile", loopVideo: "/uploads/studiomobile-loop.mp4" },
      bilde: { accent: palette.red, dict: t.detail.bilde, actionTheme: "", modalLabel: "Roblox Studio", loopVideo: "/uploads/bilde-loop.mp4" },
      tut: { accent: palette.blue, dict: t.detail.tut, actionTheme: "", modalLabel: "Roblox Studio", loopVideo: "/uploads/plugin-loop.mp4" },
    };
    return map[kind];
  };

  const renderDetail = (kind, { inline, onBack }) => {
    const p = detailProps(kind);
    return (
      <DetailScreen
        accent={p.accent}
        kicker={p.dict.kicker}
        title={p.dict.title}
        subline={p.dict.subline}
        cards={p.dict.cards}
        action={p.dict.action}
        actionTheme={p.actionTheme}
        labels={t.detail}
        videoStub
        loopVideo={p.loopVideo}
        inline={inline}
        onAction={() => setModal({ label: p.modalLabel })}
        onBack={onBack}
      />
    );
  };

  const modalName = modal ? t.modal.names[modal.label] || modal.label : "";

  // Manifesto hero: horizontal on desktop, vertical (per language) on mobile.
  const heroVideo = isMobile
    ? (lang === "en" ? "/uploads/manifesto-eng.mp4" : "/uploads/manifesto-ptbr.mp4")
    : "/uploads/manifesto-horiz.mp4";

  const ecoExplored = ECO_KEYS.filter(
    (k) => ecoProgress.viewed[k] || ecoProgress.done[k] || ecoProgress.pending[k],
  ).length;
  const ecoDone = ECO_KEYS.filter((k) => ecoProgress.done[k]).length;
  const ecoPending = ECO_KEYS.filter((k) => ecoProgress.pending[k] && !ecoProgress.done[k]).length;
  const earnedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]).length;

  return (
    <div className="app-root">
      <LoadingOverlay loading={loading} hub={screen === "hub"} />
      {screen !== "hub" && <LangSwitch lang={lang} setLang={setLang} />}

      {screen === "entry" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <h1 className="entry-title">
              {t.entry.title.map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h1>
            <p className="entry-text">{t.entry.p1}</p>
            <p className="entry-text strong">{t.entry.p2}</p>
            <p className="entry-text faint">{t.entry.p3}</p>
            <button
              className="cta cta-red"
              onClick={() => {
                if (creatorSession) {
                  toHub("sobre");
                  return;
                }
                runLoading(() => {
                  resetCreatorQ();
                  setScreen("creator-id");
                });
              }}
            >
              <span>{t.entry.cta}</span>
              <span className="cta-badge">→</span>
            </button>
            <div className="footnote dark">{t.entry.footnote}</div>
          </div>
        </section>
      )}

      {screen === "anamnese" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <button className="back-link" onClick={() => setScreen("entry")}>{t.common.back}</button>
            <div className="choice-list">
              <ChoiceCard
                title={t.anamnese.creatorTitle}
                body={t.anamnese.creatorBody}
                icon={icon("stair", "#fff")}
                onClick={() => {
                  resetCreatorQ();
                  setScreen("creator-id");
                  window.scrollTo(0, 0);
                }}
              />
              <ChoiceCard
                title={t.anamnese.parentTitle}
                body={t.anamnese.parentBody}
                icon={icon("shield", "#fff")}
                onClick={() => toHub("pais")}
              />
            </div>
          </div>
        </section>
      )}

      {screen === "creator-id" && idStep === "username" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <button className="back-link" onClick={() => runLoading(() => setScreen("entry"))}>{t.common.back}</button>

            <h1 className="id-heading">{t.id.heading}</h1>
            <p className="entry-text">{t.id.intro}</p>

            <div className="id-form">
              <div className="id-field">
                <label className="id-label" htmlFor="id-roblox">{t.id.robloxLabel}</label>
                <div className="id-input-wrap">
                  <span className="id-input-prefix">@</span>
                  <input
                    id="id-roblox"
                    className="id-input has-prefix"
                    type="text"
                    autoComplete="off"
                    placeholder={t.id.robloxPlaceholder}
                    value={robloxHandle}
                    onChange={(e) => { setRobloxHandle(e.target.value.replace(/^@+/, "")); setRobloxError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && robloxHandle.trim()) validateRobloxHandle(robloxHandle.trim()); }}
                  />
                </div>
                {robloxError && <div className="id-error">{robloxError}</div>}
                <div className="id-hint">
                  {t.id.noAccount}{" "}
                  <a className="id-hint-link" href="https://www.roblox.com/" target="_blank" rel="noopener noreferrer">
                    {t.id.createFree}
                  </a>
                </div>
              </div>
            </div>

            <button
              className="cta cta-red id-continue"
              disabled={!robloxHandle.trim() || robloxValidating}
              onClick={() => validateRobloxHandle(robloxHandle.trim())}
            >
              <span>{robloxValidating ? "Verificando..." : t.id.continue}</span>
              <span className="cta-badge">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "creator-id" && idStep === "confirm" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <button className="back-link" onClick={() => { setIdStep("username"); setRobloxError(""); }}>{t.common.back}</button>

            <div className="id-confirm-card">
              <p className="id-confirm-eyebrow">Encontramos este usuário no Roblox:</p>
              <div className="id-confirm-display">{resolvedDisplayName}</div>
              <div className="id-confirm-handle">@{resolvedHandle}</div>
              <p className="id-confirm-question">É você?</p>
              <div className="id-confirm-actions">
                <button
                  className="id-confirm-no"
                  onClick={() => { setIdStep("username"); setRobloxError("Digite seu @username (não o display name)."); }}
                >
                  Não, corrigir
                </button>
                <button
                  className="id-confirm-yes cta cta-red"
                  disabled={registerLoading}
                  onClick={async () => {
                    setRobloxHandle(resolvedHandle);
                    setRegisterLoading(true);
                    try {
                      const res = await fetch(`${API_URL}/api/leads/check-identifier/?roblox_username=${encodeURIComponent(resolvedHandle)}`);
                      const data = await res.json();
                      if (data.exists) {
                        setCreatorSession({ handle: resolvedHandle, pais: "", estado: "" });
                        runLoading(() => setScreen("hub"));
                      } else {
                        setIdStep("details");
                      }
                    } catch {
                      setRobloxError("Erro ao verificar. Tente novamente.");
                      setIdStep("username");
                    } finally {
                      setRegisterLoading(false);
                    }
                  }}
                >
                  {registerLoading ? "Verificando..." : "Sim, sou eu"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === "creator-id" && idStep === "details" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <button className="back-link" onClick={() => setIdStep("confirm")}>{t.common.back}</button>

            <h1 className="id-heading">{t.id.heading}</h1>
            <p className="entry-text">{t.id.intro}</p>

            <div className="id-roblox-preview">
              <div className="id-roblox-preview-avatar">
                {resolvedThumbnail
                  ? <img src={resolvedThumbnail} alt={resolvedDisplayName} />
                  : (resolvedDisplayName || resolvedHandle).charAt(0).toUpperCase()
                }
              </div>
              <div className="id-roblox-preview-info">
                <span className="id-roblox-preview-display">{resolvedDisplayName}</span>
                <span className="id-roblox-preview-handle">@{resolvedHandle}</span>
              </div>
            </div>

            <div className="id-form">
              <div className="id-field">
                <label className="id-label" htmlFor="id-email">E-mail</label>
                <input
                  id="id-email"
                  className="id-input"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="id-field">
                <label className="id-label" htmlFor="id-birthday">Data de nascimento</label>
                <input
                  id="id-birthday"
                  className="id-input"
                  type="date"
                  value={regBirthday}
                  onChange={(e) => setRegBirthday(e.target.value)}
                />
              </div>

              <div className="id-field">
                <label className="id-label" htmlFor="id-pais">{t.id.countryLabel}</label>
                <select
                  id="id-pais"
                  className={`id-select ${pais ? "" : "placeholder"}`}
                  value={pais}
                  onChange={(e) => { setPais(e.target.value); setEstado(""); }}
                >
                  <option value="" disabled>{t.id.countryPlaceholder}</option>
                  {t.id.countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              {statesByCountry[pais] && (
                <div className="id-field">
                  <label className="id-label" htmlFor="id-estado">{t.id.stateLabel}</label>
                  <select
                    id="id-estado"
                    className={`id-select ${estado ? "" : "placeholder"}`}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="" disabled>{t.id.statePlaceholder}</option>
                    {statesByCountry[pais].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {robloxError && <div className="id-error">{robloxError}</div>}

            <button
              className="cta cta-red id-continue"
              disabled={!regEmail || !regBirthday || !pais || (statesByCountry[pais] && !estado) || registerLoading}
              onClick={() => registerWithRoblox({ email: regEmail, birthday: regBirthday, country: pais, state: estado })}
            >
              <span>{registerLoading ? "Salvando..." : t.id.continue}</span>
              <span className="cta-badge">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "creator-q" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" alt={t.common.logoAlt} />
            <button className="back-link" onClick={() => setScreen("creator-id")}>{t.common.back}</button>

            <QuestionCard number="01" title={t.creatorQ.q1Title}>
              <div className="pill-row">
                <QuestionPill active={qDev === "pc"} onClick={runPcTest}>{t.creatorQ.optComputer}</QuestionPill>
                <QuestionPill active={qDev === "mob"} onClick={chooseMobile}>{t.creatorQ.optMobile}</QuestionPill>
              </div>
            </QuestionCard>

            {!qDev && <div className="empty-result">{t.creatorQ.empty}</div>}

            {qDev === "mob" && (
              <ResultCard
                theme="yellow"
                kicker={t.creatorQ.results.mobile.kicker}
                title={t.creatorQ.results.mobile.title}
                body={t.creatorQ.results.mobile.body}
                button={t.creatorQ.results.mobile.button}
                onClick={() => toHub("jornada", "mob", "detail")}
              />
            )}

            {qDev === "pc" && pcTest === "running" && (
              <TestingCard title={t.creatorQ.testing.title} note={t.creatorQ.testing.note} />
            )}

            {qDev === "pc" && pcTest === "capable" && (
              <ResultCard
                theme="red"
                kicker={t.creatorQ.results.plugin.kicker}
                title={t.creatorQ.results.plugin.title}
                body={t.creatorQ.results.plugin.body}
                button={t.creatorQ.results.plugin.button}
                onClick={() => setModal({ label: "Roblox Studio" })}
                secondaryText={t.creatorQ.results.plugin.webHint}
                onSecondary={() => setModal({ label: "Studio web" })}
              />
            )}

            {qDev === "pc" && pcTest === "weak" && (
              <ResultCard
                theme="blue"
                kicker={t.creatorQ.results.web.kicker}
                title={t.creatorQ.results.web.title}
                body={t.creatorQ.results.web.body}
                button={t.creatorQ.results.web.button}
                onClick={() => setModal({ label: "Studio web" })}
              />
            )}

            <div className="subtle-link-wrap">
              <button className="subtle-link" onClick={() => toHub("jornada")}>
                {t.creatorQ.directLink}
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "hub" && (
        <div className={`hub-shell ${isMobile ? "mobile" : ""}`}>
          {!isMobile && (
            <aside className="sidebar">
              <div className="sidebar-logo">
                <Logo usage="sidebar" alt={t.common.logoAlt} />
                <LangSwitch lang={lang} setLang={setLang} className="sidebar-lang-switch" />
              </div>
              <div className="sidebar-nav">
                {activeNav.map((item) => (
                  <button
                    key={item.key}
                    className={`side-link ${tab === item.key ? "active" : ""}`}
                    onClick={() => runLoading(() => { setTab(item.key); setSub("main"); setJourneyView("inline"); setJourneyDevice(null); })}
                  >
                    <span className="side-icon">{icon(navIcon(item.key), "rgba(255,255,255,.75)")}</span>
                    <span className="side-copy">
                      <span>{item.label}</span>
                      <small>{item.subtitle}</small>
                    </span>
                    {tab === item.key && <span className="nav-dot" />}
                  </button>
                ))}
              </div>

              <div className="sidebar-footer">
                <button
                  className="sidebar-exit"
                  onClick={creatorSession ? logout : () => runLoading(() => setScreen("entry"))}
                >
                  {creatorSession ? t.account.logout : t.common.exit}
                </button>
              </div>
            </aside>
          )}

          <main className="main-panel">
            {welcomeBack && creatorSession && (
              <div className="welcome-back" role="status" onClick={() => setWelcomeBack(false)}>
                <span>{t.account.welcomeBack} <strong>@{creatorSession.handle}</strong></span>
                <button className="welcome-back-close" aria-label="Fechar" onClick={(e) => { e.stopPropagation(); setWelcomeBack(false); }}>✕</button>
              </div>
            )}
            {isMobile && (
              <>
                <header className="mobile-topbar">
                  <div className="mobile-head">
                    <Logo usage="topbar" alt={t.common.logoAlt} />
                    {creatorSession
                      ? <button className="mobile-logout" onClick={logout}>{t.account.logout}</button>
                      : <span className="mobile-tag">{t.common.creatorTag}</span>}
                  </div>
                  <div className="mobile-tabs">
                    {activeNav.map((item) => (
                      <button
                        key={item.key}
                        className={`mobile-tab ${tab === item.key ? "active" : ""}`}
                        onClick={() => runLoading(() => { setTab(item.key); setSub("main"); setJourneyView("inline"); setJourneyDevice(null); })}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </header>
              </>
            )}

            <div className="main-layout">
              <div className="content-shell">
                {tab === "jornada" && journeyView === "detail" && sub !== "main" && (
                <section>
                  {sub === "mob" && renderDetail("mob", { inline: false, onBack: () => { setJourneyView("inline"); setSub("main"); } })}
                  {sub === "bilde" && renderDetail("bilde", { inline: false, onBack: () => { setJourneyView("inline"); setSub("main"); } })}
                  {sub === "tut" && renderDetail("tut", { inline: false, onBack: () => { setJourneyView("inline"); setSub("main"); } })}
                </section>
              )}

              {tab === "jornada" && journeyView === "inline" && (
                <section>
                  <h2 className="page-title">{t.journey.pageTitle}</h2>
                  <p className="page-subtitle">{t.journey.pageSubtitle}</p>

                  <div className="device-switch" role="tablist" aria-label={t.journey.deviceAria}>
                    <button
                      className={`device-switch-option ${journeyDevice === "mobile" ? "active yellow" : ""}`}
                      onClick={() => {
                        setJourneyDevice("mobile");
                        if (sub === "bilde" || sub === "tut") setSub("main");
                      }}
                    >
                      <span className="device-switch-icon">{icon("mobile", journeyDevice === "mobile" ? palette.yellowText : "#8A8A8A")}</span>
                      <span className="device-switch-copy">
                        <strong>{t.journey.deviceMobileStrong}</strong>
                        <small>{t.journey.deviceMobileSmall}</small>
                      </span>
                    </button>
                    <button
                      className={`device-switch-option ${journeyDevice === "computer" ? "active dark" : ""}`}
                      onClick={() => {
                        setJourneyDevice("computer");
                        if (sub === "mob") setSub("main");
                      }}
                    >
                      <span className="device-switch-icon">{icon("laptop", journeyDevice === "computer" ? palette.text : "#8A8A8A")}</span>
                      <span className="device-switch-copy">
                        <strong>{t.journey.deviceComputerStrong}</strong>
                        <small>{t.journey.deviceComputerSmall}</small>
                      </span>
                    </button>
                  </div>

                  {!journeyDevice && (
                    <div className="journey-choice-empty">
                      {t.journey.chooseEmpty}
                    </div>
                  )}

                  {journeyDevice === "mobile" && (
                    <>
                      <div className="section-label yellow">{t.journey.labelMobile}</div>
                      <JourneyCard
                        accent="yellow"
                        kicker={t.journey.cardMobile.kicker}
                        title={t.journey.cardMobile.title}
                        body={t.journey.cardMobile.body}
                        note={t.journey.cardMobile.note}
                        onClick={() => setSub(sub === "mob" ? "main" : "mob")}
                      />
                      {sub === "mob" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          {renderDetail("mob", { inline: true, onBack: () => setSub("main") })}
                        </InlineJourneyDetail>
                      )}
                    </>
                  )}

                  {journeyDevice === "computer" && (
                    <>
                      <div className="section-label gray">{t.journey.labelComputer}</div>
                      <JourneyCard
                        accent="red"
                        kicker={t.journey.cardBilde.kicker}
                        title={t.journey.cardBilde.title}
                        body={t.journey.cardBilde.body}
                        note={t.journey.cardBilde.note}
                        onClick={() => setSub(sub === "bilde" ? "main" : "bilde")}
                      />
                      {sub === "bilde" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          {renderDetail("bilde", { inline: true, onBack: () => setSub("main") })}
                        </InlineJourneyDetail>
                      )}

                      <div className="or-separator"><span>{t.journey.or}</span></div>

                      <JourneyCard
                        accent="blue"
                        kicker={t.journey.cardTut.kicker}
                        title={t.journey.cardTut.title}
                        body={t.journey.cardTut.body}
                        note={t.journey.cardTut.note}
                        onClick={() => setSub(sub === "tut" ? "main" : "tut")}
                      />
                      {sub === "tut" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          {renderDetail("tut", { inline: true, onBack: () => setSub("main") })}
                        </InlineJourneyDetail>
                      )}
                    </>
                  )}

                  {journeyDevice && <PublishJourneyCard dict={t.publish} onClick={() => setModal({ label: "Roblox" })} />}

                  {journeyDevice && <CommunityJourneyCard dict={t.community} onClick={() => setModal({ label: "Comunidade no Discord" })} />}
                </section>
              )}

              {tab === "eco" && (
                <section>
                  <h2 className="page-title">{t.eco.pageTitle}</h2>
                  <p className="page-subtitle">{t.eco.pageSubtitle}</p>

                  <EcoProgress explored={ecoExplored} done={ecoDone} pending={ecoPending} total={ECO_KEYS.length} t={t} />

                  <AccordionCard
                    accent="yellow"
                    deviceIcon="mobile"
                    title={t.eco.studiomob.title}
                    subtitle={t.eco.studiomob.subtitle}
                    body={t.eco.studiomob.body}
                    open={ecoOpen === "studiomob"}
                    onToggle={() => toggleEco("studiomob")}
                  >
                    <InfoRows accent="yellow" rows={t.eco.studiomob.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.studiomob.ctaCopy}</div>
                      <button className="small-action yellow" onClick={(e) => { e.stopPropagation(); runEcoAction("studiomob"); setModal({ label: "Studio mobile" }); }}>
                        {t.eco.studiomob.cta}
                      </button>
                      <EcoStatus item="studiomob" progress={ecoProgress} t={t} />
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="dark"
                    deviceIcon="laptop"
                    title={t.eco.rstudio.title}
                    subtitle={t.eco.rstudio.subtitle}
                    body={t.eco.rstudio.body}
                    open={ecoOpen === "rstudio"}
                    onToggle={() => toggleEco("rstudio")}
                  >
                    <InfoRows accent="dark" rows={t.eco.rstudio.rows} />
                    <div className="nested-cards">
                      <SubToolCard
                        accent="red"
                        meta={t.eco.subtoolMeta}
                        title={t.eco.rstudio.bilde.title}
                        open={ecoSubOpen === "bilde"}
                        onToggle={(e) => { e.stopPropagation(); setEcoSubOpen(ecoSubOpen === "bilde" ? null : "bilde"); }}
                        body={t.eco.rstudio.bilde.body}
                        rows={t.eco.rstudio.bilde.rows}
                        cta={t.eco.rstudio.bilde.cta}
                        onAction={(e) => {
                          e.stopPropagation();
                          runEcoAction("rstudio");
                          runLoading(() => {
                            setTab("jornada");
                            setJourneyDevice("computer");
                            setJourneyView("detail");
                            setSub("bilde");
                          });
                        }}
                      />
                      <SubToolCard
                        accent="blue"
                        meta={t.eco.subtoolMeta}
                        title={t.eco.rstudio.tut.title}
                        open={ecoSubOpen === "tutoriais"}
                        onToggle={(e) => { e.stopPropagation(); setEcoSubOpen(ecoSubOpen === "tutoriais" ? null : "tutoriais"); }}
                        body={t.eco.rstudio.tut.body}
                        rows={t.eco.rstudio.tut.rows}
                        cta={t.eco.rstudio.tut.cta}
                        onAction={(e) => {
                          e.stopPropagation();
                          runEcoAction("rstudio");
                          runLoading(() => {
                            setTab("jornada");
                            setJourneyDevice("computer");
                            setJourneyView("detail");
                            setSub("tut");
                          });
                        }}
                      />
                    </div>
                    <EcoStatus item="rstudio" progress={ecoProgress} t={t} />
                  </AccordionCard>

                  <AccordionCard
                    accent="red"
                    title={t.eco.roblox.title}
                    subtitle={t.eco.roblox.subtitle}
                    body={t.eco.roblox.body}
                    open={ecoOpen === "roblox"}
                    onToggle={() => toggleEco("roblox")}
                  >
                    <InfoRows accent="red" rows={t.eco.roblox.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.roblox.ctaCopy}</div>
                      <button className="small-action red" onClick={(e) => { e.stopPropagation(); markEco("roblox", "done"); setModal({ label: "Roblox" }); }}>
                        {t.eco.roblox.cta}
                      </button>
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="purple"
                    title={t.eco.comunidade.title}
                    subtitle={t.eco.comunidade.subtitle}
                    body={t.eco.comunidade.body}
                    open={ecoOpen === "comunidade"}
                    onToggle={() => toggleEco("comunidade")}
                  >
                    <InfoRows accent="purple" rows={t.eco.comunidade.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.comunidade.ctaCopy}</div>
                      <button className="small-action purple" onClick={(e) => { e.stopPropagation(); runEcoAction("comunidade"); setModal({ label: "Comunidade no Discord" }); }}>
                        {t.eco.comunidade.cta}
                      </button>
                      <EcoStatus item="comunidade" progress={ecoProgress} t={t} />
                    </div>
                  </AccordionCard>
                </section>
              )}

              {tab === "sobre" && (
                <section>
                  <h2 className="page-title">{t.sobre.pageTitle}</h2>
                  <div className="sobre-media-card">
                    <video
                      key={heroVideo}
                      className="sobre-media-video"
                      src={heroVideo}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  </div>
                  <div className="sobre-list">
                    {t.sobre.sections.map((section, index) => (
                      <div key={index} className="sobre-item">
                        <div className="sobre-icon">{icon(sobreMeta[index].icon, sobreMeta[index].color)}</div>
                        <div className="sobre-copy">
                          <div className="sobre-kicker" style={{ color: sobreMeta[index].color }}>{section.kicker}</div>
                          {section.paragraphs.map((p, i) => (
                            <p key={`${index}-${i}`} className={`sobre-paragraph ${i === 0 ? "lead" : ""}`}>{p}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

                {tab === "pais" && (() => {
                const aud = t.responsaveis.audiences[audience];
                const media = responsaveisMedia[audience];
                return (
                  <section>
                    <h2 className="page-title">{t.responsaveis.pageTitle}</h2>
                    <p className="page-subtitle wider">{t.responsaveis.pageSubtitle}</p>

                    <div className="device-switch" role="tablist" aria-label={t.responsaveis.audienceAria}>
                      <button
                        className={`device-switch-option red ${audience === "responsaveis" ? "active" : ""}`}
                        onClick={() => setAudience("responsaveis")}
                      >
                        <span className="device-switch-icon">{icon("shield", audience === "responsaveis" ? palette.red : "#8A8A8A")}</span>
                        <span className="device-switch-copy">
                          <strong>{t.responsaveis.toggleResp.strong}</strong>
                          <small>{t.responsaveis.toggleResp.small}</small>
                        </span>
                      </button>
                      <button
                        className={`device-switch-option blue ${audience === "educadores" ? "active" : ""}`}
                        onClick={() => setAudience("educadores")}
                      >
                        <span className="device-switch-icon">{icon("stair", audience === "educadores" ? palette.blue : "#8A8A8A")}</span>
                        <span className="device-switch-copy">
                          <strong>{t.responsaveis.toggleEdu.strong}</strong>
                          <small>{t.responsaveis.toggleEdu.small}</small>
                        </span>
                      </button>
                    </div>

                    <p className="resp-intro">{aud.intro}</p>

                    <div className="resp-steps">
                      {aud.steps.map((step, i) => (
                        <div key={i} className="resp-step">
                          <div className="resp-step-num">{String(i + 1).padStart(2, "0")}</div>
                          <div className="resp-step-title">{step.title}</div>
                          <div className="resp-step-body">{step.body}</div>
                        </div>
                      ))}
                    </div>

                    <h3 className="resp-section-title">{t.responsaveis.videosLabel}</h3>
                    <div className="resp-video-grid">
                      {aud.videos.map((video, i) => (
                        <button
                          key={`${audience}-v-${i}`}
                          className="resp-video-card"
                          onClick={() => setVideoModal({ id: media.videos[i], title: video.title })}
                        >
                          <div className="resp-video-thumb">
                            <img src={`https://img.youtube.com/vi/${media.videos[i]}/hqdefault.jpg`} alt={video.title} loading="lazy" />
                            <span className="resp-video-play">▶</span>
                          </div>
                          <div className="resp-video-info">
                            <strong>{video.title}</strong>
                            <small>{video.desc}</small>
                          </div>
                        </button>
                      ))}
                    </div>

                    <h3 className="resp-section-title">{t.responsaveis.docsLabel}</h3>
                    <div className="resp-doc-list">
                      {aud.docs.map((doc, i) => (
                        <button
                          key={`${audience}-d-${i}`}
                          className="resp-doc-card"
                          onClick={() => window.open(media.docs[i], "_blank", "noopener,noreferrer")}
                        >
                          <span className="resp-doc-icon">
                            {icon(responsaveisDocIcons[i % responsaveisDocIcons.length], palette.red)}
                          </span>
                          <span className="resp-doc-copy">
                            <strong>{doc.title}</strong>
                            <small>{t.responsaveis.docTag}</small>
                          </span>
                          <span className="resp-doc-arrow">↗</span>
                        </button>
                      ))}
                    </div>

                    <div className="resp-community-card">
                      <div className="resp-community-top">
                        <div className="card-kicker light">{t.responsaveis.community.kicker}</div>
                        <div className="community-title">{t.responsaveis.community.title}</div>
                        <p>{t.responsaveis.community.body}</p>
                      </div>
                      <div className="resp-community-bottom">
                        <div className="resp-community-note">A comunidade acompanha antes, durante e depois da jornada.</div>
                        <button className="small-action purple" onClick={() => setModal({ label: "Comunidade no Discord" })}>
                        {t.responsaveis.community.button}
                        </button>
                      </div>
                    </div>
                  </section>
                );
                })()}
              </div>

              {!isMobile && creatorSession && (
                <aside className="right-rail">
                  <div className="rail-achievements">
                    <div className="sa-head">
                      <span className="sa-title">{t.achievements.title}</span>
                      <span className="sa-count">{earnedCount}/{ACHIEVEMENTS.length}</span>
                    </div>
                    {t.achievements.intro && (
                      <p className="sa-intro">{t.achievements.intro}</p>
                    )}
                    <div className="sa-clusters">
                      {ACHIEVEMENT_CLUSTERS.map((cluster) => {
                        if (cluster.hidden) return null;
                        const clusterText = t.achievements.clusters?.[cluster.id];
                        if (!clusterText) return null;
                        return (
                          <section
                            key={cluster.id}
                            className="sa-cluster"
                            style={{
                              borderColor: cluster.style.borderColor,
                            }}
                          >
                            <div className="sa-cluster-head">
                              <h3 className="sa-cluster-name" style={{ color: cluster.style.titleColor }}>
                                {clusterText.name}
                              </h3>
                              <span className="sa-cluster-tag" style={{ color: cluster.style.textColor }}>
                                {clusterText.tag}
                              </span>
                            </div>
                            <p className="sa-cluster-desc" style={{ color: cluster.style.textColor }}>
                              {clusterText.desc}
                            </p>
                            <div className="sa-grid">
                              {cluster.badgeIds.map((badgeId) => {
                                const a = ACHIEVEMENTS.find((item) => item.id === badgeId);
                                if (!a) return null;
                                const earned = !!achievements[a.id];
                                const label = t.achievements.items[a.id];
                                const desc = t.achievements.descriptions?.[a.id];
                                return (
                                  <div
                                    key={a.id}
                                    className={`sa-item-row ${earned ? "earned" : "locked"}`}
                                    title={`${label} — ${earned ? t.achievements.earnedHint : t.achievements.lockedHint}`}
                                  >
                                    <div className={`sa-item ${a.frame} ${earned ? "earned" : "locked"}`}>
                                      {a.kind === "symbol" ? (
                                        <svg className="sa-badge-svg" viewBox="0 0 120 120" aria-hidden="true">
                                          <use href={`${earned ? badgesCorUrl : badgesLinhaUrl}#${a.symbol}`} />
                                        </svg>
                                      ) : a.kind === "badge" ? (
                                        <img src={a.img} alt={label} onError={(e) => { e.currentTarget.src = MEDAL_FALLBACK; }} />
                                      ) : (
                                        <span className="sa-emoji">{a.emoji}</span>
                                      )}
                                    </div>
                                    <div className="sa-copy">
                                      <strong>
                                        {label}
                                        {!earned && (
                                          <span className="sa-lock" aria-hidden="true">
                                            <Icon name="lock" color="#6D6D74" />
                                          </span>
                                        )}
                                      </strong>
                                      <small>{desc || (earned ? t.achievements.earnedHint : t.achievements.lockedHint)}</small>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              )}
            </div>

            {isMobile && (
              <nav className="bottom-nav">
                {activeNav.map((item) => (
                  <button
                    key={item.key}
                    className={`bottom-item ${tab === item.key ? "active" : ""}`}
                    onClick={() => runLoading(() => { setTab(item.key); setSub("main"); setJourneyView("inline"); setJourneyDevice(null); })}
                  >
                    <span>{bottomSymbol(item.key)}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            )}
          </main>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="modal-kicker">{t.modal.kicker}</div>
            <h3 className="modal-title">{t.modal.openPrefix} {modalName}{t.modal.openSuffix}</h3>
            <p className="modal-copy">
              {externalLinks[modal.label] ? t.modal.copyNew : t.modal.copy}
            </p>
            <div className="modal-actions">
              <button
                className="modal-primary"
                onClick={() => {
                  const url = externalLinks[modal.label];
                  if (url) window.open(url, "_blank", "noopener,noreferrer");
                  setModal(null);
                }}
              >
                {t.modal.continue}
              </button>
              <button className="modal-secondary" onClick={() => setModal(null)}>{t.modal.stay}</button>
            </div>
          </div>
        </div>
      )}

      {videoModal && (
        <div className="modal-backdrop video-backdrop" onClick={() => setVideoModal(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setVideoModal(null)} aria-label="Fechar">✕</button>
            <div className="video-modal-frame">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.id}?autoplay=1&rel=0`}
                title={videoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="video-modal-title">{videoModal.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function LangSwitch({ lang, setLang, className = "" }) {
  return (
    <div className={`lang-switch ${className}`.trim()}>
      {langOrder.map((code) => (
        <button
          key={code}
          className={`lang-option ${lang === code ? "active" : ""}`}
          onClick={() => setLang(code)}
        >
          {langLabels[code]}
        </button>
      ))}
    </div>
  );
}

function LoadingOverlay({ loading, hub }) {
  return (
    <div className={`loading-overlay ${loading ? "show" : ""} ${hub ? "light" : ""}`}>
      <div className="loading-stack">
        <Logo usage="loading" />
        <div className="loading-icons">
          <div className="load-icon">{<Icon name="target" color={palette.red} />}</div>
          <div className="load-icon">{<Icon name="stair" color={palette.blue} />}</div>
          <div className="load-icon">{<Icon name="shield" color={palette.yellowText} />}</div>
          <div className="load-icon">{<Icon name="infinity" color={palette.purple} />}</div>
        </div>
      </div>
    </div>
  );
}

function Logo({ usage = "entry", alt = "Expedição Roblox" }) {
  return (
    <img
      className={`logo-image ${usage}`}
      src="/uploads/expedicao-roblox-logo.png"
      alt={alt}
    />
  );
}

function ChoiceCard({ title, body, icon, onClick }) {
  return (
    <button className="choice-card" onClick={onClick}>
      <span className="choice-icon">{icon}</span>
      <span className="choice-copy">
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
      <span className="choice-arrow">›</span>
    </button>
  );
}

function QuestionCard({ number, title, children, muted = false }) {
  return (
    <div className={`question-card ${muted ? "muted" : ""}`}>
      <div className="q-number">{number} ·</div>
      <div className="q-title">{title}</div>
      {children}
    </div>
  );
}

function QuestionPill({ active, disabled, onClick, children }) {
  return (
    <button className={`question-pill ${active ? "active" : ""} ${disabled ? "disabled" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ResultCard({ theme, kicker, title, body, button, onClick, secondaryText, onSecondary }) {
  return (
    <div className={`result-card ${theme}`}>
      <div className="result-kicker">{kicker}</div>
      <div className="result-title">{title}</div>
      <div className="result-body">{body}</div>
      <button className="result-button" onClick={onClick}>{button}</button>
      {secondaryText && (
        <button className="result-secondary" onClick={onSecondary}>{secondaryText} ›</button>
      )}
    </div>
  );
}

function EcoProgress({ explored, done, pending, total, t }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const exploredPct = total ? Math.round((explored / total) * 100) : 0;
  return (
    <div className="eco-progress">
      <div className="eco-progress-track">
        <div className="eco-progress-explored" style={{ width: `${exploredPct}%` }} />
        <div className="eco-progress-done" style={{ width: `${pct}%` }} />
      </div>
      <div className="eco-progress-label">
        {explored} {t.eco.progressOf} {total} {t.eco.progressExplored}
        <span className="eco-progress-sep"> · </span>
        {done} {t.eco.progressDone}
        {pending > 0 && (
          <>
            <span className="eco-progress-sep"> · </span>
            <span className="eco-progress-analyzing">{pending} {t.eco.progressAnalyzing}</span>
          </>
        )}
      </div>
    </div>
  );
}

function EcoStatus({ item, progress, t }) {
  if (progress.done[item]) {
    return <div className="eco-status done">✓ {t.eco.statusDone}</div>;
  }
  if (progress.pending[item]) {
    return (
      <div className="eco-status pending">
        <span className="eco-status-dot" />
        {t.eco.statusPending}
      </div>
    );
  }
  return null;
}

function TestingCard({ title, note }) {
  return (
    <div className="testing-card">
      <div className="testing-spinner" />
      <div className="testing-copy">
        <div className="testing-title">{title}</div>
        <div className="testing-note">{note}</div>
      </div>
    </div>
  );
}

function DetailScreen({ accent, kicker, title, subline, cards, action, onAction, onBack, actionTheme, videoStub, loopVideo, labels, inline = false }) {
  return (
    <section className={inline ? "detail-screen-inline" : ""}>
      <button className="detail-back" onClick={onBack}>{inline ? labels.close : labels.back}</button>
      <div className="detail-head">
        <div>
          <div className="detail-kicker" style={{ color: accent }}>{kicker}</div>
          <h2 className="detail-title">{title}</h2>
        </div>
      </div>
      <div className="detail-subline" style={{ color: accent }}>{subline}</div>
      {loopVideo ? (
        <div className="detail-loop">
          <video src={loopVideo} autoPlay muted loop playsInline preload="metadata" />
        </div>
      ) : (
        videoStub && <div className="video-stub"><span>▶</span><small>{labels.howItWorks}</small></div>
      )}
      <div className="detail-grid" style={{ color: accent }}>
        <DetailFact title={labels.factWhat} body={cards[0]} />
        <DetailFact title={labels.factHow} body={cards[1]} />
        <DetailFact title={labels.factWhere} body={cards[2]} />
      </div>
      <button className={`detail-action ${actionTheme || ""}`} onClick={onAction}>{action}</button>
    </section>
  );
}

function InlineJourneyDetail({ children, containerRef }) {
  const contentRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    setMeasuredHeight(contentRef.current.scrollHeight);
  }, [children]);

  return (
    <div
      className="inline-journey-detail"
      ref={containerRef}
      style={{ "--detail-max-height": `${measuredHeight}px` }}
    >
      <div ref={contentRef} className="inline-journey-detail-inner">
        {children}
      </div>
    </div>
  );
}

function DetailFact({ title, body }) {
  return (
    <div className="detail-fact">
      <div className="detail-fact-title">{title}</div>
      <div className="detail-fact-body">{body}</div>
    </div>
  );
}

function JourneyCard({ accent, kicker, title, body, note, onClick }) {
  return (
    <button className={`journey-card ${accent}`} onClick={onClick}>
      <div className="journey-head">
        <div>
          <div className="journey-kicker">{kicker}</div>
          <div className="journey-title">{title}</div>
          <div className="journey-body">{body}</div>
        </div>
      </div>
      <div className="journey-foot">
        <p>{note}</p>
        <span>›</span>
      </div>
    </button>
  );
}

function PromoCard({ theme, kicker, title, body, note, button, onClick, compact = false }) {
  return (
    <div className={`promo-card ${theme} ${compact ? "compact" : ""}`}>
      <div className="promo-kicker">{kicker}</div>
      <div className="promo-title">{title}</div>
      <div className="promo-body">{body.split("\n").map((line) => <div key={line}>{line}</div>)}</div>
      {note && <p className="promo-note">{note}</p>}
      <button className={`promo-button ${theme}`} onClick={onClick}>{button}</button>
    </div>
  );
}

function CommunityJourneyCard({ dict, onClick }) {
  return (
    <div className="community-journey-card">
      <div className="community-orb" />
      <div className="promo-kicker">{dict.kicker}</div>
      <div className="promo-title">{dict.title}</div>
      <p className="community-journey-copy">{dict.copy}</p>
      <button className="community-journey-button" onClick={onClick}>
        {dict.button}
      </button>
    </div>
  );
}

function PublishJourneyCard({ dict, onClick }) {
  return (
    <div className="publish-journey-card">
      <div className="promo-kicker">{dict.kicker}</div>
      <div className="promo-title">{dict.title}</div>
      <div className="publish-journey-headline">
        <div>{dict.line1}</div>
        <div>{dict.line2}</div>
      </div>
      <p className="publish-journey-copy">{dict.copy}</p>
      <button className="publish-journey-button" onClick={onClick}>
        {dict.button}
      </button>
    </div>
  );
}

function AccordionCard({ accent, title, subtitle, body, open, onToggle, children, deviceIcon }) {
  return (
    <div className={`accordion-card ${accent} ${open ? "open" : ""}`}>
      <button className={`accordion-head ${accent}`} onClick={onToggle}>
        <div className="accordion-head-main">
          <div className="accordion-head-copy">
            <div className="accordion-subtitle">{subtitle}</div>
            <div className="accordion-title">{title}</div>
            <div className="accordion-body">{body}</div>
          </div>
          {deviceIcon && (
            <div className="accordion-device-icon">
              <Icon
                name={deviceIcon}
                color={accent === "yellow" ? "#1A1A1A" : "#FFFFFF"}
                large
              />
            </div>
          )}
        </div>
        <div className="accordion-chevron">{open ? "∧" : "∨"}</div>
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  );
}

function InfoRows({ rows, accent = "dark", compact = false }) {
  return (
    <div className={`info-rows ${compact ? "compact" : ""}`}>
      {rows.map(([glyph, title, body]) => (
        <div key={title} className="info-row">
          <div className={`info-row-icon ${accent}`}>{<RowGlyph glyph={glyph} accent={accent} />}</div>
          <div className="info-row-copy">
            <div className="info-row-title">{title}</div>
            <div className="info-row-body">{body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RowGlyph({ glyph, accent }) {
  const colorMap = {
    yellow: "#B8860B",
    dark: "#1A1A1A",
    red: "#E31837",
    purple: "#5865F2",
    blue: "#2468B8",
  };
  const color = colorMap[accent] || "#1A1A1A";

  if (glyph === "what") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.9"/><path d="M12 15V11.5C12 9.7 14.8 9.7 14.8 7.9C14.8 6.4 13.5 5.5 12.1 5.5C10.6 5.5 9.3 6.4 9.3 7.9" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><circle cx="12" cy="18" r="1.2" fill={color}/></svg>;
  }
  if (glyph === "do") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5.5 12.2L9.8 16.4L18.3 7.9" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3.8V5.8M20.2 12H18.2M5.8 12H3.8M17.8 6.2L16.4 7.6" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  if (glyph === "platform") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="5.5" width="15" height="9.5" rx="2.2" stroke={color} strokeWidth="1.9"/><path d="M2.5 18.5H21.5M9.2 15.8V18.5M14.8 15.8V18.5" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 4L18.5 7V12.8C18.5 16.1 15.7 18.3 12 20C8.3 18.3 5.5 16.1 5.5 12.8V7L12 4Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.2 12.4L11.2 14.4L14.9 10.7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SubToolCard({ accent, title, open, onToggle, body, rows, cta, onAction, meta }) {
  return (
    <div className={`subtool-card ${accent} ${open ? "open" : ""}`}>
      <div className={`subtool-top ${accent}`}>
        <button className="subtool-toggle" onClick={onToggle}>
          <div className="subtool-meta">{meta}</div>
          <div className="subtool-head">
            <div className="subtool-head-copy">
              <strong>{title}</strong>
              <small>{body}</small>
            </div>
            <span>{open ? "∧" : "∨"}</span>
          </div>
        </button>
      </div>
      {open && (
        <div className="subtool-bottom">
          <InfoRows rows={rows} accent={accent} compact />
          <button className={`subtool-cta ${accent}`} onClick={onAction}>
            {cta}
          </button>
        </div>
      )}
    </div>
  );
}

function NumberedHeader({ number, color, title, icon }) {
  return (
    <>
      <div className="section-number">
        <span style={{ color }}>{number}</span>
        <div style={{ background: color }} />
      </div>
      <div className="section-heading">
        <span className="section-heading-icon">{<Icon name={icon} color={color} />}</span>
        <h3>{title}</h3>
      </div>
    </>
  );
}

function ExpandCard({ title, subtitle, open, onToggle, children }) {
  return (
    <div className="expand-card">
      <button className="expand-head" onClick={onToggle}>
        <span>
          <small>{subtitle}</small>
          <strong>{title}</strong>
        </span>
        <span>{open ? "∧" : "∨"}</span>
      </button>
      {open && <div className="expand-body">{children}</div>}
    </div>
  );
}

function CompactJourney({ accent, title, subtitle, body }) {
  return (
    <div className={`compact-journey ${accent}`}>
      <div className="compact-head">
        <small>{subtitle}</small>
        <strong>{title}</strong>
      </div>
      <div className="compact-body">{body}</div>
    </div>
  );
}

function SafetyCard({ label, title, body }) {
  return (
    <div className="safety-card">
      <div className="card-kicker">{label}</div>
      <div className="safety-title">{title}</div>
      <p>{body}</p>
    </div>
  );
}

function Icon({ name, color = "currentColor", large = false }) {
  const size = large ? 52 : 34;

  if (name === "target") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="32" stroke={color} strokeWidth="1.8"/><circle cx="40" cy="40" r="20" stroke={color} strokeWidth="1.8"/><circle cx="40" cy="40" r="6" fill={color}/><line x1="8" y1="40" x2="20" y2="40" stroke={color} strokeWidth="1.8"/><line x1="60" y1="40" x2="72" y2="40" stroke={color} strokeWidth="1.8"/><line x1="40" y1="8" x2="40" y2="20" stroke={color} strokeWidth="1.8"/><line x1="40" y1="60" x2="40" y2="72" stroke={color} strokeWidth="1.8"/></svg>;
  }
  if (name === "stair") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><polyline points="14,66 14,46 30,46 30,32 46,32 46,18 66,18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="54,10 66,18 58,30" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "shield") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><path d="M40 10 L66 22 L66 44 C66 58 40 70 40 70 C40 70 14 58 14 44 L14 22 Z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/><path d="M28 42 L37 51 L54 32" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "infinity") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><path d="M40 40 C40 40 30 22 18 22 C8 22 8 58 18 58 C30 58 40 40 40 40 C40 40 50 22 62 22 C72 22 72 58 62 58 C50 58 40 40 40 40 Z" stroke={color} strokeWidth="2" fill="none"/></svg>;
  }
  if (name === "hex") {
    return <svg width="36" height="36" viewBox="0 0 44 44" fill="none"><polygon points="22,3 37,12 37,30 22,39 7,30 7,12" stroke={color} strokeWidth="1.5"/><circle cx="22" cy="21" r="5" stroke={color} strokeWidth="1.5"/></svg>;
  }
  if (name === "play") {
    return <svg width="36" height="36" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1.5"/><path d="M17 15 L32 22 L17 29 Z" fill={color}/></svg>;
  }
  if (name === "arrow") {
    return <svg width="36" height="36" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1.5"/><path d="M16 22 L28 22 M23 16 L28 22 L23 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "mobile") {
    return <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="13" y="5" width="22" height="38" rx="5" stroke={color} strokeWidth="2.2"/><rect x="17" y="11" width="14" height="22" rx="2.5" stroke={color} strokeWidth="1.8" opacity="0.45"/><circle cx="24" cy="37.2" r="1.8" fill={color}/><line x1="20" y1="8.3" x2="28" y2="8.3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (name === "laptop") {
    return <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="10" y="11" width="28" height="18" rx="3.5" stroke={color} strokeWidth="2.2"/><rect x="14" y="15" width="20" height="10" rx="1.8" stroke={color} strokeWidth="1.8" opacity="0.45"/><path d="M6 34.5H42" stroke={color} strokeWidth="2.2" strokeLinecap="round"/><path d="M18 31.5H30" stroke={color} strokeWidth="2.2" strokeLinecap="round"/></svg>;
  }
  if (name === "doc") {
    return <svg width="30" height="30" viewBox="0 0 44 44" fill="none"><path d="M14 7.5H25.5L31 13V33.5C31 35.4 29.4 37 27.5 37H14C12.1 37 10.5 35.4 10.5 33.5V11C10.5 9.1 12.1 7.5 14 7.5Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M25.5 7.5V13H31" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M16.5 19H25M16.5 24H25M16.5 29H22.5" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  if (name === "checklist") {
    return <svg width="30" height="30" viewBox="0 0 44 44" fill="none"><path d="M16 10.5H30M16 22H30M16 33.5H30" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><circle cx="11" cy="10.5" r="2.3" stroke={color} strokeWidth="1.9"/><path d="M8.8 22L10.6 23.8L13.5 20.9" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.8 33.5L10.6 35.3L13.5 32.4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "book-open") {
    return <svg width="30" height="30" viewBox="0 0 44 44" fill="none"><path d="M10.5 12.5C10.5 10.8 11.8 9.5 13.5 9.5H21.5V34C19.9 32.8 18 32.2 16 32.2H13.5C11.8 32.2 10.5 30.9 10.5 29.2V12.5Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M33.5 12.5C33.5 10.8 32.2 9.5 30.5 9.5H22.5V34C24.1 32.8 26 32.2 28 32.2H30.5C32.2 32.2 33.5 30.9 33.5 29.2V12.5Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M15 16H19M25 16H29" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  if (name === "lock") {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.8"/><path d="M8 11V8.5C8 6.01472 10.0147 4 12.5 4C14.9853 4 17 6.01472 17 8.5V11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.2" fill={color}/></svg>;
  }
  return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1.5"/></svg>;
}

function navIcon(key) {
  return { sobre: "target", jornada: "stair", eco: "hex", pais: "shield" }[key];
}

function bottomSymbol(key) {
  return { sobre: "△", jornada: "⬡", eco: "◉", pais: "◈" }[key];
}

export default App;
