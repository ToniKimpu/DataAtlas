# DataAtlas — Claude Code project notes

This file is auto-loaded by Claude Code at the start of every session in this directory. It is the source of truth for plans, conventions, and implementation details that should survive across sessions and machine swaps.

---

## What this project is

DataAtlas is a Remotion-based pipeline that produces **country-themed data videos** for YouTube. The channel publishes both longform (16:9, 5–8 min) and shorts (9:16, ~60 s). The goal is to scale topic coverage (passports, GDP, military, AI, oil, chips, gaming, etc.) without YouTube flagging the channel as inauthentic / mass-produced content.

The anti-inauthentic strategy: **a small number of structurally-distinct video templates**, each reused across many topics. Same template + new data ≠ mass production, as long as the templates themselves look and feel genuinely different from each other.

---

## Build conventions

These hold across all longform templates. New code should follow them unless explicitly agreed otherwise.

- **Light theme** for longform compositions. Shorts engine (`src/shorts/_engine/`) is dark-themed. Don't unify — light reads better on TV/desktop, dark reads better on phones.
- **No AI voiceover, ever.** YouTube's inauthentic-content policy flags AI TTS hardest right now. Human VO is acceptable if the user adds it selectively (intro/outro only). On-screen text + atmospheric music + SFX retains well on data channels.
- **3-act structure**: HookScene → main body (metric loop / carousel / etc.) → ClosingScene. Frame-counted via exported constants (`HOOK_FRAMES + N × <BODY>_FRAMES + CLOSING_FRAMES = TOTAL_FRAMES`).
- **One composition per template**, parametrized by `data.ts`. New videos = swap the data file, render. Template code stays untouched.
- **Inter / Segoe UI / system-ui** font stack everywhere.
- **Audio assets** (in `public/`):
  - `map-music.mp3` — background loop, volume 0.3 under everything
  - `map-whoosh.mp3` — transition/arrival SFX (volume 0.5–0.6)
  - `map-reveal.mp3` — reveal/winner moment SFX (volume 0.7–0.9 depending on weight)
- **Audio layering pattern**: wrap SFX in `<Sequence from={N} durationInFrames={X}>` to fire at exact frames. Music plays globally as `<Audio loop>` at the composition root.
- **Length philosophy**: target 5–8 min. **Retention > total length.** Don't pad to clear YouTube's 8-min mid-roll threshold if it dilutes content. Better path: a more comprehensive matchup with more naturally-occurring metrics.
- **Pacing rule (added during ChartRace build)**: **no static hold over ~3 s**. Anything that isn't actively animating should fade/cut within 1–3 s, or have something subtly moving (pulse, drift) to avoid feeling dead. To extend a runtime, add more story moments / snapshots / metrics rather than lengthening holds. Tested on ChartRace and the difference between a 60 s "contenders" intro and an 18 s one was the difference between watchable and bail-worthy.
- **Data file pattern**: each template has `data.ts` exporting (a) typed shape definitions, (b) helpers for computed values (winner, score, formatting), (c) the actual data constant. New videos require only the data constant to change.

---

## The 6 longform video templates

| # | Template | Status | Folder |
|---|---|---|---|
| 1 | Ranking Countdown | Built | `src/longform/passportRanking/` |
| 2 | Head-to-Head Battle | Built | `src/longform/headToHead/` |
| 3 | World Map Reveal | Planned | `src/longform/mapReveal/` (TBD) |
| 4 | Bar-Chart Race / Timeline | Built | `src/longform/chartRace/` |
| 5 | Tier List (S/A/B/C/D) | Planned | `src/longform/tierList/` (TBD) |
| 6 | Bracket Tournament | Planned | `src/longform/bracket/` (TBD) |

### Production cost (rough, lowest → highest effort, excluding the three built)

1. Tier List
2. World Map Reveal
3. Bracket Tournament (reuses H2H match overlay + audio pattern)

---

## Template implementation details

### 1. Ranking Countdown *(built)*

