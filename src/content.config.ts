import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One folder per tool-slug, one file per locale: src/content/tools/{slug}/{locale}.md
// toolSlug/locale are explicit frontmatter fields (not parsed from the file path) so lookups
// never depend on how the loader happens to format entry.id.
// IMPORTANT: never name this field "slug" — Astro's glob loader treats a frontmatter
// field literally named "slug" as an id override, which made the ru/en files of the
// same tool collide on one id and silently overwrite each other (caught via a real build,
// not by eyeballing the schema — see feedback-testing-rigor memory).
const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    toolSlug: z.string(),
    locale: z.string(),
    category: z.string(),
    engine: z.enum(['linear-converter', 'temperature-converter']),
    // linear-converter uses {factor}; temperature-converter uses {scale, offset} for the
    // y = x*scale + offset formula (temperature scales don't share a zero point, so a plain
    // multiply-by-factor is wrong for them).
    engineParams: z.object({
      factor: z.number().optional(),
      scale: z.number().optional(),
      offset: z.number().optional(),
      fromUnit: z.string(),
      toUnit: z.string(),
      fromUnitShort: z.string(),
      toUnitShort: z.string(),
    }),
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

// One folder per category-slug, one file per locale: src/content/categories/{slug}/{locale}.md
// See the note on the tools collection above — "catSlug", not "slug", for the same reason.
const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    catSlug: z.string(),
    locale: z.string(),
    // Short label for nav/breadcrumb use ("Длина") -- deliberately separate from the
    // long, keyword-rich `title` (browser tab / SEO <title>), which is far too long to
    // show as a UI label. Mixing the two up was a real bug the user caught live.
    name: z.string(),
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

// One folder per audio-tool-slug, one file per locale: src/content/media-tools/{slug}/{locale}.md
// Separate from `tools` because file-processing tools (ffmpeg-based) don't fit the
// unit-conversion schema at all -- no factor/scale, no fromUnit/toUnit. `tool` picks the
// AUDIO_TOOLS config entry (src/lib/audio-tools-config.js) that drives the actual component.
const mediaTools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media-tools' }),
  schema: z.object({
    toolSlug: z.string(),
    locale: z.string(),
    category: z.string(),
    tool: z.string(),
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

export const collections = { tools, categories, mediaTools };
