// ПРОВЕРКА JSON ПО СХЕМЕ.
//
// Правила JSON Schema проверяет Ajv -- образцовая реализация стандарта. Своими руками такое
// не пишут: в спецификации сотня ключевых слов, ссылки $ref, композиция anyOf/oneOf/allOf,
// и почти правильная проверка хуже никакой -- она молча пропускает то, что настоящая
// программа потом отвергнет.
//
// AJV ГРУЗИТСЯ ЛЕНИВО, при первом нажатии. Это сто с лишним килобайт, и класть их в каждую
// загрузку страницы ради тех, кто просто зашёл посмотреть, незачем.
//
// ЧЕРНОВИКИ. У стандарта их несколько, и они несовместимы: в 2019-09 и 2020-12 у массивов
// вместо items появились prefixItems, а $recursiveRef заменён на $dynamicRef. Ajv поэтому
// собран двумя разными сборками. Нужную выбираем по полю $schema самой схемы, а если его
// нет -- берём draft-07, он самый распространённый.

const СБОРКИ = new Map();

/** Какой черновик просит схема. По $schema, иначе draft-07. */
export function черновик(схема) {
  const у = схема && typeof схема === 'object' ? String(схема.$schema || '') : '';
  if (у.includes('2020-12')) return '2020-12';
  if (у.includes('2019-09')) return '2019-09';
  return 'draft-07';
}

async function взятьAjv(вид) {
  if (СБОРКИ.has(вид)) return СБОРКИ.get(вид);
  // Ajv 8 отдаёт черновики отдельными точками входа: обычная -- draft-07.
  const [модуль, форматы] = await Promise.all([
    вид === '2020-12' ? import('ajv/dist/2020.js')
      : вид === '2019-09' ? import('ajv/dist/2019.js')
      : import('ajv'),
    import('ajv-formats'),
  ]);
  const Ajv = модуль.default || модуль;
  const добавитьФорматы = форматы.default || форматы;
  const собрать = (настройки) => {
    const ajv = new Ajv({ allErrors: true, strict: false, ...настройки });
    // Без этого «format»: «email» просто не проверяется -- Ajv по умолчанию его не знает.
    добавитьФорматы(ajv);
    return ajv;
  };
  СБОРКИ.set(вид, собрать);
  return собрать;
}

/** Путь к месту ошибки человеческим видом: пустой -- значит корень. */
function путь(ошибка, корень) {
  const п = ошибка.instancePath || '';
  if (!п) return корень;
  return п;
}

/**
 * Проверяет данные по схеме. Обе стороны уже должны быть разобраны в значения.
 * Возвращает {годно} либо {ошибки:[{путь, что, правило}]} либо {схемаПлоха: 'текст'}.
 */
export async function проверитьПоСхеме(схема, данные, корневоеИмя = '/') {
  const вид = черновик(схема);
  let собрать;
  try {
    собрать = await взятьAjv(вид);
  } catch (е) {
    return { неЗагрузилось: String(е && (е.message || е)) };
  }

  let проверка;
  try {
    проверка = собрать().compile(схема);
  } catch (е) {
    // Схема сама по себе бессмысленна: неизвестное ключевое слово со strict, битый $ref,
    // «type»: «int» вместо «integer» и подобное.
    return { схемаПлоха: String(е && (е.message || е)), черновик: вид };
  }

  const годно = проверка(данные);
  if (годно) return { годно: true, черновик: вид };

  const ошибки = (проверка.errors || []).map((о) => ({
    путь: путь(о, корневоеИмя),
    что: о.message || '',
    правило: о.keyword,
    подробно: о.params && Object.keys(о.params).length ? о.params : null,
  }));
  return { годно: false, ошибки, черновик: вид };
}

// ---------------------------------------------------------------------------------------------
// СООБЩЕНИЯ ПО-ЧЕЛОВЕЧЕСКИ.
//
// Ajv говорит по-английски и коротко: «must be integer», «must have required property 'email'».
// Готового перевода ajv-i18n не берём по двум причинам: там НЕТ УКРАИНСКОГО (а бросать одну из
// четырёх версий сайта на английский нельзя), и его слог -- дословный технический, а у нас на
// страницах говорят простыми словами. Здесь двадцать самых частых правил на четырёх языках;
// всё редкое честно падает обратно на английскую фразу Ajv, а не выдумывается.