- **Folder**: `src/longform/passportRanking/`
- **Composition root**: `PassportRanking.tsx` — `HOOK_FRAMES=150`, `FRAMES_PER_CARD=120`, `CLOSING_FRAMES=450`
- **Visual**: horizontal card carousel, one country per card, rank N → 1
- **Data shape**: `{ rank, iso2, name, value, accent? }[]`
- **Audio**: `map-music.mp3` loop only (no SFX in v1 — could be added later following the H2H pattern)
- **Current dataset**: Henley Passport Index 2026 — curated 100-country selection. `rank` and `visaFree` are kept strictly consistent (score never rises as rank improves) so the weakest→strongest reveal climbs monotonically; ties are capped ~3–4 per score so the climax never stalls on identical cards. Singapore is the solo #1.
- **Suitable topics**: passports, GDP, military spending, Olympic medals, oil reserves

### 2. Head-to-Head Battle *(built — full implementation details below)*

**Folder**: `src/longform/headToHead/`

**Composition root**: `HeadToHead.tsx`
- `HOOK_FRAMES = 240` (8 s)
- `METRIC_FRAMES = 570` (19 s)
- `CLOSING_FRAMES = 870` (29 s — includes a 150 f ResultsGrid stage)
- With 16 metrics: `240 + 16×570 + 870 = 10,230 frames = 5:41 @ 30 fps`

**Per-metric sub-timing** (570 f window inside `MetricRow.tsx`):

```
0–22    category pill + label slide down
22–60   hold (viewer reads label)
60–240  LEFT counter ticks 0 → final + magnitude bar fills (cubic-out)
240–420 RIGHT counter ticks 0 → final + magnitude bar fills
420–480 compare hold (deliberately tight — 2 s, was 4 s)
480–498 WINNER badge slams in (spring, 18 f)
510–526 AFTERMATH callout slides up (spring, 16 f)
550–570 fade out
```

Exported constants from `MetricRow.tsx`: `WINNER_DECLARED_AT = 480`, `AFTERMATH_AT = 510`. The composition uses these to compute the live scoreboard (`winnersDeclared`) and to schedule WINNER SFX.

**Background recipe — "Split Arena"** (stacked in `HeadToHead.tsx`, redesigned to fix a flat/washed-out look):

1. **Neutral base**: light vertical gradient (`#EEF2F7 → #DFE5EC → #C9D2DD`).
2. **ArenaHalf ×2**: the two team-colored halves, each a `clip-path` polygon wedge. The dividing edge runs x=54 % (top) → x=46 % (bottom) — a "/" lean. Each half layers a radial highlight + linear gradient of the team color (alpha 24 %→66 %) so it reads unmistakably as blue / red territory while staying light enough for white panels to pop.
3. **SpeedLines**: 36 lines radiating from center, ring-masked, opacity 0.14.
4. **Seam**: glowing diagonal line on the wedge edge — blurred color-blend halo + bright white core. `SEAM_ANGLE = 8.1°` (derived from the clip geometry; keep the two in sync).
5. **Top Spotlight**: white radial pool brightening the header band.
6. **DotGrid**: subtle dot texture, opacity 0.18.
7. **FloorBand** + **Vignette**: depth at the bottom and edges.

**Leader photos** (added in the redesign): `Country` has optional `photo?` (filename in `public/`) + `photoFocus?` (CSS `object-position`). `Portrait.tsx` renders the photo cropped `object-fit: cover`, or falls back to the flag when `photo` is unset — so every matchup still works. Photos appear in the Hook panels, the Arena top-bar avatars, and the Closing champion panel. **Licensing is the data author's job — public-domain / CC only** (current: Trump = US-gov PD; Xi = CC BY 4.0, Kremlin.ru).

**Per-metric layout — "Two team panels"**: `MetricRow.tsx` houses each side in its own team-colored panel (`TeamPanel`) — colored header strip (flag + name), white body with the big counter + magnitude bar, reserved winner-badge zone. The winning panel lifts, brightens and glows. Replaces the old loose `ValueColumn` stack.

**Audio layering** (each wrapped in `<Sequence>`):

