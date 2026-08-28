// МАТЕРИАЛ ДЛЯ ТЕСТА СКОРОСТИ ПЕЧАТИ -- три уровня.
//
// Порядок уровней взят из того, как человек на самом деле печатает. Связный текст набирают
// быстрее всего: смысл подсказывает следующее слово, и пальцы идут вперёд головы. Стоит убрать
// смысл -- и скорость падает, потому что каждое слово приходится читать целиком. Поэтому
// бессвязные слова здесь САМЫЙ ТРУДНЫЙ уровень, а не самый лёгкий:
//   * ЛЁГКИЙ  -- связный текст, слова короткие и знакомые;
//   * СРЕДНИЙ -- связный текст, слова длинные и трудные;
//   * СЛОЖНЫЙ -- слова без связи, со знаками препинания и заглавными.
//
// Про сам материал. В работе, на которую в этой области ссылаются все (MacKenzie, Soukoreff,
// «Phrase sets for evaluating text entry techniques», CHI 2003), названы требования к фразам:
// короткие (16-43 знака, в среднем 28,6), легко запоминаются, частота букв близка к частоте
// букв в языке, средняя длина слова 4,46 знака. Первые два уровня сделаны по этим требованиям.
//
// Знаки препинания и заглавные там намеренно исключены: они проверяют знание раскладки, а не
// скорость. Здесь они есть только на сложном уровне -- как отдельная, заявленная трудность.
//
// Набор для попытки собирается СЛУЧАЙНО и заново на каждый заход: нажал «Заново» -- получил
// другой текст. Раньше текст был один на всю сборку, и человек проходил тест второй раз уже
// по знакомому.

// Частые слова языка. Идут в сложный уровень -- вперемешку, без всякой связи между собой.
const ЧАСТЫЕ = {
  ru: `и в не на я быть с он а то все она так его но да ты к у же вы за бы по только ее мне
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
магазин врач больница`,

  en: `the be to of and a in that have it for not on with he as you do at this but his by
from they we say her she or an will my one all would there their what so up out if about who get
which go me when make can like time no just him know take people into year your good some could
them see other than then now look only come its over think also back after use two how our work
first well way even new want because any these give day most us man thing woman life child world
school state family student group country problem hand part place case week company system
program question night water house room door book letter voice morning evening street city river
sea sky snow rain wind forest field mountain bread money price shop doctor train plane phone
mother father son daughter brother sister friend road light table window paper music garden
summer winter spring autumn`,

  es: `de la que el en y a los se del las un por con no una su para es al lo como más pero
sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde
todo nos durante todos uno les ni contra otros ese eso ante ellos esto antes algunos qué unos yo
otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas
algo nosotros mi mis tú te ti tu tus ellas casa tiempo día vida hombre mujer parte mundo año
trabajo país lugar mano forma caso noche agua puerta libro carta voz mañana tarde calle ciudad
río mar cielo nieve lluvia viento bosque campo montaña pan dinero precio tienda médico tren avión
teléfono madre padre hijo hija hermano hermana amigo camino luz mesa ventana papel música jardín
verano invierno primavera otoño`,

  uk: `і в не на я бути з він а то все вона так його але ти у же ви за би по тільки її мені
було ось від мене ще немає про йому тепер коли навіть ну раптом чи якщо вже або ні був нього до
вас знову вам сказав адже там потім себе нічого їй може вони тут де є треба для ми тебе їх ніж
була сам щоб без ніби людина чого раз теж собі під життя буде тоді хто цей говорив того тому
цього який зовсім ним цьому один майже мій тим неї були куди навіщо сказати всіх ніколи сьогодні
можна при нарешті два інший хоч після над більше той через ці нас всього них яка багато хіба три
цю моя втім добре свою цієї перед іноді краще трохи такий їм більш завжди звісно всю між дім рука
очі час день рік робота слово місце друг сторона питання справа місто вода земля шлях світло стіл
вікно двері книга лист голос ранок вечір ніч тиждень місяць хвилина година дорога море небо сніг
дощ вітер ліс поле річка гора хліб чай мама тато син дочка брат сестра школа вулиця машина потяг
літак телефон гроші ціна магазин лікар лікарня`,
};
for (const яз of Object.keys(ЧАСТЫЕ)) ЧАСТЫЕ[яз] = ЧАСТЫЕ[яз].split(/\s+/).filter(Boolean);

