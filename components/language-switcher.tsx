"use client";

import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";

export function LanguageSwitcher() {
	const { locale, setLocale } = useLocale();
	const t = useTranslations();

	return (
		<div
			aria-label={t.language.label}
			className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1"
			role="group"
		>
			<LocaleButton
				isActive={locale === "es"}
				label={t.language.es}
				onClick={() => setLocale("es")}
			/>
			<LocaleButton
				isActive={locale === "en"}
				label={t.language.en}
				onClick={() => setLocale("en")}
			/>
		</div>
	);
}

function LocaleButton({
	isActive,
	label,
	onClick,
}: {
	isActive: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<Button
			className="min-w-11"
			onClick={onClick}
			size="sm"
			type="button"
			variant={isActive ? "default" : "ghost"}
		>
			{label}
		</Button>
	);
}
