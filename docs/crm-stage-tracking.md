# CRM stage tracking — what each column does

Closers change nothing about how they work. Drag the card to the column that
describes what happened; the database follows.

## The rule

**Never drag a "Showed" step.** There isn't one. A held call is proven by where
the card ends up: Proposal Sent, Lost and Won all mean the call happened. Only
No Show means it didn't.

## Column → what gets recorded

| Drag to | Sends | Stamps | Counts as a held call? |
|---|---|---|---|
| For Qualification | `for_qualification` | `for_qualification_at` | — |
| Qualified | `qualified` | `qualified_at` | — |
| Booked Call | `booked` | `booked_at` | no |
| Rescheduled | `rescheduled` | `rescheduled_at` | no — still booked |
| No Show | `no_show` | `no_show_at` | no |
| Proposal Sent | `proposal_sent` | `proposal_sent_at` | **yes** |
| Lost | `lost` | `lost_at` | **yes** (post-call only) |
| Won | `won` | `won_at` | **yes** |

Follow Up DM is not tracked — those leads are organic, and this reporting exists
to price paid traffic.

## The one thing that matters

**Lost is for after a call.** If someone never showed up and went cold, they go
to **No Show**, not Lost. The show rate is derived from Lost, so putting a
no-show in Lost silently inflates it.

## Edge cases, already handled

**Rescheduled.** Does not clear `booked_at` — the first booking is what the ad
paid for. Move the card to Rescheduled, then back to Booked Call when the new
time is set. Dragging backwards is safe: every stamp is first-occurrence-wins,
so a timestamp can never move.

**Missed, then attended.** They keep `no_show_at` *and* gain a held call. That's
why there are two numbers:

- **No-shows** — missed at least one call
- **No-show rate** on the dashboard — missed and *never* made it to a call

The second is the one that costs money. The first is a punctuality stat.

**Dragging out of order.** Skipping a stage costs nothing. Stages are counted
cumulatively, so reaching Won implies showed, booked, qualified and
for-qualification whether or not those cards were ever dragged through.

**Double-drag / re-drag.** Harmless. The Meta `event_id` is derived from
(event, contact, opportunity), so a repeat is deduplicated, and the database
uses `coalesce()` so the first time wins.

## What goes to Meta

Only three stages: `qualified` → `Qualified`, `booked` → `Lead`,
`won` → `Purchase`. Everything else is recorded locally. Sending Meta a signal
for every pipeline nudge just adds noise to optimisation, and two stages sharing
an event name would collide on `event_id` and silently discard one.

## Setup checklist (one workflow per stage)

Each is Pipeline Stage Changed → Webhook POST to
`https://vsl.dochodowestudio.com/api/conversion`, with Custom Data:

- `event` = the value from the table above
- `contactId` = Contact.ID
- `referenceId` = Opportunity.Opportunity (ID) — omit if the token is unavailable
- `fbc` / `fbclid` / `fbp` = Contact.Custom Fields
- Header `x-webhook-secret`

Add `value` = Opportunity.Opportunity Value and `currency` = PLN **only** on the
`won` workflow. Then publish — a saved-but-draft workflow never fires.

Verify in the Vercel logs: `stage=<name> ledger=ok`. A `meta=-:n/a` is correct
for any stage not in the Meta list above.
