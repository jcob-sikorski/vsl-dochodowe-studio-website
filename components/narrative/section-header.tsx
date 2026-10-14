import React from "react";

/**
 * Eyebrow pill + headline, in the same visual language as the FAQ and
 * playbook sections (neutral pill, extrabold headline, one underlined part).
 */
export function SectionHeader({
  eyebrow,
  before,
  underline,
  after,
  as: Tag = "h2",
}: {
  eyebrow: string;
  before?: string;
  underline: string;
  after?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1">
        <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neutral-900">
          {eyebrow}
        </span>
      </div>
      <Tag className="mt-2.5 max-w-[26ch] text-[1.3rem] font-extrabold leading-tight tracking-tight text-neutral-900 min-[390px]:text-[1.42rem] sm:text-[1.65rem]">
        {before ? <>{before} </> : null}
        <span className="underline decoration-[#ea580c] decoration-[3px] underline-offset-4">
          {underline}
        </span>
        {after ? <> {after}</> : null}
      </Tag>
    </div>
  );
}

export function NarrativeShell({
  children,
  tone = "white",
  id,
  width = "narrow",
}: {
  children: React.ReactNode;
  tone?: "white" | "panel";
  id?: string;
  /** `wide` lets data-heavy sections use the desktop width (used on /materialy). */
  width?: "narrow" | "wide";
}) {
  return (
    <section
      id={id}
      data-track-section={id}
      className={`w-full scroll-mt-14 px-4 py-12 sm:px-6 sm:py-16 ${width === "wide" ? "lg:py-20" : ""} ${tone === "panel" ? "bg-neutral-50" : "bg-white"}`}
    >
      <div
        className={`mx-auto flex w-full max-w-[26rem] flex-col items-center sm:max-w-xl ${
          width === "wide" ? "md:max-w-3xl lg:max-w-5xl" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function CrossMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}
