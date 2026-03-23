"use client";

import Link from "next/link";

import { useTranslations } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { iconMap } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "@/types/catalog";

export function ItemCard({
  item,
  className,
}: {
  item: CatalogItem;
  className?: string;
}) {
	const t = useTranslations();
  const Icon = iconMap[item.iconName];

  return (
    <Card className={cn("flex h-full flex-col justify-between gap-6", className)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-[#F5C400]/20 bg-[#F5C400]/10 p-3 text-[#F5C400]">
            {Icon ? <Icon className="size-6" /> : null}
          </div>
          <Badge variant={item.status === "live" ? "success" : "muted"}>
					{item.status === "live" ? t.common.live : t.common.comingSoon}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
          <p className="text-sm leading-7 text-[#F7F3EB]/78">{item.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Link href={item.href}>
        <Button className="w-full" variant={item.status === "live" ? "default" : "secondary"}>
          {item.ctaLabel}
        </Button>
      </Link>
    </Card>
  );
}
