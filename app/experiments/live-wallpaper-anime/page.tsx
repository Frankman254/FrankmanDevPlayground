"use client";

import { ExternalLink, Sparkles } from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LIVE_WALLPAPER_URL = "https://livewallpaperanime.netlify.app/";

export default function LiveWallpaperBridgePage() {
  const t = useTranslations();
  const p = t.liveWallpaperExperimentPage;

  return (
    <div className="space-y-10">
      <SectionHeading description={p.description} eyebrow={p.eyebrow} title={p.title} />

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C400]/25 bg-[#F5C400]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#F5C400]">
              <Sparkles className="size-3.5" />
              Netlify
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#F7F3EB]/78">{p.body}</p>
            <p className="text-xs text-[#F7F3EB]/45">{p.techNote}</p>
          </div>
          <a className="shrink-0" href={LIVE_WALLPAPER_URL} rel="noopener noreferrer" target="_blank">
            <Button className="w-full sm:w-auto" size="lg">
              {p.openExternal}
              <ExternalLink className="ml-2 size-4" />
            </Button>
          </a>
        </div>
        <div className="flex aspect-video min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-[#0C0C0F] to-fuchsia-950/50 p-6 text-center sm:min-h-[280px]">
          <Sparkles className="size-10 text-[#F5C400]/80" />
          <p className="text-sm text-[#F7F3EB]/65">{p.previewHint}</p>
        </div>
        <p className="break-all text-xs text-[#F7F3EB]/45">{LIVE_WALLPAPER_URL}</p>
      </Card>
    </div>
  );
}
