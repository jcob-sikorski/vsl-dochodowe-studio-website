# CRM stage tracking — how GHL cards become the VSL dashboard

The VSL dashboard follows the cards in the **Marketing Pipeline** and nothing
else. Closers keep filling in the EOD report as well — that feeds the EOD
dashboard; GHL feeds this one.

## The pipeline

```
For Qualification → (Qualified) → Booked Call → No Show
                                              → Lost
                                              → Proposal Sent → Won / Lost
                                              → Won
```

A lead can go **back to For Qualification** from Booked Call, No Show or
Proposal Sent, get booked again and have another call. Every move is recorded,
so loops are counted correctly.

## How a call is counted

Every time a card **enters Booked Call** is one call. Where the card goes next
decides what happened:

| From Booked Call to | The call was |
|---|---|
| No Show | **missed** |
| Lost | **held** (call happened, no sale — not qualified or didn't buy) |
| Proposal Sent | **held** |
| Won | **held** + purchase |
| For Qualification / Qualified | **didn't happen** — left out of the show rate |
| (still in Booked Call) | **pending** — left out of the show rate |

Also:

- **No Show → For Qualification → Booked Call** — the missed call stays
  missed; the new booking is a new call.
- **Proposal Sent → For Qualification → Booked Call** — a follow-up call, counted
  as another call.
- **Proposal Sent → Won / Lost** — the decision on a call already counted, not a
  new call.
- **Lost straight from For Qualification / Qualified** — a drop-off before any
  booking; not a call, not a no-show.

**Show rate = held calls ÷ (held + missed calls).** Same definition as the EOD
report.

## The one rule for closers

**Move the card the same day you file the EOD report.**

| EOD outcome | Move the card to |
|---|---|
| Nie pojawił się | No Show |
| Decyzja otwarta | Proposal Sent |
| Nie kupił | Lost |
| Niezakwalifikowany | Lost |
| Kupił i zapłacił | Won |
| Call didn't take place / needs re-qualifying | For Qualification |

A card left in Booked Call after its call is the only thing that can make the
show rate wrong now. The dashboard warns when a call is still in Booked Call a
week after it was booked.

## What goes to Meta

`qualified` → Qualified, `booked` → Lead, `won` → Purchase — **the first time
only** for each lead. A lead looping back through Qualified or Booked Call does
not send a second conversion. Everything else is recorded locally.

## Workflows (one per stage)

Pipeline Stage Changed (Marketing Pipeline) → Webhook POST to
`https://vsl.dochodowestudio.com/api/conversion` with header `x-webhook-secret`
and Custom Data `event`, `contactId` = Contact.ID, `referenceId` =
Opportunity ID, `fbc` / `fbclid` / `fbp` = Contact → Custom Fields.

| Stage | `event` |
|---|---|
| For Qualification | `for_qualification` |
| Qualified | `qualified` |
| Booked Call | `call_booked` |
| No Show | `no_show` |
| Lost | `lost` |
| Proposal Sent | `proposal_sent` |
| Won | `won` (+ `value`, `currency` = PLN) |

Verify in the Vercel logs: `stage=<name> ledger=ok`. `meta=Lead:skipped:repeat_stage`
is correct when a lead is booked a second time.
