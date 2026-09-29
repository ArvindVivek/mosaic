# Mosaic design

KL Web (`components/kl`, `styles/kl-tokens.css`) with Mosaic's teal accent, light and dark.
Kept separate from Lumina (the sister app, rose): one page, one job, a scouting report.

## Palette (for `kitchenlabs-kit/brand/mosaic/palette.json`)

```json
{
  "app": "mosaic",
  "displayName": "Mosaic",
  "appearance": "adaptive",
  "accent": "#0F766E",
  "accentStrong": "#0F766E",
  "accentDeep": "#0B4F4A",
  "accentSoft": "#DDECEB",
  "accentSoftDark": "#142E37",
  "onAccent": "#FFFFFF",
  "accentText": "#0F746C",
  "accentTextDark": "#15A69A",
  "secondary": null,
  "gradient": ["#14B8A6", "#0B4F4A"],
  "night": null
}
```

Measured: accentText 5.11:1 on `#F2F4F9`, 4.62:1 on accentSoft; accentTextDark 5.74:1 on `#151A28`,
4.71:1 on accentSoftDark; white on accentStrong 5.47:1. Closest suite accents (CIEDE2000): Nexus
`#1F6F8B` 16.1, Day 1 `#14A6A0` 17.1. Lumina (`#E11D48`) is far apart.

## Colour roles

| Colour | Means |
|---|---|
| Accent (teal) | The team being scouted, the selected tab, the primary action |
| Attack orange / defense blue | Round-win rates by side (`--attack*`, `--defense*` in `app/globals.css`) |
| Success / danger | Won / lost results; Strong / Weak maps |
| Warning | Small samples |

## Layout

Slim header, one reports page with URL-driven filters and tabs (every view is a shareable link),
"Ask the analyst" floating bottom-right. Tables scroll inside their card on phones; tabs scroll
sideways; the page itself never does (e2e checks it).
