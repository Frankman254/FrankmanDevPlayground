"use client";

import { SectionHeading } from "@/components/section-heading";
import { useTranslations } from "@/components/providers/locale-provider";
import { Card } from "@/components/ui/card";

export function ProfilePageContent({
	email,
	hasError,
}: {
	email: string | null;
	hasError: boolean;
}) {
	const t = useTranslations();

	return (
		<div className="space-y-10">
			<SectionHeading
				description={t.profilePage.description}
				eyebrow={t.profilePage.eyebrow}
				title={t.profilePage.title}
			/>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						{t.profilePage.currentUserTitle}
					</h2>
					<p className="text-sm text-slate-300">{email ?? t.profilePage.noUser}</p>
					<p className="text-sm text-slate-400">
						{hasError ? t.profilePage.sessionError : t.profilePage.sessionReady}
					</p>
				</Card>

				<Card className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						{t.profilePage.plannedModulesTitle}
					</h2>
					<ul className="space-y-2 text-sm leading-7 text-slate-300">
						{t.profilePage.modules.map((module) => (
							<li key={module}>{module}</li>
						))}
					</ul>
				</Card>
			</div>
		</div>
	);
}
