# Design system: Field Book

Source of truth for tokens is `frontend/src/app/globals.css` (`@theme`). Direction: a surveyor's field book translated to a working CRM screen. It lends type, palette, density and one signature move; layout and controls stay standard web components.

## Colour

- Ground `oklch(0.965 0.008 245)`, surface `oklch(0.995 0.002 245)`, wash `oklch(0.94 0.012 248)` for hover and table headers.
- Ink (deep navy) `oklch(0.22 0.045 255)`, muted ink `oklch(0.45 0.03 255)`, rules `oklch(0.9 0.012 250)` / strong `oklch(0.8 0.02 250)`.
- App bar and dialog header: navy `oklch(0.24 0.055 255)`.
- Flag orange `oklch(0.74 0.17 55)` means "do this now": primary buttons (navy text on orange), follow-ups due today, the latest timeline station. Never decoration.
- Danger `oklch(0.5 0.2 25)` only for overdue follow-ups. Stale amber `oklch(0.47 0.12 65)` for leads quiet for 7+ days.
- Status hues (flagging-tape set), each a tint plus a dark foreground and a square swatch so colour is never the only cue: new blue, contacted yellow, qualified cyan, proposal violet, won green, lost grey.

## Type

- Barlow: text, controls, notes (15px base).
- Barlow Condensed: brand, headings, status tags, column labels.
- Red Hat Mono: times, follow-up chips, counts, timeline stations.
- Only tags, column labels and the brand are uppercase; headings are sentence case.

## Shape and depth

- Flat. Structure is 1px rules; only the dialog has a shadow.
- Radii: controls 6px, tags and chips 4px, panels 8px, dialog 12px.
- Rows are 44px dense on desktop; hit areas are at least 40px.

## Components

- App bar: brand, search (`/` focuses it), New lead.
- Filter tabs with per-status counts, sort select (Needs attention, Latest contact, Longest silence, Name A–Z).
- Lead table: Lead, Status, Last note, Last contact, Follow-up. Today's follow-ups are pinned above in an orange-tinted block. Arrow keys move between rows.
- Timeline dialog: two panes. Left, the chain rail; right, status list and next follow-up. Follow-up presets (Tomorrow, In 3 days, Next week, Pick date) sit above Save note.

## Signature move

The timeline is a chain rail: each discussion is a station on a vertical line, and the space between stations grows with the silence between contacts (log-scaled steps, labelled `+5d`). Long gaps are visible without reading dates.

## Motion

One authored moment: dialog enter (200ms, scale 0.97 and fade, strong ease-out) and exit (130ms). New timeline entries slide in 6px. Press feedback is `scale(0.96)`. All of it is reduced under `prefers-reduced-motion`.
