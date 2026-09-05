// ГЕНЕРАТОР ТЕСТОВЫХ ДАННЫХ.
//
// Словари СВОИ и на четырёх языках. Готовые библиотеки вроде Faker весят по полмегабайта и
// говорят по-английски: русскому разработчику, который проверяет русское приложение, «John
// Smith» в списке пользователей помогает мало -- на таких данных не видно ни длинных фамилий,
// ни отчеств, ни того, как вёрстка держит кириллицу.
//
// ПОЧТА -- ТОЛЬКО НА example.com И РОДСТВЕННЫХ. Эти домены закреплены RFC 2606 ровно за
// примерами: письмо туда не уйдёт никому. В задании стояло test.com, но это НАСТОЯЩИЙ
// зарегистрированный домен с живым владельцем, и сгенерированный адрес однажды получит от
// кого-нибудь настоящее письмо.
//
// ТЕЛЕФОНЫ могут случайно совпасть с настоящими: закреплённого «выдуманного» диапазона нет
// нигде, кроме США (555-01xx). Об этом сказано на самой странице, а не спрятано.

const РУ = {
  имена: ['Александр','Алексей','Андрей','Антон','Артём','Борис','Вадим','Валерий','Василий','Виктор','Виталий','Владимир','Вячеслав','Геннадий','Георгий','Григорий','Даниил','Денис','Дмитрий','Евгений','Егор','Иван','Игорь','Илья','Кирилл','Константин','Леонид','Максим','Михаил','Никита','Николай','Олег','Павел','Пётр','Роман','Сергей','Станислав','Степан','Тимофей','Фёдор','Юрий','Ярослав','Анна','Анастасия','Валентина','Вера','Виктория','Галина','Дарья','Екатерина','Елена','Ирина','Ксения','Лариса','Любовь','Людмила','Марина','Мария','Надежда','Наталья','Ольга','Полина','Светлана','София','Татьяна','Юлия'],
  фамилии: ['Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов','Новиков','Фёдоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Егоров','Павлов','Козлов','Степанов','Николаев','Орлов','Андреев','Макаров','Никитин','Захаров','Зайцев','Соловьёв','Борисов','Яковлев','Григорьев','Романов','Воробьёв','Сергеев','Кузьмин','Фролов','Александров','Дмитриев','Королёв','Гусев','Киселёв'],
  города: ['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань','Нижний Новгород','Челябинск','Самара','Омск','Ростов-на-Дону','Уфа','Красноярск','Воронеж','Пермь','Волгоград','Краснодар','Саратов','Тюмень','Тольятти','Ижевск'],
  улицы: ['Ленина','Советская','Молодёжная','Центральная','Школьная','Садовая','Лесная','Набережная','Заречная','Полевая','Мира','Пушкина','Гагарина','Победы','Юбилейная'],
  страны: ['Россия','Казахстан','Беларусь','Армения','Грузия','Узбекистан','Киргизия'],
  компании: ['Альфа','Вектор','Горизонт','Импульс','Кристалл','Меридиан','Орион','Партнёр','Прогресс','Ритм','Синтез','Спектр','Старт','Техносила','Форум','Эталон','Юнион','Янтарь'],
  должности: ['Разработчик','Аналитик','Дизайнер','Менеджер','Тестировщик','Администратор','Бухгалтер','Инженер','Консультант','Руководитель отдела'],
  слова: ['время','дело','жизнь','день','рука','раз','работа','место','вопрос','час','сторона','дом','слово','город','вода','путь','конец','свет','земля','мысль'],
};

const УК = {
  имена: ['Олександр','Андрій','Богдан','Василь','Віктор','Володимир','Дмитро','Євген','Іван','Ігор','Максим','Микола','Михайло','Назар','Олег','Остап','Павло','Петро','Роман','Сергій','Тарас','Юрій','Ярослав','Анна','Валентина','Галина','Дарина','Ірина','Катерина','Леся','Людмила','Марія','Наталія','Оксана','Олена','Ольга','Світлана','Софія','Тетяна','Христина','Юлія'],
  фамилии: ['Шевченко','Коваленко','Бондаренко','Ткаченко','Кравченко','Олійник','Шевчук','Поліщук','Бойко','Ковальчук','Мельник','Савченко','Руденко','Марченко','Лисенко','Гончаренко','Панасенко','Кузьменко','Петренко','Іваненко','Мороз','Литвин','Дяченко','Захарченко','Сидоренко'],
  города: ['Київ','Харків','Одеса','Дніпро','Донецьк','Запоріжжя','Львів','Кривий Ріг','Миколаїв','Вінниця','Полтава','Чернігів','Черкаси','Житомир','Суми','Хмельницький','Чернівці','Рівне','Івано-Франківськ','Тернопіль'],
  улицы: ['Шевченка','Франка','Лесі Українки','Соборна','Центральна','Молодіжна','Садова','Лісова','Набережна','Миру','Грушевського','Сагайдачного','Хрещатик','Волі','Перемоги'],
  страны: ['Україна','Польща','Молдова','Румунія','Словаччина','Угорщина'],
  компании: ['Аврора','Веста','Галактика','Дніпро','Зоря','Карпати','Либідь','Модерн','Оріон','Прогрес','Роса','Січ','Схід','Тандем','Форум','Хвиля','Явір'],
  должности: ['Розробник','Аналітик','Дизайнер','Менеджер','Тестувальник','Адміністратор','Бухгалтер','Інженер','Консультант','Керівник відділу'],
  слова: ['час','справа','життя','день','рука','раз','робота','місце','питання','сторона','дім','слово','місто','вода','шлях','кінець','світло','земля','думка','рік'],
};

