# Portfolio Content JSON Migration Plan

Phased execution gates and progress tracking live in [PHASED_ROADMAP.md](./PHASED_ROADMAP.md).

## Goal

Make portfolio information editable outside React components by moving all user-maintained site content into one validated JSON document. Keep the current Next.js portfolio as the public renderer. A separate editor can be built later to edit the same document without changing the public site's content contract.

"Everything editable" means every user-facing text value and every image used as portfolio content, including hero titles such as "Systems Programmer", section headings, button labels, accessibility text, SEO metadata, article bodies, and image bytes. These values must live in the JSON source rather than being embedded in TSX or kept as the authoritative copy in `public/`. Layout, component behavior, and the visual design system remain implementation code; changing those is a code/design change, not a content edit.

## Current State

- `src/lib/config.ts` contains identity, navigation, social links, and projects.
- The home hero copy, contact copy, writing index copy, and article-page labels are literals in page/component JSX.
- Articles are Markdown files with YAML frontmatter in `content/articles/`; `src/lib/articles.ts` reads and parses them at runtime/build time.
- The App Router pages are server-rendered, and the home route passes data to focused display components.
- `FUTURE_EXPANSION_PLAN.md` discusses a larger admin/CMS backed by a database. This migration deliberately establishes a file-based content source first; it does not introduce a database, authentication, analytics, or remote publishing.

## Target Contract

- Canonical content file: `content/portfolio.json`.
- Shared contract: `content/portfolio.schema.json` using JSON Schema, with a `schemaVersion` field.
- Typed access boundary: `src/lib/portfolio.ts` loads the JSON, validates it against the schema, and exposes typed site and article data to server components.
- All prose, labels, titles, and metadata move to JSON. Article bodies remain Markdown text stored as JSON strings, preserving familiar authoring syntax while making the JSON file the single source of truth.
- Rendering components receive data as props and remain responsible for presentation and interaction only.
- Every editable image is embedded in JSON as a data URI/base64 payload with MIME type, alt text, and any needed display metadata. No image path in `public/` is the authoritative editable image source.
- A build step may extract or transform embedded image payloads into generated assets for optimization/performance, but those outputs are disposable derivatives; editing/replacing an image happens in the JSON-backed editor and updates the JSON payload.
- The public app reads content only. The future editor modifies a local working copy or submits a reviewed Git change; it does not let an unauthenticated deployed app write to its own filesystem.

## Implementation Sequence

### 1. Inventory and define the schema

- Inventory every user-facing string and content value in routes, layout metadata, components, and current article frontmatter/body.
- Design the top-level JSON shape for `site`, `navigation`, `socials`, `home`, `projects`, `writing`, `articles`, and reusable `images`/media records.
- Define required/optional fields, allowed project statuses, URL expectations, stable IDs/slugs, ordering behavior, and `schemaVersion` in JSON Schema.
- Include editable image payload fields (MIME type and base64/data URI), alt text, and references from the relevant content records. Include sensible validation for supported image formats and payload size.
- Keep the schema editor-friendly: explicit objects and arrays, clear field names, and no values that must be inferred from component internals.

**Exit check:** every current user-editable value has an identified JSON field; only layout, styling rules, and interaction logic remain implementation code.

### 2. Create the initial JSON content document

- Create `content/portfolio.json` by transferring current config, every editable string found in routes/components/layout metadata, SEO metadata, all three articles, and the actual bytes of each current portfolio image without intentionally changing content.
- Store article body text as Markdown strings; preserve frontmatter values as article object fields rather than embedded YAML.
- Use stable article slugs matching the existing `/writing/[slug]` URLs.
- Store image payloads in JSON, including the current avatar image; keep generated image files out of source control or clearly marked as derived if the build needs them.

**Exit check:** the JSON parses and contains the complete current portfolio content, and existing article slugs remain unchanged.

### 3. Add validated typed loading

- Add a server-only content loader in `src/lib/portfolio.ts` that imports/reads the JSON and validates it against the shared schema before returning data.
- Derive or maintain TypeScript types from the contract so components and the editor agree on the data shape. Avoid duplicating independently-maintained interfaces and schema rules.
- Fail the build with a useful path-specific validation error for invalid content; do not silently replace malformed author content with defaults.
- Keep computed values such as article reading time deterministic. Prefer deriving them at load time when absent rather than forcing manual duplication in JSON.

