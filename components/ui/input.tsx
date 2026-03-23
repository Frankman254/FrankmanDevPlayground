import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-11 w-full rounded-2xl border border-[#F7F3EB]/10 bg-[#0F0F14]/85 px-4 py-2 text-sm text-[#F7F3EB] placeholder:text-[#6B6B73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D72638]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