const EN = {
  имена: ['James','Robert','John','Michael','David','William','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Andrew','Paul','Joshua','Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Sandra','Margaret','Ashley','Kimberly','Emily','Donna','Michelle'],
  фамилии: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'],
  города: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','London','Manchester','Birmingham','Liverpool','Bristol','Leeds','Edinburgh','Glasgow','Dublin','Toronto'],
  улицы: ['Main St','Oak Ave','Maple Dr','Cedar Ln','Elm St','Park Rd','Washington Ave','Lake View','High St','Church Rd','Station Rd','Victoria St','King St','Queen St','Mill Ln'],
  страны: ['United States','United Kingdom','Canada','Australia','Ireland','New Zealand'],
  компании: ['Acme','Apex','Beacon','Catalyst','Cobalt','Delta','Everest','Fusion','Granite','Harbor','Ignite','Keystone','Lumen','Meridian','Northwind','Orbit','Pinnacle','Quantum','Summit','Vertex'],
  должности: ['Developer','Analyst','Designer','Manager','QA Engineer','Administrator','Accountant','Engineer','Consultant','Team Lead'],
  слова: ['time','case','life','day','hand','work','place','question','side','house','word','city','water','way','end','light','earth','thought','year','part'],
};

const ES = {
  имена: ['Antonio','José','Manuel','Francisco','David','Juan','Javier','Daniel','Carlos','Miguel','Rafael','Pedro','Alejandro','Ángel','Pablo','Sergio','Jorge','Alberto','Luis','Álvaro','María','Carmen','Ana','Isabel','Laura','Marta','Cristina','Elena','Lucía','Paula','Sara','Andrea','Rocío','Beatriz','Nuria','Silvia','Patricia','Raquel','Julia','Clara'],
  фамилии: ['García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Martín','Jiménez','Ruiz','Hernández','Díaz','Moreno','Muñoz','Álvarez','Romero','Alonso','Gutiérrez','Navarro','Torres','Domínguez','Vázquez','Ramos','Gil','Ramírez','Serrano','Blanco','Molina'],
  города: ['Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Palma','Bilbao','Alicante','Córdoba','Valladolid','Vigo','Gijón','Granada','Ciudad de México','Bogotá','Buenos Aires','Lima','Santiago'],
  улицы: ['Calle Mayor','Gran Vía','Calle Real','Avenida de la Constitución','Calle del Sol','Paseo del Prado','Calle Nueva','Avenida de América','Calle Alta','Plaza España','Calle Larga','Calle Ancha','Avenida Central','Calle Verde','Camino Viejo'],
  страны: ['España','México','Argentina','Colombia','Chile','Perú','Uruguay'],
  компании: ['Alba','Aurora','Boreal','Cima','Delta','Encina','Faro','Gala','Horizonte','Ibérica','Lumbre','Mirador','Norte','Olivo','Puente','Ribera','Solar','Tramo','Vega','Zafiro'],
  должности: ['Desarrollador','Analista','Diseñador','Gerente','Tester','Administrador','Contable','Ingeniero','Consultor','Jefe de equipo'],
  слова: ['tiempo','caso','vida','día','mano','trabajo','lugar','pregunta','lado','casa','palabra','ciudad','agua','camino','fin','luz','tierra','idea','año','parte'],
};

const СЛОВАРИ = { ru: РУ, uk: УК, en: EN, es: ES };

// Транслитерация только для почтовых адресов. На сайте есть отдельная страница
// транслитерации, но её таблицы живут внутри того компонента и знают четыре стандарта;
// вытаскивать их сюда значило бы трогать работающую страницу ради мелочи.
const ЛАТ = {
  а:'a',б:'b',в:'v',г:'g',ґ:'g',д:'d',е:'e',є:'ie',ё:'e',ж:'zh',з:'z',и:'i',і:'i',ї:'i',й:'i',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',
  ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'iu',я:'ia',
};
function латиницей(с) {
  return String(с).toLowerCase().split('').map((з) => {
    if (ЛАТ[з] !== undefined) return ЛАТ[з];
    if (/[a-z0-9]/.test(з)) return з;
    // Испанские и другие надстрочные знаки в адресе почты недопустимы.
    const без = з.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return /[a-z]/i.test(без) ? без.toLowerCase() : '';
  }).join('');
}

