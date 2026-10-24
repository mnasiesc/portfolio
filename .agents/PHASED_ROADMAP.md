# Phased Portfolio JSON Migration Roadmap

## Objective

Move every editable portfolio value into one canonical JSON document, including all visible text, titles such as "Systems Programmer", SEO metadata, article content, and the actual bytes and alt text for every portfolio image. Keep layout, styling rules, and interaction behavior in application code. Build a separate editing tool against the shared JSON contract after the public site is data-driven.

Work proceeds in order. Each phase has a gate; later phases begin only when the preceding gate passes. Git operations are local only unless explicitly authorized.

## Phase 1: Content Contract and Source Inventory

**Goal:** establish the complete data model and account for every current editable value.

**Milestones:**
- Inventory strings and content currently in config, route metadata, layouts, components, and article files.
- Define `content/portfolio.json` sections for site identity/SEO, navigation, socials, home copy, projects, writing copy, articles, and image payload records.
- Define a versioned JSON Schema for required/optional fields, stable IDs/slugs, project statuses, image MIME types, and payload-size constraints.
- Migrate current data and article bodies without changing public wording or slugs.
- Embed current portfolio image bytes as base64/data URIs in the JSON source; preserve alt text as editable fields.

**Exit gate:** JSON parses, validates against its schema, contains every inventoried editable value and image payload, and preserves the existing article slugs.

## Phase 2: Validated Content Access Layer

**Goal:** make the JSON document a typed, validated application boundary.

**Milestones:**
- Add a server-only loader that imports the JSON and validates it at build/render time.
- Add useful field-path validation errors and invariant checks for unique project IDs/article slugs and valid image payloads.
- Add a local/CI content-validation command and focused tests.
- Use one contract source for schema and TypeScript types, or add checks that detect drift.

**Exit gate:** the valid document loads with expected types; malformed content and image payloads fail with actionable errors; focused tests pass.

## Phase 3: Public Site Content Migration

**Goal:** remove content literals and legacy sources from the rendering path without redesigning the site.

**Milestones:**
- Move identity, navigation, socials, projects, all visible copy, page labels, and SEO metadata to JSON-backed data.
- Move article metadata and Markdown bodies from standalone Markdown files into JSON while preserving current URLs and canonical redirects.
- Replace hard-coded image URLs and alt text with JSON image records.
- Keep components presentational and pass only needed data through props.
- Preserve interactions, accessibility behavior, responsive layout, and current visual design.

**Exit gate:** every route renders from the JSON content source; route/SEO behavior and visible content match the baseline; no editable content remains embedded in TSX or legacy content files.

## Phase 4: Image Build and Runtime Handling

**Goal:** keep image bytes editable in JSON while delivering images efficiently.

**Milestones:**
- Decide whether current payload sizes are suitable for direct data-URI rendering or need build-time extraction/optimization.
- If derivatives are needed, generate them reproducibly from JSON and ensure they are disposable outputs, not alternate sources of truth.
- Enforce supported MIME types, decodable payloads, and size budgets; surface clear editor/build feedback.
- Verify image rendering, alt text, responsive behavior, and production output.

**Exit gate:** every displayed portfolio image is sourced from JSON, optimized behavior is verified, and generated files can be recreated from the JSON document.

## Phase 5: External Visual Editor

**Goal:** make the JSON easy to edit without touching application code.

**Milestones:**
- Build a form-based editor using the shared JSON Schema.
- Support all editable text and metadata, project/article CRUD and ordering, and image upload/replace/preview/alt-text editing.
- Validate before save and show a JSON preview/export with image-size feedback.
- Start with a local editor that safely updates the repository JSON file.
- Keep hosted editing as a later option requiring authentication and reviewed Git changes; never expose credentials or write to a deployed app filesystem.

**Exit gate:** a user can make a complete content/image change in the editor and produce a schema-valid JSON document that the public build consumes.

## Phase 6: Cleanup, Documentation, and Release Readiness

**Goal:** remove duplicate sources and prove the complete workflow.

**Milestones:**
- Remove `src/lib/config.ts` and `content/articles/` only after JSON-backed rendering and regression checks pass.
- Update README and content/editor instructions with the local editing workflow.
- Run content validation, tests, lint, typecheck, and production build.
- Review generated image handling, SEO metadata, article slugs, and responsive behavior.
- Document deployment behavior: JSON changes publish through the normal build/deploy process.

**Exit gate:** there is one editable source of truth, no stale duplicate content source, and all required checks pass.

## Current Progress

- Planning: architecture and implementation details are documented in `.agents/`.
- Phase 1: complete. The source inventory was migrated into the versioned JSON document and schema, including article bodies and embedded image payloads.
- Phase 2: implementation complete. The server-side loader, schema validation, uniqueness/reference checks, and `npm run content:validate` are in place. Automated focused test files have not been added, so the original test portion of this phase's exit gate remains open.
- Phase 3: complete. Public routes and rendered copy use the validated JSON boundary; legacy config and Markdown article sources are absent. Remaining route paths and Markdown rendering syntax are implementation details, not editable content.
- Phase 4: complete. Image derivatives are reproducibly generated from embedded JSON payloads and validation checks their encoding and references.
- Phase 5: complete. The local-only editor supports content editing, collection changes, image replacement, schema validation, and stale-write protection.
- Phase 6: in progress. The final content-literal audit found no remaining hard-coded user-facing portfolio copy in the app routes/components. Content validation, lint, typecheck, and production build remain the final checks; README changes are currently user-owned and must be preserved. The focused-test gap from Phase 2 remains open.

## Guardrails

- Keep all work local unless the user explicitly requests a remote operation.
- Do not change appearance or behavior as part of the content migration.
- Never make the deployed public app an unauthenticated content writer.
- Preserve the JSON document as the only editable source, including image bytes; generated image assets are build outputs only.
- Check the repository's installed framework guidance before changing framework APIs. If local guidance is missing, fetch the matching official guidance before those changes.

## Related Documents

- Detailed tasks and acceptance criteria: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- System design: [ARCHITECTURE.md](./ARCHITECTURE.md)