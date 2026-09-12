# Webinar landing page

Next.js 14 (App Router) + Tailwind + shadcn/ui, matching the reference design.

## Run it

```bash
npm install
npm run dev
```

## Typography

- **Inter** sets all running text. It's drawn specifically for screens —
  tall x-height, open apertures, unambiguous `1 / l / I` — which is why it's
  the default choice for readable body copy on the web.
- **Playfair Display** is kept for display headings only. High-contrast
  serifs read as editorial at 30px+ and as fatiguing at 17px, so it never
  touches paragraph text.

Body copy is 17px at 1.7 line-height, and prose blocks are capped at 42rem
(~70 characters) — the range where reading speed peaks.

## Color tokens

Text tones are solid values rather than opacity steps, so each one has a
predictable contrast ratio against white:

| Token       | Use                | Contrast |
| ----------- | ------------------ | -------- |
| `ink`       | headings, emphasis | 14.9:1   |
| `ink-muted` | body copy          | 8.7:1    |
| `ink-subtle`| captions, labels   | 4.9:1    |
| `coral`     | accent text        | 4.6:1    |
| `coral-bright` | buttons, large numerals, markers | — |

All clear WCAG AA.

## Page structure

`app/page.tsx` composes the sections in order:

1. `hero-section` — announcement bar, headline, video card, CTA
2. `script-is-the-business-section` — case-study cards
3. `webinar-failures-section` — the 5 structural failures
4. `percentage-point-section` — conversion math panel
5. `teaching-bio-section` — bio, stats, highlights
6. `proof-section` — proof screenshot + photo gallery
7. `is-this-for-you-section` — three persona cards
8. `testimonials-section` — student screenshots
9. `offer-stack-section` — what you get + pricing rationale
10. `faq-section`
11. `final-cta-section`
12. `legal-footer`

Shared primitives live in `components/ui/`: `Section` (one vertical rhythm
for every block), `CheckItem` (checkmark bullets), `PhotoPlaceholder`,
and `Button`.

## Dropping in real media

Every image slot renders a dashed placeholder until you supply artwork:

```tsx
<TeachingBioSection photo={<img src="/dan.jpg" alt="Dan Henry" className="h-full w-full object-cover" />} />

<ProofSection
  proofScreenshot={<img src="/dashboard.png" alt="" className="h-full w-full object-cover" />}
  galleryPhotos={{ 0: <img src="/kennedy.jpg" alt="" className="h-full w-full object-cover" /> }}
/>

<TestimonialsSection photos={{ 2: <img src="/whatsapp.png" alt="" className="h-full w-full object-cover" /> }} />
```

The hero video frame works the same way — pass `videoEmbed` to
`<HeroSection />` and it replaces the static "resume watching" placeholder
inside the same 16:9 box. There's a commented example in `app/page.tsx`.

## Countdown

`components/countdown-timer.tsx` drives both the top bar and the boxed
version in the hero. The target time is one constant, `WORKSHOP_START`, at
the top of `hero-section.tsx`. It renders a fixed value on the server and
fills in the live time after mount, which is what keeps it free of
hydration mismatches.
