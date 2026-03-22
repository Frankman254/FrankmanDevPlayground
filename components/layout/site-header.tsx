import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mainNav, siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <Link className="text-lg font-semibold text-white" href="/">
            {siteConfig.name}
          </Link>
          <p className="hidden text-sm text-slate-400 md:block">
            {siteConfig.headline}
          </p>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/login">
          <Button size="sm" variant="secondary">
            Sign in
          </Button>
        </Link>
      </div>
    </header>
  );
}
