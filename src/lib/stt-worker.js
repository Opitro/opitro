
const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/dist/transformers.min.js';

const DIARIZE_MODEL = 'onnx-community/pyannote-segmentation-3.0';

let lib = null;
let asr = null;
let loadedKey = '';
let seg = null;
let segProc = null;

const post = (msg) => self.postMessage(msg);

async function ensurePipeline(repo, key, totalBytes) {
  if (asr && loadedKey === key) return asr;
  if (!lib) {
    post({ type: 'stage', stage: 'connecting' });
    lib = await import( TRANSFORMERS);
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

      const pct = Math.min(99, (loaded / totalBytes) * 100);
      shownPct = Math.max(shownPct, pct);
      post({ type: 'progress', pct: shownPct });
    },
  });
  loadedKey = key;
  return asr;
}

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

      speakers = await diarize(audio).catch(() => null);
    }
    post({ type: 'done', id, detected, speakers, chunks: out.chunks || [], text: out.text || '' });
  } catch (err) {
    post({ type: 'failed', id, message: String((err && err.message) || err) });
  }
};
