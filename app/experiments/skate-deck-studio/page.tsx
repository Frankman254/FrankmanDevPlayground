"use client";

import { Boxes } from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function SkateDeckStudioPlaceholderPage() {
  const t = useTranslations();
  const p = t.skateDeckExperimentPage;

  return (
    <div className="space-y-10">
      <SectionHeading description={p.description} eyebrow={p.eyebrow} title={p.title} />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-[#F5C400]/20 bg-[#F5C400]/10 p-3 text-[#F5C400]">
            <Boxes className="size-8" />
          </div>
          <Badge variant="muted">{p.status}</Badge>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[#F7F3EB]/78">{p.body}</p>
      </Card>
    </div>
  );
}
