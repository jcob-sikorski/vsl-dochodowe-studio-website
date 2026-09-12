import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  /** Inner content width. `prose` keeps line length in the readable 60-75ch band. */
  width?: "prose" | "wide";
  className?: string;
}

/**
 * One vertical rhythm for the whole page. Every section uses the same
 * padding and gutters so the page reads as a single document rather than a
 * stack of independently-spaced blocks.
 */
export function Section({ children, width = "prose", className }: SectionProps) {
  return (
    <section className={cn("px-5 py-14 sm:px-6 sm:py-20", className)}>
      <div
        className={cn(
          "mx-auto w-full",
          width === "prose" ? "max-w-[42rem]" : "max-w-3xl"
        )}
      >
        {children}
      </div>
    </section>
  );
}