// ЛЁГКИЙ. Связный текст об обычных вещах, слова короткие и знакомые. Такую фразу человек
// прочитывает целиком и набирает по памяти, не возвращаясь глазами к началу.
const ПРОСТЫЕ = {
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

// СРЕДНИЙ. Тот же связный текст, но слова длинные и редкие: «предварительное», «сотрудничество».
// Смысл ещё помогает, а вот пальцы уже нет -- длинное слово надо дочитать до конца.
const ТРУДНЫЕ = {
  ru: [
    'предварительное согласование заняло несколько недель',
    'представители организации подтвердили договорённость',
    'исследователи опубликовали промежуточные результаты наблюдений',
    'администрация предупредила о временном ограничении движения',
    'специалисты рекомендуют использовать альтернативное оборудование',
    'в университете открылась дополнительная лаборатория',
    'документация потребовала существенной переработки',
    'окончательное решение принимается коллегиально',
    'производительность оборудования превысила ожидания',
    'международное сотрудничество продолжается несмотря на обстоятельства',
    'предпринимателям предложили упрощённую систему налогообложения',
    'качественная реставрация памятника заняла четыре года',
    'последовательность действий описана в сопроводительной инструкции',
    'большинство участников высказалось за пересмотр соглашения',
    'автоматизация производства сократила издержки предприятия',
    'неблагоприятные погодные условия задержали строительство',
    'правительство рассматривает возможность продления программы',
    'дополнительное финансирование распределяется по направлениям',
    'археологи обнаружили удивительно хорошо сохранившееся захоронение',
    'распространение технологии потребовало переподготовки сотрудников',
    'свидетельство о регистрации выдаётся в течение недели',
    'преподаватель порекомендовал ознакомиться с первоисточниками',
    'эффективность лечения подтверждена независимыми испытаниями',
    'предполагаемая продолжительность работ составляет полгода',
    'существующая инфраструктура нуждается в модернизации',
    'общественность отреагировала на публикацию неоднозначно',
    'восстановление электроснабжения обещают к понедельнику',
    'ответственность за сохранность оборудования несёт руководитель',
    'взаимодействие подразделений происходит через общую систему',
    'предварительные подсчёты оказались слишком оптимистичными',
  ],
  en: [
    'the preliminary arrangement required additional approval',
    'researchers published the intermediate results of their observations',
    'the administration announced a temporary traffic restriction',
    'specialists recommend using alternative equipment',
    'the university opened an additional research laboratory',
    'the documentation needed substantial revision',
    'the final decision is taken collectively',
    'equipment performance significantly exceeded expectations',
    'international cooperation continues despite the circumstances',
    'entrepreneurs were offered a simplified taxation system',
    'careful restoration of the monument took four years',
    'the sequence of actions is described in the accompanying instructions',
    'most participants voted for revising the agreement',
    'manufacturing automation reduced the expenses of the enterprise',
    'unfavourable weather conditions delayed construction',
    'the government is considering extending the programme',
    'additional funding is distributed across several directions',
    'archaeologists discovered a remarkably well preserved burial',
    'spreading the technology required retraining the employees',
    'the registration certificate is issued within a week',
    'the lecturer recommended consulting the original sources',
    'the effectiveness of treatment was confirmed by independent trials',
    'the estimated duration of the works is about six months',
    'the existing infrastructure needs modernisation',
    'the public reacted to the publication ambiguously',
    'electricity supply is expected to be restored by monday',
    'responsibility for the equipment rests with the manager',
    'the departments communicate through a shared system',
    'preliminary calculations proved too optimistic',
    'the committee postponed consideration until the following quarter',
  ],
  es: [
    'el acuerdo preliminar requirió una aprobación adicional',
    'los investigadores publicaron los resultados intermedios',
    'la administración anunció una restricción temporal del tráfico',
    'los especialistas recomiendan utilizar equipos alternativos',
    'la universidad inauguró un laboratorio de investigación adicional',
    'la documentación necesitaba una revisión sustancial',
    'la decisión definitiva se toma colectivamente',
    'el rendimiento del equipo superó considerablemente las expectativas',
    'la cooperación internacional continúa pese a las circunstancias',
    'ofrecieron a los empresarios un sistema tributario simplificado',
    'la restauración del monumento duró cuatro años',
    'la secuencia de acciones aparece en las instrucciones adjuntas',
    'la mayoría de los participantes votó por revisar el acuerdo',
    'la automatización redujo los gastos de la empresa',
    'las condiciones meteorológicas desfavorables retrasaron la construcción',
    'el gobierno estudia la posibilidad de prorrogar el programa',
    'la financiación adicional se distribuye en varias direcciones',
    'los arqueólogos descubrieron un enterramiento sorprendentemente conservado',
    'la difusión de la tecnología exigió capacitar de nuevo al personal',
    'el certificado de registro se expide en una semana',
    'el profesor recomendó consultar las fuentes originales',
    'la eficacia del tratamiento fue confirmada por ensayos independientes',
    'la duración estimada de las obras es de medio año',
    'la infraestructura existente necesita modernización',
    'la opinión pública reaccionó de forma ambigua',
    'prometen restablecer el suministro eléctrico el lunes',
    'la responsabilidad del equipamiento corresponde al director',
    'los departamentos se comunican mediante un sistema común',
    'los cálculos preliminares resultaron demasiado optimistas',
    'la comisión aplazó el examen hasta el trimestre siguiente',
  ],
  uk: [
    'попереднє погодження зайняло кілька тижнів',
    'представники організації підтвердили домовленість',
    'дослідники оприлюднили проміжні результати спостережень',
    'адміністрація попередила про тимчасове обмеження руху',
    'фахівці рекомендують використовувати альтернативне обладнання',
    'в університеті відкрилася додаткова дослідницька лабораторія',
    'документація потребувала суттєвого доопрацювання',
    'остаточне рішення ухвалюється колегіально',
    'продуктивність обладнання перевищила очікування',
    'міжнародна співпраця триває попри обставини',
    'підприємцям запропонували спрощену систему оподаткування',
    'якісне відновлення споруди тривало чотири роки',
    'послідовність дій описана в супровідній інструкції',
    'більшість учасників висловилася за перегляд угоди',
    'автоматизація виробництва скоротила витрати підприємства',
    'несприятливі погодні умови затримали будівництво',
    'уряд розглядає можливість продовження програми',
    'додаткове фінансування розподіляється за напрямами',
    'археологи виявили напрочуд добре збережене поховання',
    'поширення технології потребувало перепідготовки працівників',
    'свідоцтво про реєстрацію видається протягом тижня',
    'викладач порекомендував ознайомитися з першоджерелами',
    'ефективність лікування підтверджена незалежними випробуваннями',
    'передбачувана тривалість робіт становить півроку',
    'наявна інфраструктура потребує модернізації',
    'громадськість відреагувала на публікацію неоднозначно',
    'відновлення електропостачання обіцяють до понеділка',
    'відповідальність за збереження обладнання несе керівник',
    'взаємодія підрозділів відбувається через спільну систему',
    'попередні підрахунки виявилися надто оптимістичними',
  ],
};

// Кавычки у каждого языка свои. Английские «лапки» в русском тексте выглядят чужеродно, а
// печатаются они по-разному -- значит и трудность была бы не та.
const КАВЫЧКИ = { ru: ['«', '»'], uk: ['«', '»'], es: ['«', '»'], en: ['“', '”'] };

const сл = (n) => Math.floor(Math.random() * n);
const из = (список) => список[сл(список.length)];

/** Сколько всего материала в запасе -- для честного ответа «а сколько у нас текстов». */
export function размерЗапаса(язык = 'ru') {
  const яз = ЧАСТЫЕ[язык] ? язык : 'ru';
  return { слов: ЧАСТЫЕ[яз].length, простых: ПРОСТЫЕ[яз].length, трудных: ТРУДНЫЕ[яз].length };
}

/**
 * Связный уровень: фразы идут подряд и разбиты на слова. Весь список сначала перемешивается,
 * а не тянется по одной случайной -- иначе одна и та же фраза попадается за попытку дважды,
 * и это выглядит как поломка страницы.
 */
function изФраз(список, сколькоСлов) {
  const свои = [...список];
  for (let i = свои.length - 1; i > 0; i--) {
    const j = сл(i + 1);
    [свои[i], свои[j]] = [свои[j], свои[i]];
  }
  const вышло = [];
  let i = 0;
  while (вышло.length < сколькоСлов) вышло.push(...свои[i++ % свои.length].split(' '));
  return вышло.slice(0, сколькоСлов);
}

/**
 * Сложный уровень: слова без всякой связи, разложенные на предложения со знаками препинания
 * и заглавными. Смысла нет -- каждое слово приходится дочитывать до конца, и на этом скорость
 * заметно падает. Это и есть заявленная трудность уровня.
 */
function изСлов(список, сколькоСлов, язык) {
  const [лк, пк] = КАВЫЧКИ[язык] || КАВЫЧКИ.en;
  const вышло = [];
  let сНачала = true;
  while (вышло.length < сколькоСлов) {
    const длина = 4 + сл(5); // предложение из 4-8 слов -- как обычная фраза
    const запятая = длина > 5 && Math.random() < 0.5 ? 1 + сл(длина - 2) : -1;
    for (let i = 0; i < длина && вышло.length < сколькоСлов; i++) {
      let слово = из(список);
      // Кавычки и числа -- редко: они трудные (Shift и верхний ряд), но если сыпать их часто,
      // тест перестаёт быть тестом набора и становится тестом верхнего ряда.
      if (Math.random() < 0.03) слово = лк + слово + пк;
      else if (Math.random() < 0.03) слово = String(10 + сл(990));
      if (сНачала) {
        // Заглавная ставится на первую БУКВУ, а не на первый знак: иначе после кавычки
        // предложение начинается со строчной и выглядит опечаткой.
        const б = слово.search(/\p{L}/u);
        if (б >= 0) слово = слово.slice(0, б) + слово[б].toUpperCase() + слово.slice(б + 1);
        сНачала = false;
      }
      if (i === запятая) слово += ',';
      if (i === длина - 1) { слово += из(['.', '.', '.', '.', '!', '?']); сНачала = true; }
      вышло.push(слово);
    }
  }
  return вышло;
}

/**
 * Материал на одну попытку. Уровни: 'easy' -- связный текст простыми словами, 'medium' -- он же
 * длинными и трудными, 'hard' -- слова без связи со знаками препинания.
 */
export function текстДляТеста(язык = 'ru', уровень = 'easy', сколькоСлов = 140) {
  const яз = ЧАСТЫЕ[язык] ? язык : 'ru';
  if (уровень === 'hard') return изСлов(ЧАСТЫЕ[яз], сколькоСлов, яз);
  return изФраз(уровень === 'medium' ? ТРУДНЫЕ[яз] : ПРОСТЫЕ[яз], сколькоСлов);
}
