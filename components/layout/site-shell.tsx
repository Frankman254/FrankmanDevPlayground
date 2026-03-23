import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export function SiteShell({ children }: { children: ReactNode }) {
	return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,196,0,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(215,38,56,0.10),transparent_22%),linear-gradient(180deg,#060608_0%,#121217_100%)] text-[#F7F3EB]">
			<SiteHeader />
			<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
				{children}
			</main>
			<SiteFooter />
		</div>
	);
}
