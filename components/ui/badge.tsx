import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-[#F5C400]/40 bg-[#F5C400]/12 text-[#F5C400]",
        muted: "border-[#F7F3EB]/10 bg-[#F7F3EB]/5 text-[#F7F3EB]/75",
        success: "border-[#D72638]/35 bg-[#D72638]/12 text-[#F7B6BD]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
