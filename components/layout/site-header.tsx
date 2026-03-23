"use client";

import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
	const t = useTranslations();
	const navItems = [
		{ href: "/", label: t.nav.home },
		{ href: "/games", label: t.nav.games },
		{ href: "/apps", label: t.nav.apps },
		{ href: "/experiments", label: t.nav.experiments },
		{ href: "/profile", label: t.nav.profile },
	];

  return (
		<header className="sticky top-0 z-40 border-b border-[#F7F3EB]/8 bg-[#0C0C0F]/82 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
				<div>
					<Link className="flex items-center gap-3 text-lg font-semibold text-white" href="/">
						<Image
							alt="Frankman Dev"
							className="size-10 rounded-xl"
							height={40}
							src="/brand-mark.svg"
							width={40}
						/>
            {siteConfig.name}
          </Link>
					<p className="hidden text-sm text-[#F7F3EB]/58 md:block">
						{t.site.headline}
          </p>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
					{navItems.map((item) => (
            <Link
							className="rounded-full px-4 py-2 text-sm text-[#F7F3EB]/78 transition hover:bg-[#F7F3EB]/6 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<Link href="/login">
						<Button size="sm" variant="secondary">
							{t.nav.signIn}
						</Button>
					</Link>
				</div>
      </div>
    </header>
  );
}
