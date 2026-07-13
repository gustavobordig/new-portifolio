import type { Dictionary, Locale } from "./types";

const en: Dictionary = {
  nav: {
    about: "About me",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
  },
  hero: {
    titleBefore: "Providing",
    titleHighlight: "the best",
    titleAfter: "project experience.",
    description:
      "I'm a Full Stack Software Engineer with experience in Website, Mobile, and Software development. Check out my projects and skills.",
    cta: "Learn more",
  },
  skills: {
    title: "My Skills",
  },
  experience: {
    title: "My Experience",
    items: [
      {
        company: "Vcodes",
        logo: "/experience/vcodes.png",
        location: "Curitiba, Paraná, Brazil · On-site",
        employmentType: "Full-time",
        period: "Jun 2025 – Present",
        roles: [
          {
            title: "Mid-level Mobile & Full Stack Developer",
            period: "Jun 2025 – Present",
            workMode: "On-site",
            description:
              "Mid-level Full Stack Developer at a startup, working on digital products across mobile, web, and desktop applications.",
          },
        ],
      },
      {
        company: "Embarca",
        logo: "/experience/embarca.png",
        location: "Curitiba, Paraná, Brazil · On-site",
        employmentType: "Full-time",
        period: "Apr 2025 – Jun 2025",
        roles: [
          {
            title: "Mid-level Mobile & Full Stack Developer",
            period: "Apr 2025 – Jun 2025 · 3 months",
            workMode: "On-site",
            description:
              "Front-end development with Next.js, React, and React Native.",
          },
        ],
      },
      {
        company: "Agência Chleba",
        logo: "/experience/chleba.png",
        location: "Curitiba, Paraná, Brazil",
        employmentType: "1 year 8 months",
        period: "Sep 2022 – Apr 2024",
        roles: [
          {
            title: "Junior Full Stack Developer",
            period: "Feb 2024 – Apr 2024 · 3 months",
            workMode: "Hybrid",
            description:
              "Worked as a front-end developer using HTML, CSS, JavaScript, jQuery, and SCSS.",
          },
          {
            title: "Intern",
            period: "Sep 2022 – Feb 2024 · 1 year 6 months",
            description: "Front-end developer working with HTML, CSS, and JS.",
          },
        ],
      },
      {
        company: "Pontifical Catholic University of Paraná",
        logo: "/experience/pucpr.png",
        location: "Curitiba, Paraná, Brazil",
        employmentType: "Education",
        period: "Mar 2022 – Dec 2025",
        roles: [
          {
            title: "Bachelor's Degree, Information Systems",
            period: "Mar 2022 – Dec 2025",
            description:
              "Bachelor's in Information Systems focused on software development and digital solutions.",
          },
        ],
      },
    ],
  },
  projects: {
    title: "My Projects",
    downloadIos: "App Store",
    downloadMacos: "Mac App Store",
    items: [
      {
        title: "Heisen",
        description:
          "Training app for people who take workouts seriously. Build weekly routines, log sets and loads in real time, track progress, and stay consistent — at the gym or at home.",
        image: "/projects/heisen.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/heisen/id6759606396",
          },
        ],
      },
      {
        title: "Nara",
        description:
          "Task management with strategy and clarity. Organize by date, category, and priority, create subtasks and reminders, and turn goals into clear, controlled actions — on iPhone and Mac.",
        image: "/projects/nara.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/nara-app/id6759169299",
          },
          {
            platform: "macos",
            url: "https://apps.apple.com/us/app/nara-focus-tasks/id6759509890",
          },
        ],
      },
      {
        title: "Soma",
        description:
          "Calories, macros, and grocery spending in one place. Track meals, manage recipes with cook mode, and get nutrition and shopping insights — all in Soma.",
        image: "/projects/soma-favicon.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/soma-food-tracker/id6761935731",
          },
        ],
      },
    ],
  },
  footer: {
    rights: "All rights reserved.",
  },
};

