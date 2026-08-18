import { useEffect, useRef, useState } from "react";
import { getStoredUtms } from "./utm";
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
  "Comunidade no Discord": "https://discord.gg/Kvh3ccfrM8",
  "Guia para pais e educadores": "https://docs.google.com/document/d/e/2PACX-1vSiAvmcWNoNZUDhSlYMYeFnbKm0W-irUtdpwT0-zs1Jzp2OIA4rNEka9m9hSqD3Eu6w0UxHgIqbrkbq/pub",
};

const WHATSAPP_URL = "https://wa.me/5511919522455";

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
      borderColor: "#7F77DD73",
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
      borderColor: "#D85A3070",
      titleColor: "#712B13",
      textColor: "#993C1D",
    },
  },
  {
    id: "interaction",
    badgeIds: ["tut-plataforma", "tut-porta", "tut-moeda"],
    style: {
      background: "#FAEEDA",
      borderColor: "#BA751770",
      titleColor: "#633806",
      textColor: "#854F0B",
    },
  },
  {
    id: "systems",
    badgeIds: ["tut-clicker", "tut-semaforo", "bilde-game"],
    style: {
      background: "#E1F5EE",
      borderColor: "#1D9E7570",
      titleColor: "#085041",
      textColor: "#0F6E56",
    },
  },
];

const CONTEXT_RAIL = {
  expedition: {
    variant: "editorial",
    eyebrow: "Expedição",
    title: "O que está acontecendo?",
    intro: "A Expedição ganha forma em encontros, ativações, creators convidados, famílias presentes e caminhos que continuam depois de cada parada.",
    highlight: {
      kicker: "São Paulo · Rio · Brasília · gamescom",
      title: "Uma mesma metodologia, territórios bem diferentes",
      body: "Em formatos bem diferentes, a Expedição manteve a mesma espinha: mobilização local, criação guiada, referências concretas e continuidade possível depois da experiência presencial.",
      stats: [
        { value: "2.000", label: "pessoas na gamescom" },
        { value: "135", label: "jovens em São Paulo" },
        { value: "45", label: "jovens no Rio" },
        { value: "30", label: "participantes em Brasília" },
      ],
    },
    sections: [
      {
        label: "Onde a Expedição aconteceu",
        items: [
          {
            kicker: "Rio de Janeiro",
            title: "A primeira parada provou que o formato funcionava",
            body: "A primeira parada aconteceu no 42 Rio, espaço que recebeu a ativação e contou com voluntários na mediação do dia. Vieram jovens mobilizados por organizações e coletivos como ViDançar, Comunidade da Mangueira, Novas Vozes e Instituto Paramitas, o que deu ao encontro um vínculo real com redes que já atuavam com esses participantes. Dali saíram desdobramentos que depois continuaram em formato de camp e presença local.",
            image: {
              src: "/context-rail/rio-42.jpg",
              alt: "Encontro da Expedição Roblox no 42 Rio",
              position: "center 44%",
            },
          },
          {
            kicker: "São Paulo",
            title: "A operação cresceu sem perder a mediação",
            body: "Em São Paulo, a Expedição reuniu jovens de escolas públicas e grupos que chegaram por hubs sociais e educacionais, com forte presença de redes como Instituto Paramitas / Technovation. Com 184 inscritos e 135 participantes, a cidade mostrou que era possível ganhar escala sem perder a mediação próxima, e ainda abriu espaço para que pais e responsáveis vissem a criação acontecendo ao vivo.",
            image: {
              src: "/context-rail/sao-paulo-atividade.jpg",
              alt: "Atividade da Expedição Roblox em São Paulo",
              position: "center 42%",
            },
          },
          {
            kicker: "Brasília",
            title: "A ida ao Centro-Oeste ampliou a legitimidade do programa",
            body: "Em Brasília, a Expedição encontrou no Brasília Game Hub o parceiro que articulou o território e conectou o programa a instituições como CRÊ Ceilândia e Centro Social Comunitário Tia Angelina. A parada trouxe famílias para mais perto da conversa e recebeu Elizabeth Milovidov, que conduziu uma fala sobre criação digital, segurança e mediação adulta, ampliando o peso público e formativo do encontro.",
            image: {
              src: "/context-rail/brasilia-familias.jpg",
              alt: "Conversa com famílias e participantes em Brasília",
              position: "center 42%",
            },
          },
        ],
      },
      {
        label: "Parcerias, creators e desdobramentos",
        items: [
          {
            kicker: "gamescom latam",
            title: "A ativação pública virou vitrine e funil",
            body: "A gamescom latam, uma das maiores feiras de games da América Latina, colocou a Expedição diante de cerca de 2.000 pessoas em quatro dias. Dentro do estande da Roblox, a ativação testou o plugin em fluxo alto, funcionou como vitrine pública do programa e ainda gerou contatos que depois alimentaram a operação da própria Expedição em São Paulo.",
            image: {
              src: "/context-rail/gamescom-palco.jpg",
              alt: "Ativação da Expedição Roblox na gamescom latam",
              position: "center 28%",
            },
          },
          {
            kicker: "Creators e referências",
            title: "Casos concretos aproximam criação de futuro",
            body: "Caio Cabral, no Rio, apareceu como artista e creator brasileiro ligado ao universo 3D. Em São Paulo, Breno Luchesi levou essa conversa a partir de sua atuação na Voldex. Em Brasília, Chrystian Gabriel, conhecido como Christian PPP, compartilhou sua trajetória e falou de Primeval Earth, experiência que alcança mais de meio milhão de usuários por mês. Em comum, os três ajudaram a mostrar que autoria, comunidade e carreira não são abstrações distantes.",
            image: {
              src: "/context-rail/sao-paulo-lab.jpg",
              alt: "Jovens participantes da Expedição Roblox em São Paulo",
              position: "center 28%",
            },
          },
          {
            kicker: "Legitimação pública",
            title: "Imprensa, governo e parceiros certos mudam o peso do encontro",
            body: "Quando a operação encontra parceiros locais fortes, presença institucional e visibilidade pública, o programa muda de escala. No Rio, por exemplo, Gabriel Medina, secretário municipal de Ciência e Tecnologia, esteve presente. Em Brasília, a cobertura do Correio Braziliense e a articulação local reforçaram a percepção de que a Expedição dialoga com educação, cultura digital e oportunidade real.",
            image: {
              src: "/context-rail/gamescom-palco.jpg",
              alt: "Momento público da Expedição Roblox em evento",
              position: "center 20%",
            },
          },
        ],
      },
    ],
    cards: [
      {
        kicker: "Como a experiência funciona",
        title: "Criação guiada dá mais corpo ao que os jovens conseguem fazer",
        body: "Rio e São Paulo deixaram uma leitura consistente: quando a juventude cria em dupla, com mediação, tempo protegido e uma estrutura simples de começo, meio e fim, a curiosidade vira produção concreta com muito mais consistência.",
        image: {
          src: "/context-rail/rio-42.jpg",
          alt: "Jovens criando em atividade guiada da Expedição Roblox",
          position: "center 46%",
        },
      },
      {
        kicker: "Confiança em campo",
        title: "Quando famílias veem o processo, a confiança deixa de ser abstrata",
        body: "A confiança cresce quando responsáveis conseguem enxergar criação, mediação e segurança acontecendo de verdade, e não só ouvir uma explicação sobre isso.",
        image: {
          src: "/context-rail/brasilia-familias.jpg",
          alt: "Conversa com famílias na Expedição Roblox em Brasília",
          position: "center 42%",
        },
      },
      {
        kicker: "O que continua depois",
        title: "Camps, materiais e desafios já aparecem como próximos desdobramentos",
        body: "Camps, materiais para escolas, sessões remotas de programação e IA e desafios criativos contínuos já aparecem como extensões naturais do que começou em campo.",
        image: {
          src: "/context-rail/sao-paulo-atividade.jpg",
          alt: "Participantes da Expedição Roblox em continuidade de criação",
          position: "center 42%",
        },
        actionLabel: "Entrar na comunidade",
        modalLabel: "Comunidade no Discord",
      },
    ],
  },
  ecosystem: {
    variant: "editorial",
    eyebrow: "Ecossistema",
    title: "O que eu posso construir?",
    intro: "Aqui a ideia não é explicar ferramenta por ferramenta. É mostrar o tipo de criação, continuidade e repertório que esse ecossistema pode colocar nas mãos de quem entra nele.",
    sections: [
      {
        label: "Casos que já apareceram no ecossistema",
        items: [
          {
            kicker: "São Paulo",
            title: "A criação continuou viva depois do encontro",
            body: "Na etapa de São Paulo, a adesão ao plugin foi a mais forte entre os encontros presenciais e o pós-evento deixou um sinal importante de continuidade: participantes quiseram seguir criando mesmo depois do encerramento. Isso ajuda a mostrar que o ecossistema não termina na mediação da oficina.",
            image: {
              src: "/context-rail/sao-paulo-atividade.jpg",
              alt: "Jovens criando na etapa de São Paulo",
              position: "center 40%",
            },
          },
          {
            kicker: "Brasília",
            title: "Primeval Earth virou referência concreta de onde se pode chegar",
            body: "Em Brasília, Chrystian Gabriel compartilhou sua trajetória como creator e falou de Primeval Earth, experiência ligada ao seu trabalho que alcança mais de meio milhão de usuários por mês. Para quem está começando, isso dá corpo à ideia de autoria, comunidade e escala dentro do universo Roblox.",
            image: {
              src: "/context-rail/brasilia-familias.jpg",
              alt: "Participantes e convidados em Brasília",
              position: "center 34%",
            },
          },
        ],
      },
      {
        label: "Como a criação continua depois",
        items: [
          {
            kicker: "Rio de Janeiro",
            title: "O que começa no evento pode virar presença contínua",
            body: "Depois da ativação no Rio, a relação com a Comunidade da Mangueira continuou em formato de camp, com computadores adaptados para Roblox Studio, descoberta do plugin e acompanhamento do que estava funcionando. O ecossistema aparece aí como continuidade, não só como ferramenta.",
            image: {
              src: "/context-rail/rio-42.jpg",
              alt: "Atividade da Expedição Roblox no Rio",
              position: "center 44%",
            },
          },
          {
            kicker: "gamescom latam",
            title: "A vitrine pública também alimenta novas entradas",
            body: "Na gamescom latam, cerca de 2.000 pessoas passaram pela ativação da Expedição dentro do estande da Roblox. Além de visibilidade, isso gerou contatos que depois alimentaram a própria operação de São Paulo.",
            image: {
              src: "/context-rail/gamescom-palco.jpg",
              alt: "Ativação pública da Expedição Roblox na gamescom",
              position: "center 24%",
            },
          },
        ],
      },
      {
        label: "O que ainda pode entrar aqui",
        items: [
          {
            kicker: "Criação em destaque",
            title: "Jogo da semana ou criação visitada por estudantes",
            body: "Aqui pode entrar uma criação concreta para mostrar linguagem, ambição e tipo de mundo que jovens reconhecem como possível dentro do ecossistema.",
            placeholder: true,
          },
          {
            kicker: "IA e plugin",
            title: "Prompt interessante ou plugin do mês",
            body: "Este espaço pode receber um recorte curto: um prompt que virou protótipo, uma missão que gerou resultado forte ou um plugin em destaque para puxar curiosidade.",
            placeholder: true,
          },
        ],
      },
    ],
    cards: [
      {
        icon: "mobile",
        kicker: "Studio Mobile",
        title: "O celular pode ser porta de entrada real para criar",
        body: "Como boa parte dos jovens chega pelo celular, o Studio Mobile existe para reduzir a barreira inicial e fazer a criação começar antes mesmo do desktop entrar na história.",
        actionLabel: "Ir para o Studio Mobile",
        modalLabel: "Studio mobile",
        actionKey: "studiomob",
      },
      {
        icon: "chat",
        kicker: "Comunidade",
        title: "Entre uma etapa e outra, a comunidade segura o ritmo",
        body: "Discord, creators de referência, plugin, Studio e oficinas não aparecem como peças soltas: juntos, eles mantêm a criação em movimento.",
        actionLabel: "Entrar na comunidade",
        modalLabel: "Comunidade no Discord",
        actionKey: "comunidade",
      },
    ],
  },
  parents: {
    variant: "editorial",
    eyebrow: "Pais, responsáveis e educadores",
    title: "Criar com segurança",
    intro: "Aqui aparecem sinais concretos de cuidado, mediação e aprendizagem para quem acompanha adolescentes criando no universo Roblox.",
    sections: [
      {
        label: "Cenas reais de cuidado e mediação",
        items: [
          {
            kicker: "Brasília",
            title: "Famílias entraram na conversa, não ficaram na borda",
            body: "Na ativação de 27 de maio de 2026, sediada no Brasília Game Hub, a trilha prática aconteceu em paralelo a uma conversa conduzida por Elizabeth Milovidov sobre criação digital, segurança, mediação e controles parentais. O encontro ainda conectou CRÊ Ceilândia e Centro Social Comunitário Tia Angelina, dando à conversa um chão social bem identificável.",
            image: {
              src: "/context-rail/brasilia-familias.jpg",
              alt: "Roda de conversa com famílias em Brasília",
              position: "center 42%",
            },
          },
          {
            kicker: "São Paulo",
            title: "Ver a criação acontecendo muda a percepção do programa",
            body: "Na parada de 9 de maio de 2026, realizada no 42 São Paulo, pais e responsáveis puderam acompanhar a experiência no mesmo espaço em que os jovens criavam. Essa presença adulta lado a lado com a atividade tornou a proposta mais tangível: os responsáveis não ouviram apenas uma explicação, eles viram a experiência acontecendo.",
            image: {
              src: "/context-rail/sao-paulo-lab.jpg",
              alt: "Participantes da Expedição Roblox em São Paulo",
              position: "center 32%",
            },
          },
        ],
      },
      {
        label: "Por que famílias e educadores confiam",
        items: [
          {
            kicker: "Rio de Janeiro",
            title: "Parcerias locais deram lastro social ao encontro",
            body: "Na primeira parada, em 11 de abril de 2026, o encontro aconteceu no 42 Rio com jovens mobilizados por redes como ViDançar, Comunidade da Mangueira, Novas Vozes e Instituto Paramitas. O fato de a entrada acontecer por organizações que já tinham vínculo com esses participantes deu ao programa uma base de confiança muito mais concreta do que um chamado aberto e genérico.",
            image: {
              src: "/context-rail/rio-42.jpg",
              alt: "Atividade da Expedição Roblox no Rio de Janeiro",
              position: "center 44%",
            },
          },
          {
            kicker: "Visibilidade pública",
            title: "Imprensa e presença institucional aumentam a legibilidade",
            body: "No Rio, Gabriel Medina, secretário municipal de Ciência e Tecnologia, acompanhou a ativação ao lado da conversa sobre carreiras criativas. Em Brasília, a cobertura do Correio Braziliense ajudou a dar forma pública ao que aconteceu no Brasília Game Hub. Quando esses sinais aparecem, o programa fica mais legível para famílias, educadores e parceiros externos.",
            image: {
              src: "/context-rail/gamescom-palco.jpg",
              alt: "Momento público com mediação da Expedição Roblox",
              position: "center 22%",
            },
          },
        ],
      },
      {
        label: "O que ainda pode entrar aqui",
        items: [
          {
            kicker: "Linguagem pública",
            title: "Posts recentes para mostrar tom e proximidade",
            body: "Aqui podem entrar três ou quatro conteúdos recentes para mostrar como a Expedição fala com jovens, que temas aparecem e qual clima de comunicação realmente sustenta a comunidade.",
            placeholder: true,
          },
          {
            kicker: "Segurança",
            title: "Atualização curta de boas práticas e controles",
            body: "Este espaço pode receber um resumo curto sobre parental controls, segurança e boas práticas, com linguagem direta para quem precisa se orientar rápido.",
            placeholder: true,
          },
        ],
      },
    ],
    cards: [
      {
        kicker: "Confiança",
        title: "A clareza cresce quando o processo fica visível",
        body: "Famílias e educadores entendem melhor a proposta quando conseguem ver criação, mediação e autoria acontecendo de forma concreta.",
        actionLabel: "Ver guia para pais e educadores",
        modalLabel: "Guia para pais e educadores",
      },
    ],
  },
  journeyGuest: {
    eyebrow: "Sua jornada",
    title: "Como estou indo?",
    intro: "Quando o creator entra, esta coluna passa a mostrar badges, passos concluídos e o que faz sentido explorar em seguida.",
    cards: [
      {
        icon: "target",
        kicker: "Progresso",
        title: "Badges conquistados",
        body: "Memorial dos badges do programa, com o que já foi alcançado e o que ainda falta destravar.",
      },
      {
        icon: "stair",
        kicker: "Próximo passo",
        title: "Missões em andamento",
        body: "Espaço para a próxima etapa da jornada, com orientação curta e acionável.",
      },
      {
        icon: "compass",
        kicker: "Ritmo",
        title: "Seu caminho no programa",
        body: "A coluna pode ajudar o creator a entender onde está e o que faz sentido explorar em seguida.",
      },
    ],
  },
};

