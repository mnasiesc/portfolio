---
name: editorial-design
description: Style guide and component rules for the Vox-style tactile folded paper & magazine editorial theme
---

# Vox-Style Tactile Paper & Magazine Editorial Design Guide

Use this skill whenever styling pages, typography, paper textures, or UI components for the portfolio.

## 1. Tactile Paper Texture & Color System
The site should feel like a premium physical publication printed on warm, high-grade newsprint/parchment with dark ink:

- **Background Base**: `#FBF9F5` (Warm Parchment / Newsprint Light) / `#141312` (Deep Warm Charcoal Ink Dark)
- **Card & Section Surfaces**: `#F4F0E8` (Layered Paper Surface Light) / `#1C1A18` (Dark Ink Surface)
- **Ink & Text Hierarchy**:
  - Primary Text: `#1A1917` (`text-stone-900` / `dark:text-stone-100`) — Warm, rich ink black (never pure `#000000`)
  - Secondary Text: `#57534E` (`text-stone-600` / `dark:text-stone-400`) — Muted lead ink
  - Issue / Date Metadata: `#78716C` (`text-stone-500` / `dark:text-stone-500`) — Monospaced stamp ink
- **Hairline Dividers & Paper Creases**:
  - Crisp paper rules: `border-stone-300/70 dark:border-stone-800`
  - Subtle crease shadow effects: `shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]`
  - Paper grain texture: Subtle SVG noise/grain overlay or CSS radial gradient paper feel.

## 2. Typography Pairing (Vox Editorial Style)
- **Editorial Headings**: High-contrast, expressive serif fonts (e.g. *Newsreader*, *Fraunces*, or *Playfair Display*) with optical sizing and italic accent words.
- **Body Text**: Readable, clean geometric sans-serif (e.g. *Geist Sans*, *Inter*, or *Public Sans*) with wide line-height (`leading-relaxed`).
- **Issue Stamps & Monospace Metadata**: Crisp monospaced font (e.g. *Geist Mono*, *JetBrains Mono*) for issue numbers, date badges, tags, and code blocks (`VOL. 01 // 2026`).

## 3. Magazine UI Components & Structural Motifs
- **Magazine Header Masthead**: Large editorial title block with date lines, issue stamps, and thin double horizontal rules (`border-t-2 border-b border-stone-900`).
- **Folded-Paper Section Dividers**: Visual paper crease shadows and thin hairline borders that make sections look like folded pages of a newspaper or magazine.
- **Drop-Caps & Pull Quotes**: Large serif first letters on lead paragraphs, and block pull-quotes with thick left ink borders (`border-l-4 border-stone-900 dark:border-stone-100 pl-6 italic`).
- **Category & Issue Badges**: Monospaced ink-stamped tags (`bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 text-xs font-mono tracking-widest uppercase`).
- **Case Study Modals**: Styled like opening a pull-out feature article or magazine insert with a paper slide animation.
