import { useEffect, useMemo, useRef, useState } from "react";

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

const bildeShots = Array.from({ length: 5 }, (_, i) => makePlaceholder(`Arraste um screenshot aqui ${i + 1}`));
const tutShots = Array.from({ length: 5 }, (_, i) => makePlaceholder(`Arraste um screenshot aqui ${i + 1}`));
const mobShots = Array.from({ length: 5 }, (_, i) => makePlaceholder(`Screenshot ${i + 1}`, true));

const sobreSections = [
  {
    color: palette.red,
    kicker: "A iniciativa",
    icon: "target",
    paragraphs: [
      "A Expedição Roblox é uma iniciativa da Mastertech que leva adolescentes de treze a dezoito anos para dentro do processo de criação de experiências digitais na Roblox.",
      "O participante entra como criador, alguém que projeta, testa e publica o próprio espaço dentro da plataforma.",
      "A Mastertech estrutura o percurso, oferece o acompanhamento e organiza cada etapa para que o jovem saia da expedição com experiências de fato construídas e publicadas.",
    ],
  },
  {
    color: palette.blue,
    kicker: "O desenvolvimento",
    icon: "stair",
    paragraphs: [
      "O foco do trabalho está no desenvolvimento das habilidades do futuro.",
      "Ao construir suas experiências, os participantes exercitam pensamento computacional, resolução de problemas, colaboração e a capacidade de transformar uma ideia em algo navegável por outras pessoas.",
      "Esse desenvolvimento acontece em ambientes mediados, com etapas guiadas que conduzem o criador do primeiro rascunho até a publicação.",
      "Cada fase se apoia em artefatos produzidos pela Mastertech para sustentar a criação de forma evolutiva, e esses materiais funcionam no celular e no desktop, atendendo a realidade de quem cria a partir do aparelho que tem em mãos.",
    ],
  },
  {
    color: palette.yellowText,
    kicker: "O ambiente",
    icon: "shield",
    paragraphs: [
      "Toda a expedição se apoia no lastro de uma plataforma comprometida com conteúdo, segurança e bem-estar dos mais jovens.",
      "A Roblox opera com diretrizes voltadas a públicos infantojuvenis, recursos de controle parental, moderação de conteúdo e mecanismos de proteção alinhados às exigências de países que tratam o tema com seriedade.",
      "Para famílias e educadores, isso significa um ambiente em que a liberdade de criar caminha ao lado de camadas de cuidado pensadas para essa faixa etária.",
    ],
  },
  {
    color: palette.purple,
    kicker: "A continuidade",
    icon: "infinity",
    paragraphs: [
      "A jornada continua depois que a atividade termina.",
      "A Expedição Roblox se sustenta numa comunidade que prolonga o aprendizado, onde os criadores trocam, mostram o que fizeram, recebem retorno e encontram referências para o próximo passo.",
      "Esse tecido de convivência dá continuidade ao percurso e permite que cada participante avance no próprio ritmo com apoio dos colegas e dos mediadores.",
    ],
  },
];

const parentSteps = [
  {
    number: "01",
    title: "Escolhe a ferramenta",
    body: "Bilde, Tutoriais ou Studio mobile — cada uma serve a um perfil diferente de creator e a um dispositivo diferente.",
  },
  {
    number: "02",
    title: "Cria o jogo",
    body: "Constrói no Roblox Studio (computador) ou no Studio mobile (celular), com orientação a cada passo. O creator faz tudo com a própria mão.",
  },
  {
    number: "03",
    title: "Publica no Roblox",
    body: "O jogo fica visível para qualquer pessoa no mundo. É o momento mais importante da jornada.",
  },
];

const videos = [
  {
    text: "Entenda em menos de 3 minutos o que é a Expedição Roblox, quem são os parceiros, qual o objetivo e o que seu filho vai criar ao longo da jornada.",
    title: "O que é a Expedição Roblox",
    meta: "Visão geral · 3 min",
    color: "linear-gradient(135deg,#0D1117 0%,#1A2233 100%)",
    accent: palette.red,
  },
  {
    text: "Passo a passo para configurar a conta parental no Roblox: restrições de chat, quem pode adicionar seu filho, visível para quem, e controle de privacidade.",
    title: "Segurança e controle parental",
    meta: "Como proteger a conta · 4 min",
    color: "linear-gradient(135deg,#111827 0%,#1F2D40 100%)",
    accent: palette.blue,
  },
  {
    text: "O Roblox tem uma moeda virtual chamada Robux. A Expedição não exige nenhuma compra. Saiba como funciona e como bloquear transações caso precise.",
    title: "Microtransações e Robux",
    meta: "Sobre compras · 2 min",
    color: "linear-gradient(135deg,#0F1A0F 0%,#1A2E1A 100%)",
    accent: "#1F8A5B",
  },
];

