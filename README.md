# DataAtlas

YouTube channel: longform data videos about countries — rankings, comparisons, and geopolitical insights. Built with [Remotion](https://www.remotion.dev/).

## Stack

- **Remotion** + React 19 + TypeScript — programmatic video rendering
- **d3-geo** + **topojson** + **world-atlas** — country geometries
- **country-flag-icons** — flag SVGs
- **react-icons** — UI icons

## Project structure

```
src/
├── shared/                       # Cross-video utilities
│   ├── theme.ts                  # Dark-theme tokens (used by shorts engine)
│   ├── CountryFlag.tsx           # Single deduped flag component
│   └── worldData.ts              # World-atlas topology loader
├── shorts/_engine/               # Reusable shorts components (1080×1920)
│   ├── ShortWorldMap.tsx         # Animated world map with country highlights
│   ├── FlagBadge.tsx             # Top-center flag w/ spring entry
│   ├── ScriptLine.tsx            # Karaoke caption synced to narration
│   ├── BeatLayer.tsx             # Stat/Portrait/Comparison/Stamp/Counter/Logo beats
│   ├── HookOverlay.tsx           # Opening big-text karaoke
│   ├── ClosingCard.tsx           # Final stat card w/ flag row
│   ├── CompanyIcons.tsx          # Branded badge row
│   ├── brandIcons.ts             # BRAND_MAP (~30 brands)
│   ├── cameraBuilder.ts          # Keyframe builder + interpolation
│   ├── sceneHelpers.ts           # getSceneAt, getHighlights
│   ├── safeZones.ts              # YouTube Shorts safe-area constants
│   └── types.ts                  # Scene, Camera, WordCue, NarrationTimings
└── longform/                     # Longform videos (1920×1080)
    └── passportRanking/          # "World's Strongest Passports 2026"
        ├── data.ts               # ~88 countries, Henley 2024 baseline
        ├── Card.tsx              # Editorial country card
        ├── Carousel.tsx          # Horizontal sliding stage
        ├── TopBar.tsx            # Title + rank counter
        ├── ProgressBar.tsx       # Bottom video progress bar
        ├── HookScene.tsx         # 5s opening
        ├── ClosingScene.tsx      # 15s final reveal
        ├── PassportRanking.tsx   # Composition
        └── palette.ts            # Light-theme palette
```

## Scripts

```bash
npm start                # launch Remotion Studio (preview/scrub live)
npm run build:passport   # render out/passport-ranking.mp4
```

## Status

- ✅ Shorts engine ported from companion channel
- ✅ Passport ranking composition (light theme, ~6:12 at current data size)
- 🚧 Refresh data to current Henley 2026 numbers before publishing
- 🚧 Add narration pipeline for 8+ min videos (mid-roll monetization)
