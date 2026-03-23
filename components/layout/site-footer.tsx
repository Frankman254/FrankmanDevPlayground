"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function SiteFooter() {
	const t = useTranslations();

  return (
    <footer className="border-t border-white/10">
			<div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-[#F7F3EB]/52 md:flex-row md:items-center md:justify-between">
				<p>{t.footer.left}</p>
				<p>{t.footer.right}</p>
      </div>
    </footer>
  );
}
