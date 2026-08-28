// МАТЕРИАЛ ДЛЯ ТЕСТА СКОРОСТИ ПЕЧАТИ.
//
// Что вообще положено набирать в таких тестах -- вопрос давно изученный. В работе, на которую
// в этой области ссылаются все (MacKenzie, Soukoreff, «Phrase sets for evaluating text entry
// techniques», CHI 2003), собран набор из 500 коротких английских фраз и названы требования
// к материалу:
//   * фразы КОРОТКИЕ -- от 16 до 43 знаков, в среднем 28,6;
//   * ЛЕГКО ЗАПОМИНАЮТСЯ -- человек прочитывает фразу и набирает, а не читает по букве;
//   * ПРЕДСТАВЛЯЮТ ЯЗЫК -- частота букв в наборе близка к частоте букв в языке (у них 0,954);
//   * БЕЗ ЗНАКОВ ПРЕПИНАНИЯ и почти без заглавных: запятые и Shift проверяют знание раскладки,
//     а не скорость, и портят сравнение между людьми.
// Средняя длина слова у них 4,46 знака -- то есть слова обычные, короткие.
//
// Отсюда два вида материала, и оба здесь есть:
//   1. СЛОВА -- частые слова языка вперемешку. Так делают Monkeytype и подобные: связный текст
//      можно угадывать по смыслу, и тогда меряется знакомство с отрывком, а не набор.
//   2. ФРАЗЫ -- по требованиям выше: короткие, без знаков препинания, из обычных слов.
//
// Набор для попытки собирается СЛУЧАЙНО и заново на каждый заход: нажал «Заново» -- получил
// другой текст. Раньше текст был один на всю сборку, и это была настоящая беда: человек
// проходил тест второй раз уже по знакомому.

const RU = `и в не на я быть с он а то все она так его но да ты к у же вы за бы по только ее мне
было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни был него до вас
опять уж вам сказал ведь там потом себя ничего ей может они тут где есть надо ней для мы тебя их
чем была сам чтоб без будто человек чего раз тоже себе под жизнь будет тогда кто этот говорил
того потому этого какой совсем ним здесь этом один почти мой тем чтобы нее были куда зачем
сказать всех никогда сегодня можно при наконец два об другой хоть после над больше тот через эти
нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед иногда лучше чуть
том нельзя такой им более всегда конечно всю между дом рука глаза время день год работа слово
место друг сторона вопрос дело город вода земля путь свет стол окно дверь книга письмо голос
утро вечер ночь неделя месяц минута час дорога море небо снег дождь ветер лес поле река гора
хлеб чай мама папа сын дочь брат сестра школа улица машина поезд самолет телефон деньги цена
магазин врач больница`
  .split(/\s+/).filter(Boolean);

const EN = `the be to of and a in that have it for not on with he as you do at this but his by
from they we say her she or an will my one all would there their what so up out if about who get
which go me when make can like time no just him know take people into year your good some could
them see other than then now look only come its over think also back after use two how our work
first well way even new want because any these give day most us man thing woman life child world
school state family student group country problem hand part place case week company system
program question night water house room door book letter voice morning evening street city river
sea sky snow rain wind forest field mountain bread money price shop doctor train plane phone
mother father son daughter brother sister friend road light table window paper music garden
summer winter spring autumn`.split(/\s+/).filter(Boolean);

const ES = `de la que el en y a los se del las un por con no una su para es al lo como más pero
sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde
todo nos durante todos uno les ni contra otros ese eso ante ellos esto antes algunos qué unos yo
otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas
algo nosotros mi mis tú te ti tu tus ellas casa tiempo día vida hombre mujer parte mundo año
trabajo país lugar mano forma caso noche agua puerta libro carta voz mañana tarde calle ciudad
río mar cielo nieve lluvia viento bosque campo montaña pan dinero precio tienda médico tren avión
teléfono madre padre hijo hija hermano hermana amigo camino luz mesa ventana papel música jardín
verano invierno primavera otoño`.split(/\s+/).filter(Boolean);

