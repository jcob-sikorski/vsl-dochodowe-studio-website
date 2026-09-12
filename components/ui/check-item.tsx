import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckItemProps {
  children: React.ReactNode;
  /** `square` matches the offer stack; `round` matches the body lists. */
  shape?: "round" | "square";
  className?: string;
}

/** A checkmark bullet with the marker optically aligned to the first line. */
export function CheckItem({
  children,
  shape = "round",
  className,
}: CheckItemProps) {
  return (
    <li className={cn("flex gap-3.5 sm:gap-4", className)}>
      <span
        aria-hidden
        className={cn(
          "mt-[0.3rem] flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center bg-coral-bright",
          shape === "round" ? "rounded-full" : "rounded-[0.25rem]"
        )}
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
