
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const города = require('all-the-cities');

const ПОРОГ = 15000;
const строки = города
  .filter((г) => г.population >= ПОРОГ)
  .map((г) => [
    г.name,
    г.country,
    г.loc.coordinates[1].toFixed(3),
    г.loc.coordinates[0].toFixed(3),
  ].join('\t'));

const тело = строки.join('\n');
const файл = `// СПИСОК ГОРОДОВ. Собран scripts/make-cities.mjs из набора all-the-cities.
export const ГОРОДА = ${JSON.stringify(тело)};
`;
const куда = path.join(process.cwd(), 'src', 'lib', 'cities.js');
fs.writeFileSync(куда, файл);
console.log(`городов: ${строки.length}, вес файла: ${(файл.length / 1024).toFixed(0)} КБ`);