- Background: `map-music.mp3` loop @ 0.3 — global
- Per-metric whoosh: `map-whoosh.mp3` @ 0.55 — fires at frame 0 of each metric, 45 f duration
- Per-metric WINNER: `map-reveal.mp3` @ 0.7 — fires at `arenaStart + i × METRIC_FRAMES + WINNER_DECLARED_AT`, 75 f duration, **skipped for ties** (`winnerOf(m) === "tie"`)
- Closing trophy: `map-reveal.mp3` @ 0.9 — fires at `closingStart + 150` (after the ResultsGrid stage), 120 f duration

**Category system** (`data.ts`):

- 6 categories: `ECONOMY` (emerald `#10B981`) · `MILITARY` (crimson `#DC2626`) · `TECH` (indigo `#6366F1`) · `INFRASTRUCTURE` (amber `#F59E0B`) · `DEMOGRAPHIC` (teal `#14B8A6`) · `SPORT` (purple `#A855F7`)
- Each `Metric` has a required `category: Category` field
- Rendered as a colored pill above the metric label in `MetricRow`, and as the cell border + tiny category strip in the ResultsGrid

**ClosingScene 2-stage structure** (`ClosingScene.tsx`):

- `GRID_DURATION = 150` (5 s)
- **Stage 1 (within = 0–150)**: `<ResultsGrid>` — 4×4 grid of all 16 metrics. Each cell shows category strip + label + both flags with winner highlighted (scale 1.1, full opacity) and loser dimmed (opacity 0.4). Cells stagger-animate in via spring (4 f offset each). Whole grid fades out 125 → 150.
- **Stage 2 (within ≥ 150)**: trophy → winner flag → winner name → "WINS THE BOUT" → final scoreboard → footer ("Data: World Bank, SIPRI, Forbes 2024"). All springs reference `t = within - GRID_DURATION`.

**Data structure** (`data.ts`):

```ts
type Matchup = {
  title: string;       // "USA vs CHINA"
  subtitle: string;    // "2024 GLOBAL POWER COMPARISON"
  left: Country;       // { iso2, name, color }
  right: Country;
  metrics: Metric[];   // 8–16 ideally
};
type Metric = {
  label: string;
  category: Category;
  unit?: string;       // "T", "B", "M", "K", "yr", "%"
  leftVal: number;
  rightVal: number;
  winnerRule?: "higher" | "lower";  // default higher
  note?: string;       // optional context line shown small
};
```

Helpers: `winnerOf(m)`, `scoreAfter(matchup, count)`, `formatValue(v)`, `aftermathText(m)` (adapts phrasing to ratio scale and lower-is-better metrics).

**To produce a new Head-to-Head video**:

1. Edit `src/longform/headToHead/data.ts` — replace the `matchup` constant with a new pairing (countries, colors, 8–16 metrics with categories).
2. `npm start` to preview in Remotion Studio.
3. `npm run build:headtohead` to render locally, or trigger via GitHub Actions (composition id: `HeadToHead`).

**Current dataset**: USA vs CHINA, 16 metrics, sourced from World Bank, SIPRI, Forbes (2024 figures). Order alternates winners to keep the live scoreboard tense. Final score: CHN 8 — USA 7 — Tie 1.

### 3. World Map Reveal *(planned)*

- Visual: full-screen 1920×1080 world map, countries light up progressively as each is named ("every country that…")
- Data: `{ title, countries: { iso2, label, year?, note? }[] }`
- Reuses: `ShortWorldMap` ported to 16:9, `cameraBuilder` for fly-to moves
- Suitable topics: nuclear powers, EU members, OPEC, US military bases abroad, BRICS

### 4. Bar-Chart Race / Timeline *(built — full implementation details below)*

**Folder**: `src/longform/chartRace/`

**Composition root**: `ChartRace.tsx`
- `HOOK_FRAMES = 210` (7 s) — title, year range banner, headliner flag preview
- `CONTENDERS_FRAMES = 300` (10 s) — 10 starting-year cards in a 5×2 grid + 3 WATCH FOR spoilers
- `INITIAL_DWELL = 60` (2 s) — hold on year[0] before race begins
- `TRANSITION_FRAMES = 240` (8 s per 5-year jump) — eased rank interp + linear value interp
- `STORY_DWELL_FRAMES = 240` (8 s per callout) — race holds while StoryCallout overlays
- `FINAL_DWELL = 90` (3 s) — hold on the last snapshot
- `ANALYSIS_FRAMES = 420` (14 s total, 210 per stage) — Climbers podium → Fallers podium
- `CLOSING_FRAMES = 270` (9 s) — trophy + champion card (flag + name + value) + wire-to-wire payoff + source footer
- With 14 snapshots and 4 story moments: total runtime ~2:41 @ 30 fps

