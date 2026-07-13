"use client";

import { useLanguage } from "@/i18n/language-context";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-transparent text-gray-200 p-[15px]">
      <div className="mb-[20px] text-[15px] text-center">
        &copy; Gustavo Bordignon {new Date().getFullYear()}. {t.footer.rights}
      </div>
    </div>
  );
};