const UK = `і в не на я бути з він а то все вона так його але ти у же ви за би по тільки її мені
було ось від мене ще немає про йому тепер коли навіть ну раптом чи якщо вже або ні був нього до
вас знову вам сказав адже там потім себе нічого їй може вони тут де є треба для ми тебе їх ніж
була сам щоб без ніби людина чого раз теж собі під життя буде тоді хто цей говорив того тому
цього який зовсім ним цьому один майже мій тим неї були куди навіщо сказати всіх ніколи сьогодні
можна при нарешті два інший хоч після над більше той через ці нас всього них яка багато хіба три
цю моя втім добре свою цієї перед іноді краще трохи такий їм більш завжди звісно всю між дім рука
очі час день рік робота слово місце друг сторона питання справа місто вода земля шлях світло стіл
вікно двері книга лист голос ранок вечір ніч тиждень місяць хвилина година дорога море небо сніг
дощ вітер ліс поле річка гора хліб чай мама тато син дочка брат сестра школа вулиця машина потяг
літак телефон гроші ціна магазин лікар лікарня`.split(/\s+/).filter(Boolean);

const СЛОВА = { ru: RU, en: EN, es: ES, uk: UK };

// Фразы -- по требованиям из работы выше: короткие, без знаков препинания и заглавных,
// из обычных слов, о простых вещах. Их легко прочитать целиком и набрать по памяти.
const ФРАЗЫ = {
  ru: [
    'завтра утром обещали дождь', 'поставь чайник на плиту', 'он забыл ключи на столе',
    'мы вернёмся домой к вечеру', 'у неё новая работа в городе', 'книга лежит на верхней полке',
    'дети играют во дворе после школы', 'позвони мне когда будешь готов',
    'свет в комнате слишком яркий', 'поезд приходит через двадцать минут',
    'она варит кофе каждое утро', 'снег шёл всю ночь без остановки',
    'старый дом стоит у самой реки', 'мне нужно купить хлеб и молоко',
    'он читает газету за завтраком', 'музыка играет слишком громко',
    'дорога до моря заняла три часа', 'положи телефон и посмотри на меня',
    'в саду растут яблони и груши', 'письмо пришло только вчера вечером',
    'мы забыли выключить свет на кухне', 'ветер сорвал шляпу с головы',
    'она пишет письмо своей сестре', 'магазин закрывается в девять',
    'кот спит на подоконнике весь день', 'у нас закончилась горячая вода',
    'он работает в этом здании давно', 'покажи мне дорогу до вокзала',
    'лето кончилось быстрее обычного', 'я оставил зонт в машине',
    'они живут на другой стороне улицы', 'стол накрыт к приходу гостей',
  ],
  en: [
    'the train leaves in ten minutes', 'she forgot her keys at home',
    'we walked along the river bank', 'the coffee is getting cold',
    'please close the window before you leave', 'he reads the paper every morning',
    'the children are playing outside', 'call me when you get there',
    'the shop closes at nine', 'it rained all night without stopping',
    'my brother lives in another city', 'put the book back on the shelf',
    'the light in the room is too bright', 'we need bread and milk',
    'the old house stands by the road', 'she writes a letter to her sister',
    'the music is much too loud', 'he left his umbrella in the car',
    'the garden is full of apple trees', 'summer ended sooner than usual',
    'we forgot to turn off the kitchen light', 'the wind blew his hat away',
    'show me the way to the station', 'the cat sleeps on the windowsill',
    'there is no hot water today', 'he has worked here for years',
    'the letter arrived only yesterday', 'they live across the street',
    'the table is set for dinner', 'she takes the bus to work',
    'the road to the sea took three hours', 'put your phone down and look at me',
  ],
  es: [
    'el tren sale en diez minutos', 'ella olvidó las llaves en casa',
    'caminamos junto al río toda la tarde', 'el café se está enfriando',
    'cierra la ventana antes de salir', 'él lee el periódico cada mañana',
    'los niños juegan en la calle', 'llámame cuando llegues a casa',
    'la tienda cierra a las nueve', 'llovió toda la noche sin parar',
    'mi hermano vive en otra ciudad', 'pon el libro en el estante',
    'la luz de la sala es muy fuerte', 'necesitamos pan y leche',
    'la casa vieja está junto al camino', 'ella escribe una carta a su hermana',
    'la música suena demasiado alta', 'dejó el paraguas en el coche',
    'el jardín está lleno de manzanos', 'el verano terminó antes de lo normal',
    'olvidamos apagar la luz de la cocina', 'el viento le quitó el sombrero',
    'muéstrame el camino a la estación', 'el gato duerme en la ventana',
    'hoy no hay agua caliente', 'trabaja aquí desde hace muchos años',
    'la carta llegó solo ayer', 'viven al otro lado de la calle',
    'la mesa está puesta para la cena', 'toma el autobús para ir al trabajo',
    'el camino al mar duró tres horas', 'deja el teléfono y mírame',
  ],
  uk: [
    'завтра вранці обіцяли дощ', 'постав чайник на плиту', 'він забув ключі на столі',
    'ми повернемось додому надвечір', 'у неї нова робота в місті', 'книга лежить на верхній полиці',
    'діти грають у дворі після школи', 'зателефонуй мені коли будеш готовий',
    'світло в кімнаті надто яскраве', 'потяг приходить через двадцять хвилин',
    'вона варить каву щоранку', 'сніг ішов усю ніч без упину',
    'старий дім стоїть біля самої річки', 'мені треба купити хліб і молоко',
    'він читає газету за сніданком', 'музика грає надто гучно',
    'дорога до моря зайняла три години', 'поклади телефон і подивись на мене',
    'у саду ростуть яблуні та груші', 'лист прийшов лише вчора ввечері',
    'ми забули вимкнути світло на кухні', 'вітер зірвав капелюха з голови',
    'вона пише листа своїй сестрі', 'магазин зачиняється о дев ятій',
    'кіт спить на підвіконні цілий день', 'у нас скінчилася гаряча вода',
    'він працює в цій будівлі давно', 'покажи мені дорогу до вокзалу',
    'літо скінчилося швидше ніж завжди', 'я залишив парасольку в машині',
    'вони живуть на іншому боці вулиці', 'стіл накритий до приходу гостей',
  ],
};

