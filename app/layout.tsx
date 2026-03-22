import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
