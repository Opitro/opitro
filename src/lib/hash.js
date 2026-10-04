
export const вБайты = (текст) => new TextEncoder().encode(String(текст ?? ''));

const шестнадцать = (байты) => {
  let с = '';
  for (const б of байты) с += б.toString(16).padStart(2, '0');
  return с;
};

const СДВИГИ = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const ПОСТОЯННЫЕ = (() => {
  const к = new Uint32Array(64);
  for (let и = 0; и < 64; и++) к[и] = Math.floor(Math.abs(Math.sin(и + 1)) * 2 ** 32);
  return к;
})();

const влево = (х, н) => (х << н) | (х >>> (32 - н));

export function md5(байты) {
  const длина = байты.length;

  const сколько = (((длина + 8) >> 6) + 1) * 64;
  const х = new Uint8Array(сколько);
  х.set(байты);
  х[длина] = 0x80;
  const битов = длина * 8;

  const вид = new DataView(х.buffer);
  вид.setUint32(сколько - 8, битов >>> 0, true);
  вид.setUint32(сколько - 4, Math.floor(битов / 2 ** 32), true);

  let а = 0x67452301, б = 0xefcdab89, в = 0x98badcfe, г = 0x10325476;

  for (let место = 0; место < сколько; место += 64) {
    const м = new Uint32Array(16);
    for (let и = 0; и < 16; и++) м[и] = вид.getUint32(место + и * 4, true);

    let [аа, бб, вв, гг] = [а, б, в, г];
    for (let и = 0; и < 64; и++) {
      let ф, к;
      if (и < 16) { ф = (бб & вв) | (~бб & гг); к = и; }
      else if (и < 32) { ф = (гг & бб) | (~гг & вв); к = (5 * и + 1) % 16; }
      else if (и < 48) { ф = бб ^ вв ^ гг; к = (3 * и + 5) % 16; }
      else { ф = вв ^ (бб | ~гг); к = (7 * и) % 16; }
      const врем = гг;
      гг = вв;
      вв = бб;
      бб = (бб + влево((аа + ф + ПОСТОЯННЫЕ[и] + м[к]) | 0, СДВИГИ[и])) | 0;
      аа = врем;
    }
    а = (а + аа) | 0; б = (б + бб) | 0; в = (в + вв) | 0; г = (г + гг) | 0;
  }

  const итог = new Uint8Array(16);
  const вывод = new DataView(итог.buffer);
  вывод.setUint32(0, а >>> 0, true);
  вывод.setUint32(4, б >>> 0, true);
  вывод.setUint32(8, в >>> 0, true);
  вывод.setUint32(12, г >>> 0, true);
  return шестнадцать(итог);
}

const ИМЕНА = { 'sha-1': 'SHA-1', 'sha-256': 'SHA-256', 'sha-512': 'SHA-512' };

export async function sha(имя, байты) {
  const родное = ИМЕНА[String(имя).toLowerCase()];
  if (!родное) throw new Error('НЕИЗВЕСТНЫЙ_АЛГОРИТМ');
  const узел = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto.subtle : null;
  if (!узел) throw new Error('НЕТ_CRYPTO_SUBTLE');
  return шестнадцать(new Uint8Array(await узел.digest(родное, байты)));
}

export async function всеХэши(текст) {
  const байты = вБайты(текст);
  const [единица, двести, пятьсот] = await Promise.all([
    sha('sha-1', байты), sha('sha-256', байты), sha('sha-512', байты),
  ]);
  return [
    ['MD5', md5(байты)],
    ['SHA-1', единица],
    ['SHA-256', двести],
    ['SHA-512', пятьсот],
  ];
}
