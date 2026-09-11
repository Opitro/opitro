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
    /** Подобранные вручную смежные инструменты, слугами, в порядке важности. Раньше эти связи
        жили строкой «Рядом: …» в конце текста; когда появились плитки «Попробуйте ещё», строка
        и плитки стали дублировать друг друга. Связи перенесены сюда, строка убрана. */
    related: z.array(z.string()).optional(),
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
    /** ОДНА СТРОКА О ТОМ, ЧТО ИНСТРУМЕНТ ДЕЛАЕТ. Показывается на карточке в рубрике, в
        плитках «попробуйте ещё» и в поиске -- поэтому названо по сути, а не по месту.

        Зачем: на карточках стояли одни названия. «Base64» -- и что он делает? «QR-код» --
        ну код, а дальше? Человек не мог сообразить, что ему нужно, на витрине всего сайта.

        Правило: три-восемь слов, конкретно -- что кладёшь и что получаешь. Не повторять
        название: оно уже написано выше. Никаких «профессиональный онлайн-инструмент» --
        эта фраза занимает всю строку и не сообщает ничего.

        Живёт В ШАПКЕ СТРАНИЦЫ, а не в общем словаре, намеренно: при 500 инструментах и
        десятке языков общий словарь становится файлом на пять тысяч строк, который правят
        все сразу, а забытая подпись молча даёт пустую карточку. Здесь же переводчику дают
        один самодостаточный файл, а npm run check:cards ловит пропуски.

        Конвертерам величин подпись пишут так же, как всем. Пробовали собирать её из
        множителя -- выходило «1 см = 0,394 дюйм» вместо «дюйма»: после дробного числа
        русский требует родительного единственного, а в шапках лежит другая форма. В польском
        своя, в арабском счёт зависит от самого числа. Грамматика не собирается, поэтому
        правило одно на всех и без исключений. */
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
    /** Короткая строка «что внутри» под названием рубрики на главной: «Обрезать, склеить,
        убрать шум». Без неё рубрики отличались одним словом и сливались. */
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

// One folder per audio-tool-slug, one file per locale: src/content/media-tools/{slug}/{locale}.md
// Separate from `tools` because file-processing tools (ffmpeg-based) don't fit the
// unit-conversion schema at all -- no factor/scale, no fromUnit/toUnit. `tool` picks the
// AUDIO_TOOLS config entry (src/lib/audio-tools-config.js) that drives the actual component.
const mediaTools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media-tools' }),
  schema: z.object({
    toolSlug: z.string(),
    /** Подобранные вручную смежные инструменты, слугами, в порядке важности. Раньше эти связи
        жили строкой «Рядом: …» в конце текста; когда появились плитки «Попробуйте ещё», строка
        и плитки стали дублировать друг друга. Связи перенесены сюда, строка убрана. */
    related: z.array(z.string()).optional(),
    locale: z.string(),
    category: z.string(),
    tool: z.string(),
    title: z.string(),
    h1: z.string(),
    // Optional short name for the category-page tool grid card, where a longer SEO-oriented h1
    // (e.g. "Audio Converter Online") reads as clutter next to a dozen other tool names. Falls
    // back to h1 when not set, so this is opt-in per tool, not a second field everyone must fill.
    navName: z.string().optional(),
    /** ОДНА СТРОКА О ТОМ, ЧТО ИНСТРУМЕНТ ДЕЛАЕТ. Показывается на карточке в рубрике, в
        плитках «попробуйте ещё» и в поиске -- поэтому названо по сути, а не по месту.

        Зачем: на карточках стояли одни названия. «Base64» -- и что он делает? «QR-код» --
        ну код, а дальше? Человек не мог сообразить, что ему нужно, на витрине всего сайта.

        Правило: три-восемь слов, конкретно -- что кладёшь и что получаешь. Не повторять
        название: оно уже написано выше. Никаких «профессиональный онлайн-инструмент» --
        эта фраза занимает всю строку и не сообщает ничего.

        Живёт В ШАПКЕ СТРАНИЦЫ, а не в общем словаре, намеренно: при 500 инструментах и
        десятке языков общий словарь становится файлом на пять тысяч строк, который правят
        все сразу, а забытая подпись молча даёт пустую карточку. Здесь же переводчику дают
        один самодостаточный файл, а npm run check:cards ловит пропуски.

        Конвертерам величин подпись пишут так же, как всем. Пробовали собирать её из
        множителя -- выходило «1 см = 0,394 дюйм» вместо «дюйма»: после дробного числа
        русский требует родительного единственного, а в шапках лежит другая форма. В польском
        своя, в арабском счёт зависит от самого числа. Грамматика не собирается, поэтому
        правило одно на всех и без исключений. */
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