const ТИПЫ = {
  ru: { string: 'строкой', number: 'числом', integer: 'целым числом', boolean: 'да или нет',
        object: 'объектом', array: 'массивом', null: 'пустым значением' },
  uk: { string: 'рядком', number: 'числом', integer: 'цілим числом', boolean: 'так або ні',
        object: 'об’єктом', array: 'масивом', null: 'порожнім значенням' },
  en: { string: 'a string', number: 'a number', integer: 'an integer', boolean: 'true or false',
        object: 'an object', array: 'an array', null: 'null' },
  es: { string: 'una cadena', number: 'un número', integer: 'un entero', boolean: 'verdadero o falso',
        object: 'un objeto', array: 'un array', null: 'nulo' },
};

const ПРАВИЛА = {
  ru: {
    type: (п, я) => `должно быть ${(п.type || '').split(',').map((т) => ТИПЫ[я][т.trim()] || т).join(' или ')}`,
    required: (п) => `нет обязательного поля «${п.missingProperty}»`,
    additionalProperties: (п) => `лишнее поле «${п.additionalProperty}»: схема других не допускает`,
    enum: (п) => `должно быть одним из: ${(п.allowedValues || []).join(', ')}`,
    const: (п) => `должно быть равно ${JSON.stringify(п.allowedValue)}`,
    minimum: (п) => `должно быть не меньше ${п.limit}`,
    maximum: (п) => `должно быть не больше ${п.limit}`,
    exclusiveMinimum: (п) => `должно быть больше ${п.limit}`,
    exclusiveMaximum: (п) => `должно быть меньше ${п.limit}`,
    multipleOf: (п) => `должно делиться на ${п.multipleOf}`,
    minLength: (п) => `не короче ${п.limit} знаков`,
    maxLength: (п) => `не длиннее ${п.limit} знаков`,
    pattern: (п) => `не подходит под образец ${п.pattern}`,
    format: (п) => `не похоже на ${п.format}`,
    minItems: (п) => `должно быть не меньше ${п.limit} элементов`,
    maxItems: (п) => `должно быть не больше ${п.limit} элементов`,
    uniqueItems: (п) => `элементы повторяются (${п.i} и ${п.j} одинаковы)`,
    minProperties: (п) => `должно быть не меньше ${п.limit} полей`,
    maxProperties: (п) => `должно быть не больше ${п.limit} полей`,
    anyOf: () => 'не подходит ни под один из перечисленных вариантов',
    oneOf: () => 'подходит больше чем под один вариант — а должно ровно под один',
    not: () => 'подходит под запрещённое правило',
    dependentRequired: (п) => `поле «${п.property}» требует поля «${п.missingProperty}»`,
  },
  uk: {
    type: (п, я) => `має бути ${(п.type || '').split(',').map((т) => ТИПЫ[я][т.trim()] || т).join(' або ')}`,
    required: (п) => `немає обов’язкового поля «${п.missingProperty}»`,
    additionalProperties: (п) => `зайве поле «${п.additionalProperty}»: схема інших не допускає`,
    enum: (п) => `має бути одним із: ${(п.allowedValues || []).join(', ')}`,
    const: (п) => `має дорівнювати ${JSON.stringify(п.allowedValue)}`,
    minimum: (п) => `має бути не менше ${п.limit}`,
    maximum: (п) => `має бути не більше ${п.limit}`,
    exclusiveMinimum: (п) => `має бути більше ${п.limit}`,
    exclusiveMaximum: (п) => `має бути менше ${п.limit}`,
    multipleOf: (п) => `має ділитися на ${п.multipleOf}`,
    minLength: (п) => `не коротше ${п.limit} знаків`,
    maxLength: (п) => `не довше ${п.limit} знаків`,
    pattern: (п) => `не підходить під взірець ${п.pattern}`,
    format: (п) => `не схоже на ${п.format}`,
    minItems: (п) => `має бути не менше ${п.limit} елементів`,
    maxItems: (п) => `має бути не більше ${п.limit} елементів`,
    uniqueItems: (п) => `елементи повторюються (${п.i} і ${п.j} однакові)`,
    minProperties: (п) => `має бути не менше ${п.limit} полів`,
    maxProperties: (п) => `має бути не більше ${п.limit} полів`,
    anyOf: () => 'не підходить під жоден із перелічених варіантів',
    oneOf: () => 'підходить більше ніж під один варіант — а має рівно під один',
    not: () => 'підходить під заборонене правило',
    dependentRequired: (п) => `поле «${п.property}» потребує поля «${п.missingProperty}»`,
  },
  en: {
    type: (п, я) => `must be ${(п.type || '').split(',').map((т) => ТИПЫ[я][т.trim()] || т).join(' or ')}`,
    required: (п) => `required property “${п.missingProperty}” is missing`,
    additionalProperties: (п) => `unexpected property “${п.additionalProperty}”: the schema allows no others`,
    enum: (п) => `must be one of: ${(п.allowedValues || []).join(', ')}`,
    const: (п) => `must equal ${JSON.stringify(п.allowedValue)}`,
    minimum: (п) => `must be at least ${п.limit}`,
    maximum: (п) => `must be at most ${п.limit}`,
    exclusiveMinimum: (п) => `must be greater than ${п.limit}`,
    exclusiveMaximum: (п) => `must be less than ${п.limit}`,
    multipleOf: (п) => `must be a multiple of ${п.multipleOf}`,
    minLength: (п) => `must be at least ${п.limit} characters`,
    maxLength: (п) => `must be at most ${п.limit} characters`,
    pattern: (п) => `does not match the pattern ${п.pattern}`,
    format: (п) => `does not look like ${п.format}`,
    minItems: (п) => `must have at least ${п.limit} items`,
    maxItems: (п) => `must have at most ${п.limit} items`,
    uniqueItems: (п) => `items repeat (${п.i} and ${п.j} are the same)`,
    minProperties: (п) => `must have at least ${п.limit} properties`,
    maxProperties: (п) => `must have at most ${п.limit} properties`,
    anyOf: () => 'matches none of the listed alternatives',
    oneOf: () => 'matches more than one alternative — it must match exactly one',
    not: () => 'matches a rule that is forbidden here',
    dependentRequired: (п) => `property “${п.property}” requires “${п.missingProperty}”`,
  },
  es: {
    type: (п, я) => `debe ser ${(п.type || '').split(',').map((т) => ТИПЫ[я][т.trim()] || т).join(' o ')}`,
    required: (п) => `falta el campo obligatorio «${п.missingProperty}»`,
    additionalProperties: (п) => `campo sobrante «${п.additionalProperty}»: el esquema no admite otros`,
    enum: (п) => `debe ser uno de: ${(п.allowedValues || []).join(', ')}`,
    const: (п) => `debe ser igual a ${JSON.stringify(п.allowedValue)}`,
    minimum: (п) => `debe ser como mínimo ${п.limit}`,
    maximum: (п) => `debe ser como máximo ${п.limit}`,
    exclusiveMinimum: (п) => `debe ser mayor que ${п.limit}`,
    exclusiveMaximum: (п) => `debe ser menor que ${п.limit}`,
    multipleOf: (п) => `debe ser múltiplo de ${п.multipleOf}`,
    minLength: (п) => `no menos de ${п.limit} caracteres`,
    maxLength: (п) => `no más de ${п.limit} caracteres`,
    pattern: (п) => `no encaja con el patrón ${п.pattern}`,
    format: (п) => `no parece ${п.format}`,
    minItems: (п) => `debe tener al menos ${п.limit} elementos`,
    maxItems: (п) => `debe tener como máximo ${п.limit} elementos`,
    uniqueItems: (п) => `hay elementos repetidos (${п.i} y ${п.j} son iguales)`,
    minProperties: (п) => `debe tener al menos ${п.limit} campos`,
    maxProperties: (п) => `debe tener como máximo ${п.limit} campos`,
    anyOf: () => 'no encaja con ninguna de las alternativas listadas',
    oneOf: () => 'encaja con más de una alternativa, y debe encajar exactamente con una',
    not: () => 'encaja con una regla que aquí está prohibida',
    dependentRequired: (п) => `el campo «${п.property}» exige «${п.missingProperty}»`,
  },
};

/** Фраза об ошибке на языке страницы. Незнакомое правило отдаём как есть, от Ajv. */
export function пофразе(ошибка, язык = 'ru') {
  const набор = ПРАВИЛА[язык] || ПРАВИЛА.ru;
  const правило = набор[ошибка.правило];
  if (!правило) return ошибка.что;
  try {
    return правило(ошибка.подробно || {}, ПРАВИЛА[язык] ? язык : 'ru');
  } catch (е) {
    return ошибка.что;
  }
}