const CONTEXT_RAIL_I18N = {
  pt: CONTEXT_RAIL,
  en: {
    expedition: {
      variant: "editorial",
      eyebrow: "Expedition",
      title: "What's happening?",
      intro: "The Expedition takes shape through meetups, activations, invited creators, families on site and paths that continue after each stop.",
      highlight: {
        kicker: "São Paulo · Rio · Brasília · gamescom",
        title: "One method, very different territories",
        body: "Across very different formats, the Expedition kept the same backbone: local mobilization, guided creation, concrete references and possible continuity after the in-person experience.",
        stats: [
          { value: "2,000", label: "people at gamescom" },
          { value: "135", label: "young people in São Paulo" },
          { value: "45", label: "young people in Rio" },
          { value: "30", label: "participants in Brasília" },
        ],
      },
      sections: [
        {
          label: "Where the Expedition has already happened",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "The first stop proved the format worked",
              body: "The first stop took place at 42 Rio with volunteers mediating the day. Young people arrived through local organizations and collectives such as ViDançar, Comunidade da Mangueira, Novas Vozes and Instituto Paramitas, giving the experience a real social anchor.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Roblox Expedition gathering at 42 Rio", position: "center 44%" },
            },
            {
              kicker: "São Paulo",
              title: "The operation scaled without losing mediation",
              body: "In São Paulo, the Expedition brought together public-school youth and participants mobilized by social and educational hubs. The city showed that scale was possible without losing close mediation, while families could watch creation happen live.",
              image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Roblox Expedition activity in São Paulo", position: "center 42%" },
            },
            {
              kicker: "Brasília",
              title: "Going to the Center-West expanded the program's legitimacy",
              body: "In Brasília, Brasília Game Hub helped connect the program to local institutions and families. Elizabeth Milovidov led a conversation on digital creation, safety and adult mediation, adding public and educational weight to the event.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Conversation with families and participants in Brasília", position: "center 42%" },
            },
          ],
        },
        {
          label: "Partnerships, creators and next steps",
          items: [
            {
              kicker: "gamescom latam",
              title: "The public activation became both showcase and funnel",
              body: "At gamescom latam, one of the largest gaming fairs in Latin America, the Expedition reached around 2,000 people in four days. Inside the Roblox booth, it worked as a public showcase and also generated leads that later fed the São Paulo operation.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Roblox Expedition activation at gamescom latam", position: "center 28%" },
            },
            {
              kicker: "Creators and references",
              title: "Real cases make creation feel like a future",
              body: "Caio Cabral in Rio, Breno Luchesi in São Paulo and Chrystian Gabriel in Brasília helped make authorship, community and career feel tangible rather than distant abstractions.",
              image: { src: "/context-rail/sao-paulo-lab.jpg", alt: "Young participants in São Paulo", position: "center 28%" },
            },
            {
              kicker: "Public legitimacy",
              title: "Press, government and the right partners change the weight of the encounter",
              body: "When the operation finds strong local partners, institutional presence and public visibility, the program changes scale and becomes easier to trust.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Public moment of Roblox Expedition", position: "center 20%" },
            },
          ],
        },
      ],
      cards: [
        {
          kicker: "How the experience works",
          title: "Guided creation gives more shape to what young people can do",
          body: "Rio and São Paulo pointed to the same pattern: when youth create in pairs, with mediation, protected time and a clear beginning, middle and end, curiosity turns into much more consistent output.",
          image: { src: "/context-rail/rio-42.jpg", alt: "Young people creating in a guided Expedition activity", position: "center 46%" },
        },
        {
          kicker: "Trust in the field",
          title: "When families see the process, trust stops being abstract",
          body: "Trust grows when guardians can actually see creation, mediation and safety happening, not just hear an explanation about it.",
          image: { src: "/context-rail/brasilia-familias.jpg", alt: "Conversation with families in Brasília", position: "center 42%" },
        },
        {
          kicker: "What continues afterwards",
          title: "Camps, materials and challenges already appear as next steps",
          body: "Camps, school materials, remote programming and AI sessions, and ongoing creative challenges are already showing up as natural extensions of what started in the field.",
          image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Participants continuing to create", position: "center 42%" },
          actionLabel: "Join the community",
          modalLabel: "Comunidade no Discord",
        },
      ],
    },
    ecosystem: {
      variant: "editorial",
      eyebrow: "Ecosystem",
      title: "What can I build?",
      intro: "The point here is not to explain tool by tool. It is to show the kind of creation, continuity and repertoire this ecosystem can put into the hands of whoever enters it.",
      sections: [
        {
          label: "Cases already visible in this ecosystem",
          items: [
            {
              kicker: "São Paulo",
              title: "Creation stayed alive after the event",
              body: "In São Paulo, adoption of the plugin was strongest among the in-person events and the post-event period showed a clear sign of continuity: participants wanted to keep creating after the official end.",
              image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Young people creating in São Paulo", position: "center 40%" },
            },
            {
              kicker: "Brasília",
              title: "Primeval Earth became a concrete reference for what is possible",
              body: "In Brasília, Chrystian Gabriel shared his creator journey and spoke about Primeval Earth, showing that authorship, community and scale are real possibilities inside the Roblox universe.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Participants and guests in Brasília", position: "center 34%" },
            },
          ],
        },
        {
          label: "How creation keeps going after the event",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "What starts at the event can become ongoing presence",
              body: "After the Rio activation, the relationship with the local community continued in camp format, with computers adapted for Roblox Studio, discovery of the plugin and follow-up on what was working.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Expedition activity in Rio", position: "center 44%" },
            },
            {
              kicker: "gamescom latam",
              title: "The public showcase also feeds new entries",
              body: "At gamescom latam, around 2,000 people passed through the Expedition activation inside the Roblox booth. Beyond visibility, it also generated contacts that later fed the São Paulo operation.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Public Roblox Expedition activation at gamescom", position: "center 24%" },
            },
          ],
        },
        {
          label: "What could still live here",
          items: [
            {
              kicker: "Featured creation",
              title: "Game of the week or a build visited by students",
              body: "A concrete creation can sit here to show language, ambition and the kind of world young people can imagine as possible inside the ecosystem.",
              placeholder: true,
            },
            {
              kicker: "AI and plugin",
              title: "Interesting prompt or plugin of the month",
              body: "This space can host a short slice: a prompt that became a prototype, a mission with a strong outcome or a highlighted plugin that pulls curiosity forward.",
              placeholder: true,
            },
          ],
        },
      ],
      cards: [
        {
          icon: "mobile",
          kicker: "Studio Mobile",
          title: "The phone can be a real doorway into creation",
          body: "Because many young people arrive through the phone, Studio Mobile exists to lower the initial barrier and let creation begin before desktop even enters the story.",
          actionLabel: "Go to Studio Mobile",
          modalLabel: "Studio mobile",
          actionKey: "studiomob",
        },
        {
          icon: "chat",
          kicker: "Community",
          title: "Between one step and the next, the community keeps the rhythm",
          body: "Discord, reference creators, plugin, Studio and workshops do not appear as isolated pieces: together they keep creation moving.",
          actionLabel: "Join the community",
          modalLabel: "Comunidade no Discord",
          actionKey: "comunidade",
        },
      ],
    },
    parents: {
      variant: "editorial",
      eyebrow: "Parents, guardians and educators",
      title: "Create with safety",
      intro: "Here you can see concrete signs of care, mediation and learning for anyone following teenagers creating inside the Roblox universe.",
      sections: [
        {
          label: "Real scenes of care and mediation",
          items: [
            {
              kicker: "Brasília",
              title: "Families were brought into the conversation, not left at the edge",
              body: "At the Brasília activation, the hands-on track happened alongside a conversation led by Elizabeth Milovidov on digital creation, safety, mediation and parental controls, giving the discussion a very concrete social ground.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Conversation with families in Brasília", position: "center 42%" },
            },
            {
              kicker: "São Paulo",
              title: "Watching creation happen changes how the program is perceived",
              body: "In São Paulo, parents and guardians could follow the experience inside the same space where young people were creating. That made the proposal tangible rather than abstract.",
              image: { src: "/context-rail/sao-paulo-lab.jpg", alt: "Participants in São Paulo", position: "center 32%" },
            },
          ],
        },
        {
          label: "Why families and educators trust it",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "Local partnerships gave the meeting a real social base",
              body: "The first stop in Rio happened with young people mobilized by networks such as ViDançar, Comunidade da Mangueira, Novas Vozes and Instituto Paramitas, giving the program a more concrete layer of trust.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Expedition activity in Rio de Janeiro", position: "center 44%" },
            },
            {
              kicker: "Public visibility",
              title: "Press and institutional presence make the program easier to read",
              body: "In Rio, the municipal secretary of Science and Technology was present. In Brasília, coverage from Correio Braziliense helped give public shape to what happened. Signals like these make the program more legible for families and educators.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Public moment with Expedition mediation", position: "center 22%" },
            },
          ],
        },
        {
          label: "What could still live here",
          items: [
            {
              kicker: "Public language",
              title: "Recent posts to show tone and proximity",
              body: "Three or four recent pieces can live here to show how the Expedition speaks with young people, what themes appear and what communication climate sustains the community.",
              placeholder: true,
            },
            {
              kicker: "Safety",
              title: "Short updates on controls and good practices",
              body: "This space can host a short summary on parental controls, safety and good practices in direct language for whoever needs quick guidance.",
              placeholder: true,
            },
          ],
        },
      ],
      cards: [
        {
          kicker: "Trust",
          title: "Clarity grows when the process becomes visible",
          body: "Families and educators understand the proposal better when they can actually see creation, mediation and authorship happening.",
          actionLabel: "See the guide for parents and educators",
          modalLabel: "Guia para pais e educadores",
        },
      ],
    },
    journeyGuest: {
      eyebrow: "Your journey",
      title: "How am I doing?",
      intro: "Once the creator enters, this column starts showing badges, completed steps and what makes sense to explore next.",
      cards: [
        { icon: "target", kicker: "Progress", title: "Earned badges", body: "A memory of program badges, with what has already been reached and what still needs to be unlocked." },
        { icon: "stair", kicker: "Next step", title: "Missions in progress", body: "Space for the next step in the journey, with short and actionable guidance." },
        { icon: "compass", kicker: "Rhythm", title: "Your path in the program", body: "The column can help the creator understand where they are and what makes sense to explore next." },
      ],
    },
  },
  es: {
    expedition: {
      variant: "editorial",
      eyebrow: "Expedición",
      title: "¿Qué está pasando?",
      intro: "La Expedición toma forma en encuentros, activaciones, creators invitados, familias presentes y caminos que continúan después de cada parada.",
      highlight: {
        kicker: "São Paulo · Rio · Brasília · gamescom",
        title: "Una misma metodología, territorios muy distintos",
        body: "En formatos muy diferentes, la Expedición mantuvo la misma columna vertebral: movilización local, creación guiada, referencias concretas y continuidad posible después de la experiencia presencial.",
        stats: [
          { value: "2.000", label: "personas en gamescom" },
          { value: "135", label: "jóvenes en São Paulo" },
          { value: "45", label: "jóvenes en Río" },
          { value: "30", label: "participantes en Brasília" },
        ],
      },
      sections: [
        {
          label: "Dónde ya pasó la Expedición",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "La primera parada probó que el formato funcionaba",
              body: "La primera parada ocurrió en 42 Rio con voluntarios mediando la jornada. Llegaron jóvenes movilizados por organizaciones y colectivos locales, lo que dio a la experiencia un anclaje social real.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Encuentro de la Expedición Roblox en 42 Rio", position: "center 44%" },
            },
            {
              kicker: "São Paulo",
              title: "La operación creció sin perder mediación",
              body: "En São Paulo, la Expedición reunió a jóvenes de escuelas públicas y de hubs sociales y educativos. La ciudad mostró que era posible ganar escala sin perder la mediación cercana, mientras las familias veían la creación en vivo.",
              image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Actividad de la Expedición Roblox en São Paulo", position: "center 42%" },
            },
            {
              kicker: "Brasília",
              title: "Ir al Centro-Oeste amplió la legitimidad del programa",
              body: "En Brasília, Brasília Game Hub ayudó a conectar el programa con instituciones locales y familias. Elizabeth Milovidov condujo una conversación sobre creación digital, seguridad y mediación adulta, ampliando el peso público y formativo del encuentro.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Conversación con familias y participantes en Brasília", position: "center 42%" },
            },
          ],
        },
        {
          label: "Alianzas, creators y continuidad",
          items: [
            {
              kicker: "gamescom latam",
              title: "La activación pública se volvió vitrina y embudo",
              body: "En gamescom latam, una de las mayores ferias de videojuegos de América Latina, la Expedición llegó a cerca de 2.000 personas en cuatro días. Dentro del estand de Roblox, funcionó como vitrina pública y también generó contactos que luego alimentaron la operación en São Paulo.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Activación de la Expedición Roblox en gamescom latam", position: "center 28%" },
            },
            {
              kicker: "Creators y referencias",
              title: "Casos concretos acercan la creación al futuro",
              body: "Caio Cabral en Río, Breno Luchesi en São Paulo y Chrystian Gabriel en Brasília ayudaron a hacer tangible la idea de autoría, comunidad y carrera.",
              image: { src: "/context-rail/sao-paulo-lab.jpg", alt: "Participantes jóvenes en São Paulo", position: "center 28%" },
            },
            {
              kicker: "Legitimidad pública",
              title: "Prensa, gobierno y socios adecuados cambian el peso del encuentro",
              body: "Cuando la operación encuentra socios locales fuertes, presencia institucional y visibilidad pública, el programa cambia de escala y se vuelve más confiable.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Momento público de la Expedición Roblox", position: "center 20%" },
            },
          ],
        },
      ],
      cards: [
        {
          kicker: "Cómo funciona la experiencia",
          title: "La creación guiada da más cuerpo a lo que los jóvenes pueden hacer",
          body: "Río y São Paulo dejaron la misma lectura: cuando la juventud crea en dupla, con mediación, tiempo protegido y una estructura clara, la curiosidad se convierte en producción mucho más consistente.",
          image: { src: "/context-rail/rio-42.jpg", alt: "Jóvenes creando en actividad guiada", position: "center 46%" },
        },
        {
          kicker: "Confianza en campo",
          title: "Cuando las familias ven el proceso, la confianza deja de ser abstracta",
          body: "La confianza crece cuando responsables pueden ver creación, mediación y seguridad ocurriendo de verdad, y no solo escuchar una explicación.",
          image: { src: "/context-rail/brasilia-familias.jpg", alt: "Conversación con familias en Brasília", position: "center 42%" },
        },
        {
          kicker: "Lo que sigue después",
          title: "Camps, materiales y desafíos ya aparecen como próximos pasos",
          body: "Camps, materiales para escuelas, sesiones remotas de programación e IA y desafíos creativos continuos ya aparecen como extensiones naturales de lo que empezó en campo.",
          image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Participantes continuando la creación", position: "center 42%" },
          actionLabel: "Entrar en la comunidad",
          modalLabel: "Comunidade no Discord",
        },
      ],
    },
    ecosystem: {
      variant: "editorial",
      eyebrow: "Ecosistema",
      title: "¿Qué puedo construir?",
      intro: "La idea aquí no es explicar herramienta por herramienta. Es mostrar el tipo de creación, continuidad y repertorio que este ecosistema puede poner en manos de quien entra en él.",
      sections: [
        {
          label: "Casos que ya aparecieron en el ecosistema",
          items: [
            {
              kicker: "São Paulo",
              title: "La creación siguió viva después del encuentro",
              body: "En São Paulo, la adhesión al plugin fue la más fuerte entre los encuentros presenciales y el posevento dejó una señal clara de continuidad: los participantes quisieron seguir creando después del cierre.",
              image: { src: "/context-rail/sao-paulo-atividade.jpg", alt: "Jóvenes creando en São Paulo", position: "center 40%" },
            },
            {
              kicker: "Brasília",
              title: "Primeval Earth se volvió una referencia concreta de hasta dónde se puede llegar",
              body: "En Brasília, Chrystian Gabriel compartió su trayectoria como creator y habló de Primeval Earth, mostrando que autoría, comunidad y escala son posibilidades reales dentro del universo Roblox.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Participantes e invitados en Brasília", position: "center 34%" },
            },
          ],
        },
        {
          label: "Cómo la creación sigue después",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "Lo que empieza en el evento puede volverse presencia continua",
              body: "Después de la activación en Río, la relación con la comunidad local siguió en formato camp, con computadoras adaptadas para Roblox Studio, descubrimiento del plugin y acompañamiento de lo que estaba funcionando.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Actividad de la Expedición en Río", position: "center 44%" },
            },
            {
              kicker: "gamescom latam",
              title: "La vitrina pública también alimenta nuevas entradas",
              body: "En gamescom latam, cerca de 2.000 personas pasaron por la activación de la Expedición dentro del estand de Roblox. Además de visibilidad, generó contactos que después alimentaron la operación en São Paulo.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Activación pública en gamescom", position: "center 24%" },
            },
          ],
        },
        {
          label: "Lo que todavía puede entrar aquí",
          items: [
            {
              kicker: "Creación destacada",
              title: "Juego de la semana o creación visitada por estudiantes",
              body: "Aquí puede entrar una creación concreta para mostrar lenguaje, ambición y el tipo de mundo que los jóvenes reconocen como posible dentro del ecosistema.",
              placeholder: true,
            },
            {
              kicker: "IA y plugin",
              title: "Prompt interesante o plugin del mes",
              body: "Este espacio puede recibir un recorte corto: un prompt que se volvió prototipo, una misión con resultado fuerte o un plugin destacado que despierte curiosidad.",
              placeholder: true,
            },
          ],
        },
      ],
      cards: [
        {
          icon: "mobile",
          kicker: "Studio Mobile",
          title: "El celular puede ser una puerta real para crear",
          body: "Como muchos jóvenes llegan por el celular, Studio Mobile existe para reducir la barrera inicial y hacer que la creación empiece incluso antes de que el desktop entre en escena.",
          actionLabel: "Ir al Studio Mobile",
          modalLabel: "Studio mobile",
          actionKey: "studiomob",
        },
        {
          icon: "chat",
          kicker: "Comunidad",
          title: "Entre una etapa y otra, la comunidad sostiene el ritmo",
          body: "Discord, creators de referencia, plugin, Studio y talleres no aparecen como piezas sueltas: juntos, mantienen la creación en movimiento.",
          actionLabel: "Entrar en la comunidad",
          modalLabel: "Comunidade no Discord",
          actionKey: "comunidade",
        },
      ],
    },
    parents: {
      variant: "editorial",
      eyebrow: "Padres, responsables y educadores",
      title: "Crear con seguridad",
      intro: "Aquí aparecen señales concretas de cuidado, mediación y aprendizaje para quien acompaña a adolescentes creando dentro del universo Roblox.",
      sections: [
        {
          label: "Escenas reales de cuidado y mediación",
          items: [
            {
              kicker: "Brasília",
              title: "Las familias entraron en la conversación, no quedaron al margen",
              body: "En la activación de Brasília, la ruta práctica ocurrió en paralelo a una conversación conducida por Elizabeth Milovidov sobre creación digital, seguridad, mediación y controles parentales, dando a la conversación un suelo social muy concreto.",
              image: { src: "/context-rail/brasilia-familias.jpg", alt: "Ronda de conversación con familias en Brasília", position: "center 42%" },
            },
            {
              kicker: "São Paulo",
              title: "Ver la creación ocurriendo cambia la percepción del programa",
              body: "En São Paulo, padres y responsables pudieron seguir la experiencia dentro del mismo espacio en que los jóvenes creaban. Eso volvió la propuesta tangible.",
              image: { src: "/context-rail/sao-paulo-lab.jpg", alt: "Participantes en São Paulo", position: "center 32%" },
            },
          ],
        },
        {
          label: "Por qué familias y educadores confían",
          items: [
            {
              kicker: "Rio de Janeiro",
              title: "Las alianzas locales dieron base social real al encuentro",
              body: "La primera parada en Río ocurrió con jóvenes movilizados por redes como ViDançar, Comunidade da Mangueira, Novas Vozes e Instituto Paramitas, dando al programa una capa de confianza mucho más concreta.",
              image: { src: "/context-rail/rio-42.jpg", alt: "Actividad de la Expedición en Rio de Janeiro", position: "center 44%" },
            },
            {
              kicker: "Visibilidad pública",
              title: "Prensa y presencia institucional vuelven el programa más legible",
              body: "En Río estuvo presente el secretario municipal de Ciencia y Tecnología. En Brasília, la cobertura de Correio Braziliense ayudó a dar forma pública a lo ocurrido. Señales así hacen el programa más legible para familias y educadores.",
              image: { src: "/context-rail/gamescom-palco.jpg", alt: "Momento público con mediación de la Expedición", position: "center 22%" },
            },
          ],
        },
        {
          label: "Lo que todavía puede entrar aquí",
          items: [
            {
              kicker: "Lenguaje público",
              title: "Posts recientes para mostrar tono y cercanía",
              body: "Aquí pueden entrar tres o cuatro contenidos recientes para mostrar cómo la Expedición habla con jóvenes, qué temas aparecen y qué clima de comunicación sostiene la comunidad.",
              placeholder: true,
            },
            {
              kicker: "Seguridad",
              title: "Actualización breve sobre controles y buenas prácticas",
              body: "Este espacio puede recibir un resumen corto sobre parental controls, seguridad y buenas prácticas con lenguaje directo para quien necesita orientación rápida.",
              placeholder: true,
            },
          ],
        },
      ],
      cards: [
        {
          kicker: "Confianza",
          title: "La claridad crece cuando el proceso se vuelve visible",
          body: "Familias y educadores entienden mejor la propuesta cuando consiguen ver creación, mediación y autoría ocurriendo de forma concreta.",
          actionLabel: "Ver guía para padres y educadores",
          modalLabel: "Guia para pais e educadores",
        },
      ],
    },
    journeyGuest: {
      eyebrow: "Tu jornada",
      title: "¿Cómo voy?",
      intro: "Cuando el creator entra, esta columna pasa a mostrar badges, pasos concluidos y lo que tiene sentido explorar después.",
      cards: [
        { icon: "target", kicker: "Progreso", title: "Badges conquistados", body: "Memoria de los badges del programa, con lo que ya se alcanzó y lo que aún falta desbloquear." },
        { icon: "stair", kicker: "Siguiente paso", title: "Misiones en curso", body: "Espacio para la próxima etapa de la jornada, con orientación corta y accionable." },
        { icon: "compass", kicker: "Ritmo", title: "Tu camino en el programa", body: "La columna puede ayudar al creator a entender dónde está y qué vale la pena explorar después." },
      ],
    },
  },
};

