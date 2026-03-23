import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[#F7F3EB]/10 bg-[#0F0F14]/72 p-6 shadow-2xl shadow-black/30 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
