// СЛОВА ДЛЯ ТЕСТА СКОРОСТИ ПЕЧАТИ.
//
// Не связный текст, а частые слова языка вперемешку -- так меряют скорость все, кто меряет её
// всерьёз. Причина простая: связный текст можно угадывать по смыслу, и тогда меряется не
// скорость печати, а знакомство с этим конкретным отрывком. Случайные частые слова убирают
// угадывание и оставляют собственно набор.
//
// Слова короткие и без знаков препинания: заглавные буквы и запятые проверяют не скорость,
// а знание раскладки, и портят сравнение между людьми. По той же причине нет цифр.

const RU = `и в не на я быть с он а то все она так его но да ты к у же вы за бы по только ее мне
было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него до
вас нибудь опять уж вам сказал ведь там потом себя ничего ей может они тут где есть надо ней для
мы тебя их чем была сам чтоб без будто человек чего раз тоже себе под жизнь будет ж тогда кто
этот говорил того потому этого какой совсем ним здесь этом один почти мой тем чтобы нее были
куда зачем сказать всех никогда сегодня можно при наконец два об другой хоть после над больше
тот через эти нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед
иногда лучше чуть том нельзя такой им более всегда конечно всю между дом рука глаза время
день год работа слово место друг сторона вопрос дело`.split(/\s+/);

const EN = `the be to of and a in that have I it for not on with he as you do at this but his by
from they we say her she or an will my one all would there their what so up out if about who get
which go me when make can like time no just him know take people into year your good some could
them see other than then now look only come its over think also back after use two how our work
first well way even new want because any these give day most us man thing woman life child world
school state family student group country problem hand part place case week company system
program question`.split(/\s+/);

const ES = `de la que el en y a los se del las un por con no una su para es al lo como más pero
sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde
todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué
unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas
algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros vosotras os mío mía casa
tiempo día vida hombre mujer parte mundo año trabajo país lugar mano forma caso`.split(/\s+/);

const UK = `і в не на я бути з він а то все вона так його але так ти у же ви за би по тільки її
мені було ось від мене ще немає про з йому тепер коли навіть ну раптом чи якщо вже або ні бути
був нього до вас небудь знову вам сказав адже там потім себе нічого їй може вони тут де є треба
їй для ми тебе їх ніж була сам щоб без ніби людина чого раз теж собі під життя буде тоді хто цей
говорив того тому цього який зовсім ним тут цьому один майже мій тим щоб неї були куди навіщо
сказати всіх ніколи сьогодні можна при нарешті два про інший хоч після над більше той через ці
нас про всього них яка багато хіба три цю моя втім добре свою цієї перед іноді краще трохи тому
не можна такий їм більш завжди звісно всю між дім рука очі час день рік робота слово місце друг
сторона питання справа`.split(/\s+/);

const СЛОВА = { ru: RU, en: EN, es: ES, uk: UK };

/**
 * Набор слов для одной попытки. Слова берутся случайно, но одно и то же не встаёт подряд:
 * повтор сбивает -- человек думает, что промахнулся строкой.
 */
export function словаДляТеста(язык = 'ru', сколько = 120) {
  const список = СЛОВА[язык] || СЛОВА.ru;
  const из = [];
  let прошлое = '';
  for (let i = 0; i < сколько; i++) {
    let слово = прошлое;
    // Три попытки -- этого хватает: список длинный, повтор подряд выпадает редко.
    for (let n = 0; n < 3 && слово === прошлое; n++) слово = список[Math.floor(Math.random() * список.length)];
    из.push(слово);
    прошлое = слово;
  }
  return из;
}
