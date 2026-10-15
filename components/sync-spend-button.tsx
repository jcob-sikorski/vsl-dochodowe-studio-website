"use client";

import { useFormState, useFormStatus } from "react-dom";

import { syncSpendNow, type SyncSpendState } from "@/app/dashboard/actions";

const whenFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Warsaw",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const INITIAL: SyncSpendState = { status: "idle", message: "" };

/**
 * Dashboard app-bar button: pulls the last 3 days of Meta spend into ad_spend
 * right now, then the page re-renders with the fresh numbers.
 */
export function SyncSpendButton({ lastSynced }: { lastSynced: string | null }) {
  const [state, action] = useFormState(syncSpendNow, INITIAL);

  return (
    <form action={action} className="syncwrap">
      <SubmitButton />
      <span
        className={`syncnote${state.status === "error" ? " bad" : ""}`}
        role="status"
        aria-live="polite"
        title={state.message || undefined}
      >
        {state.message
          ? state.message
          : lastSynced
            ? `Spend synced ${whenFmt.format(new Date(lastSynced))}`
            : "Spend never synced"}
      </span>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="syncbtn" disabled={pending} aria-busy={pending}>
      <svg className={`syncicon${pending ? " spin" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 12a8 8 0 0 1-13.66 5.66M4 12a8 8 0 0 1 13.66-5.66M18 3v4h-4M6 21v-4h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {pending ? "Syncing…" : "Sync spend now"}
    </button>
  );
}