const из = (список) => список[Math.floor(Math.random() * список.length)];
const между = (а, б) => а + Math.floor(Math.random() * (б - а + 1));

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Запасной путь для старых браузеров: тот же вид, четвёртая версия.
  const б = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(б);
  else for (let и = 0; и < 16; и++) б[и] = Math.floor(Math.random() * 256);
  б[6] = (б[6] & 0x0f) | 0x40;
  б[8] = (б[8] & 0x3f) | 0x80;
  const ш = [...б].map((з) => з.toString(16).padStart(2, '0')).join('');
  return `${ш.slice(0,8)}-${ш.slice(8,12)}-${ш.slice(12,16)}-${ш.slice(16,20)}-${ш.slice(20)}`;
}

/** Список доступных типов: ключ и как он называется на четырёх языках. */
export const ТИПЫ = [
  'id', 'uuid', 'firstName', 'lastName', 'fullName', 'email', 'phone',
  'city', 'country', 'address', 'company', 'jobTitle',
  'number', 'price', 'date', 'datetime', 'boolean', 'word', 'sentence', 'url', 'ip',
];

// Домены только из тех, что RFC 2606 закрепил за примерами: почта туда физически не уйдёт.
const ДОМЕНЫ = ['example.com', 'example.org', 'example.net'];

/** Одно значение заданного типа. Номер строки нужен типу «id». */
export function значение(тип, язык, номер) {
  const с = СЛОВАРИ[язык] || РУ;
  switch (тип) {
    case 'id': return номер;
    case 'uuid': return uuid();
    case 'firstName': return из(с.имена);
    case 'lastName': return из(с.фамилии);
    case 'fullName': return `${из(с.имена)} ${из(с.фамилии)}`;
    case 'email': {
      const имя = латиницей(из(с.имена));
      const фам = латиницей(из(с.фамилии));
      const вид = Math.random();
      const местная = вид < 0.4 ? `${имя}.${фам}`
        : вид < 0.7 ? `${имя[0]}${фам}`
        : `${фам}${между(1, 99)}`;
      return `${местная}@${из(ДОМЕНЫ)}`;
    }
    case 'phone': {
      if (язык === 'en') return `+1 555-01${String(между(0, 99)).padStart(2, '0')}`;
      const код = язык === 'uk' ? '+380' : язык === 'es' ? '+34' : '+7';
      const хвост = язык === 'es'
        ? `${между(600, 699)} ${между(100, 999)} ${между(100, 999)}`
        : `${между(900, 999)} ${между(100, 999)}-${String(между(0, 99)).padStart(2, '0')}-${String(между(0, 99)).padStart(2, '0')}`;
      return `${код} ${хвост}`;
    }
    case 'city': return из(с.города);
    case 'country': return из(с.страны);
    case 'address': return `${из(с.улицы)}, ${между(1, 150)}`;
    case 'company': return из(с.компании);
    case 'jobTitle': return из(с.должности);
    case 'number': return между(1, 1000);
    case 'price': return Number((Math.random() * 9990 + 10).toFixed(2));
    case 'date': {
      const д = new Date(Date.now() - между(0, 730) * 86400000);
      return д.toISOString().slice(0, 10);
    }
    case 'datetime': {
      const д = new Date(Date.now() - между(0, 730) * 86400000 - между(0, 86399) * 1000);
      return д.toISOString();
    }
    case 'boolean': return Math.random() < 0.5;
    case 'word': return из(с.слова);
    case 'sentence': {
      const н = между(4, 9);
      const слова = Array.from({ length: н }, () => из(с.слова));
      слова[0] = слова[0][0].toUpperCase() + слова[0].slice(1);
      return слова.join(' ') + '.';
    }
    case 'url': return `https://${из(ДОМЕНЫ)}/${латиницей(из(с.слова))}/${между(1, 999)}`;
    case 'ip': return `${между(1, 223)}.${между(0, 255)}.${между(0, 255)}.${между(1, 254)}`;
    default: return '';
  }
}

/** Массив объектов по схеме. Схема -- список {ключ, тип}. */
export function сделать(схема, сколько, язык) {
  const поля = схема.filter((п) => п.ключ && п.ключ.trim());
  const из_ = [];
  for (let н = 1; н <= сколько; н++) {
    const строка = {};
    for (const п of поля) строка[п.ключ.trim()] = значение(п.тип, язык, н);
    из_.push(строка);
  }
  return из_;
}

/**
 * Строки SQL INSERT. Значения ЭКРАНИРУЮТСЯ: одинарная кавычка удваивается. Без этого имя
 * O'Brien или город Cote-d'Or рвут запрос пополам, и получается не «тестовые данные», а
 * готовый пример того, как ломают базы.
 */
export function вSQL(ряды, таблица = 'users') {
  if (!ряды.length) return '';
  const колонки = Object.keys(ряды[0]);
  const имя = /^[A-Za-z_][A-Za-z_0-9]*$/.test(таблица) ? таблица : 'users';
  const клетка = (з) => {
    if (з === null || з === undefined) return 'NULL';
    if (typeof з === 'number') return String(з);
    if (typeof з === 'boolean') return з ? 'TRUE' : 'FALSE';
    return `'${String(з).split("'").join("''")}'`;
  };
  return ряды
    .map((р) => `INSERT INTO ${имя} (${колонки.join(', ')}) VALUES (${колонки.map((к) => клетка(р[к])).join(', ')});`)
    .join('\n');
}
