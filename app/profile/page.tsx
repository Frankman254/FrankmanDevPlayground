import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Profile"
        title="A future home for synced data."
        description="Profiles will tie together favorites, recently played modules, todo sync and personal stats once authentication is turned on."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Current user</h2>
          <p className="text-sm text-slate-300">
            {data.user?.email ?? "No authenticated user yet."}
          </p>
          <p className="text-sm text-slate-400">
            {error
              ? "Supabase is configured but the current session could not be read."
              : "This page is ready to display profile data when auth is active."}
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Planned modules</h2>
          <ul className="space-y-2 text-sm leading-7 text-slate-300">
            <li>Favorites across games, apps and experiments.</li>
            <li>Saved todo lists per account.</li>
            <li>Blackjack sessions, streaks and personal bests.</li>
            <li>Recently used items and personalized recommendations.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
