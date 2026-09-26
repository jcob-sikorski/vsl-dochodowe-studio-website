# GHL runbook — fix 3 workflows, add 4

Roughly 25 minutes. Part A first: it's four field changes and it fixes match
quality on events you're already sending. Part B is the new stages.

Every workflow here is the same shape:

> **Trigger:** Pipeline Stage Changed → In pipeline is `Marketing Pipeline` →
> Pipeline stage is `<stage>`
> **Action:** Webhook → POST → `https://vsl.dochodowestudio.com/api/conversion`

---

## Part A — normalise the fb fields (4 changes)

The three live workflows reference the Facebook identifiers three different
ways. The lowercase `contact.fbc` form is **not** a native GHL contact property
— these values exist only as custom fields — so it may be resolving to nothing
and silently dropping the click identifier.

Fix exactly these rows. Everything else in these workflows stays as it is.

| Workflow | Row to fix | Change it to |
|---|---|---|
| Setter Booked Call → Send Lead Event to Meta | `fbp` | `Contact.Custom Fields.fbp` |
| Setter Qualified Lead → Send Qualified Event to Meta | `fbc` | `Contact.Custom Fields.fbc` |
| Purchased → Send Purchased Event to Meta | `fbclid` | `Contact.Custom Fields.fbclid` |
| Purchased → Send Purchased Event to Meta | `fbp` | `Contact.Custom Fields.fbp` |

**How to change one row**

1. Open the workflow → click the **Webhook** action.
2. Find the row in Custom Data. Click into its **value** box.
3. Delete the existing token completely — clear the box.
4. Click the **tag icon** at the right of the box.
5. Choose **Contact → Custom Fields → fbc** (or `fbclid` / `fbp`).
6. Confirm the chip now reads `Contact . Custom Fields . fbc`, not `contact.fbc`.
7. **Save action**, then **Save** (top right — it carries a red dot when there
   are unsaved changes).

> The workflow is already published, so the change is live the moment you save.

**Do not touch** the `value` and `currency` rows on the Purchased workflow.
Those are correct and belong only there.

---

## Part B — add the 4 missing stages

Build these by duplicating **Setter Qualified Lead** *after* you've fixed it in
Part A — it's the cleanest template, because it has no `value`/`currency` rows
to remove.

| # | Name it | Trigger stage | `event` value |
|---|---|---|---|
| 4 | `Rescheduled → Record` | Rescheduled | `rescheduled` |
| 5 | `No Show → Record` | No Show | `no_show` |
| 6 | `Proposal Sent → Record` | Proposal Sent | `proposal_sent` |
| 7 | `Lost → Record` | Lost | `lost` |

**For each one**

1. Workflows list → the **⋮** on Setter Qualified Lead → **Duplicate**.
2. Rename it (pencil icon beside the title).
3. Click the **Pipeline Stage Changed** trigger → change **Pipeline stage** to
   the stage from the table → **Save trigger**.
4. Click the **Webhook** action → change the **`event`** row's value to the one
   from the table. It's plain text, not a merge field — type it.
5. Leave `contactId`, `referenceId`, `fbc`, `fbclid`, `fbp` and the
   `x-webhook-secret` header exactly as they are.
6. **Save action** → **Save**.
7. **Flip the toggle from Draft to Publish.** A duplicate is always created as a
   draft, and a draft never fires. This is the step that gets missed.

**Priority:** build **Proposal Sent**, **No Show** and **Lost** first. Show
rate is Proposal Sent (held) against No Show + Lost (missed), so until those
exist every call stays "pending" no matter how many actually happen.

---

## Verify

**Immediately.** Move one card into each new stage and watch the Vercel logs.
Expect one line per drag:

```
[conversion] stage=lost ledger=ok meta=-:n/a contact=... 
```

`meta=-:n/a` is **correct** for rescheduled / no_show / proposal_sent / lost —
those are recorded locally and deliberately never sent to Meta.

A `400 unknown_event` means the `event` value has a typo.
A `401` means the secret header didn't survive duplication.

**The Part A check.** Move a card into Qualified and read that line:

```
match=[em,ph,fbc,fbp]      ← fixed
match=[em,ph]              ← fbc still not resolving
```

If it changed, that was also the cause of Lead sitting at 8.0/10 match quality
in Events Manager while Submit application sat at 9.3.

**Tomorrow.** `/dashboard` should show a non-zero Show rate and a real No-show
rate. If Show rate is still 0% but Proposal Sent and Lost are firing, tell me —
that would mean the derivation isn't seeing them.

---

## Checklist

- [ ] A1 — Booked Call: `fbp` → Custom Fields
- [ ] A2 — Qualified: `fbc` → Custom Fields
- [ ] A3 — Purchased: `fbclid` → Custom Fields
- [ ] A4 — Purchased: `fbp` → Custom Fields
- [ ] B6 — Proposal Sent workflow built **and published**
- [ ] B7 — Lost workflow built **and published**
- [ ] B5 — No Show workflow built **and published**
- [ ] B4 — Rescheduled workflow built **and published**
- [ ] Migration `2026-09-22_call_outcomes.sql` run in Supabase
- [ ] Code committed and deployed
