# Portfolio

The public portfolio is rendered by Next.js. Editable portfolio data lives in [`content/portfolio.json`](content/portfolio.json), including page copy, titles, navigation, projects, articles, SEO metadata, and embedded image bytes. The JSON Schema is [`content/portfolio.schema.json`](content/portfolio.schema.json).

## Run the Site

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. Development and production builds validate the content and regenerate image files under `public/generated-content/` from embedded JSON. Those files are disposable build output, not the editable image source.

## Edit Portfolio Content

Start the local visual editor:

```bash
npm run editor
```

Open <http://127.0.0.1:4173>. The editor is local-only, validates the document before saving, and writes changes directly to `content/portfolio.json`. Image uploads are encoded into the JSON document, with generated image derivatives rebuilt on save. Restart or rebuild the Next.js site after saving for updates to be rendered.

Content can also be edited directly in JSON. Check it with:

```bash
npm run content:validate
npm run typecheck
npm run lint
npm run build
```

The implementation phases and completion gates are tracked in [` .agents/PHASED_ROADMAP.md`](.agents/PHASED_ROADMAP.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
