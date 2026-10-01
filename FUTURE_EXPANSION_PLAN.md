# Future Expansion Plan: Personal Admin Dashboard & Visual CMS

> **Status:** Planned / Deferred  
> **Target:** Post-v1 Milestone  
> **Author:** Mnasie  

---

## 1. Overview

This document outlines the architecture and feature roadmap for an integrated administrative dashboard. The goal is to manage content, monitor audience traffic, and add new portfolio sections directly through a visual interface without needing to manually edit code, commit to Git, or trigger manual redeployments.

---

## 2. Core Capabilities & Feature Roadmap

### A. Traffic & Analytics Monitoring
- **Privacy-First Metrics:** Track pageviews, unique visitors, bounce rates, and session durations.
- **Referral Tracking:** Monitor where visitors arrive from (e.g., X, LinkedIn, Telegram, GitHub, Hashnode).
- **Engagement Insights:** Track outbound clicks to project repositories and Hashnode technical essays.
- **Recommended Tools:** Self-hosted Umami or Plausible, or a lightweight custom telemetry endpoint logging to SQLite / Turso.

### B. Visual Article & Content Management
- **Article Editor:** Visual Markdown / MDX editor with live preview, syntax highlighting, and frontmatter editing (title, date, tags, reading time, canonical URL).
- **Drafting & Publishing:** Save drafts locally before publishing them to the public catalog.
- **Hashnode Sync:** Direct integration with Hashnode's GraphQL API to automatically sync articles published on *Kernel Thoughts* ([kernel-thoughts.hashnode.dev](https://kernel-thoughts.hashnode.dev)).

### C. Project Portfolio Manager
- **CRUD Operations:** Add, edit, reorder, or archive projects without editing `src/lib/config.ts`.
- **Status Badges:** Toggle project status (`featured`, `active`, `experimental`, `archived`) with immediate visual feedback.
- **Asset / Demo Uploader:** Attach demo screenshots, architecture diagrams, and custom links directly.

### D. Dynamic Section Builder
- **Extensible Layouts:** Ability to toggle and insert new editorial sections on demand:
  - *Research & Whitepapers*
  - *Speaking & Talks*
  - *Open-Source Contributions & PR Activity*
  - *Systems Reading List / Book Reviews*
- **Order Reorganization:** Drag-and-drop or rank-order configuration for homepage layout sections.

---

## 3. Recommended Architecture & Tech Stack

| Layer | Recommended Choice | Rationale |
| :--- | :--- | :--- |
| **Authentication** | Auth.js (NextAuth) or GitHub OAuth | Secure single-user admin authentication restricted to personal GitHub profile. |
| **Database** | Turso (libSQL) or Supabase (PostgreSQL) | Serverless, zero-maintenance, free-tier friendly, fast edge query execution. |
| **ORM / Data Layer** | Drizzle ORM | Type-safe, lightweight, zero bloat, native TypeScript schema synchronization. |
| **Dashboard UI** | Next.js App Router (`/admin`) | Same design language and components; protected with Next.js Middleware. |
| **Storage (Assets)** | Cloudflare R2 or Uploadthing | S3-compatible, generous free tiers, fast global CDN delivery. |

---

## 4. Implementation Steps (When Ready to Build)

1. **Step 1: Admin Route & Authentication**
   - Create `/src/app/admin` with Next.js Middleware guarding unauthorized requests.
   - Configure GitHub OAuth allowing only the administrator's GitHub ID (`mnasies`).

2. **Step 2: Database Schema & Migration**
   - Define tables for `projects`, `articles`, `analytics_events`, and `sections`.
   - Seed database using current `src/lib/config.ts` data as the baseline.

3. **Step 3: CMS Dashboard UI**
   - Implement tabs: *Overview / Analytics*, *Projects*, *Writing*, and *Settings*.
   - Add forms for editing project descriptions, tags, and years.

4. **Step 4: Real-time Revalidation**
   - Use Next.js `revalidatePath("/")` on write operations so updates reflect instantly across the live portfolio.
