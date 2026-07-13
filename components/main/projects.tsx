"use client";

import { ProjectCard } from "@/components/sub/project-card";
import { useLanguage } from "@/i18n/language-context";

export const Projects = () => {
  const { t } = useLanguage();

  return (
    <section
      id="projects"
      className="flex flex-col items-center justify-center py-20"
    >
      <h1 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-20">
        {t.projects.title}
      </h1>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
        {t.projects.items.map((project) => (
          <ProjectCard
            key={project.title}
            src={project.image}
            title={project.title}
            description={project.description}
            downloads={project.downloads}
            downloadIosLabel={t.projects.downloadIos}
            downloadMacosLabel={t.projects.downloadMacos}
          />
        ))}
      </div>
    </section>
  );
};
