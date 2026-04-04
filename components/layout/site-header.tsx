'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from '@/components/providers/locale-provider';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

export function SiteHeader() {
	const t = useTranslations();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const navItems = [
		{ href: '/', label: t.nav.home },
		{ href: '/games', label: t.nav.games },
		{ href: '/apps', label: t.nav.apps },
		{ href: '/experiments', label: t.nav.experiments },
		{ href: '/profile', label: t.nav.profile },
	];

	return (
		<header className="sticky top-0 z-40 border-b border-[#F7F3EB]/8 bg-[#0C0C0F]/88 backdrop-blur-xl">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<div className="flex items-center justify-between gap-3 py-3">
					<Link
						className="min-w-0 flex items-center gap-3 text-white"
						href="/"
					>
						<Image
							alt="Frankman Dev"
							className="size-9 rounded-xl sm:size-10"
							height={40}
							src="/brand-mark.svg"
							width={40}
						/>
						<div className="min-w-0">
							<p className="truncate text-base font-semibold sm:text-lg">
								{siteConfig.name}
							</p>
							<p className="hidden text-xs text-[#F7F3EB]/56 xl:block">
								{t.site.headline}
							</p>
						</div>
					</Link>

					<nav className="hidden items-center gap-1 lg:flex">
						{navItems.map(item => {
							const isActive =
								item.href === '/'
									? pathname === item.href
									: pathname === item.href ||
										pathname.startsWith(`${item.href}/`);

							return (
								<Link
									className={cn(
										'rounded-full px-3 py-2 text-sm transition',
										isActive
											? 'bg-[#F7F3EB]/10 text-white'
											: 'text-[#F7F3EB]/72 hover:bg-[#F7F3EB]/6 hover:text-white'
									)}
									href={item.href}
									key={item.href}
								>
									{item.label}
								</Link>
							);
						})}
					</nav>

					<div className="flex shrink-0 items-center gap-2">
						<div className="hidden sm:block">
							<LanguageSwitcher />
						</div>

						<Link className="hidden lg:block" href="/login">
							<Button size="sm" variant="secondary">
								{t.nav.signIn}
							</Button>
						</Link>

						<button
							aria-expanded={mobileMenuOpen}
							aria-label={
								mobileMenuOpen
									? 'Close navigation'
									: 'Open navigation'
							}
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#F7F3EB]/82 transition hover:bg-white/10 hover:text-white lg:hidden"
							onClick={() =>
								setMobileMenuOpen(current => !current)
							}
							type="button"
						>
							{mobileMenuOpen ? (
								<X className="size-4" />
							) : (
								<Menu className="size-4" />
							)}
						</button>
					</div>
				</div>

				<div className="hidden pb-3 text-sm text-[#F7F3EB]/56 md:block xl:hidden">
					{t.site.headline}
				</div>

				{mobileMenuOpen ? (
					<div className="border-t border-white/10 py-3 lg:hidden">
						<div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F7F3EB]/42">
								{t.language.label}
							</p>
							<LanguageSwitcher />
						</div>

						<nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
							{navItems.map(item => {
								const isActive =
									item.href === '/'
										? pathname === item.href
										: pathname === item.href ||
											pathname.startsWith(
												`${item.href}/`
											);

								return (
									<Link
										className={cn(
											'rounded-2xl border px-3 py-3 text-center text-sm font-medium transition',
											isActive
												? 'border-[#F5C400]/35 bg-[#F5C400]/10 text-[#F5C400]'
												: 'border-white/10 bg-white/[0.03] text-[#F7F3EB]/78 hover:border-white/20 hover:text-white'
										)}
										href={item.href}
										key={item.href}
										onClick={() => setMobileMenuOpen(false)}
									>
										{item.label}
									</Link>
								);
							})}
						</nav>

						<div className="mt-3">
							<Link
								href="/login"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Button
									className="w-full"
									size="sm"
									variant="secondary"
								>
									{t.nav.signIn}
								</Button>
							</Link>
						</div>
					</div>
				) : null}
			</div>
		</header>
	);
}
