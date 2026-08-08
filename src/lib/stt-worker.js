// Speech recognition, off the main thread.
//
// Whisper is a lot of arithmetic. Run on the page's own thread it holds the thread for the whole
// job -- 35 seconds for a 45-second recording on the best model -- and Chrome puts up "Страница не
// отвечает" with a button offering to close the page. Nothing was wrong; the browser simply could
// not tell a busy thread from a hung one. A worker has its own thread, so the page keeps painting,
// the progress line keeps moving, and the browser has no reason to complain.
//
// Everything here talks in plain messages: {type} in, {type} out. The page never touches the
// model directly.

const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/dist/transformers.min.js';

const DIARIZE_MODEL = 'onnx-community/pyannote-segmentation-3.0';

let lib = null;
let asr = null;
let loadedKey = '';
let seg = null;      // speaker segmentation model, loaded only if asked for
let segProc = null;

const post = (msg) => self.postMessage(msg);

async function ensurePipeline(repo, key, totalBytes) {
  if (asr && loadedKey === key) return asr;
  if (!lib) {
    post({ type: 'stage', stage: 'connecting' });
    lib = await import(/* @vite-ignore */ TRANSFORMERS);
    lib.env.allowLocalModels = false;
  }
  const seen = new Map();
  let shownPct = 0;
  asr = await lib.pipeline('automatic-speech-recognition', repo, {
    dtype: 'q8',
    progress_callback: (p) => {
      if (p.status !== 'progress' || !p.total) return;
      seen.set(p.file, p.loaded);
      let loaded = 0;
      for (const v of seen.values()) loaded += v;
      // Against the model's known total, so the number only ever grows: summing the files that
      // have registered so far reads 100% while the tokenizer finishes and then falls back.
      const pct = Math.min(99, (loaded / totalBytes) * 100);
      shownPct = Math.max(shownPct, pct);
      post({ type: 'progress', pct: shownPct });
    },
  });
  loadedKey = key;
  return asr;
}

/**
 * Whisper predicts the language itself as the first token after the start marker. transformers.js
 * never lets it -- with no `language` it forces English and the model translates instead. Feeding
 * only the start token and generating exactly one more gives the model's own answer.
 */
async function detectLanguage(audio, rate) {
  const tok = asr.tokenizer;
  const ids = tok.model.tokens_to_ids;
  const idOf = (t) => (ids && typeof ids.get === 'function' ? ids.get(t) : ids?.[t]);
  const sot = idOf('<|startoftranscript|>');
  if (sot == null) return null;
  const inputs = await asr.processor(audio.slice(0, rate * 30));
  const out = await asr.model.generate({ ...inputs, decoder_input_ids: [[sot]], max_new_tokens: 1, return_dict_in_generate: true });
  const seq = out.sequences?.tolist ? out.sequences.tolist() : out.sequences;
  const last = seq?.[0]?.[seq[0].length - 1];
  if (last == null) return null;
  const text = tok.decode([Number(last)], { skip_special_tokens: false });
  return (String(text).match(/^<\|([a-z]{2,3})\|>$/) || [])[1] || null;
}

/**
 * Who spoke when. pyannote-segmentation-3.0 through transformers.js: 1.5 MB quantized, and on a
 * measured two-voice conversation it put the turn boundaries within 0.1 s of the truth and never
 * confused the two speakers. It works on the whole recording in one pass -- 1.4 s for three
 * minutes -- so no windowing is needed here.
 *
 * Its limit, measured: two clearly different voices are separated cleanly, but two similar ones
 * (both female, similar register) were merged into one. That is a property of the model, and the
 * page says so rather than pretending otherwise.
 */
async function diarize(audio) {
  if (!seg) {
    post({ type: 'stage', stage: 'loadingSpeakers' });
    seg = await lib.AutoModelForAudioFrameClassification.from_pretrained(DIARIZE_MODEL, { dtype: 'q8' });
    segProc = await lib.AutoProcessor.from_pretrained(DIARIZE_MODEL);
  }
  post({ type: 'stage', stage: 'speakers' });
  const inputs = await segProc(audio);
  const { logits } = await seg(inputs);
  const out = segProc.post_process_speaker_diarization(logits, audio.length);
  return (out && out[0]) || [];
}

self.onmessage = async (e) => {
  const { id, type } = e.data || {};
  if (type !== 'run') return;
  const { audio, rate, repo, key, totalBytes, language, task } = e.data;
  try {
    await ensurePipeline(repo, key, totalBytes);

    let lang = language;
    let detected = null;
    if (!lang) {
      post({ type: 'stage', stage: 'detecting' });
      detected = await detectLanguage(audio, rate).catch(() => null);
      lang = detected || 'english';
    }

    post({ type: 'stage', stage: task === 'translate' ? 'translating' : 'transcribing' });
    const out = await asr(audio, {
      task,
      language: lang,
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });
    let speakers = null;
    if (e.data.speakers) {
      // After the text, not before: if diarization fails there is still a transcript to show.
      speakers = await diarize(audio).catch(() => null);
    }
    post({ type: 'done', id, detected, speakers, chunks: out.chunks || [], text: out.text || '' });
  } catch (err) {
    post({ type: 'failed', id, message: String((err && err.message) || err) });
  }
};
