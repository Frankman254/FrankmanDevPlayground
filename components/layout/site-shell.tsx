import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
