"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { AuthCard } from "@/components/auth-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
	const t = useTranslations();
  const isConfigured = hasSupabaseEnv();

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.loginPage.description}
				eyebrow={t.loginPage.eyebrow}
				title={t.loginPage.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <AuthCard />

        <Card className="space-y-4">
				<h2 className="text-xl font-semibold text-white">
					{t.loginPage.statusTitle}
				</h2>
          <p className="text-sm leading-7 text-slate-300">
					{isConfigured ? t.loginPage.envPresent : t.loginPage.envMissing}
          </p>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
					{t.loginPage.bullets.map((bullet) => (
						<li key={bullet}>{bullet}</li>
					))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
