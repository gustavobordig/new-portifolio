"use client";

import { TimelineItem } from "@/components/sub/timeline-item";
import { useLanguage } from "@/i18n/language-context";

export const Timeline = () => {
  const { t } = useLanguage();

  return (
    <section
      id="experience"
      className="flex flex-col items-center justify-center py-20 px-6 md:px-10"
    >
      <h1 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-20">
        {t.experience.title}
      </h1>

      <div className="w-full max-w-3xl flex flex-col">
        {t.experience.items.map((item) => (
          <TimelineItem
            key={item.company}
            company={item.company}
            logo={item.logo}
            location={item.location}
            employmentType={item.employmentType}
            period={item.period}
            roles={item.roles}
          />
        ))}
      </div>
    </section>
  );
};
