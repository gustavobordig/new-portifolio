import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Área de adm",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-[#030014] text-white", inter.className)}>
        {children}
      </body>
    </html>
  );
}