**5-segment structure** (in order on the timeline):
1. **Hook** — opening title scene (`HookScene.tsx`)
2. **Contenders** — "MEET THE CONTENDERS · 1960" intro (`ContendersScene.tsx`)
3. **Race body** — 13 transitions interleaved with 4 story dwells (`RaceScene.tsx` + `StoryCallout.tsx`)
4. **Analysis** — two-stage "BIGGEST CLIMBERS" / "BIGGEST FALLERS" podiums (`AnalysisScene.tsx`)
5. **Closing** — pure trophy moment (`ClosingScene.tsx`)

**Race schedule abstraction** (the key engine pattern — first time a longform composition used it):
```ts
type RaceBeat =
  | { kind: "dwell"; from; to; yearIdx; storyIdx? }
  | { kind: "transition"; from; to; fromYearIdx };
```
- `buildSchedule()` runs once at module load and produces a flat list of beats covering the entire race body, including story-dwell pauses interleaved at the right years.
- `RaceScene` finds the active beat for the current frame and computes `(yearIdx, t, tLinear)` accordingly. Story callouts are positioned as `<Sequence>` blocks at the beats marked with `storyIdx`.
- This made the timing math one loop instead of branching, and makes adding more story moments a one-line change in `data.ts`.

**Easing choices**:
- Rank interpolation: `Easing.out(Easing.cubic)` — bars *launch* into the new slot and settle. Originally ease-in-out, which felt sluggish.
- Value interpolation: linear — keeps on-screen number ticking at a readable cadence.

**Adaptive value formatting** (`formatValue` in `data.ts`):
- `< 1T` → shown as billions (e.g. "543B")
- `≥ 1T` → shown as trillions (e.g. "5.96T", "28.8T")
- Reason: "0.54T" reads dead — the digit barely moves during interpolation. "543B" reads alive.

**Data shape** (`data.ts`):
```ts
type RaceData = {
  title: string;
  subtitle: string;
  metricName: string;
  unit: string;         // "T" | "B" | "M" | "K" | "%"
  source: string;
  countries: Country[]; // every country that ever appears in any snapshot
  years: YearSnapshot[];
};
type YearSnapshot = { year: number; entries: { iso2; value }[] };
```
Helpers: `getCountryStateAt(iso2, yearIdx, t, tLinear)` returns `{ rank, value, opacity }`, with opacity fading countries entering/leaving the visible stack; `getMaxValueAt` for auto-scaling bar widths so the leader is always 100 %; `getLeaderAt` for the leader badge; `yearAt(yearIdx, t)` for the smoothly-interpolating year ticker; `topClimbers(n)` / `topFallers(n)` for the Analysis stage.

