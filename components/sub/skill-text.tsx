"use client";

import { useLanguage } from "@/i18n/language-context";

export const SkillText = () => {
  const { t } = useLanguage();

  return (
    <h1 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-10 text-center">
      {t.skills.title}
    </h1>
  );
};