function App() {
  const [screen, setScreen] = useState("entry");
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
    { key: "sobre", label: "Expedição", subtitle: "O que é o programa" },
    { key: "jornada", label: "Jornada", subtitle: "Ferramentas e caminho" },
    { key: "eco", label: "Ecossistema", subtitle: "Onde tudo acontece" },
    { key: "pais", label: "Para pais", subtitle: "Guia para responsáveis" },
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

  return (
    <div className="app-root">
      <LoadingOverlay loading={loading} hub={screen === "hub"} />

      {screen === "entry" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" />
            <h1 className="entry-title">Quer criar?<br />Desce pro<br />play.</h1>
            <p className="entry-text">Este hub é seu ponto de entrada na Expedição, um projeto onde jovens aprendem a criar jogos e experiências digitais.</p>
            <p className="entry-text strong">Entenda o programa, escolha sua jornada e participe.</p>
            <p className="entry-text faint">Um projeto conjunto entre Mastertech e Roblox.</p>
            <button
              className="cta cta-red"
              onClick={() =>
                runLoading(() => {
                  setQDev(null);
                  setQSty(null);
                  setScreen("creator-q");
                })
              }
            >
              <span>Entrar na Expedição</span>
              <span className="cta-badge">→</span>
            </button>
            <div className="footnote dark">Mastertech · Expedição Roblox</div>
          </div>
        </section>
      )}

      {screen === "anamnese" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" />
            <button className="back-link" onClick={() => setScreen("entry")}>← Voltar</button>
            <div className="choice-list">
              <ChoiceCard
                title="Sou creator"
                body="Quero criar e publicar um jogo no Roblox."
                icon={icon("stair", "#fff")}
                onClick={() => {
                  setQDev(null);
                  setQSty(null);
                  setScreen("creator-q");
                  window.scrollTo(0, 0);
                }}
              />
              <ChoiceCard
                title="Sou responsável"
                body="Quero entender e acompanhar meu filho."
                icon={icon("shield", "#fff")}
                onClick={() => toHub("pais")}
              />
            </div>
          </div>
        </section>
      )}

      {screen === "creator-q" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <Logo usage="entry" />
            <button className="back-link" onClick={() => setScreen("entry")}>← Voltar</button>

            <QuestionCard number="01" title="Onde você vai criar?">
              <div className="pill-row">
                <QuestionPill active={qDev === "pc"} onClick={() => { setQDev("pc"); setQSty(null); }}>No computador</QuestionPill>
                <QuestionPill active={qDev === "mob"} onClick={() => setQDev("mob")}>No celular</QuestionPill>
              </div>
            </QuestionCard>

            {qDev && (
              <QuestionCard number="02" title="Como você prefere começar?" muted={qDev !== "pc"}>
                <div className="pill-row">
                  <QuestionPill active={qSty === "guia"} disabled={qDev !== "pc"} onClick={() => setQSty("guia")}>Ser guiado por perguntas</QuestionPill>
                  <QuestionPill active={qSty === "mao"} disabled={qDev !== "pc"} onClick={() => setQSty("mao")}>Mão na massa, construindo</QuestionPill>
                </div>
                {qDev !== "pc" && <div className="mini-note">Vale para quem cria no computador.</div>}
              </QuestionCard>
            )}

            {!qResult && <div className="empty-result">Responda para ver o caminho ↑</div>}

            {qResult === "mobile" && (
              <ResultCard
                theme="yellow"
                kicker="no celular, seu caminho é"
                title="Criar no Celular"
                body="Studio mobile — app de criação da Mastertech para celular."
                button="Ir para o Studio mobile →"
                onClick={() => toHub("jornada", "mob", "detail")}
              />
            )}
            {qResult === "bilde" && (
              <ResultCard
                theme="red"
                kicker="no computador, guiado por IA"
                title="Criar com IA"
                body="Bilde — conversa com você por perguntas e monta o jogo junto."
                button="Ir para o Bilde →"
                onClick={() => toHub("jornada", "bilde", "detail")}
              />
            )}
            {qResult === "tut" && (
              <ResultCard
                theme="blue"
                kicker="no computador, mão na massa"
                title="Aprender com Tutoriais"
                body="Você constrói cada parte do jogo com a própria mão."
                button="Ir para os Tutoriais →"
                onClick={() => toHub("jornada", "tut", "detail")}
              />
            )}

            <div className="subtle-link-wrap">
              <button className="subtle-link" onClick={() => toHub("jornada")}>
                ou vá direto para a Jornada ›
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "hub" && (
        <div className={`hub-shell ${isMobile ? "mobile" : ""}`}>
          {!isMobile && (
            <aside className="sidebar">
              <div className="sidebar-logo"><Logo usage="sidebar" /></div>
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
              <button className="sidebar-exit" onClick={() => runLoading(() => setScreen("entry"))}>← Sair</button>
            </aside>
          )}

          <main className="main-panel">
            {isMobile && (
              <>
                <header className="mobile-topbar">
                  <div className="mobile-head">
                    <Logo usage="topbar" />
                    <span className="mobile-tag">creator</span>
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
                  {sub === "mob" && (
                    <DetailScreen
                      accent={palette.yellowText}
                      kicker="Studio mobile"
                      title="Criar no Celular"
                      subline="app · Mastertech · celular"
                      videoStub
                      cards={[
                        "App da Mastertech para criar no celular, com interface pensada para tela pequena.",
                        "Cria e publica um jogo inteiro pelo telefone. Vai direto para o Roblox ao publicar.",
                        "No Studio mobile, no celular. App separado do Roblox Studio.",
                      ]}
                      slides={mobShots}
                      slide={mobSlide}
                      setSlide={setMobSlide}
                      action="Abrir o Studio mobile →"
                      actionTheme="yellow"
                      onAction={() => setModal({ label: "Studio mobile" })}
                      onBack={() => {
                        setJourneyView("inline");
                        setSub("main");
                      }}
                    />
                  )}
                  {sub === "bilde" && (
                    <DetailScreen
                      accent={palette.red}
                      kicker="Bilde"
                      title="Criar com IA"
                      subline="plugin · Roblox Studio · computador"
                      videoStub
                      cards={[
                        "Plugin que entrevista você sobre o jogo que quer criar e vai construindo junto com as respostas.",
                        "Você responde perguntas sobre personagem, cenário e objetivo. O Bilde monta o projeto.",
                        "No Roblox Studio, no computador.",
                      ]}
                      slides={bildeShots}
                      slide={bildeSlide}
                      setSlide={setBildeSlide}
                      action="Abrir no Roblox Studio →"
                      onAction={() => setModal({ label: "Roblox Studio" })}
                      onBack={() => {
                        setJourneyView("inline");
                        setSub("main");
                      }}
                    />
                  )}
                  {sub === "tut" && (
                    <DetailScreen
                      accent={palette.blue}
                      kicker="Tutoriais"
                      title="Aprender com Tutoriais"
                      subline="plugin · Roblox Studio · computador"
                      videoStub
                      cards={[
                        "Plugin que conduz por etapas — em cada etapa você constrói uma parte do jogo com a própria mão.",
                        "Segue o passo a passo e ao terminar já tem um jogo publicável. Aprende fazendo.",
                        "No Roblox Studio, no computador.",
                      ]}
                      slides={tutShots}
                      slide={tutSlide}
                      setSlide={setTutSlide}
                      action="Abrir no Roblox Studio →"
                      onAction={() => setModal({ label: "Roblox Studio" })}
                      onBack={() => {
                        setJourneyView("inline");
                        setSub("main");
                      }}
                    />
                  )}
                </section>
              )}

              {tab === "jornada" && journeyView === "inline" && (
                <section>
                  <h2 className="page-title">Sua jornada</h2>
                  <p className="page-subtitle">Três caminhos para criar. Um destino: seu jogo no ar.</p>

                  <div className="device-switch" role="tablist" aria-label="Escolha o dispositivo">
                    <button
                      className={`device-switch-option ${journeyDevice === "mobile" ? "active yellow" : ""}`}
                      onClick={() => {
                        setJourneyDevice("mobile");
                        if (sub === "bilde" || sub === "tut") setSub("main");
                      }}
                    >
                      <span className="device-switch-icon">{icon("mobile", journeyDevice === "mobile" ? palette.yellowText : "#8A8A8A")}</span>
                      <span className="device-switch-copy">
                        <strong>No celular</strong>
                        <small>Studio mobile</small>
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
                        <strong>No computador</strong>
                        <small>Bilde e Tutoriais</small>
                      </span>
                    </button>
                  </div>

                  {!journeyDevice && (
                    <div className="journey-choice-empty">
                      Escolha primeiro onde você vai criar para revelar os caminhos da jornada.
                    </div>
                  )}

                  {journeyDevice === "mobile" && (
                    <>
                      <div className="section-label yellow">No celular</div>
                      <JourneyCard
                        accent="yellow"
                        kicker="Studio mobile · App Mastertech"
                        title="Criar no Celular"
                        body="Cria e publica sem computador"
                        note="Só o celular basta. Cria e publica tudo pelo telefone."
                        onClick={() => setSub(sub === "mob" ? "main" : "mob")}
                      />
                      {sub === "mob" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          <DetailScreen
                            accent={palette.yellowText}
                            kicker="Studio mobile"
                            title="Criar no Celular"
                            subline="app · Mastertech · celular"
                            videoStub
                            cards={[
                              "App da Mastertech para criar no celular, com interface pensada para tela pequena.",
                              "Cria e publica um jogo inteiro pelo telefone. Vai direto para o Roblox ao publicar.",
                              "No Studio mobile, no celular. App separado do Roblox Studio.",
                            ]}
                            slides={mobShots}
                            slide={mobSlide}
                            setSlide={setMobSlide}
                            action="Abrir o Studio mobile →"
                            actionTheme="yellow"
                            onAction={() => setModal({ label: "Studio mobile" })}
                            onBack={() => setSub("main")}
                            inline
                          />
                        </InlineJourneyDetail>
                      )}
                    </>
                  )}

                  {journeyDevice === "computer" && (
                    <>
                      <div className="section-label gray">No computador</div>
                      <JourneyCard
                        accent="red"
                        kicker="Bilde · Roblox Studio · plugin"
                        title="Criar com IA"
                        body="Conversa com você, monta o jogo"
                        note="Guiado por perguntas. Ideal para quem quer começar sem saber o que fazer."
                        onClick={() => setSub(sub === "bilde" ? "main" : "bilde")}
                      />
                      {sub === "bilde" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          <DetailScreen
                            accent={palette.red}
                            kicker="Bilde"
                            title="Criar com IA"
                            subline="plugin · Roblox Studio · computador"
                            videoStub
                            cards={[
                              "Plugin que entrevista você sobre o jogo que quer criar e vai construindo junto com as respostas.",
                              "Você responde perguntas sobre personagem, cenário e objetivo. O Bilde monta o projeto.",
                              "No Roblox Studio, no computador.",
                            ]}
                            slides={bildeShots}
                            slide={bildeSlide}
                            setSlide={setBildeSlide}
                            action="Abrir no Roblox Studio →"
                            onAction={() => setModal({ label: "Roblox Studio" })}
                            onBack={() => setSub("main")}
                            inline
                          />
                        </InlineJourneyDetail>
                      )}

                      <div className="or-separator"><span>OU</span></div>

                      <JourneyCard
                        accent="blue"
                        kicker="Tutoriais · Roblox Studio · plugin"
                        title="Aprender com Tutoriais"
                        body="Passo a passo, mão na massa"
                        note="Cada etapa, uma parte do jogo construída com a própria mão."
                        onClick={() => setSub(sub === "tut" ? "main" : "tut")}
                      />
                      {sub === "tut" && (
                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                          <DetailScreen
                            accent={palette.blue}
                            kicker="Tutoriais"
                            title="Aprender com Tutoriais"
                            subline="plugin · Roblox Studio · computador"
                            videoStub
                            cards={[
                              "Plugin que conduz por etapas — em cada etapa você constrói uma parte do jogo com a própria mão.",
                              "Segue o passo a passo e ao terminar já tem um jogo publicável. Aprende fazendo.",
                              "No Roblox Studio, no computador.",
                            ]}
                            slides={tutShots}
                            slide={tutSlide}
                            setSlide={setTutSlide}
                            action="Abrir no Roblox Studio →"
                            onAction={() => setModal({ label: "Roblox Studio" })}
                            onBack={() => setSub("main")}
                            inline
                          />
                        </InlineJourneyDetail>
                      )}
                    </>
                  )}

                  {journeyDevice && <PublishJourneyCard onClick={() => setModal({ label: "Roblox" })} />}

                  {journeyDevice && <CommunityJourneyCard onClick={() => setModal({ label: "Comunidade no Discord" })} />}
                </section>
              )}

              {tab === "eco" && (
                <section>
                  <h2 className="page-title">O ecossistema</h2>
                  <p className="page-subtitle">Toque em cada espaço para entender o que é e o que você faz lá.</p>

                  <AccordionCard
                    accent="yellow"
                    title="Studio mobile"
                    subtitle="App Mastertech · celular"
                    body="Cria e publica só com o celular"
                    open={ecoOpen === "studiomob"}
                    onToggle={() => setEcoOpen(ecoOpen === "studiomob" ? null : "studiomob")}
                  >
                    <InfoRows
                      accent="yellow"
                      rows={[
                        ["O que é", "O app da Mastertech para criar no celular. Uma alternativa ao Roblox Studio para quem não tem computador."],
                        ["O que você faz aqui", "Cria e publica um jogo inteiro pelo telefone. Vai direto para o Roblox ao publicar."],
                        ["Quem fez", "Mastertech — parte da Expedição Roblox."],
                      ]}
                    />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">Entre direto no app de criação para celular da Expedição.</div>
                      <button className="small-action yellow" onClick={(e) => { e.stopPropagation(); setModal({ label: "Studio mobile" }); }}>
                        Abrir o Studio mobile →
                      </button>
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="dark"
                    title="Roblox Studio"
                    subtitle="Roblox · computador"
                    body="Onde os jogos são construídos"
                    open={ecoOpen === "rstudio"}
                    onToggle={() => setEcoOpen(ecoOpen === "rstudio" ? null : "rstudio")}
                  >
                    <InfoRows
                      accent="dark"
                      rows={[["O que é", "Software oficial da Roblox onde os jogos são construídos no computador."], ["O que você faz aqui", "Cria, testa e ajusta a experiência antes de publicar."], ["Plataforma", "Gratuito, da Roblox."]]}
                    />
                    <div className="nested-cards">
                      <SubToolCard
                        accent="red"
                        title="Bilde"
                        open={ecoSubOpen === "bilde"}
                        onToggle={(e) => { e.stopPropagation(); setEcoSubOpen(ecoSubOpen === "bilde" ? null : "bilde"); }}
                        body="Criação guiada por perguntas, com ajuda de IA."
                        rows={[
                          ["O que é", "Plugin que entrevista o creator e vai montando o jogo a partir das respostas."],
                          ["O que você faz aqui", "Descreve a ideia, responde às perguntas e ajusta o projeto no Roblox Studio."],
                          ["Plataforma", "Plugin dentro do Roblox Studio, no computador."],
                        ]}
                        cta="Ver Bilde →"
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
                        title="Tutoriais"
                        open={ecoSubOpen === "tutoriais"}
                        onToggle={(e) => { e.stopPropagation(); setEcoSubOpen(ecoSubOpen === "tutoriais" ? null : "tutoriais"); }}
                        body="Passo a passo mão na massa, etapa por etapa."
                        rows={[
                          ["O que é", "Plugin com trilhas guiadas em que cada etapa ensina uma parte concreta do jogo."],
                          ["O que você faz aqui", "Constrói cenário, lógica e mecânicas com a própria mão dentro do Roblox Studio."],
                          ["Plataforma", "Plugin dentro do Roblox Studio, no computador."],
                        ]}
                        cta="Ver Tutoriais →"
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
                    title="Roblox"
                    subtitle="Plataforma de jogos"
                    body="Onde seu jogo vai para o mundo"
                    open={ecoOpen === "roblox"}
                    onToggle={() => setEcoOpen(ecoOpen === "roblox" ? null : "roblox")}
                  >
                    <InfoRows
                      accent="red"
                      rows={[["O que é", "A plataforma onde os jogos são publicados e jogados por outras pessoas."], ["O que você faz aqui", "Publica o jogo pronto e acompanha sua experiência no ar."], ["Plataforma", "Roblox — gratuita, com conta própria."]]}
                    />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">Quando o jogo estiver pronto, é aqui que ele entra no ar.</div>
                      <button className="small-action red" onClick={(e) => { e.stopPropagation(); setModal({ label: "Roblox" }); }}>
                        Publicar no Roblox →
                      </button>
                    </div>
                  </AccordionCard>

                  <AccordionCard
                    accent="purple"
                    title="Comunidade"
                    subtitle="Discord · paralelo"
                    body="Creators juntos, a qualquer hora"
                    open={ecoOpen === "comunidade"}
                    onToggle={() => setEcoOpen(ecoOpen === "comunidade" ? null : "comunidade")}
                  >
                    <InfoRows
                      accent="purple"
                      rows={[["O que é", "O servidor da Expedição no Discord. Acompanha por fora — um espaço paralelo, não uma fase da jornada."], ["O que você faz aqui", "Encontra outros creators, tira dúvidas, compartilha o jogo. Antes, durante e depois de publicar."], ["Plataforma", "Discord — gratuito, no celular e no computador."]]}
                    />
                    <div className="ecosystem-cta-area">
                      <div className="ecosystem-cta-copy">A comunidade segue junto antes, durante e depois da publicação.</div>
                      <button className="small-action purple" onClick={(e) => { e.stopPropagation(); setModal({ label: "Comunidade no Discord" }); }}>
                        Entrar no Discord →
                      </button>
                    </div>
                  </AccordionCard>
                </section>
              )}

              {tab === "sobre" && (
                <section>
                  <h2 className="page-title">A Expedição Roblox</h2>
                  <div className="sobre-list">
                    {sobreSections.map((section, index) => (
                      <div key={section.kicker} className="sobre-item">
                        <div className="sobre-icon">{icon(section.icon, section.color)}</div>
                        <div className="sobre-copy">
                          <div className="sobre-kicker" style={{ color: section.color }}>{section.kicker}</div>
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
                      <span>{paisJornada && paisEco ? "Recolher" : "Expandir"}</span>
                    </button>
                  )}

                  <NumberedHeader number="01" color={palette.red} title="O que acontece na Expedição" icon="stair" />
                  <p className="page-subtitle wider">A Expedição conduz o creator por um caminho estruturado — da escolha da ferramenta até o jogo publicado no Roblox. A cada etapa, o jovem constrói algo real com a própria mão, sem que ninguém faça por ele.</p>
                  <div className="parent-steps">
                    {parentSteps.map((step) => (
                      <div key={step.number} className="parent-step">
                        <div className="parent-step-head">
                          <div>
                            <div className="ghost-number">{step.number}</div>
                            <div className="parent-step-title">{step.title}</div>
                          </div>
                        </div>
                        <div className="parent-step-body">{step.body}</div>
                      </div>
                    ))}
                  </div>

                  <NumberedHeader number="02" color={palette.yellow} title="A jornada do creator" icon="stair" />
                  <p className="page-subtitle wider">Cada ferramenta da Expedição tem um propósito específico. Veja como funciona o caminho completo.</p>
                  <ExpandCard
                    title="Ver a jornada completa"
                    subtitle="Jornada do creator"
                    open={paisJornada}
                    onToggle={() => setPaisJornada(!paisJornada)}
                  >
                    <div className="expand-stack">
                      <CompactJourney accent="yellow" title="Criar no Celular" subtitle="App Mastertech · celular" body="Só o celular basta. Cria e publica um jogo inteiro pelo telefone." />
                      <CompactJourney accent="red" title="Criar com IA" subtitle="Bilde · Roblox Studio · plugin" body="Plugin que entrevista o creator e monta o jogo a partir das respostas. Ideal para quem não sabe por onde começar." />
                      <CompactJourney accent="blue" title="Aprender com Tutoriais" subtitle="Tutoriais · Roblox Studio · plugin" body="Plugin que conduz etapa a etapa. O creator constrói cada parte do jogo com a própria mão." />
                      <PromoCard
                        theme="dark"
                        kicker="a virada"
                        title="Publicar"
                        body="Já tem um jogo?\nPublique no Roblox."
                        note="O creator publica no Roblox e o jogo fica no ar para qualquer pessoa jogar."
                        button="Publicar agora →"
                        onClick={() => setModal({ label: "Roblox" })}
                        compact
                      />
                    </div>
                  </ExpandCard>

                  <NumberedHeader number="03" color={palette.blue} title="O ecossistema" icon="hex" />
                  <p className="page-subtitle wider">Os espaços onde a criação acontece — o que cada um é e qual o papel da Mastertech e da Roblox em cada um.</p>
                  <ExpandCard
                    title="Ver o ecossistema"
                    subtitle="Espaços da Expedição"
                    open={paisEco}
                    onToggle={() => setPaisEco(!paisEco)}
                  >
                    <div className="expand-stack">
                      <CompactJourney accent="dark" title="Roblox Studio" subtitle="Roblox · computador" body="Onde os jogos são construídos. Os plugins Bilde e Tutoriais rodam dentro dele. Pertence à Roblox — gratuito." />
                      <CompactJourney accent="red" title="Roblox" subtitle="Plataforma de jogos" body="Onde os jogos são publicados. Qualquer pessoa no mundo pode jogar. Pertence à Roblox." />
                      <CompactJourney accent="purple" title="Comunidade" subtitle="Discord · paralelo" body="Servidor da Expedição no Discord. Mediado pela Mastertech. Não é obrigatório — acompanha por fora." />
                    </div>
                  </ExpandCard>

                  <NumberedHeader number="04" color={palette.red} title="Para entender melhor" icon="play" />
                  <p className="page-subtitle wider">Conteúdos feitos para responsáveis. Cada vídeo tem um propósito específico.</p>
                  <div className="video-list">
                    {videos.map((video) => (
                      <div key={video.title} className="video-item">
                        <p className="video-text">{video.text}</p>
                        <div className="video-card">
                          <div className="video-thumb" style={{ background: video.color }}>
                            <span className="video-play" style={{ background: video.accent }}>▶</span>
                            <span className="video-title">{video.title}</span>
                          </div>
                          <div className="video-meta">{video.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <NumberedHeader number="05" color={palette.purple} title="Comunidade e segurança" icon="shield" />
                  <p className="page-subtitle wider">A Mastertech gerencia a comunidade da Expedição e está presente na jornada do creator.</p>
                  <div className="safety-list">
                    <SafetyCard title="Roblox é classificado E10+" label="Classificação" body="Filtros de chat ativos por padrão. A Mastertech orienta sobre as configurações de segurança recomendadas para a faixa etária." />
                    <SafetyCard title="A Expedição é gratuita" label="Microtransações" body="Nenhuma atividade da Expedição exige compra. O Roblox usa Robux como moeda opcional — você controla o acesso." />
                    <SafetyCard title="Conta vinculada + privacidade configurável" label="Controle parental" body="Crie uma conta parental no Roblox e configure quem pode interagir com seu filho, ver o perfil e enviar mensagens." />
                    <div className="community-card">
                      <div className="card-kicker light">Comunidade mediada</div>
                      <div className="community-title">Mastertech presente no Discord</div>
                      <p>O servidor da Expedição é gerenciado pela equipe Mastertech. Há moderação ativa e acompanhamento das interações.</p>
                      <button className="outline-action" onClick={() => setModal({ label: "Comunidade no Discord" })}>
                        Entrar na comunidade →
                      </button>
                    </div>
                  </div>

                  <NumberedHeader number="06" color={palette.text} title="Quer aprofundar?" icon="arrow" />
                  <p className="page-subtitle wider">Se quiser explorar o Roblox diretamente, configure a conta parental antes de começar.</p>
                  <button className="deep-link" onClick={() => setModal({ label: "Roblox" })}>
                    <span>
                      <small>Roblox · externo</small>
                      <strong>Configurar conta parental</strong>
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
                  <div className="modal-kicker">Saindo do hub</div>
                  <h3 className="modal-title">Abrir {modal.label}?</h3>
                  <p className="modal-copy">Você vai sair do Unbloxing e abrir um app externo.</p>
                  <div className="modal-actions">
                    <button className="modal-primary" onClick={() => setModal(null)}>Continuar →</button>
                    <button className="modal-secondary" onClick={() => setModal(null)}>Ficar no hub</button>
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

function Logo({ usage = "entry" }) {
  return (
    <img
      className={`logo-image ${usage}`}
      src="/uploads/expedicao-roblox-logo.png"
      alt="Expedição Roblox"
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

function DetailScreen({ accent, kicker, title, subline, cards, slides, slide, setSlide, action, onAction, onBack, actionTheme, videoStub, inline = false }) {
  return (
    <section className={inline ? "detail-screen-inline" : ""}>
      <button className="detail-back" onClick={onBack}>{inline ? "fechar ↑" : "← voltar"}</button>
      <div className="detail-head">
        <div>
          <div className="detail-kicker" style={{ color: accent }}>{kicker}</div>
          <h2 className="detail-title">{title}</h2>
        </div>
      </div>
      <div className="detail-subline" style={{ color: accent }}>{subline}</div>
      {videoStub && <div className="video-stub"><span>▶</span><small>Como funciona</small></div>}
      <div className="detail-grid" style={{ color: accent }}>
        <DetailFact title="O que é" body={cards[0]} />
        <DetailFact title="Como funciona" body={cards[1]} />
        <DetailFact title="Onde abre" body={cards[2]} />
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

function CommunityJourneyCard({ onClick }) {
  return (
    <div className="community-journey-card">
      <div className="community-orb" />
      <div className="promo-kicker">continuidade</div>
      <div className="promo-title">Comunidade</div>
      <p className="community-journey-copy">
        O servidor da Expedição no Discord. Não é uma fase da jornada — está disponível a
        qualquer hora, para os creators continuarem criando juntos.
      </p>
      <button className="community-journey-button" onClick={onClick}>
        Entrar no Discord →
      </button>
    </div>
  );
}

function PublishJourneyCard({ onClick }) {
  return (
    <div className="publish-journey-card">
      <div className="promo-kicker">a virada</div>
      <div className="promo-title">Publicar</div>
      <div className="publish-journey-headline">
        <div>Já tem um jogo?</div>
        <div>Publique no Roblox.</div>
      </div>
      <p className="publish-journey-copy">
        O momento mais importante da jornada. Seu jogo entra no Roblox e qualquer pessoa no
        mundo pode jogar.
      </p>
      <button className="publish-journey-button" onClick={onClick}>
        Publicar agora →
      </button>
    </div>
  );
}

function AccordionCard({ accent, title, subtitle, body, open, onToggle, children }) {
  return (
    <div className={`accordion-card ${accent} ${open ? "open" : ""}`}>
      <button className={`accordion-head ${accent}`} onClick={onToggle}>
        <div className="accordion-head-main">
          <div className="accordion-head-copy">
            <div className="accordion-subtitle">{subtitle}</div>
            <div className="accordion-title">{title}</div>
            <div className="accordion-body">{body}</div>
          </div>
          {(title === "Studio mobile" || title === "Roblox Studio") && (
            <div className="accordion-device-icon">
              <Icon
                name={title === "Studio mobile" ? "mobile" : "laptop"}
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
      {rows.map(([title, body]) => (
        <div key={title} className="info-row">
          <div className={`info-row-icon ${accent}`}>{<RowGlyph title={title} accent={accent} />}</div>
          <div className="info-row-copy">
            <div className="info-row-title">{title}</div>
            <div className="info-row-body">{body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RowGlyph({ title, accent }) {
  const colorMap = {
    yellow: "#B8860B",
    dark: "#1A1A1A",
    red: "#E31837",
    purple: "#5865F2",
    blue: "#2468B8",
  };
  const color = colorMap[accent] || "#1A1A1A";

  if (title === "O que é") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.9"/><path d="M12 15V11.5C12 9.7 14.8 9.7 14.8 7.9C14.8 6.4 13.5 5.5 12.1 5.5C10.6 5.5 9.3 6.4 9.3 7.9" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><circle cx="12" cy="18" r="1.2" fill={color}/></svg>;
  }
  if (title === "O que você faz aqui") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5.5 12.2L9.8 16.4L18.3 7.9" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3.8V5.8M20.2 12H18.2M5.8 12H3.8M17.8 6.2L16.4 7.6" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  if (title === "Plataforma") {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="5.5" width="15" height="9.5" rx="2.2" stroke={color} strokeWidth="1.9"/><path d="M2.5 18.5H21.5M9.2 15.8V18.5M14.8 15.8V18.5" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 4L18.5 7V12.8C18.5 16.1 15.7 18.3 12 20C8.3 18.3 5.5 16.1 5.5 12.8V7L12 4Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.2 12.4L11.2 14.4L14.9 10.7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SubToolCard({ accent, title, open, onToggle, body, rows, cta, onAction }) {
  return (
    <div className={`subtool-card ${accent} ${open ? "open" : ""}`}>
      <div className={`subtool-top ${accent}`}>
        <button className="subtool-toggle" onClick={onToggle}>
          <div className="subtool-meta">plugin · Roblox Studio · computador</div>
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
