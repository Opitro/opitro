import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    toolSlug: z.string(),

    related: z.array(z.string()).optional(),
    locale: z.string(),
    category: z.string(),

    alsoIn: z.array(z.string()).optional(),

    engine: z.enum(['linear-converter', 'temperature-converter']),

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

    summary: z.string().min(8).max(90).optional(),
    description: z.string(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    catSlug: z.string(),
    locale: z.string(),

    name: z.string(),

    blurb: z.string().optional(),
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

const mediaTools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media-tools' }),
  schema: z.object({
    toolSlug: z.string(),

    related: z.array(z.string()).optional(),
    locale: z.string(),
    category: z.string(),

    alsoIn: z.array(z.string()).optional(),

    tool: z.string(),
    title: z.string(),
    h1: z.string(),

    navName: z.string().optional(),

    summary: z.string().min(8).max(90).optional(),
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
