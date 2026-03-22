import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { AuthCard } from "@/components/auth-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const isConfigured = hasSupabaseEnv();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Authentication"
        title="Guest-first access, account-enhanced experience."
        description="The platform works without forcing sign-in, but the data layer is ready for profiles, favorites, stats and synced utilities when Supabase keys are added."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <AuthCard />

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Supabase status</h2>
          <p className="text-sm leading-7 text-slate-300">
            {isConfigured
              ? "Environment variables are present. You can connect auth flows next."
              : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real auth."}
          </p>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            <li>Email or social login can unlock favorites, saved stats and synced app data.</li>
            <li>Guests should still be able to use most modules without friction.</li>
            <li>Start with magic links, then add providers only if they help activation.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
