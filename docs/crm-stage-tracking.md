# CRM stage tracking — what each column does

Closers change nothing about how they work. Drag the card to the column that
describes what happened; the database follows.

## The rule

The dashboard follows the cards and nothing else:

| Card is in | Dashboard counts it as |
|---|---|
| Booked Call / Rescheduled | booked — call **pending** |
| Proposal Sent | **showed** (held call) |
| Won | showed + **purchase** |
| No Show | **no-show** |
| Lost | **no-show** — unless it already reached Proposal Sent, then it's a lost deal |

**Never drag a "Showed" step.** There isn't one, and a `showed` stage is ignored.

## Column → what gets recorded

| Drag to | Sends | Stamps | Counts as a held call? |
|---|---|---|---|
| For Qualification | `for_qualification` | `for_qualification_at` | — |
| Qualified | `qualified` | `qualified_at` | — |
| Booked Call | `booked` | `booked_at` | pending |
| Rescheduled | `rescheduled` | `rescheduled_at` | pending — still booked |
| No Show | `no_show` | `no_show_at` | no — no-show |
| Proposal Sent | `proposal_sent` | `proposal_sent_at` | **yes** |
| Lost | `lost` | `lost_at` | no — no-show (lost deal if a proposal was sent) |
| Won | `won` | `won_at` | **yes** |

Follow Up DM is not tracked — those leads are organic, and this reporting exists
to price paid traffic.

## The one thing that matters

**Move the card as soon as the call time passes.** The dashboard can't see when
a call is scheduled — a card in Booked Call is always *pending*. Show rate and
no-show rate count only calls with an outcome, so a missed call left in Booked
never counts against the show rate. Held → Proposal Sent. Missed → No Show or Lost.

**A held call always goes to Proposal Sent before Won or Lost.** If a call
happened but the card goes straight from Booked to Lost, it's counted as a
no-show.

## Edge cases, already handled

**Rescheduled.** Does not clear `booked_at` — the first booking is what the ad
paid for. Move the card to Rescheduled, then back to Booked Call when the new
time is set. Dragging backwards is safe: every stamp is first-occurrence-wins,
so a timestamp can never move.

**Missed, then attended.** They keep `no_show_at` *and* gain a held call once
they reach Proposal Sent. That's
why there are two numbers:

- **No-shows** — missed at least one call
- **No-show rate** on the dashboard — No Show or Lost and *never* reached
  Proposal Sent, as a share of calls that have an outcome (pending excluded)

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
