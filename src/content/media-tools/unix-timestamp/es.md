---
toolSlug: unix-timestamp
locale: es
category: dev
tool: unix-timestamp
title: Conversor de Unix Timestamp online — Convertir tiempo Epoch a fecha y hora
h1: Conversor de Unix Timestamp
navName: "Conversor de marcas Unix"
summary: "Marca ↔ fecha, en cualquier zona horaria"
description: "Herramienta profesional para la conversión de Unix Time (Epoch) online. Transforma segundos y milisegundos en fechas legibles de forma 100% local e instantánea."
faq:
  - question: ¿Qué es una marca de tiempo Unix y desde cuándo se cuenta?
    answer: "Es una forma de anotar un instante con un solo número entero: los segundos transcurridos desde la medianoche del 1 de enero de 1970 en tiempo universal coordinado (UTC). El formato no depende de ninguna zona horaria, ni de idioma, ni del calendario de ningún país, y por eso las bases de datos comparan y ordenan registros por él más rápido que por nada: se comparan simplemente dos números. El punto de partida no se eligió por ningún acontecimiento astronómico sino por comodidad: una fecha redonda cercana al nacimiento del propio Unix."
  - question: ¿Cuál es la diferencia entre segundos y milisegundos?
    answer: "El Unix tradicional cuenta en segundos —hoy un número de diez dígitos—, y así miden el tiempo MySQL, PostgreSQL, PHP y Python. JavaScript (Date.now()) y Java cuentan en milisegundos: trece dígitos. También existen los microsegundos (dieciséis dígitos), que entregan muchos formatos de registro y los campos internos de PostgreSQL, y los nanosegundos (diecinueve), que es como llevan el tiempo Go y el núcleo de Linux. Nuestro conversor lee el número de las cuatro maneras, toma la lectura más cercana a hoy y escribe su suposición al lado: un clic la cambia."
  - question: ¿Por qué no basta con contar los dígitos?
    answer: "Porque esa regla solo vale para la época actual. La marca 999999999 tiene nueve dígitos y sin embargo es el 9 de septiembre de 2001: segundos perfectamente normales. El cero tiene un dígito y es el inicio de la era. Las marcas anteriores a 1970 son negativas, y la regla no dice nada de ellas. En vez de contar dígitos leemos el número de todas las maneras y miramos cuál cae más cerca de hoy; con diez y trece dígitos el resultado es exactamente el de la regla habitual, pero no se rompe en los extremos."
  - question: ¿Por qué hay que elegir zona horaria al convertir una fecha en marca?
    answer: "Porque una fecha sin zona no es un instante. «6 de septiembre, 12:00» es un momento distinto en Madrid y en Kyiv, y sus marcas difieren en una hora. El selector de fecha del navegador no lleva zona, así que el interruptor local/UTC está justo al lado. Las herramientas que no lo tienen asumen en silencio la zona de su ordenador, y mienten a todos los demás."
  - question: ¿Qué ocurrirá el 19 de enero de 2038?
    answer: "A las 03:14:07 UTC la marca alcanzará 2147483647, el mayor número que cabe en un entero con signo de 32 bits. El segundo siguiente lo desborda y la hora retrocede a diciembre de 1901. Solo afecta a los sistemas que aún guardan el tiempo en 32 bits: dispositivos empotrados antiguos, parte del equipamiento de red, algunos formatos de archivo. Los sistemas modernos cuentan en 64 bits, lo que les da unos doscientos noventa y dos mil millones de años de margen. Si la marca que introduce cruza la línea de 2038, se la señalamos."
  - question: ¿La marca es realmente el número de segundos transcurridos desde 1970?
    answer: "No, y no es imprecisión nuestra sino diseño del propio estándar. El tiempo Unix da por hecho que cada día tiene exactamente 86 400 segundos, mientras que en la realidad de vez en cuando se añade un segundo intercalar al UTC para que no se aleje de la rotación de la Tierra. Se han acumulado veintisiete. El estándar los omite, porque de lo contrario los sistemas de todo el mundo dejarían de coincidir entre sí. Así que la marca responde con honestidad a «qué día y hora es esto», pero no a «cuántos segundos han pasado exactamente»."
  - question: ¿Mis marcas de tiempo van a alguna parte?
    answer: "No. Descifrar fechas es aritmética pura: no hace falta servidor ni red, y la página no realiza ni una sola petición. Importa más de lo que parece: las marcas de los registros de su servidor son huellas del funcionamiento de su sistema, y no tienen por qué acabar en los registros de otro."
related:
  - uuid-generator
  - json-formatter
  - date-to-words
---

Pegue una marca y la fecha aparece al instante, en dos zonas horarias y como cadena ISO 8601. Arriba corre la hora actual, que puede llevarse con un clic. Debajo está el sentido inverso: elija una fecha y obtenga la marca.

## Segundos, milisegundos y todo lo demás

No preguntamos qué unidad quiere decir: la deducimos, y siempre mostramos qué hemos decidido. Esa suposición cambia la respuesta exactamente por mil, así que junto a la lectura hay cuatro botones: s, ms, µs, ns. Si la herramienta ha supuesto algo distinto de lo que usted necesitaba, pulse el que quiera y se recalcula en el sitio.

La unidad no se decide por la longitud de la cadena. El número se lee de las cuatro maneras y gana la lectura cuya respuesta cae más cerca de hoy. Con los diez y trece dígitos habituales coincide con la regla de siempre, pero no tropieza ni con el cero ni con las marcas anteriores a 1970.

## La hora local es la hora de su ordenador

La fila «Local» se calcula con la configuración de su propio sistema, cambio de hora incluido: una marca de enero en Kyiv da UTC+02:00 y una de septiembre da UTC+03:00. Conviene recordar que los países cambian esas reglas, y para fechas del siglo pasado su sistema puede tener reglas distintas de las que regían entonces.

## Comprobado contra el reloj del sistema

El descifrado de fechas se contrastó con la orden `date` del sistema: nueve marcas de referencia, marcas negativas anteriores a 1970 y tres mil aleatorias; todas coincidieron carácter por carácter, incluido el año bisiesto 2000 y el año 2100, que es divisible entre cuatro y sin embargo no es bisiesto. Las zonas horarias se verificaron en siete países, con el desfase de media hora de la India y el de tres cuartos de hora de las islas Chatham.