const responsaveisDocIcons = {
  responsaveis: ["home", "laptop", "book-open"],
  educadores: ["book-open", "classroom", "pathway"],
};

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
  const [idStep, setIdStep] = useState("username"); // "username" | "confirm" | "details"
  const [resolvedHandle, setResolvedHandle] = useState("");
  const [resolvedDisplayName, setResolvedDisplayName] = useState("");
  const [resolvedId, setResolvedId] = useState(null);
  const [resolvedThumbnailUrl, setResolvedThumbnailUrl] = useState("");
  const [robloxValidating, setRobloxValidating] = useState(false);
  const [robloxError, setRobloxError] = useState("");
  const [userAge, setUserAge] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regBirthday, setRegBirthday] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [qDev, setQDev] = useState(null);
  const [pcTest, setPcTest] = useState(null); // null | "running" | "capable" | "weak"
  const [tab, setTab] = useState("sobre");
  const [sub, setSub] = useState("main");
  const [journeyDevice, setJourneyDevice] = useState(null);
  const [journeyView, setJourneyView] = useState("inline");
  const [ecoOpen, setEcoOpen] = useState(null);
  const [ecoSubOpen, setEcoSubOpen] = useState(null);
  const [modal, setModal] = useState(null);
  const [audience, setAudience] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 880);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuIntroActive, setMobileMenuIntroActive] = useState(false);
  const [mobileMenuIntroHighlight, setMobileMenuIntroHighlight] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileSectionTitleVisible, setMobileSectionTitleVisible] = useState(false);
  const activeJourneyDetailRef = useRef(null);
  const [mobileJourneyStep, setMobileJourneyStep] = useState(null);
  const [journeyDrawerOpen, setJourneyDrawerOpen] = useState(false);
  const responsaveisMediaRef = useRef(null);
  const responsaveisCommunityRef = useRef(null);
  const contentShellRef = useRef(null);
  const rightRailRef = useRef(null);
  const videoModalFrameRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("hublox-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (creatorSession) localStorage.setItem("hublox-creator-session", JSON.stringify(creatorSession));
  }, [creatorSession]);

  useEffect(() => {
    if (!creatorSession?.birthday) { setUserAge(null); return; }
    const birth = new Date(creatorSession.birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    setUserAge(age);
  }, [creatorSession?.birthday]);

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

  const resetIdFlow = () => {
    setRobloxHandle("");
    setIdStep("username");
    setResolvedHandle("");
    setResolvedDisplayName("");
    setResolvedId(null);
    setResolvedThumbnailUrl("");
    setRobloxError("");
    setRobloxValidating(false);
    setRegEmail("");
    setRegBirthday("");
    setPais("");
    setEstado("");
    setRegisterLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("hublox-creator-session");
    localStorage.removeItem("hublox-eco-progress");
    localStorage.removeItem("hublox-achievements");
    setCreatorSession(null);
    setEcoProgress({ viewed: {}, done: {}, pending: {} });
    setAchievements({});
    setUserAge(null);
    setWelcomeBack(false);
    resetIdFlow();
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
    if (!isMobile && mobileMenuOpen) setMobileMenuOpen(false);
  }, [isMobile, mobileMenuOpen]);

  useEffect(() => {
    if (!isMobile || screen !== "hub") return undefined;
    if (localStorage.getItem("hublox-mobile-menu-intro-seen")) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      localStorage.setItem("hublox-mobile-menu-intro-seen", "1");
      return undefined;
    }

    let cancelled = false;
    const timers = [];
    const schedule = (fn, delay) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, delay);
      timers.push(id);
    };

    schedule(() => {
      setMobileMenuIntroActive(true);
      setMobileMenuOpen(true);
    }, 350);
    schedule(() => {
      setMobileMenuIntroHighlight("sobre");
    }, 1100);
    schedule(() => {
      setMobileMenuOpen(false);
    }, 2450);
    schedule(() => {
      setMobileMenuIntroActive(false);
      setMobileMenuIntroHighlight(null);
      localStorage.setItem("hublox-mobile-menu-intro-seen", "1");
    }, 2850);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isMobile, screen]);

  useEffect(() => {
    if (!isMobile) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : prevOverflow || "";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobile, mobileMenuOpen]);

  useEffect(() => {
    if (!isMobile || screen !== "hub") {
      setMobileSectionTitleVisible(false);
      return undefined;
    }

    const onScroll = () => {
      setMobileSectionTitleVisible(window.scrollY > 110);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, screen, tab, sub, journeyView, audience, journeyDevice]);

  useEffect(() => {
    if (!isMobile || tab !== "jornada" || !creatorSession || !journeyDevice) {
      setJourneyDrawerOpen(false);
    }
  }, [isMobile, tab, creatorSession, journeyDevice]);

  useEffect(() => {
    if (isMobile || tab !== "jornada" || sub === "main" || !activeJourneyDetailRef.current) return;
    activeJourneyDetailRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isMobile, sub, tab]);

  useEffect(() => {
    if (sub === "mob") setJourneyDevice("mobile");
    if (sub === "bilde" || sub === "tut") setJourneyDevice("computer");
  }, [sub]);

  useEffect(() => {
    if (tab !== "pais" && audience !== null) {
      setAudience(null);
    }
  }, [tab, audience]);

  const resetHubScrolls = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (contentShellRef.current) contentShellRef.current.scrollTop = 0;
    if (rightRailRef.current) rightRailRef.current.scrollTop = 0;
  };

  const API_URL = import.meta.env.VITE_API_URL || "https://roblox-api.mastertech.com.br";

  async function validateRobloxHandle(handle) {
    setRobloxValidating(true);
    setRobloxError("");
    try {
      const res = await fetch(`${API_URL}/api/roblox/user/?username=${encodeURIComponent(handle)}`);
      if (!res.ok) throw new Error("api_error");
      const data = await res.json();
      if (!data.found) {
        setRobloxError(t.id.notFound || "Usuário não encontrado no Roblox. Verifique o username.");
        return;
      }
      setResolvedHandle(data.name);
      setResolvedDisplayName(data.displayName || data.name);
      setResolvedId(data.id);
      setResolvedThumbnailUrl(data.thumbnailUrl || "");
      setIdStep("confirm");
    } catch {
      setRobloxError(t.id.noConnection || "Sem conexão. Verifique sua internet e tente novamente.");
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
        avatar_url: resolvedThumbnailUrl,
        ...(email ? { email } : {}),
        ...(birthday ? { birthday } : {}),
        ...(country ? { country } : {}),
        ...(state ? { state } : {}),
        ...getStoredUtms(),
      };
      const res = await fetch(`${API_URL}/api/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("register_failed");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submit",
        form_id: "hublox-cadastro",
        roblox_username: resolvedHandle.toLowerCase(),
        ...getStoredUtms(),
      });
      let displayName = resolvedDisplayName;
      let avatarUrl = resolvedThumbnailUrl;
      let sessionBirthday = birthday || "";
      try {
        const meRes = await fetch(`${API_URL}/api/user/me/?roblox_id=${resolvedId}`);
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.found) {
            if (me.display_name) displayName = me.display_name;
            if (me.avatar_url) avatarUrl = me.avatar_url;
            if (me.birthday) sessionBirthday = me.birthday;
            if (me.age != null) setUserAge(me.age);
          }
        }
      } catch { /* non-blocking */ }
      setCreatorSession({ handle: resolvedHandle, displayName, avatarUrl, birthday: sessionBirthday, pais: country || "", estado: state || "" });
      runLoading(() => setScreen("hub"));
    } catch {
      setRobloxError(t.id.saveError || "Erro ao salvar. Tente novamente.");
    } finally {
      setRegisterLoading(false);
    }
  }

  const runLoading = (cb, duration = 900) => {
    setLoading(true);
    cb();
    resetHubScrolls();
    setTimeout(() => setLoading(false), duration);
  };

  const runSectionLoading = (cb, duration = 420) => {
    setLoading(true);
    cb();
    resetHubScrolls();
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

  const canSeePais = userAge === null || userAge >= 23;
  const activeNav = [
    { key: "sobre", ...t.nav.sobre },
    { key: "eco", ...t.nav.eco },
    ...(canSeePais ? [{ key: "pais", ...t.nav.pais }] : []),
    { key: "jornada", ...t.nav.jornada },
  ];

  const mobileSectionTitle = activeNav.find((item) => item.key === tab)?.label || "";
  const creatorBadgeLabel = creatorSession?.handle
    ? creatorSession.handle
      .replace(/[_\-\.]+/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
    : "";

  const journeyDrawerCopy = {
    pt: {
      button: "Minha jornada",
      kicker: "Área logada",
      title: "Sua jornada",
      close: "Fechar painel",
      summaryTitle: "Seu momento agora",
    },
    en: {
      button: "My journey",
      kicker: "Logged area",
      title: "Your journey",
      close: "Close panel",
      summaryTitle: "Where you are now",
    },
    es: {
      button: "Mi jornada",
      kicker: "Área iniciada",
      title: "Tu jornada",
      close: "Cerrar panel",
      summaryTitle: "Tu momento ahora",
    },
  }[lang];

  const canOpenJourneyDrawer =
    isMobile && tab === "jornada" && !!journeyDevice;

  const showJourneyMascot =
    tab === "jornada" && (!isMobile || !!journeyDevice);

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

  const navigateHub = (nextTab) =>
    runLoading(() => {
      setMobileMenuOpen(false);
      setTab(nextTab);
      setSub("main");
      setJourneyView("inline");
      setJourneyDevice(null);
    });

  const cycleLang = () => {
    const currentIndex = langOrder.indexOf(lang);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % langOrder.length : 0;
    setLang(langOrder[nextIndex]);
  };

  const expeditionSectionActions = {
    pt: {
      1: {
        button: "Ir para Jornada",
        kicker: "Navegação interna",
        title: "Quer abrir a Jornada agora?",
        body: "Isso vai mudar você da Expedição para a Jornada, ainda dentro do hub. Você pode abrir essa seção agora ou continuar na Expedição.",
        confirm: "Abrir Jornada",
        stay: "Continuar na Expedição",
        targetTab: "jornada",
        theme: "dark",
      },
      2: {
        button: "Ir para Ecossistema",
        kicker: "Navegação interna",
        title: "Quer abrir o Ecossistema agora?",
        body: "Isso vai mudar você da Expedição para o Ecossistema, ainda dentro do hub. Você pode abrir essa seção agora ou continuar na Expedição.",
        confirm: "Abrir Ecossistema",
        stay: "Continuar na Expedição",
        targetTab: "eco",
        theme: "yellow",
      },
      3: {
        button: "Ir para Comunidade",
        kicker: "Saindo do hub",
        title: "Quer ir para a comunidade no Discord?",
        body: "Esse botão redireciona você para a comunidade da Expedição no Discord, fora deste site. Você pode seguir agora ou continuar na Expedição.",
        confirm: "Abrir comunidade",
        stay: "Continuar na Expedição",
        label: "Comunidade no Discord",
        theme: "purple",
      },
    },
    en: {
      1: {
        button: "Go to Journey",
        kicker: "Internal navigation",
        title: "Do you want to open Journey now?",
        body: "This will move you from Expedition to Journey, still inside the hub. You can open that section now or stay in Expedition.",
        confirm: "Open Journey",
        stay: "Stay in Expedition",
        targetTab: "jornada",
        theme: "dark",
      },
      2: {
        button: "Go to Ecosystem",
        kicker: "Internal navigation",
        title: "Do you want to open Ecosystem now?",
        body: "This will move you from Expedition to Ecosystem, still inside the hub. You can open that section now or stay in Expedition.",
        confirm: "Open Ecosystem",
        stay: "Stay in Expedition",
        targetTab: "eco",
        theme: "yellow",
      },
      3: {
        button: "Go to Community",
        kicker: "Leaving the hub",
        title: "Do you want to go to the Discord community?",
        body: "This will redirect you to the Expedition community on Discord, outside this site. You can continue now or stay in Expedition.",
        confirm: "Open community",
        stay: "Stay in Expedition",
        label: "Comunidade no Discord",
        theme: "purple",
      },
    },
    es: {
      1: {
        button: "Ir a Jornada",
        kicker: "Navegación interna",
        title: "¿Quieres abrir la Jornada ahora?",
        body: "Esto te cambia de Expedición a Jornada, todavía dentro del hub. Puedes abrir esa sección ahora o seguir en Expedición.",
        confirm: "Abrir Jornada",
        stay: "Seguir en Expedición",
        targetTab: "jornada",
        theme: "dark",
      },
      2: {
        button: "Ir a Ecosistema",
        kicker: "Navegación interna",
        title: "¿Quieres abrir el Ecosistema ahora?",
        body: "Esto te cambia de Expedición a Ecosistema, todavía dentro del hub. Puedes abrir esa sección ahora o seguir en Expedición.",
        confirm: "Abrir Ecosistema",
        stay: "Seguir en Expedición",
        targetTab: "eco",
        theme: "yellow",
      },
      3: {
        button: "Ir a Comunidad",
        kicker: "Saliendo del hub",
        title: "¿Quieres ir a la comunidad en Discord?",
        body: "Esto te redirige a la comunidad de la Expedición en Discord, fuera de este sitio. Puedes seguir ahora o continuar en Expedición.",
        confirm: "Abrir comunidad",
        stay: "Seguir en Expedición",
        label: "Comunidade no Discord",
        theme: "purple",
      },
    },
  }[lang];

  const logoutDialogCopy = {
    pt: {
      kicker: "Sair da conta",
      title: "Quer encerrar sua sessão?",
      body: "Você volta para a entrada do hub e limpa o progresso salvo desta conta neste aparelho.",
      stay: "Continuar aqui",
      confirm: "Sair da conta",
    },
    en: {
      kicker: "Log out",
      title: "Do you want to leave your session?",
      body: "You will return to the hub entry and clear this account's saved progress on this device.",
      stay: "Stay here",
      confirm: "Log out",
    },
    es: {
      kicker: "Cerrar sesión",
      title: "¿Quieres cerrar tu sesión?",
      body: "Volverás a la entrada del hub y se limpiará el progreso guardado de esta cuenta en este dispositivo.",
      stay: "Seguir aquí",
      confirm: "Cerrar sesión",
    },
  }[lang];

  const icon = (name, color = "currentColor") => <Icon name={name} color={color} />;

  const detailProps = (kind) => {
    const map = {
      mob: { accent: palette.yellowText, dict: t.detail.mob, actionTheme: "yellow", modalLabel: "Studio mobile", loopVideo: "/uploads/studiomobile-loop.mp4" },
      bilde: { accent: palette.red, dict: t.detail.bilde, actionTheme: "", modalLabel: "Roblox Studio", loopVideo: "/uploads/bilde-loop.mp4" },
      tut: { accent: palette.blue, dict: t.detail.tut, actionTheme: "", modalLabel: "Roblox Studio", loopVideo: "/uploads/plugin-loop.mp4" },
    };
    return map[kind];
  };

  const openExpeditionSectionModal = (config) => {
    setModal({
      kind: "section-nav",
      ...config,
    });
  };

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  const openVideoModal = (payload) => {
    setVideoModal(payload);
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
        onOpenVideo={() => openVideoModal({ kind: "file", src: p.loopVideo, title: p.dict.title })}
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
  const railContent = CONTEXT_RAIL_I18N[lang] || CONTEXT_RAIL;
  const showRightRail = !isMobile && (
    tab === "sobre" ||
    tab === "eco" ||
    (tab === "pais" && !!audience) ||
    (tab === "jornada" && !!creatorSession && !!journeyDevice)
  );

  const renderAchievementClusters = () => (
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
              color: cluster.style.textColor,
              borderColor: cluster.style.borderColor,
            }}
          >
            <div className="sa-cluster-head">
              <h3 className="sa-cluster-name" style={{ color: cluster.style.titleColor }}>
                {clusterText.name}
              </h3>
              <span
                className="sa-cluster-tag"
                style={{
                  color: cluster.style.textColor,
                  borderColor: cluster.style.borderColor,
                }}
              >
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
                      {!earned && (
                        <span className="sa-lock sa-lock-badge" aria-hidden="true">
                          <Icon name="lock" color="#E31837" />
                        </span>
                      )}
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
                        <span className="sa-label">{label}</span>
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
  );

  return (
    <div className="app-root">
      <LoadingOverlay loading={loading} hub={screen === "hub"} />
      {screen !== "hub" && <LangSwitch lang={lang} setLang={setLang} />}

      {screen === "entry" && (
        <div className="entry-page dark-shell">
          <section className="entry-shell">
            <div className="entry-card">
              <EntryLogos />
              <div className="entry-reach">{t.common.reach}</div>
              <h1 className="entry-title">
                {t.entry.title.map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </h1>
              <p className="entry-text">{t.entry.p1}</p>
              <p className="entry-text strong">{t.entry.p2}</p>
              <button
                className="cta cta-red"
                onClick={() => {
                  if (creatorSession) {
                    toHub("sobre");
                    return;
                  }
                  runLoading(() => {
                    resetCreatorQ();
                    resetIdFlow();
                    setScreen("creator-id");
                  });
                }}
              >
                <span>{t.entry.cta}</span>
                <span className="cta-badge">→</span>
              </button>
            </div>
          </section>
          <footer className="entry-footer">
            <div className="entry-footer-inner">
              <strong>{t.entry.p3}</strong>
              <span>{t.entry.footnote}</span>
            </div>
          </footer>
        </div>
      )}

      {screen === "anamnese" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <EntryLogos />
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
            <EntryLogos />
            <button className="back-link" onClick={() => runLoading(() => setScreen("entry"))}>{t.common.back}</button>

            <h1 className="id-heading">{t.id.heading}</h1>
            <p className="entry-text id-intro">{t.id.intro}</p>

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
              <span>{robloxValidating ? t.id.verifying : t.id.continue}</span>
              <span className="cta-badge">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "creator-id" && idStep === "confirm" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <EntryLogos />
            <button className="back-link" onClick={() => { setIdStep("username"); setRobloxError(""); }}>{t.common.back}</button>

            <div className="id-confirm-card">
              <p className="id-confirm-eyebrow">{t.id.foundUser}</p>
              <div className="id-confirm-avatar">
                {resolvedThumbnailUrl
                  ? <img src={resolvedThumbnailUrl} alt={resolvedDisplayName} />
                  : (resolvedDisplayName || resolvedHandle).charAt(0).toUpperCase()
                }
              </div>
              <div className="id-confirm-display">{resolvedDisplayName}</div>
              <div className="id-confirm-handle">@{resolvedHandle}</div>
              <p className="id-confirm-question">{t.id.isYou}</p>
              <div className="id-confirm-actions">
                <button
                  className="id-confirm-no"
                  onClick={() => { setIdStep("username"); setRobloxError(""); }}
                >
                  {t.id.noCorrect}
                </button>
                <button
                  className="id-confirm-yes cta cta-red"
                  disabled={registerLoading}
                  onClick={async () => {
                    setRobloxHandle(resolvedHandle);
                    setRegisterLoading(true);
                    try {
                      const res = await fetch(`${API_URL}/api/user/check/?roblox_id=${resolvedId}&roblox_username=${encodeURIComponent(resolvedHandle)}`);
                      const data = await res.json();
                      if (data.exists) {
                        let displayName = resolvedDisplayName;
                        let avatarUrl = resolvedThumbnailUrl;
                        let birthday = "";
                        let pais = "";
                        let estado = "";
                        try {
                          const meRes = await fetch(`${API_URL}/api/user/me/?roblox_id=${resolvedId}`);
                          if (meRes.ok) {
                            const me = await meRes.json();
                            if (me.found) {
                              if (me.display_name) displayName = me.display_name;
                              if (me.avatar_url) avatarUrl = me.avatar_url;
                              if (me.birthday) birthday = me.birthday;
                              if (me.country_code) pais = me.country_code;
                              if (me.state) estado = me.state;
                              if (me.age != null) setUserAge(me.age);
                            }
                          }
                        } catch { /* non-blocking: proceed with resolved data */ }
                        setCreatorSession({ handle: resolvedHandle, displayName, avatarUrl, birthday, pais, estado });
                        runLoading(() => setScreen("hub"));
                      } else {
                        setIdStep("details");
                      }
                    } catch {
                      setRobloxError(t.id.noConnection || "Erro ao verificar. Tente novamente.");
                      setIdStep("username");
                    } finally {
                      setRegisterLoading(false);
                    }
                  }}
                >
                  {registerLoading ? t.id.verifying : t.id.yesMe}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === "creator-id" && idStep === "details" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <EntryLogos />
            <button className="back-link" onClick={() => setIdStep("confirm")}>{t.common.back}</button>

            <h1 className="id-heading">{t.id.heading}</h1>
            <p className="entry-text id-intro">{t.id.intro}</p>

            <div className="id-roblox-preview">
              <div className="id-roblox-preview-avatar">
                {resolvedThumbnailUrl
                  ? <img src={resolvedThumbnailUrl} alt={resolvedDisplayName} />
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
                <label className="id-label" htmlFor="id-email">{t.id.emailLabel}</label>
                <input
                  id="id-email"
                  className="id-input"
                  type="email"
                  autoComplete="email"
                  placeholder={t.id.emailPlaceholder}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="id-field">
                <label className="id-label" htmlFor="id-birthday">{t.id.birthdayLabel}</label>
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
              disabled={!regBirthday || !pais || (statesByCountry[pais] && !estado) || registerLoading}
              onClick={() => registerWithRoblox({ email: regEmail, birthday: regBirthday, country: pais, state: estado })}
            >
              <span>{registerLoading ? (t.id.saving || "Salvando...") : t.id.continue}</span>
              <span className="cta-badge">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "creator-q" && (
        <section className="entry-shell dark-shell">
          <div className="entry-card">
            <EntryLogos />
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
        <div className="hub-frame">
          <div className={`hub-shell ${isMobile ? "mobile" : ""}`}>
            {!isMobile && (
              <aside className="sidebar">
                <div className="sidebar-logo">
                  <EntryLogos />
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
                  {creatorSession && (
                    <div className="sidebar-user">
                      <div className="sidebar-user-avatar">
                        {creatorSession.avatarUrl
                          ? <img src={creatorSession.avatarUrl} alt={creatorSession.displayName || creatorSession.handle} onError={(e) => { e.target.style.display = "none"; }} />
                          : (creatorSession.displayName || creatorSession.handle || "?").charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="sidebar-user-info">
                        <span className="sidebar-user-display">{creatorSession.displayName || creatorSession.handle}</span>
                        <span className="sidebar-user-handle">@{creatorSession.handle}</span>
                      </div>
                    </div>
                  )}
                  <button
                    className="sidebar-exit"
                    onClick={creatorSession ? logout : () => runLoading(() => setScreen("entry"))}
                  >
                    <span className="sidebar-exit-icon">{icon("logout", "rgba(255,255,255,.9)")}</span>
                    <span>{creatorSession ? t.account.logout : t.common.exit}</span>
                  </button>
                </div>
              </aside>
            )}

            <main className="main-panel">
            {welcomeBack && creatorSession && (
              <div className="welcome-back" role="status" onClick={() => setWelcomeBack(false)}>
                <span>{t.account.welcomeBack} <strong>@{creatorSession.handle}</strong></span>
                <button className="welcome-back-close" aria-label={t.common.close} onClick={(e) => { e.stopPropagation(); setWelcomeBack(false); }}>✕</button>
              </div>
            )}
            {isMobile && (
              <>
                <header className="mobile-topbar">
                  <div className="mobile-head">
                    <button
                      className={`mobile-speed-dial-toggle topbar ${mobileMenuOpen ? "open" : ""}`}
                      aria-label={mobileMenuOpen ? t.common.closeMenu : t.common.openMenu}
                      aria-expanded={mobileMenuOpen}
                      onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                      {icon(mobileMenuOpen ? "close" : "menu", "#FFFFFF")}
                    </button>
                    <div className="mobile-head-actions">
                      <button
                        className="mobile-lang-cycle"
                        type="button"
                        onClick={cycleLang}
                        aria-label={`Switch language from ${langLabels[lang]}`}
                      >
                        {langLabels[lang]}
                      </button>
                      <button
                        className="mobile-logout-toggle"
                        type="button"
                        onClick={() => setLogoutConfirmOpen(true)}
                        aria-label={t.account.logout}
                      >
                        {icon("logout", "#FFFFFF")}
                      </button>
                    </div>
                    <div className="mobile-brand">
                      <EntryLogos />
                    </div>
                  </div>
                </header>

                <div
                  className={`mobile-speed-dial-backdrop ${mobileMenuOpen ? "open" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className={`mobile-speed-dial ${mobileMenuOpen ? "open" : ""} ${mobileMenuIntroActive ? "intro-active" : ""}`} aria-hidden={!mobileMenuOpen}>
                  <div className="mobile-speed-dial-menu">
                    {activeNav.map((item, index) => (
                      <button
                        key={item.key}
                        className={`mobile-speed-item ${tab === item.key ? "active" : ""} ${mobileMenuIntroHighlight === item.key ? "intro-highlight" : ""}`}
                        onClick={() => navigateHub(item.key)}
                        style={{ "--speed-index": index }}
                      >
                        <span className="mobile-speed-item-label">
                          <strong>{item.label}</strong>
                          <small>{item.subtitle}</small>
                        </span>
                        <span className="mobile-speed-item-icon">
                          {icon(navIcon(item.key), tab === item.key ? "#FFFFFF" : "#0D1117")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`mobile-section-sticky-bar ${mobileSectionTitleVisible ? "visible" : ""}`}>
                  <span className="mobile-section-sticky-copy">
                    <span>{mobileSectionTitle}</span>
                    {tab === "jornada" && creatorSession && (
                      <span className="mobile-section-live-indicator" aria-hidden="true" />
                    )}
                  </span>
                </div>
              </>
            )}

            <div className="main-layout">
              <div className="content-shell" ref={contentShellRef}>
                {tab === "jornada" && journeyView === "detail" && sub !== "main" && (
                <section>
                  {sub === "mob" && renderDetail("mob", { inline: false, onBack: () => runSectionLoading(() => { setJourneyView("inline"); setSub("main"); }) })}
                  {sub === "bilde" && renderDetail("bilde", { inline: false, onBack: () => runSectionLoading(() => { setJourneyView("inline"); setSub("main"); }) })}
                  {sub === "tut" && renderDetail("tut", { inline: false, onBack: () => runSectionLoading(() => { setJourneyView("inline"); setSub("main"); }) })}
                </section>
              )}

              {tab === "jornada" && journeyView === "inline" && (
                <section className="journey-page">
                  <div className="journey-page-hero">
                    <div className="journey-page-copy">
                      <ReachBadge text={t.common.reach} />
                      <h2 className="page-title">{t.journey.pageTitle}</h2>
                      <p className="page-subtitle">{t.journey.pageSubtitle}</p>
                    </div>
                    {showJourneyMascot ? (
                      canOpenJourneyDrawer ? (
                        <button
                          type="button"
                          className="journey-page-mascot journey-page-mascot-button"
                          onClick={() => setJourneyDrawerOpen(true)}
                          aria-label={journeyDrawerCopy.button}
                        >
                          <span className="journey-page-mascot-icon"><LogoMark /></span>
                          <span className="journey-page-mascot-note">{t.journey.mascotFollow}</span>
                        </button>
                      ) : (
                        <div className="journey-page-mascot" aria-hidden="true">
                          <span className="journey-page-mascot-icon"><LogoMark /></span>
                          <span className="journey-page-mascot-note">{t.journey.mascotFollow}</span>
                        </div>
                      )
                    ) : null}
                  </div>

                  <div
                    className={`device-switch ${isMobile && journeyDevice ? "compact-mobile" : ""}`}
                    role="tablist"
                    aria-label={t.journey.deviceAria}
                  >
                    <button
                      className={`device-switch-option ${journeyDevice === "mobile" ? "active yellow" : ""}`}
                      onClick={() => runSectionLoading(() => {
                        setJourneyDevice("mobile");
                        setMobileJourneyStep(null);
                        setSub("main");
                      })}
                    >
                      <span className="device-switch-icon">{icon("mobile", journeyDevice === "mobile" ? palette.yellowText : "#8A8A8A")}</span>
                      <span className="device-switch-copy">
                        <strong>{t.journey.deviceMobileStrong}</strong>
                        <small>{t.journey.deviceMobileSmall}</small>
                      </span>
                    </button>
                    <button
                      className={`device-switch-option ${journeyDevice === "computer" ? "active dark" : ""}`}
                      onClick={() => runSectionLoading(() => {
                        setJourneyDevice("computer");
                        setMobileJourneyStep(null);
                        setSub("main");
                      })}
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

                  {journeyDevice && isMobile && (
                    <div className={`journey-mobile-flow ${mobileJourneyStep ? "has-active-step" : ""}`}>
                      {[
                        { id: "1", tag: t.journey.labelMobile, title: `${t.journey.stepLabel} 1` },
                        { id: "2", tag: t.publish.kicker, title: `${t.journey.stepLabel} 2` },
                        { id: "3", tag: t.community.kicker, title: `${t.journey.stepLabel} 3` },
                      ]
                        .filter((step) => !mobileJourneyStep || Number(step.id) <= Number(mobileJourneyStep))
                        .map((step) => (
                          <div
                            key={step.id}
                            className={`journey-mobile-step-shell step-${step.id} ${mobileJourneyStep === step.id ? "open" : ""} ${!mobileJourneyStep ? "is-initial" : ""}`}
                          >
                            <button
                              className="journey-mobile-step-header"
                              onClick={() => {
                                setSub("main");
                                setMobileJourneyStep((prev) => (prev === step.id ? null : step.id));
                              }}
                            >
                              <span className="journey-mobile-step-headgroup">
                                <span className="journey-mobile-step-title">{step.title}</span>
                                <span className="journey-mobile-step-tag">{step.tag}</span>
                              </span>
                              <span className="journey-mobile-step-chevron" aria-hidden="true">
                                {mobileJourneyStep === step.id ? "∧" : "∨"}
                              </span>
                            </button>
                            {mobileJourneyStep === step.id && (
                              <div className="journey-mobile-step-content">
                                {step.id === "1" && (
                                  journeyDevice === "mobile" ? (
                                    <div className="journey-node">
                                      <JourneyCard
                                        accent="yellow"
                                        kicker={t.journey.cardMobile.kicker}
                                        title={t.journey.cardMobile.title}
                                        body={t.journey.cardMobile.body}
                                        note={t.journey.cardMobile.note}
                                        hideKicker
                                        open={sub === "mob"}
                                        onClick={() => setSub(sub === "mob" ? "main" : "mob")}
                                      />
                                      {sub === "mob" && (
                                        <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                                          {renderDetail("mob", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                                        </InlineJourneyDetail>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <div className="journey-node">
                                        <JourneyCard
                                          accent="red"
                                          kicker={t.journey.cardBilde.kicker}
                                          title={t.journey.cardBilde.title}
                                          body={t.journey.cardBilde.body}
                                          note={t.journey.cardBilde.note}
                                          hideKicker
                                          open={sub === "bilde"}
                                          onClick={() => setSub(sub === "bilde" ? "main" : "bilde")}
                                        />
                                        {sub === "bilde" && (
                                          <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                                            {renderDetail("bilde", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                                          </InlineJourneyDetail>
                                        )}
                                      </div>

                                      <div className="journey-node journey-node-separator">
                                        <div className="or-separator"><span>{t.journey.or}</span></div>
                                      </div>

                                      <div className="journey-node">
                                        <JourneyCard
                                          accent="blue"
                                          kicker={t.journey.cardTut.kicker}
                                          title={t.journey.cardTut.title}
                                          body={t.journey.cardTut.body}
                                          note={t.journey.cardTut.note}
                                          hideKicker
                                          open={sub === "tut"}
                                          onClick={() => setSub(sub === "tut" ? "main" : "tut")}
                                        />
                                        {sub === "tut" && (
                                          <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                                            {renderDetail("tut", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                                          </InlineJourneyDetail>
                                        )}
                                      </div>
                                    </>
                                  )
                                )}
                                {step.id === "2" && (
                                  <PublishJourneyCard dict={t.publish} hideKicker onClick={() => setModal({ label: "Roblox" })} />
                                )}
                                {step.id === "3" && (
                                  <CommunityJourneyCard dict={t.community} hideKicker onClick={() => setModal({ label: "Comunidade no Discord" })} />
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {mobileJourneyStep && (
                        <div className="journey-mobile-step-dock">
                          {[
                            { id: "1", tag: t.journey.labelMobile, title: `${t.journey.stepLabel} 1` },
                            { id: "2", tag: t.publish.kicker, title: `${t.journey.stepLabel} 2` },
                            { id: "3", tag: t.community.kicker, title: `${t.journey.stepLabel} 3` },
                          ]
                            .filter((step) => Number(step.id) > Number(mobileJourneyStep))
                            .map((step) => (
                              <button
                                key={step.id}
                                className={`journey-mobile-step-dock-item step-${step.id}`}
                                onClick={() => {
                                  setSub("main");
                                  setMobileJourneyStep(step.id);
                                }}
                              >
                                <span className="journey-mobile-step-dock-headgroup">
                                  <span className="journey-mobile-step-dock-title">{step.title}</span>
                                  <span className="journey-mobile-step-dock-tag">{step.tag}</span>
                                </span>
                                <span className="journey-mobile-step-dock-chevron" aria-hidden="true">∨</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {journeyDevice && !isMobile && (
                    <div className="journey-stack">
                      {journeyDevice === "mobile" && (
                        <div className="journey-step">
                          <div className="journey-step-label">{t.journey.stepLabel} 1</div>
                          <div className="journey-node">
                            <JourneyCard
                              accent="yellow"
                              kicker={t.journey.cardMobile.kicker}
                              title={t.journey.cardMobile.title}
                              body={t.journey.cardMobile.body}
                              note={t.journey.cardMobile.note}
                              open={sub === "mob"}
                              onClick={() => setSub(sub === "mob" ? "main" : "mob")}
                            />
                            {sub === "mob" && (
                              <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                                {renderDetail("mob", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                              </InlineJourneyDetail>
                            )}
                          </div>
                        </div>
                      )}

                      {journeyDevice === "computer" && (
                        <>
                        <div className="journey-step">
                          <div className="journey-step-label">{t.journey.stepLabel} 1</div>
                          <div className="journey-node">
                            <JourneyCard
                              accent="red"
                              kicker={t.journey.cardBilde.kicker}
                              title={t.journey.cardBilde.title}
                              body={t.journey.cardBilde.body}
                              note={t.journey.cardBilde.note}
                              open={sub === "bilde"}
                              onClick={() => setSub(sub === "bilde" ? "main" : "bilde")}
                            />
                            {sub === "bilde" && (
                              <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                                {renderDetail("bilde", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                              </InlineJourneyDetail>
                            )}
                          </div>
                        </div>

                        <div className="journey-node journey-node-separator">
                          <div className="or-separator"><span>{t.journey.or}</span></div>
                        </div>

                        <div className="journey-step">
                          <div className="journey-step-label">{t.journey.stepLabel} 2</div>
                          <div className="journey-node">
                            <JourneyCard
                              accent="blue"
                              kicker={t.journey.cardTut.kicker}
                              title={t.journey.cardTut.title}
                              body={t.journey.cardTut.body}
                              note={t.journey.cardTut.note}
                              open={sub === "tut"}
                              onClick={() => setSub(sub === "tut" ? "main" : "tut")}
                            />
                            {sub === "tut" && (
                              <InlineJourneyDetail containerRef={activeJourneyDetailRef}>
                              {renderDetail("tut", { inline: true, onBack: () => runSectionLoading(() => setSub("main")) })}
                              </InlineJourneyDetail>
                            )}
                          </div>
                        </div>
                        </>
                      )}

                      <div className="journey-step">
                        <div className="journey-step-label">
                          {t.journey.stepLabel} {journeyDevice === "computer" ? "3" : "2"}
                        </div>
                        <div className="journey-node">
                          <PublishJourneyCard dict={t.publish} onClick={() => setModal({ label: "Roblox" })} />
                        </div>
                      </div>

                      <div className="journey-step">
                        <div className="journey-step-label">
                          {t.journey.stepLabel} {journeyDevice === "computer" ? "4" : "3"}
                        </div>
                        <div className="journey-node">
                          <CommunityJourneyCard dict={t.community} onClick={() => setModal({ label: "Comunidade no Discord" })} />
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {tab === "eco" && (
                <section>
                  <ReachBadge text={t.common.reach} />
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
                      <button className="small-action yellow ecosystem-cta-button" onClick={(e) => { e.stopPropagation(); runEcoAction("studiomob"); setModal({ label: "Studio mobile" }); }}>
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
                      <button className="small-action red ecosystem-cta-button" onClick={(e) => { e.stopPropagation(); markEco("roblox", "done"); setModal({ label: "Roblox" }); }}>
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
                      <button className="small-action purple ecosystem-cta-button discord-cta-button" onClick={(e) => { e.stopPropagation(); runEcoAction("comunidade"); setModal({ label: "Comunidade no Discord" }); }}>
                        {t.eco.comunidade.cta}
                      </button>
                      <EcoStatus item="comunidade" progress={ecoProgress} t={t} />
                    </div>
                  </AccordionCard>
                </section>
              )}

              {tab === "sobre" && (
                <section>
                  <ReachBadge text={t.common.reach} />
                  <h2 className="page-title">{t.sobre.pageTitle}</h2>
                  <VideoPreviewCard
                    src={heroVideo}
                    title={t.sobre.pageTitle}
                    frameAt={32}
                    onClick={() => openVideoModal({ kind: "file", src: heroVideo, title: t.sobre.pageTitle, orientation: isMobile ? "portrait" : "landscape" })}
                  />
                  <div className="sobre-list">
                    {t.sobre.sections.map((section, index) => (
                      <div key={index} className="sobre-item">
                        <div className="sobre-icon">{icon(sobreMeta[index].icon, sobreMeta[index].color)}</div>
                        <div className="sobre-copy">
                          <div className="sobre-kicker" style={{ color: sobreMeta[index].color }}>{section.kicker}</div>
                          {section.paragraphs.map((p, i) => (
                            <p key={`${index}-${i}`} className={`sobre-paragraph ${i === 0 ? "lead" : ""}`}>{p}</p>
                          ))}
                          {expeditionSectionActions[index] && (
                            <div className="sobre-cta-row">
                              <button
                                className={`sobre-cta-button ${expeditionSectionActions[index].theme}`}
                                onClick={() => openExpeditionSectionModal(expeditionSectionActions[index])}
                              >
                                <span className="sobre-cta-text">{expeditionSectionActions[index].button}</span>
                                <span className="sobre-cta-arrow" aria-hidden="true">→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

                {tab === "pais" && (() => {
                const aud = audience ? t.responsaveis.audiences[audience] : null;
                const media = audience ? responsaveisMedia[audience] : null;
                return (
                  <section>
                    <ReachBadge text={t.common.reach} />
                    <h2 className="page-title">{t.responsaveis.pageTitle}</h2>
                    <p className="page-subtitle wider">{t.responsaveis.pageSubtitle}</p>

                    <div className={`device-switch ${isMobile && audience ? "compact-mobile" : ""}`} role="tablist" aria-label={t.responsaveis.audienceAria}>
                      <button
                        className={`device-switch-option red ${audience === "responsaveis" ? "active" : ""}`}
                        onClick={() => {
                          if (audience === "responsaveis") return;
                          runSectionLoading(() => setAudience("responsaveis"));
                        }}
                      >
                        <span className="device-switch-icon">{icon("home", audience === "responsaveis" ? palette.red : "#8A8A8A")}</span>
                        <span className="device-switch-copy">
                          <strong>{t.responsaveis.toggleResp.strong}</strong>
                          <small>{t.responsaveis.toggleResp.small}</small>
                        </span>
                      </button>
                      <button
                        className={`device-switch-option blue ${audience === "educadores" ? "active" : ""}`}
                        onClick={() => {
                          if (audience === "educadores") return;
                          runSectionLoading(() => setAudience("educadores"));
                        }}
                      >
                        <span className="device-switch-icon">{icon("classroom", audience === "educadores" ? palette.blue : "#8A8A8A")}</span>
                        <span className="device-switch-copy">
                          <strong>{t.responsaveis.toggleEdu.strong}</strong>
                          <small>{t.responsaveis.toggleEdu.small}</small>
                        </span>
                      </button>
                    </div>

                    {aud && (
                      <>
                        <p className="resp-intro">{aud.intro}</p>

                        <div className="resp-group" ref={responsaveisMediaRef}>
                          <div className="resp-section-head">
                            <span className="resp-section-icon">
                              {icon("play", palette.red)}
                            </span>
                            <h3 className="resp-section-title">{t.responsaveis.videosLabel}</h3>
                          </div>
                          <div className="resp-video-grid">
                            {aud.videos.map((video, i) => (
                              <button
                                key={`${audience}-v-${i}`}
                                className="resp-video-card"
                                onClick={() => openVideoModal({ kind: "youtube", id: media.videos[i], title: video.title, orientation: isMobile ? "portrait" : "landscape" })}
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
                        </div>

                        <div className="resp-group">
                          <div className="resp-section-head">
                            <span className="resp-section-icon">
                              {icon("book-open", palette.blue)}
                            </span>
                            <h3 className="resp-section-title">{aud.docsLabel}</h3>
                          </div>
                          <div className={`resp-doc-list ${audience}`}>
                            {aud.docs.map((doc, i) => (
                              <button
                                key={`${audience}-d-${i}`}
                                className={`resp-doc-card ${audience}`}
                                onClick={() => window.open(media.docs[i], "_blank", "noopener,noreferrer")}
                              >
                                <span className="resp-doc-icon">
                                  {icon(responsaveisDocIcons[audience][i % responsaveisDocIcons[audience].length], audience === "responsaveis" ? palette.red : palette.blue)}
                                </span>
                                <span className="resp-doc-copy">
                                  <strong>{doc.title}</strong>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="resp-group">
                          <div className="resp-section-head">
                            <span className="resp-section-icon">
                              {icon(audience === "responsaveis" ? "compass" : "pathway", audience === "responsaveis" ? palette.red : palette.blue)}
                            </span>
                            <h3 className="resp-section-title">{aud.stepsLabel}</h3>
                          </div>
                          <div className="resp-steps">
                            {aud.steps.map((step, i) => (
                              <div key={i} className="resp-step">
                                <div className="resp-step-num">{String(i + 1).padStart(2, "0")}</div>
                                <div className="resp-step-title">{step.title}</div>
                                <div className="resp-step-body">{step.body}</div>
                              </div>
                            ))}
                          </div>
                          <div className="resp-next-actions">
                            <button
                              className="resp-whatsapp-band"
                              onClick={openWhatsApp}
                            >
                              <span className="resp-whatsapp-icon">
                                <img src="/whatsapp-icon.png" alt="WhatsApp" className="resp-whatsapp-icon-img" />
                              </span>
                              <span className="resp-whatsapp-copy">
                                <small>{t.responsaveis.stepCta.prompt}</small>
                                <strong>{t.responsaveis.stepCta.talk}</strong>
                              </span>
                            </button>
                            <p className="resp-whatsapp-note">{t.responsaveis.stepCta.note}</p>
                          </div>
                        </div>

                        <div className="resp-group resp-group-community" ref={responsaveisCommunityRef}>
                          <div className="resp-community-card">
                            <div className="resp-community-top">
                              <div className="card-kicker light">{t.responsaveis.community.kicker}</div>
                              <div className="community-title">{t.responsaveis.community.title}</div>
                              <p>{t.responsaveis.community.body}</p>
                            </div>
                            <div className="resp-community-bottom">
                              <div className="resp-community-note">{t.responsaveis.communityNote}</div>
                              <button className="small-action purple discord-cta-button" onClick={() => setModal({ label: "Comunidade no Discord" })}>
                                {t.responsaveis.community.button}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                );
                })()}
              </div>

              {showRightRail && (
                <aside className="right-rail" ref={rightRailRef}>
                  {tab === "jornada" && creatorSession ? (
                    <div className="rail-achievements">
                      <div className="sa-head">
                        <span className="sa-title">{t.achievements.title}</span>
                        <span className="sa-count">{earnedCount}/{ACHIEVEMENTS.length}</span>
                      </div>
                      {t.achievements.intro && (
                        <p className="sa-intro">{t.achievements.intro}</p>
                      )}
                      {renderAchievementClusters()}
                    </div>
                  ) : tab === "sobre" ? (
                    <ContextRailPanel
                      icon={icon}
                      content={railContent.expedition}
                      ui={t.ui}
                      onWhatsApp={openWhatsApp}
                      onAction={(card) => {
                        if (card.actionKey) runEcoAction(card.actionKey);
                        if (card.modalLabel) setModal({ label: card.modalLabel });
                      }}
                    />
                  ) : tab === "eco" ? (
                    <ContextRailPanel
                      icon={icon}
                      content={railContent.ecosystem}
                      ui={t.ui}
                      onWhatsApp={openWhatsApp}
                      onAction={(card) => {
                        if (card.actionKey) runEcoAction(card.actionKey);
                        if (card.modalLabel) setModal({ label: card.modalLabel });
                      }}
                    />
                  ) : tab === "pais" ? (
                    <ContextRailPanel
                      icon={icon}
                      content={railContent.parents}
                      ui={t.ui}
                      onWhatsApp={openWhatsApp}
                      onAction={(card) => {
                        if (card.actionKey) runEcoAction(card.actionKey);
                        if (card.modalLabel) setModal({ label: card.modalLabel });
                      }}
                    />
                  ) : (
                    <ContextRailPanel icon={icon} content={railContent.journeyGuest} ui={t.ui} onWhatsApp={openWhatsApp} />
                  )}
                </aside>
              )}
            </div>
            </main>
          </div>

          {!(isMobile && tab === "jornada") && (
            <footer className="hub-footer">
              <div className="hub-footer-inner">
                <strong>{t.common.footerTitle}</strong>
                <span>{t.common.footerNote}</span>
              </div>
            </footer>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="modal-kicker">{modal.kind === "section-nav" ? modal.kicker : t.modal.kicker}</div>
            <h3 className="modal-title">
              {modal.kind === "section-nav" ? modal.title : `${t.modal.openPrefix} ${modalName}${t.modal.openSuffix}`}
            </h3>
            <p className="modal-copy">
              {modal.kind === "section-nav"
                ? modal.body
                : externalLinks[modal.label]
                  ? t.modal.copyNew
                  : t.modal.copy}
            </p>
            <div className="modal-actions">
              <button
                className="modal-primary"
                onClick={() => {
                  if (modal.kind === "section-nav") {
                    if (modal.targetTab) {
                      setModal(null);
                      navigateHub(modal.targetTab);
                    } else {
                      const url = externalLinks[modal.label];
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                      setModal(null);
                    }
                    return;
                  }
                  const url = externalLinks[modal.label];
                  if (url) window.open(url, "_blank", "noopener,noreferrer");
                  setModal(null);
                }}
              >
                {modal.kind === "section-nav" ? modal.confirm : t.modal.continue}
              </button>
              <button className="modal-secondary" onClick={() => setModal(null)}>
                {modal.kind === "section-nav" ? modal.stay : t.modal.stay}
              </button>
            </div>
          </div>
        </div>
      )}

      {journeyDrawerOpen && canOpenJourneyDrawer && (
        <div className="modal-backdrop journey-drawer-backdrop" onClick={() => setJourneyDrawerOpen(false)}>
          <div className="modal-sheet journey-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="journey-drawer-close"
              onClick={() => setJourneyDrawerOpen(false)}
              aria-label={journeyDrawerCopy.close}
            >
              ✕
            </button>
            <div className="right-rail journey-drawer-rail">
              <div className="rail-achievements mobile-rail-achievements">
                <div className="sa-head">
                  <span className="sa-title">{t.achievements.title}</span>
                  <span className="sa-count">{earnedCount}/{ACHIEVEMENTS.length}</span>
                </div>
                {t.achievements.intro && (
                  <p className="sa-intro">{t.achievements.intro}</p>
                )}
                {renderAchievementClusters()}
              </div>
            </div>
          </div>
        </div>
      )}

      {videoModal && (
        <div className="modal-backdrop video-backdrop" onClick={() => setVideoModal(null)}>
          <div className={`video-modal ${videoModal.orientation === "portrait" ? "portrait" : "landscape"}`} onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setVideoModal(null)} aria-label={t.common.close}>✕</button>
            <div className="video-modal-frame" ref={videoModalFrameRef}>
              {videoModal.kind === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoModal.id}?autoplay=1&rel=0`}
                  title={videoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoModal.src}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
            <div className="video-modal-title">{videoModal.title}</div>
          </div>
        </div>
      )}

      {logoutConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="modal-sheet logout-confirm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="modal-kicker">{logoutDialogCopy.kicker}</div>
            <h3 className="modal-title">{logoutDialogCopy.title}</h3>
            <p className="modal-copy">{logoutDialogCopy.body}</p>
            <div className="modal-actions">
              <button className="modal-primary" onClick={() => { setLogoutConfirmOpen(false); logout(); }}>
                {logoutDialogCopy.confirm}
              </button>
              <button className="modal-secondary" onClick={() => setLogoutConfirmOpen(false)}>
                {logoutDialogCopy.stay}
              </button>
            </div>
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
        <EntryLogos />
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
      src="/uploads/logo-expedicao-brasil.png"
      alt={alt}
    />
  );
}

// Co-branded Brasil + México lockup, used across every entry-flow screen.
function EntryLogos() {
  return (
    <div className="entry-logos">
      <img className="logo-image entry-pair" src="/uploads/logo-expedicao-brasil.png" alt="Expedição Roblox Brasil" />
      <span className="entry-logos-divider" />
      <img className="logo-image entry-pair" src="/uploads/logo-expedicao-mexico.svg" alt="Expedición Roblox México" />
    </div>
  );
}

// "Now in Brazil and Mexico" badge shown atop the hub pages.
function ReachBadge({ text }) {
  return (
    <div className="reach-badge">
      <span className="reach-badge-dot reach-badge-dot-br" />
      <span className="reach-badge-dot reach-badge-dot-mx" />
      {text}
    </div>
  );
}

// Icon-only mark (the Expedição "compass" symbol), for tight spots and the journey mascot.
function LogoMark({ color = "#e31837" }) {
  return (
    <svg className="logo-mark" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1200 1200H317.193L777.666 734.146L392.32 511.667L203.589 1200H0V0H879.242L418.771 465.854L804.115 688.333L992.847 0H1200V1200Z" fill={color} />
    </svg>
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

function VideoPreviewCard({ src, title, onClick, frameAt = 0, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;

    const seekToFrame = () => {
      if (!Number.isFinite(frameAt) || frameAt <= 0) return;
      const safeTarget = Math.min(frameAt, Math.max((node.duration || frameAt) - 0.2, 0));
      try {
        node.currentTime = safeTarget;
      } catch {
        // ignore until metadata is ready
      }
    };

    const handleLoadedMetadata = () => seekToFrame();
    const handleSeeked = () => node.pause();

    node.pause();
    if (node.readyState >= 1) seekToFrame();
    node.addEventListener("loadedmetadata", handleLoadedMetadata);
    node.addEventListener("seeked", handleSeeked);

    return () => {
      node.removeEventListener("loadedmetadata", handleLoadedMetadata);
      node.removeEventListener("seeked", handleSeeked);
    };
  }, [frameAt, src]);

  return (
    <button
      className={`sobre-media-card ${className}`.trim()}
      type="button"
      onClick={onClick}
      aria-label={title}
    >
      <video
        ref={videoRef}
        key={`${src}-${frameAt}`}
        className="sobre-media-video"
        src={src}
        muted
        playsInline
        preload="metadata"
      />
      <span className="sobre-media-overlay">
        <span className="sobre-media-play">▶</span>
      </span>
    </button>
  );
}

function DetailScreen({ accent, kicker, title, subline, cards, action, onAction, onBack, actionTheme, videoStub, loopVideo, labels, inline = false, onOpenVideo }) {
  const normalizeHeading = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase();

  const shouldHideKicker =
    normalizeHeading(kicker) &&
    normalizeHeading(title) &&
    (normalizeHeading(title).includes(normalizeHeading(kicker)) ||
      normalizeHeading(kicker).includes(normalizeHeading(title)));

  return (
    <section className={inline ? "detail-screen-inline" : ""}>
      <button className="detail-back" onClick={onBack}>{inline ? labels.close : labels.back}</button>
      <div className="detail-head">
        <div>
          {!shouldHideKicker && <div className="detail-kicker" style={{ color: accent }}>{kicker}</div>}
          <h2 className="detail-title">{title}</h2>
        </div>
      </div>
      <div className="detail-subline" style={{ color: accent }}>{subline}</div>
      {loopVideo ? (
        <button className="detail-loop" onClick={onOpenVideo} type="button" aria-label={labels.howItWorks}>
          <video src={loopVideo} muted playsInline preload="metadata" />
          <span className="detail-loop-overlay">
            <span className="detail-loop-play">▶</span>
            <span className="detail-loop-caption">{labels.howItWorks}</span>
          </span>
        </button>
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
    const node = contentRef.current;
    const measure = () => setMeasuredHeight(node.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
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

function JourneyCard({ accent, kicker, title, body, note, open = false, onClick, compact = false, hideKicker = false }) {
  return (
    <button className={`journey-card ${accent} ${open ? "open" : ""}`} onClick={onClick} aria-expanded={open}>
      <div className="journey-head">
        <div className="journey-head-copy">
          {!hideKicker && <div className="journey-kicker">{kicker}</div>}
          <div className="journey-title">{title}</div>
          <div className="journey-body">{body}</div>
        </div>
        <span className="journey-head-chevron" aria-hidden="true">{open ? "∧" : "∨"}</span>
      </div>
      {!compact && (
        <div className="journey-foot">
          <p>{note}</p>
          <span>›</span>
        </div>
      )}
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

function CommunityJourneyCard({ dict, onClick, hideKicker = false }) {
  return (
    <div className="community-journey-card">
      <div className="community-orb" />
      {!hideKicker && <div className="promo-kicker">{dict.kicker}</div>}
      <div className="promo-title">{dict.title}</div>
      <p className="community-journey-copy">{dict.copy}</p>
      <button className="community-journey-button" onClick={onClick}>
        {dict.button}
      </button>
    </div>
  );
}

function PublishJourneyCard({ dict, onClick, hideKicker = false }) {
  return (
    <div className="publish-journey-card">
      {!hideKicker && <div className="promo-kicker">{dict.kicker}</div>}
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
          <div className="accordion-head-tools">
            {deviceIcon && (
              <div className="accordion-device-icon">
                <Icon
                  name={deviceIcon}
                  color={accent === "yellow" ? "#1A1A1A" : "#FFFFFF"}
                  large
                />
              </div>
            )}
            <div className="accordion-chevron">{open ? "∧" : "∨"}</div>
          </div>
        </div>
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
  const stroke = {
    stroke: color,
    strokeWidth: 1.85,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (glyph === "what") {
    return (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="13" {...stroke} />
        <path d="M12.7 12.2C12.7 10.1 14.4 8.7 16.4 8.7C18.3 8.7 20 9.9 20 11.9C20 14.2 17.4 14.4 17.1 16.6" {...stroke} />
        <circle cx="16" cy="21.8" r="1.35" fill={color} />
      </svg>
    );
  }
  if (glyph === "do") {
    return (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M7 17L11.8 21.8L21.8 11.8" {...stroke} />
        <path d="M22.4 8.2V11.6H25.8" {...stroke} />
        <path d="M15.6 7.2V5.2" {...stroke} />
        <path d="M25.2 16H27.2" {...stroke} />
      </svg>
    );
  }
  if (glyph === "platform") {
    return (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="5" y="6.5" width="22" height="13.5" rx="3" {...stroke} />
        <path d="M3.8 24.5H28.2" {...stroke} />
        <path d="M13 20.6V24.5" {...stroke} />
        <path d="M19 20.6V24.5" {...stroke} />
      </svg>
    );
  }
  if (glyph === "who") {
    return (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4.5L24 8.3V15.2C24 19.3 20.6 21.9 16 24C11.4 21.9 8 19.3 8 15.2V8.3L16 4.5Z" {...stroke} />
        <path d="M12.6 15.3L15 17.7L19.5 13.2" {...stroke} />
      </svg>
    );
  }
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 4.5L24 8.3V15.2C24 19.3 20.6 21.9 16 24C11.4 21.9 8 19.3 8 15.2V8.3L16 4.5Z" {...stroke} />
      <path d="M12.6 15.3L15 17.7L19.5 13.2" {...stroke} />
    </svg>
  );
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

function ContextRailPanel({ icon, content, onAction, onWhatsApp, ui }) {
  const renderAction = (entry) => (
    entry.actionLabel && onAction ? (
      <button
        className="rail-context-card-action"
        onClick={() => onAction(entry)}
      >
        <span>{entry.actionLabel}</span>
        <span aria-hidden="true">↗</span>
      </button>
    ) : null
  );

  const renderRailImage = (entry) => (
    entry.image ? (
      <figure className="rail-media-figure">
        <img
          src={entry.image.src}
          alt={entry.image.alt}
          style={entry.image.position ? { objectPosition: entry.image.position } : undefined}
        />
      </figure>
    ) : null
  );

  if (content.variant === "editorial") {
    return (
      <div className="rail-context rail-context-editorial">
        <div className="rail-context-head">
          <span className="rail-context-eyebrow">{content.eyebrow}</span>
          <h3 className="rail-context-title">{content.title}</h3>
          {content.intro && <p className="rail-context-intro">{content.intro}</p>}
        </div>

        {content.highlight && (
          <section className="rail-editorial-feature">
            <span className="rail-feature-kicker">{content.highlight.kicker}</span>
            <h4 className="rail-feature-title">{content.highlight.title}</h4>
            <p className="rail-feature-body">{content.highlight.body}</p>
        </section>
      )}

        {content.sections && (
          <div className="rail-editorial-sections">
            {content.sections
              .map((section) => ({
                ...section,
                items: (section.items || []).filter((item) => !item.placeholder),
              }))
              .filter((section) => section.items.length > 0)
              .map((section) => (
              <section key={section.label} className="rail-editorial-section">
                <div className="rail-editorial-section-heading">
                  <span className="rail-editorial-section-icon">{icon("target", "#5C6171")}</span>
                  <div className="rail-editorial-section-label">{section.label}</div>
                </div>
                <div className="rail-editorial-list">
                  {section.items.map((item) => (
                    <article
                      key={item.title}
                      className={`rail-editorial-item${item.placeholder ? " is-placeholder" : ""}`}
                    >
                      <div className="rail-item-topline">
                        <span className="rail-item-highlight" aria-hidden="true" />
                        <span className="rail-context-card-kicker">{item.kicker}</span>
                        {item.placeholder && <span className="rail-placeholder-tag">{ui.placeholderTag}</span>}
                      </div>
                      {renderRailImage(item)}
                      <h4 className="rail-context-card-title">{item.title}</h4>
                      <p className="rail-context-card-body">{item.body}</p>
                      {renderAction(item)}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="rail-editorial-list">
          {content.cards.filter((card) => !card.placeholder).map((card) => (
            <section
              key={card.title}
              className={`rail-editorial-item${card.placeholder ? " is-placeholder" : ""}`}
            >
              <div className="rail-item-topline">
                <span className="rail-item-highlight" aria-hidden="true" />
                <span className="rail-context-card-kicker">{card.kicker}</span>
                {card.placeholder && <span className="rail-placeholder-tag">{ui.placeholderTag}</span>}
              </div>
              {renderRailImage(card)}
              <h4 className="rail-context-card-title">{card.title}</h4>
              <p className="rail-context-card-body">{card.body}</p>
              {renderAction(card)}
            </section>
          ))}
        </div>

        <div className="rail-editorial-end">
          <button className="rail-whatsapp-cta" aria-label={ui.askMore} onClick={onWhatsApp}>
            <span className="rail-whatsapp-cta-icon">
              <img src="/whatsapp-icon.png" alt="WhatsApp" className="rail-whatsapp-cta-icon-img" />
            </span>
            <span className="rail-whatsapp-cta-copy">
              <small>{ui.askMore}</small>
              <strong>{ui.talkToUs}</strong>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rail-context">
      <div className="rail-context-head">
        <span className="rail-context-eyebrow">{content.eyebrow}</span>
        <h3 className="rail-context-title">{content.title}</h3>
        {content.intro && <p className="rail-context-intro">{content.intro}</p>}
      </div>

      {content.highlight && (
        <section className="rail-feature-card">
          <span className="rail-feature-kicker">{content.highlight.kicker}</span>
          <h4 className="rail-feature-title">{content.highlight.title}</h4>
          <p className="rail-feature-body">{content.highlight.body}</p>
          {content.highlight.stats && (
            <div className="rail-feature-stats">
              {content.highlight.stats.map((stat) => (
                <div key={stat.label} className="rail-feature-stat">
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="rail-context-grid">
        {content.cards.map((card) => (
          <section key={card.title} className="rail-context-card">
            <div className="rail-context-card-icon">{icon(card.icon, "#4B4F64")}</div>
            <div className="rail-context-card-copy">
              <span className="rail-context-card-kicker">{card.kicker}</span>
              <h4 className="rail-context-card-title">{card.title}</h4>
              <p className="rail-context-card-body">{card.body}</p>
              {renderAction(card)}
            </div>
          </section>
        ))}
      </div>
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
  if (name === "home") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><path d="M16 35.5L40 16L64 35.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 31V61H57V31" stroke={color} strokeWidth="2" strokeLinejoin="round"/><path d="M34 61V45H46V61" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>;
  }
  if (name === "classroom") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><rect x="15" y="18" width="50" height="30" rx="3.5" stroke={color} strokeWidth="2"/><path d="M24 55H56" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M34 48V55M46 48V55" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M24 28H42M24 34H50" stroke={color} strokeWidth="2" strokeLinecap="round"/><circle cx="55" cy="31" r="4" stroke={color} strokeWidth="2"/></svg>;
  }
  if (name === "infinity") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><path d="M40 40 C40 40 30 22 18 22 C8 22 8 58 18 58 C30 58 40 40 40 40 C40 40 50 22 62 22 C72 22 72 58 62 58 C50 58 40 40 40 40 Z" stroke={color} strokeWidth="2" fill="none"/></svg>;
  }
  if (name === "compass") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="27" stroke={color} strokeWidth="2"/><path d="M49.5 30.5L44.8 44.8L30.5 49.5L35.2 35.2L49.5 30.5Z" stroke={color} strokeWidth="2" strokeLinejoin="round"/><circle cx="40" cy="40" r="2.8" fill={color}/></svg>;
  }
  if (name === "pathway") {
    return <svg width="52" height="52" viewBox="0 0 80 80" fill="none"><path d="M18 61C18 46 30 43 30 30C30 22 25 17 18 14" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M62 61C62 46 50 43 50 30C50 22 55 17 62 14" stroke={color} strokeWidth="2" strokeLinecap="round"/><circle cx="18" cy="14" r="3.5" fill={color}/><circle cx="62" cy="14" r="3.5" fill={color}/><circle cx="40" cy="61" r="4" stroke={color} strokeWidth="2"/></svg>;
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
  if (name === "logout") {
    return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><path d="M18 11.5H13.5C12.4 11.5 11.5 12.4 11.5 13.5V30.5C11.5 31.6 12.4 32.5 13.5 32.5H18" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><path d="M22 14.5L29.5 22L22 29.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 22H29" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></svg>;
  }
  if (name === "menu") {
    return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><path d="M11 15H33" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M11 22H33" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M11 29H33" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  if (name === "close") {
    return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><path d="M14 14L30 30" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M30 14L14 30" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
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
  if (name === "chat") {
    return <svg width="30" height="30" viewBox="0 0 44 44" fill="none"><path d="M22 8.5C13.99 8.5 7.5 14.44 7.5 21.77C7.5 25.35 9.05 28.61 11.6 31L10.4 36L15.53 34.25C17.49 35.03 19.68 35.45 22 35.45C30.01 35.45 36.5 29.51 36.5 22.18C36.5 14.84 30.01 8.5 22 8.5Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M16.2 21.7C17.5 24.15 19.82 26.12 22.64 27.05C23.16 27.22 23.7 27.12 24.1 26.78L26.05 25.15C26.42 24.85 26.93 24.77 27.37 24.96L30.18 26.19C30.73 26.44 30.99 27.08 30.77 27.64C30.2 29.09 28.73 29.98 27.18 29.77C20.96 28.92 15.98 24.53 14.31 18.56C13.9 17.09 14.63 15.54 15.96 14.82C16.48 14.53 17.14 14.7 17.46 15.19L19.08 17.7C19.34 18.1 19.37 18.61 19.16 19.03L18.08 21.18C17.87 21.6 17.9 22.12 18.16 22.51" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "whatsapp") {
    return <svg width="48" height="48" viewBox="0 0 44 44" fill="none"><path d="M22.1 8.2C14.2 8.2 7.8 14.4 7.8 22.1C7.8 25.1 8.8 28 10.6 30.3L9.2 35.8L14.9 34.3C17 35.5 19.5 36.1 22.1 36.1C30 36.1 36.4 29.9 36.4 22.2C36.4 14.5 30 8.2 22.1 8.2Z" stroke={color} strokeWidth="2" strokeLinejoin="round"/><path d="M18.3 16.8C18 16.1 17.7 16 17.1 16H15.7C15.2 16 14.6 16.2 14.3 16.6C13.3 17.6 12.8 18.9 12.8 20.4C12.8 22.1 13.5 23.8 14.8 25.3C17 28 20.2 30 23.8 30.7C25.3 31 26.5 30.6 27.4 29.7C27.8 29.3 28 28.7 28 28.2V26.8C28 26.2 27.8 25.9 27.2 25.6L24.8 24.5C24.3 24.3 23.9 24.4 23.5 24.7L22.4 25.6C22.1 25.8 21.7 25.9 21.4 25.8C19.5 25.1 17.9 23.6 17.1 21.8C16.9 21.5 17 21.1 17.2 20.8L18.1 19.7C18.4 19.3 18.5 18.9 18.3 18.4L17.3 16.1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "lock") {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.8"/><path d="M8 11V8.5C8 6.01472 10.0147 4 12.5 4C14.9853 4 17 6.01472 17 8.5V11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.2" fill={color}/></svg>;
  }
  return <svg width="28" height="28" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1.5"/></svg>;
}

function navIcon(key) {
  return { sobre: "target", jornada: "stair", eco: "hex", pais: "shield" }[key];
}

export default App;