**Exit check:** valid content loads with the expected types; deliberately malformed required fields fail validation with a readable message.

### 4. Move rendering onto the content boundary

- Replace `siteConfig` imports and `getAllArticles()` filesystem parsing with the typed loader.
- Pass the appropriate copy and data through existing server-component and client-component props.
- Move site metadata and page-specific SEO strings to JSON-backed metadata generation.
- Replace image path literals and image alt-text literals with JSON-backed image records; render image payloads or generated derivatives produced from those records.
- Preserve current route behavior, project grouping, social links, canonical article redirects, and rendered copy.
- Keep client components limited to interaction; do not pass the entire content document to client code when a smaller prop will do.

**Exit check:** the home, writing index, and article routes render entirely from the JSON data source, with current URLs and behavior intact.

### 5. Add validation and regression coverage

- Add a content validation command usable in local development and CI.
- Test schema validation, unique project IDs/article slugs, required URLs, and article lookup behavior.
- Test image payload decoding, allowed MIME types, useful size limits/warnings, and generated derivative consistency.
- Add a regression check that every current article slug resolves and that metadata/canonical URL behavior is retained.
- Run lint, typecheck/build, and compare key rendered content before and after the migration.
- Remove the old config and Markdown source files only after the JSON-driven routes pass and the content transfer is reviewed.

**Exit check:** CI rejects invalid content and the production build succeeds without relying on the old content sources.

### 6. Define the external editor integration

- Treat the JSON Schema as the editor's API/contract; the editor should not need to understand React components.
- First editor milestone: form-based editing for profile, every visible string, links, projects, images (upload/replace, alt text, preview), and article metadata/body, with validation and JSON preview/export.
- For a local editor, write to the repository's `content/portfolio.json` and let normal Git/build/deploy workflow publish changes.
- If a hosted editor is later required, authenticate it and have it create a branch or pull request through a narrowly scoped GitHub integration. Do not write to the deployed Next.js filesystem, and do not expose GitHub credentials to browser code.
- Preserve uploaded image bytes inside the JSON document; do not silently switch to path-only asset references.

**Exit check:** an editor can produce a schema-valid document that the public site builds from without code edits.

## Acceptance Criteria

- There is one canonical JSON file for all user-editable portfolio text, structured content, and image bytes.
- No profile, project, article, SEO, navigation, or contact content needs editing in JSX/TypeScript.
- All displayed portfolio images and their alt text can be replaced/edited through JSON without editing code or treating a `public/` file as the source of truth.
- Article bodies and current article URLs survive the migration.
- Invalid JSON content is caught before deployment with actionable errors.
- The portfolio remains a read-only renderer; editorial writes happen in a separate trusted workflow.
- A future editor can use the schema and JSON file without coupling to UI internals.

## Risks and Guardrails

- **Lost or altered content:** transfer current values mechanically where practical and review a before/after inventory.
- **JSON authoring friction and size:** preserve Markdown in article body strings and provide a form editor later; embed image payloads as base64/data URIs, provide image previews in the editor, and report payload size before save.
- **Large image payloads/performance:** validate size and formats, optimize/rescale images in the editor or build pipeline, and generate runtime-friendly derivatives without making those derivatives the source of truth.
- **Schema drift:** use one schema as the validation contract and test it in both the site and editor.
- **Broken slugs/SEO:** treat existing article slugs and canonical URLs as stable data and test them.
- **Unsafe hosted writes:** never implement arbitrary file writes in the public site. Use local edits or authenticated Git-based review.
- **Static deployment mismatch:** JSON changes on a hosted static/serverless deployment take effect on the next build/deploy unless a separate content service is deliberately introduced.

## Out of Scope for This Migration

- Database/CMS adoption, analytics, authentication, draft preview hosting, Hashnode synchronization, remote asset storage, and dynamic section plugins.
- Redesigning components or changing the editorial visual system.
- Rewriting article prose or changing public routes.