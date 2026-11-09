# Palette Studio

A responsive six-color palette generator built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` for a TypeScript check and production build, or `npm run lint` for Oxlint.

## Features

- Seven harmony modes with warm/cool/neutral, saturation, lightness, and contrast controls.
- HEX, recognized color-name, numeric, and text seeds. Text and numeric seeds are deterministic for the same settings.
- Independent color locks and keyboard shortcuts: `Space` generates, `1`–`6` toggle locks, `C` copies the focused color, and `Escape` closes overlays.
- Saved palettes persist in browser local storage.
- Copy all HEX values; copy CSS variables; export JSON and PNG.
- Color labels are the nearest CSS named color in Lab color space. They are descriptive matches, not official brand or Pantone identities.

Saved palettes are stored locally in the current browser and are not synchronized between devices.
