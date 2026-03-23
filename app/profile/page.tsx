import { ProfilePageContent } from "@/components/profile-page-content";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

	return <ProfilePageContent email={data.user?.email ?? null} hasError={Boolean(error)} />;
}