/** Сколько всего слов и фраз в запасе -- для честного ответа «а сколько у нас текстов». */
export function размерЗапаса(язык = 'ru') {
  return {
    слов: (СЛОВА[язык] || СЛОВА.ru).length,
    фраз: (ФРАЗЫ[язык] || ФРАЗЫ.ru).length,
  };
}

/**
 * Набор слов для одной попытки. Слова берутся случайно, но одно и то же не встаёт подряд:
 * повтор сбивает -- человек думает, что промахнулся строкой.
 */
export function словаДляТеста(язык = 'ru', сколько = 140) {
  const список = СЛОВА[язык] || СЛОВА.ru;
  const из = [];
  let прошлое = '';
  for (let i = 0; i < сколько; i++) {
    let слово = прошлое;
    for (let n = 0; n < 3 && слово === прошлое; n++) слово = список[Math.floor(Math.random() * список.length)];
    из.push(слово);
    прошлое = слово;
  }
  return из;
}

/**
 * Набор фраз для одной попытки, разложенный по словам: набирается он так же, как слова, а
 * читается как речь. Фразы идут подряд и не повторяются, пока не кончится весь список.
 */
export function фразыДляТеста(язык = 'ru', сколькоСлов = 140) {
  const список = [...(ФРАЗЫ[язык] || ФРАЗЫ.ru)];
  // Перемешиваем весь список, а не тянем случайные: иначе одна и та же фраза попадается
  // дважды за попытку, и это выглядит как ошибка страницы.
  for (let i = список.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [список[i], список[j]] = [список[j], список[i]];
  }
  const из = [];
  let i = 0;
  while (из.length < сколькоСлов) {
    из.push(...список[i % список.length].split(' '));
    i++;
  }
  return из.slice(0, сколькоСлов);
}