**Story moments** (`storyMoments` in `data.ts`):
```ts
type StoryMoment = { year; title; body; accent? };
```
- Each fires when the race lands on its `year` — race holds for `STORY_DWELL_FRAMES` (8 s).
- **Body text must be ≤ 12 words** so it reads in 2–3 s within the 8 s callout window. Wordier copy gets cut off.
- The story-callout year number has a subtle 1.4 Hz pulse during the hold phase, so the static "reading time" never feels dead.
- Current dataset moments: 1980 (Japan #2), 1995 (USSR dissolves), 2010 (China passes Japan), 2020 (Pandemic).

**Audio layering** (each wrapped in `<Sequence>`):
- Background: `map-music.mp3` loop @ 0.3 — global
- Whoosh at contenders / race / analysis arrival: `map-whoosh.mp3` @ 0.55–0.6
- Per-story-callout reveal sting: `map-reveal.mp3` @ 0.6 (90 f duration at story start) — built by filtering the schedule for `storyIdx !== undefined`
- Climbers → fallers stage-switch whoosh @ 0.5 (mid-analysis)
- Closing trophy: `map-reveal.mp3` @ 0.9 (120 f at `closingStart + 20`)

**Visual design** (light theme):
- Background: 4-stop aurora gradient + 4 aurora-glow blobs + a faint on-theme "GDP growth curve" motif (`GrowthChart`) + toned-down dot grid + `FloorBand` + `Vignette`. Redesigned away from the original flat 3-stop pale gradient.
- Race scene header: title left, `YearTicker` right (140 px tabular-nums) with leader badge inline
- Bar rows: rank number + flag + country name on left, color-filled bar in middle, value on right. Leader gets a white shine strip on top + extra glow
- Bar widths auto-scale to current visible max (so the leader always reaches 100 %)
- Off-screen countries fade across the bottom slot via `getCountryStateAt` opacity = `clamp(0,1, OFF_RANK − rank)` — a country parked at rank `OFF_RANK` (11) has opacity 0 and never renders as a stray 0-value bar. The bar stack also has `overflow: hidden` as a backstop.
- Closing: trophy → champion card (winner flag + name + `formatValue` badge) → `wireToWire` payoff pill (shown only when the winner led every snapshot, computed from the data — pays back the contenders tease)
- Story callouts: full-screen scrim @ 0.55 + centered white card with colored top border, huge year (130 px), title (56 px), short body (28 px)
- Analysis stages: bold pill ("BIGGEST CLIMBERS" / "BIGGEST FALLERS") + 3 podium cards. **No redundant title text** like "WHO ROSE THE FASTEST?" — pill carries it alone.

**Current dataset**: World GDP 1960 → 2024, top 10 nominal economies. 14 snapshots at 5-year intervals (plus 2024). Approximate historical figures from World Bank / IMF / Maddison estimates. USSR rendered with iso2 `RU` 1960–1990 (no Soviet flag in country-flag-icons); West Germany rendered with current German flag (also `DE`). Final 2024 top 10: USA, China, Germany, Japan, India, UK, France, Italy, Canada, Brazil.

**To produce a new chart-race video**:
1. Edit `src/longform/chartRace/data.ts`:
   - Replace `years` with new metric snapshots (population, military spending, internet users, CO2, etc.)
   - Update `title`, `subtitle`, `metricName`, `unit`, `source`
   - Update `countries` to include every country that appears in any snapshot
   - Replace `storyMoments` with 3–5 new moments anchored to years in the new dataset (≤ 12-word body)
2. `npm start` → preview `ChartRace` in Remotion Studio
3. `npm run build:chartrace` → renders to `out/chart-race.mp4`

**Pacing lessons learned during this build** (apply to future templates):
- Bar-chart races have a natural runtime ceiling (~2–4 min). To extend, add more story moments OR densify the snapshot cadence (every 2 yrs instead of every 5) — never slow the transitions back down.
- Building a Rules-of-Hooks bug into `ContendersScene` (a `useMemo` after an early `return null`) once cost a debug cycle. For Remotion compositions that early-return when out of window, push any derived computation that depends only on static data to module scope (see `WATCH_FOR_CARDS` constant).
- Cutting redundant title text was a bigger pacing win than expected — "BIGGEST CLIMBERS" + "WHO ROSE THE FASTEST?" was 1.5 s of dead air; one bold pill covers both.

**Suitable topics for swap-in**: population 1960–2024, military spending, internet users, CO2 emissions, oil reserves, smartphone shipments, Olympic medal totals, biggest-companies-by-market-cap (this one has the most volatile #1, would be very strong).

### 5. Tier List (S/A/B/C/D) *(planned)*

- Visual: grid of 5 tier rows, pool of country flags, flags fly into their assigned tier one at a time, final completed board lingers
- Data: `{ title, criteria, items: { iso2, name, tier: 'S'|'A'|'B'|'C'|'D', justification }[] }`
- Suitable topics: passport tiers, currency strength, soft power, military, education, healthcare

### 6. Bracket Tournament *(planned)*

- Visual: 16-country single-elimination bracket tree, each round shows a match overlay (two flags + metric), winner advances on the tree
- Data: `{ title, metric, bracket: { round, matches: { left, right, winner }[] }[] }`
- Reuses Head-to-Head's match overlay and audio layering pattern
- Suitable topics: military strength, economy size, food culture, beach quality (subjective ones drive comments)

---

## Reusable building blocks already in repo

- **World map**: `src/shared/worldData.ts`, `src/shorts/_engine/ShortWorldMap.tsx`
- **Country flags**: `src/shared/CountryFlag.tsx` — `<CountryFlag iso2="US" height={140} radius={0} shadow={false} />`
- **Brand registry** (tech / AI / chips / gaming / oil): `src/shorts/_engine/brandIcons.ts`
- **Palettes**: `src/shared/theme.ts` (dark, for shorts), `src/longform/passportRanking/palette.ts`, `src/longform/headToHead/palette.ts`, `src/longform/chartRace/palette.ts` (light, longform — all three are identical; extract to `src/longform/_shared/palette.ts` now that three exist).
- **Hook / closing patterns**: see all three built templates' `HookScene.tsx` and `ClosingScene.tsx`
- **ProgressBar**: `src/longform/passportRanking/ProgressBar.tsx` — currently imported cross-folder by HeadToHead. If a 3rd longform uses it, extract to `src/longform/_shared/`. (ChartRace did not need one.)
- **Frame-counted timing pattern**: see the constants near the top of `PassportRanking.tsx`, `HeadToHead.tsx`, and `ChartRace.tsx`.
- **Audio assets**: `public/map-music.mp3`, `public/map-whoosh.mp3`, `public/map-reveal.mp3`
- **Audio layering pattern**: see `HeadToHead.tsx` and `ChartRace.tsx` — `<Sequence>` wraps each per-event SFX, music plays globally
- **Aftermath caption helper**: `headToHead/data.ts` `aftermathText()` — adapts phrasing to ratio scale and lower-is-better metrics. Reusable shape for any comparison template.
- **Magnitude bar pattern**: see `MetricRow.tsx` `TeamPanel` AND `chartRace/RaceScene.tsx` `BarRow` — proportional fill scaled to the visible-max value. Reusable for tier list, bracket.
- **Portrait / photo pattern**: `headToHead/Portrait.tsx` — renders an optional `country.photo` (file in `public/`) cropped `object-fit: cover` via `photoFocus`, with a flag fallback when no photo is set. Reusable for any template that wants optional leader/representative imagery without breaking data that lacks it.
- **Race schedule / beat pattern**: `chartRace/ChartRace.tsx` `buildSchedule()` + `RaceBeat` type. A flat list of `{ dwell | transition }` beats with `(from, to, yearIdx | fromYearIdx, storyIdx?)`. Lets a scene with non-uniform timing (some transitions, some pauses for callouts) be resolved with one `findBeat()` lookup. Reusable for the Bracket template (round transitions + match-overlay dwells share this shape).
- **Story-callout overlay pattern**: `chartRace/StoryCallout.tsx` — full-screen scrim + centered card + huge year/title/short-body. Body kept ≤ 12 words. Year pulses subtly during the hold to avoid feeling static. Reusable for any template that wants to interrupt itself with a "did you know" beat.
- **Climber / Faller analysis pattern**: `chartRace/AnalysisScene.tsx` — two-stage podium reveal driven by `topClimbers(n)` / `topFallers(n)` helpers in `data.ts`. Reusable for any ranked-data template.
- **Adaptive value formatter**: `chartRace/data.ts` `formatValue()` — picks billions vs trillions automatically so the on-screen number actually changes per frame during interpolation. Reusable for any template displaying values across a wide dynamic range.

---

## Workflow for adding a new template

1. Create `src/longform/<templateName>/` with:
   - `<TemplateName>.tsx` — composition component, exports `TOTAL_FRAMES`
   - `data.ts` — typed data + helpers for this template
   - `palette.ts` — copy from a built template if light theme
   - `HookScene.tsx`, `ClosingScene.tsx`, plus body components specific to this template
2. Register in `src/Root.tsx` with a unique `id`, dimensions `1920×1080` for longform, `durationInFrames={TOTAL_FRAMES}`
3. Test in Remotion Studio: `npm start`
4. Add a build script to `package.json` (e.g., `"build:<name>": "remotion render <Id> out/<name>.mp4"`)
5. The GitHub Actions workflow (`.github/workflows/render.yml`) renders a single composition by id with **no workflow changes needed**. To include the new template in the default **"all"** render, add its id to the `matrix` list in the workflow's `setup` job (one line).

---

## Render / output notes

- **GitHub Actions** (`.github/workflows/render.yml`): manual `workflow_dispatch`. The `composition` input defaults to **`all`** — a matrix renders every composition (PassportRanking, HeadToHead, ChartRace) in **parallel jobs** (`fail-fast: false`, so one failure doesn't cancel the rest); type a specific id to render just one. Each render uploads a 30-day artifact, then a final **`publish`** job attaches all the MP4s to a rolling **`latest-renders` GitHub Release** — refreshed in place every run, so no git-history bloat. Grab the finished videos from the repo's **Releases** page (or the Actions run's Artifacts). The runner filesystem is throwaway — nothing in `out/` syncs back into git.
- **Local renders**:
  - `npm run build:passport` → `out/passport-ranking.mp4`
  - `npm run build:headtohead` → `out/head-to-head.mp4`
  - `npm run build:chartrace` → `out/chart-race.mp4`
- **Studio preview**: `npm start` — opens Remotion Studio, scrub through any composition.
- **Brand assets**: `src/brand/` holds two single-frame still compositions — `ProfileImage` (800×800 YouTube avatar) and `CoverImage` (2560×1440 channel banner, logo lockup kept inside the 1546×423 safe area). Vivid-blue field with an amber accent (`src/brand/theme.ts`), built around `BarMark` — a four-bar ascending chart mark (tallest bar gold). No map/globe. Export with `npm run export:brand` → `brand/profile.png` + `brand/cover.png`.

---

## Notes for Claude in future sessions

- If asked to "build the next video type", confirm which of the 3 unbuilt templates (World Map Reveal / Tier List / Bracket Tournament) the user means before scaffolding.
- If the user proposes a 7th template, ask whether it replaces one of the existing six rather than silently expanding scope.
- **AI TTS voiceover policy was revisited during the ChartRace build**: the strict ban ("no AI TTS ever") was relaxed. The accurate position now: YouTube doesn't ban AI voice; it demonetizes *low-effort, fully-AI-generated* content. DataAtlas has original data + custom Remotion animations + 6 distinct templates, so adding ElevenLabs-style narration would not get flagged. Still requires explicit user OK before wiring it in, but it's no longer a hard rule.
- When tuning Head-to-Head pacing: `METRIC_FRAMES` lives in `HeadToHead.tsx`; the sub-timing constants `WINNER_DECLARED_AT` and `AFTERMATH_AT` live in `MetricRow.tsx` and must stay coordinated with it (the audio sequences in `HeadToHead.tsx` rely on `WINNER_DECLARED_AT`).
- When tuning ChartRace pacing: `TRANSITION_FRAMES` and `STORY_DWELL_FRAMES` in `ChartRace.tsx` are the main knobs. Lower transition = punchier overtakes but shorter runtime; the right way to extend runtime is more story moments in `data.ts` or denser snapshots, NEVER slower transitions. Both `RaceScene.tsx` and the `<Sequence>`-wrapped story callouts read from `buildSchedule()` — keep that single source of truth.
- When adding a new chart-race dataset: only `data.ts` changes. Template code stays untouched. Story-moment body text must be ≤ 12 words.
- When adding a new Head-to-Head matchup: only `data.ts` changes. Template code stays untouched. Metric count 8–16 ideal; outside that range may need timing tweaks.
- When adding a new template, check first if it can **reuse** existing patterns: `<Sequence>`-wrapped SFX layering, the magnitude-bar component, the category pill, the `aftermathText` helper, the ResultsGrid component. Composition over duplication.
- Memory at `C:\Users\Hp\.claude-personal\projects\D--ContentCreator-DataAtlas\memory\` mirrors part of this file. **This `CLAUDE.md` is the source of truth** — if they diverge, trust CLAUDE.md and update the memory.