const pt: Dictionary = {
  nav: {
    about: "Sobre mim",
    skills: "Habilidades",
    experience: "Experiência",
    projects: "Projetos",
  },
  hero: {
    titleBefore: "Entregando",
    titleHighlight: "a melhor",
    titleAfter: "experiência em projetos.",
    description:
      "Sou um engenheiro de software Full Stack com experiência em desenvolvimento Web, Mobile e Software. Confira meus projetos e habilidades.",
    cta: "Saiba mais",
  },
  skills: {
    title: "Minhas Habilidades",
  },
  experience: {
    title: "Minha Experiência",
    items: [
      {
        company: "Vcodes",
        logo: "/experience/vcodes.png",
        location: "Curitiba, Paraná, Brasil · No local",
        employmentType: "Tempo integral",
        period: "jun de 2025 – o momento",
        roles: [
          {
            title: "Desenvolvedor Mobile e Full Stack Pleno",
            period: "jun de 2025 – o momento",
            workMode: "No local",
            description:
              "Desenvolvedor Full Stack Pleno em startup, atuando no desenvolvimento de diversos projetos e produtos digitais, abrangendo aplicações mobile, web e desktop.",
          },
        ],
      },
      {
        company: "Embarca",
        logo: "/experience/embarca.png",
        location: "Curitiba, Paraná, Brasil · No local",
        employmentType: "Tempo integral",
        period: "abr de 2025 – jun de 2025",
        roles: [
          {
            title: "Desenvolvedor Mobile e Full Stack Pleno",
            period: "abr de 2025 – jun de 2025 · 3 meses",
            workMode: "No local",
            description:
              "Desenvolvimento front-end com Next.js, React e React Native.",
          },
        ],
      },
      {
        company: "Agência Chleba",
        logo: "/experience/chleba.png",
        location: "Curitiba, Paraná, Brasil",
        employmentType: "1 ano 8 meses",
        period: "set de 2022 – abr de 2024",
        roles: [
          {
            title: "Desenvolvedor Full Stack Júnior",
            period: "fev de 2024 – abr de 2024 · 3 meses",
            workMode: "Híbrido",
            description:
              "Atuei como desenvolvedor front-end utilizando HTML, CSS, JavaScript, jQuery e SCSS.",
          },
          {
            title: "Estagiário",
            period: "set de 2022 – fev de 2024 · 1 ano 6 meses",
            description: "Desenvolvedor front-end com HTML, CSS e JS.",
          },
        ],
      },
      {
        company: "Pontifícia Universidade Católica do Paraná",
        logo: "/experience/pucpr.png",
        location: "Curitiba, Paraná, Brasil",
        employmentType: "Formação acadêmica",
        period: "mar de 2022 – dez de 2025",
        roles: [
          {
            title: "Bacharelado, Sistemas de Informação",
            period: "mar de 2022 – dez de 2025",
            description:
              "Formação em Sistemas de Informação com foco em desenvolvimento de software e soluções digitais.",
          },
        ],
      },
    ],
  },
  projects: {
    title: "Meus Projetos",
    downloadIos: "App Store",
    downloadMacos: "Mac App Store",
    items: [
      {
        title: "Heisen",
        description:
          "App de treino para quem leva a academia a sério. Monte rotinas semanais, registre séries e cargas em tempo real, acompanhe a evolução e mantenha a consistência — na academia ou em casa.",
        image: "/projects/heisen.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/heisen/id6759606396",
          },
        ],
      },
      {
        title: "Nara",
        description:
          "Gerenciamento de tarefas com estratégia e clareza. Organize por data, categoria e prioridade, crie subtarefas e lembretes, e transforme metas em ações claras — no iPhone e no Mac.",
        image: "/projects/nara.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/nara-app/id6759169299",
          },
          {
            platform: "macos",
            url: "https://apps.apple.com/us/app/nara-focus-tasks/id6759509890",
          },
        ],
      },
      {
        title: "Soma",
        description:
          "Calorias, macros e gastos do mercado em um só lugar. Acompanhe refeições, gerencie receitas com modo cozinhar e veja insights de nutrição e compras — tudo no Soma.",
        image: "/projects/soma-favicon.png",
        downloads: [
          {
            platform: "ios",
            url: "https://apps.apple.com/us/app/soma-food-tracker/id6761935731",
          },
        ],
      },
    ],
  },
  footer: {
    rights: "Todos os direitos reservados.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  pt,
};

export const LOCALE_STORAGE_KEY = "portfolio-locale";
