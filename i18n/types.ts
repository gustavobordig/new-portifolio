export type Locale = "en" | "pt";

export type ExperienceRole = {
  title: string;
  period: string;
  workMode?: string;
  description: string;
};

export type ExperienceItem = {
  company: string;
  logo: string;
  location: string;
  employmentType: string;
  period: string;
  roles: ExperienceRole[];
};

export type ProjectDownload = {
  platform: "ios" | "macos";
  url: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  image: string;
  downloads: ProjectDownload[];
};

export type Dictionary = {
  nav: {
    about: string;
    skills: string;
    experience: string;
    projects: string;
  };
  hero: {
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    description: string;
    cta: string;
  };
  skills: {
    title: string;
  };
  experience: {
    title: string;
    items: ExperienceItem[];
  };
  projects: {
    title: string;
    downloadIos: string;
    downloadMacos: string;
    items: ProjectItem[];
  };
  footer: {
    rights: string;
  };
};
