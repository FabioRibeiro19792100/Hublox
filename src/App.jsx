import { useEffect, useMemo, useRef, useState } from "react";
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

const makePlaceholder = (label, mobile = false) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${mobile ? 320 : 520}" height="${mobile ? 480 : 340}" viewBox="0 0 ${mobile ? 320 : 520} ${mobile ? 480 : 340}">
    <rect width="100%" height="100%" fill="#F0F0F0" />
    <rect x="${mobile ? 110 : 200}" y="${mobile ? 180 : 130}" width="${mobile ? 100 : 120}" height="${mobile ? 70 : 80}" rx="8" fill="#DCDCDC" />
    <circle cx="${mobile ? 135 : 225}" cy="${mobile ? 200 : 155}" r="${mobile ? 9 : 10}" fill="#C8C8C8" />
    <path d="${mobile ? "M110 230 L138 208 L160 222 L185 198 L210 230 Z" : "M200 190 L230 165 L255 185 L285 155 L320 190 Z"}" fill="#C8C8C8" />
    <text x="50%" y="${mobile ? 290 : 240}" text-anchor="middle" font-family="sans-serif" font-size="${mobile ? 12 : 13}" fill="#ADADAD">${label}</text>
  </svg>
`)}`;

const externalLinks = {
  "Studio mobile": "https://exproblox.studio",
  "Roblox Studio": "https://create.roblox.com/store/asset/125743081126783/Expedio-Roblox",
};

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

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("hublox-lang") || "pt");
  const t = translations[lang] || translations.pt;

  const [screen, setScreen] = useState("entry");
  const [robloxHandle, setRobloxHandle] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [qDev, setQDev] = useState(null);
  const [qSty, setQSty] = useState(null);
  const [tab, setTab] = useState("sobre");
  const [sub, setSub] = useState("main");
  const [journeyDevice, setJourneyDevice] = useState(null);
  const [journeyView, setJourneyView] = useState("inline");
  const [ecoOpen, setEcoOpen] = useState(null);
  const [ecoSubOpen, setEcoSubOpen] = useState(null);
  const [modal, setModal] = useState(null);
  const [paisJornada, setPaisJornada] = useState(false);
  const [paisEco, setPaisEco] = useState(false);
  const [bildeSlide, setBildeSlide] = useState(0);
  const [tutSlide, setTutSlide] = useState(0);
  const [mobSlide, setMobSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 880);
  const activeJourneyDetailRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("hublox-lang", lang);
  }, [lang]);

  const bildeShots = useMemo(
    () => Array.from({ length: 5 }, (_, i) => makePlaceholder(`${t.shots.drag} ${i + 1}`)),
    [t],
  );
  const tutShots = useMemo(
    () => Array.from({ length: 5 }, (_, i) => makePlaceholder(`${t.shots.drag} ${i + 1}`)),
    [t],
  );
  const mobShots = useMemo(
    () => Array.from({ length: 5 }, (_, i) => makePlaceholder(`${t.shots.screenshot} ${i + 1}`, true)),
    [t],
  );

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

  const runLoading = (cb, duration = 900) => {
    setLoading(true);
    cb();
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => setLoading(false), duration);
  };

  const qResult = useMemo(() => {
    if (qDev === "mob") return "mobile";
    if (qDev === "pc" && qSty === "guia") return "bilde";
    if (qDev === "pc" && qSty === "mao") return "tut";
    return null;
  }, [qDev, qSty]);

  const activeNav = [
    { key: "sobre", ...t.nav.sobre },
    { key: "jornada", ...t.nav.jornada },
    { key: "eco", ...t.nav.eco },
    { key: "pais", ...t.nav.pais },
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
      mob: { accent: palette.yellowText, dict: t.detail.mob, slides: mobShots, slide: mobSlide, setSlide: setMobSlide, actionTheme: "yellow", modalLabel: "Studio mobile" },
      bilde: { accent: palette.red, dict: t.detail.bilde, slides: bildeShots, slide: bildeSlide, setSlide: setBildeSlide, actionTheme: "", modalLabel: "Roblox Studio" },
      tut: { accent: palette.blue, dict: t.detail.tut, slides: tutShots, slide: tutSlide, setSlide: setTutSlide, actionTheme: "", modalLabel: "Roblox Studio" },
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
        slides={p.slides}
        slide={p.slide}
        setSlide={p.setSlide}
        actionTheme={p.actionTheme}
        labels={t.detail}
        videoStub
        inline={inline}
        onAction={() => setModal({ label: p.modalLabel })}
        onBack={onBack}
      />
    );
  };

  const modalName = modal ? t.modal.names[modal.label] || modal.label : "";

  return (
    <div className="app-root">
      <LoadingOverlay loading={loading} hub={screen === "hub"} />
      <LangSwitch lang={lang} setLang={setLang} />

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
              onClick={() =>
                runLoading(() => {
                  setQDev(null);
                  setQSty(null);
                  setScreen("creator-id");
                })
              }
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
                  setQDev(null);
                  setQSty(null);
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

      {screen === "creator-id" && (
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
                    onChange={(e) => setRobloxHandle(e.target.value.replace(/^@+/, ""))}
                  />
                </div>
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

            <button
              className="cta cta-red id-continue"
              disabled={!robloxHandle.trim() || !pais || (statesByCountry[pais] && !estado)}
              onClick={() => runLoading(() => { setScreen("creator-q"); })}
            >
              <span>{t.id.continue}</span>
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
                <QuestionPill active={qDev === "pc"} onClick={() => { setQDev("pc"); setQSty(null); }}>{t.creatorQ.optComputer}</QuestionPill>
                <QuestionPill active={qDev === "mob"} onClick={() => setQDev("mob")}>{t.creatorQ.optMobile}</QuestionPill>
              </div>
            </QuestionCard>

            {qDev && (
              <QuestionCard number="02" title={t.creatorQ.q2Title} muted={qDev !== "pc"}>
                <div className="pill-row">
                  <QuestionPill active={qSty === "guia"} disabled={qDev !== "pc"} onClick={() => setQSty("guia")}>{t.creatorQ.optGuided}</QuestionPill>
                  <QuestionPill active={qSty === "mao"} disabled={qDev !== "pc"} onClick={() => setQSty("mao")}>{t.creatorQ.optHands}</QuestionPill>
                </div>
                {qDev !== "pc" && <div className="mini-note">{t.creatorQ.q2Note}</div>}
              </QuestionCard>
            )}

            {!qResult && <div className="empty-result">{t.creatorQ.empty}</div>}

            {qResult === "mobile" && (
              <ResultCard
                theme="yellow"
                kicker={t.creatorQ.results.mobile.kicker}
                title={t.creatorQ.results.mobile.title}
                body={t.creatorQ.results.mobile.body}
                button={t.creatorQ.results.mobile.button}
                onClick={() => toHub("jornada", "mob", "detail")}
              />
            )}
            {qResult === "bilde" && (
              <ResultCard
                theme="red"
                kicker={t.creatorQ.results.bilde.kicker}
                title={t.creatorQ.results.bilde.title}
                body={t.creatorQ.results.bilde.body}
                button={t.creatorQ.results.bilde.button}
                onClick={() => toHub("jornada", "bilde", "detail")}
              />
            )}
            {qResult === "tut" && (
              <ResultCard
                theme="blue"
                kicker={t.creatorQ.results.tut.kicker}
                title={t.creatorQ.results.tut.title}
                body={t.creatorQ.results.tut.body}
                button={t.creatorQ.results.tut.button}
                onClick={() => toHub("jornada", "tut", "detail")}
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
              <div className="sidebar-logo"><Logo usage="sidebar" alt={t.common.logoAlt} /></div>
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
              <button className="sidebar-exit" onClick={() => runLoading(() => setScreen("entry"))}>{t.common.exit}</button>
            </aside>
          )}

          <main className="main-panel">
            {isMobile && (
              <>
                <header className="mobile-topbar">
                  <div className="mobile-head">
                    <Logo usage="topbar" alt={t.common.logoAlt} />
                    <span className="mobile-tag">{t.common.creatorTag}</span>
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

                  <AccordionCard
                    accent="yellow"
                    deviceIcon="mobile"
                    title={t.eco.studiomob.title}
                    subtitle={t.eco.studiomob.subtitle}
                    body={t.eco.studiomob.body}
                    open={ecoOpen === "studiomob"}
                    onToggle={() => setEcoOpen(ecoOpen === "studiomob" ? null : "studiomob")}
                  >
                    <InfoRows accent="yellow" rows={t.eco.studiomob.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.studiomob.ctaCopy}</div>
                      <button className="small-action yellow" onClick={(e) => { e.stopPropagation(); setModal({ label: "Studio mobile" }); }}>
                        {t.eco.studiomob.cta}
                      </button>
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="dark"
                    deviceIcon="laptop"
                    title={t.eco.rstudio.title}
                    subtitle={t.eco.rstudio.subtitle}
                    body={t.eco.rstudio.body}
                    open={ecoOpen === "rstudio"}
                    onToggle={() => setEcoOpen(ecoOpen === "rstudio" ? null : "rstudio")}
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
                          runLoading(() => {
                            setTab("jornada");
                            setJourneyDevice("computer");
                            setJourneyView("detail");
                            setSub("tut");
                          });
                        }}
                      />
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="red"
                    title={t.eco.roblox.title}
                    subtitle={t.eco.roblox.subtitle}
                    body={t.eco.roblox.body}
                    open={ecoOpen === "roblox"}
                    onToggle={() => setEcoOpen(ecoOpen === "roblox" ? null : "roblox")}
                  >
                    <InfoRows accent="red" rows={t.eco.roblox.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.roblox.ctaCopy}</div>
                      <button className="small-action red" onClick={(e) => { e.stopPropagation(); setModal({ label: "Roblox" }); }}>
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
                    onToggle={() => setEcoOpen(ecoOpen === "comunidade" ? null : "comunidade")}
                  >
                    <InfoRows accent="purple" rows={t.eco.comunidade.rows} />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">{t.eco.comunidade.ctaCopy}</div>
                      <button className="small-action purple" onClick={(e) => { e.stopPropagation(); setModal({ label: "Comunidade no Discord" }); }}>
                        {t.eco.comunidade.cta}
                      </button>
                    </div>
                  </AccordionCard>
                </section>
              )}

              {tab === "sobre" && (
                <section>
                  <h2 className="page-title">{t.sobre.pageTitle}</h2>
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

              {tab === "pais" && (
                <section>
                  {isMobile && (
                    <button
                      className="float-toggle"
                      onClick={() => {
                        const next = !(paisJornada && paisEco);
                        setPaisJornada(next);
                        setPaisEco(next);
                      }}
                    >
                      <span>{paisJornada && paisEco ? "∧" : "∨"}</span>
                      <span>{paisJornada && paisEco ? t.pais.collapse : t.pais.expand}</span>
                    </button>
                  )}

                  <NumberedHeader number="01" color={palette.red} title={t.pais.h1Title} icon="stair" />
                  <p className="page-subtitle wider">{t.pais.h1Sub}</p>
                  <div className="parent-steps">
                    {t.pais.steps.map((step, i) => (
                      <div key={i} className="parent-step">
                        <div className="parent-step-head">
                          <div>
                            <div className="ghost-number">{String(i + 1).padStart(2, "0")}</div>
                            <div className="parent-step-title">{step.title}</div>
                          </div>
                        </div>
                        <div className="parent-step-body">{step.body}</div>
                      </div>
                    ))}
                  </div>

                  <NumberedHeader number="02" color={palette.yellow} title={t.pais.h2Title} icon="stair" />
                  <p className="page-subtitle wider">{t.pais.h2Sub}</p>
                  <ExpandCard
                    title={t.pais.journeyExpandTitle}
                    subtitle={t.pais.journeyExpandSub}
                    open={paisJornada}
                    onToggle={() => setPaisJornada(!paisJornada)}
                  >
                    <div className="expand-stack">
                      {t.pais.journeyCompact.map((c, i) => (
                        <CompactJourney key={i} accent={c.accent} title={c.title} subtitle={c.subtitle} body={c.body} />
                      ))}
                      <PromoCard
                        theme="dark"
                        kicker={t.pais.promo.kicker}
                        title={t.pais.promo.title}
                        body={`${t.pais.promo.line1}\n${t.pais.promo.line2}`}
                        note={t.pais.promo.note}
                        button={t.pais.promo.button}
                        onClick={() => setModal({ label: "Roblox" })}
                        compact
                      />
                    </div>
                  </ExpandCard>

                  <NumberedHeader number="03" color={palette.blue} title={t.pais.h3Title} icon="hex" />
                  <p className="page-subtitle wider">{t.pais.h3Sub}</p>
                  <ExpandCard
                    title={t.pais.ecoExpandTitle}
                    subtitle={t.pais.ecoExpandSub}
                    open={paisEco}
                    onToggle={() => setPaisEco(!paisEco)}
                  >
                    <div className="expand-stack">
                      {t.pais.ecoCompact.map((c, i) => (
                        <CompactJourney key={i} accent={c.accent} title={c.title} subtitle={c.subtitle} body={c.body} />
                      ))}
                    </div>
                  </ExpandCard>

                  <NumberedHeader number="04" color={palette.red} title={t.pais.h4Title} icon="play" />
                  <p className="page-subtitle wider">{t.pais.h4Sub}</p>
                  <div className="video-list">
                    {t.pais.videos.map((video, i) => (
                      <div key={i} className="video-item">
                        <p className="video-text">{video.text}</p>
                        <div className="video-card">
                          <div className="video-thumb" style={{ background: videoMeta[i].color }}>
                            <span className="video-play" style={{ background: videoMeta[i].accent }}>▶</span>
                            <span className="video-title">{video.title}</span>
                          </div>
                          <div className="video-meta">{video.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <NumberedHeader number="05" color={palette.purple} title={t.pais.h5Title} icon="shield" />
                  <p className="page-subtitle wider">{t.pais.h5Sub}</p>
                  <div className="safety-list">
                    {t.pais.safety.map((card, i) => (
                      <SafetyCard key={i} label={card.label} title={card.title} body={card.body} />
                    ))}
                    <div className="community-card">
                      <div className="card-kicker light">{t.pais.communityCard.kicker}</div>
                      <div className="community-title">{t.pais.communityCard.title}</div>
                      <p>{t.pais.communityCard.body}</p>
                      <button className="outline-action" onClick={() => setModal({ label: "Comunidade no Discord" })}>
                        {t.pais.communityCard.button}
                      </button>
                    </div>
                  </div>

                  <NumberedHeader number="06" color={palette.text} title={t.pais.h6Title} icon="arrow" />
                  <p className="page-subtitle wider">{t.pais.h6Sub}</p>
                  <button className="deep-link" onClick={() => setModal({ label: "Roblox" })}>
                    <span>
                      <small>{t.pais.deepLinkSmall}</small>
                      <strong>{t.pais.deepLinkStrong}</strong>
                    </span>
                    <span>›</span>
                  </button>
                </section>
              )}
            </div>

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
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div className="lang-switch">
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

function ResultCard({ theme, kicker, title, body, button, onClick }) {
  return (
    <div className={`result-card ${theme}`}>
      <div className="result-kicker">{kicker}</div>
      <div className="result-title">{title}</div>
      <div className="result-body">{body}</div>
      <button className="result-button" onClick={onClick}>{button}</button>
    </div>
  );
}

function DetailScreen({ accent, kicker, title, subline, cards, slides, slide, setSlide, action, onAction, onBack, actionTheme, videoStub, labels, inline = false }) {
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
      {videoStub && <div className="video-stub"><span>▶</span><small>{labels.howItWorks}</small></div>}
      <div className="detail-grid" style={{ color: accent }}>
        <DetailFact title={labels.factWhat} body={cards[0]} />
        <DetailFact title={labels.factHow} body={cards[1]} />
        <DetailFact title={labels.factWhere} body={cards[2]} />
      </div>
      <div className="carousel">
        <div className="carousel-frame">
          <img src={slides[slide]} alt={title} />
        </div>
        <div className="dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className="dot"
              style={{ background: slide === index ? accent : "#E0E0E0" }}
              onClick={() => setSlide(index)}
            />
          ))}
        </div>
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
  return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1.5"/></svg>;
}

function navIcon(key) {
  return { sobre: "target", jornada: "stair", eco: "hex", pais: "shield" }[key];
}

function bottomSymbol(key) {
  return { sobre: "△", jornada: "⬡", eco: "◉", pais: "◈" }[key];
}

export default App;
