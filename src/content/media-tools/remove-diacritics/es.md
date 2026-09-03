---
toolSlug: remove-diacritics
locale: es
category: text
tool: remove-diacritics
title: "Eliminar diacríticos online — quitar acentos y tildes del texto"
h1: Eliminar signos diacríticos
navName: Quitar acentos
description: "Herramienta para quitar acentos, tildes y diacríticos online. Convierte caracteres especiales (á, é, í, ó, ú, ü, ñ) en letras latinas estándar al instante."
faq:
  - question: ¿Para qué quitar los signos diacríticos?
    answer: "Casi siempre para preparar texto destinado a una URL, a una base de datos o a un sistema antiguo que solo entiende latín simple. Ahí, caracteres como á o ü se convierten en basura o rompen el enlace entero. También sirve al cotejar listas: «José» y «Jose» son cadenas distintas para un programa, pero el mismo José para una persona."
  - question: ¿Qué hace la herramienta con la «ñ»?
    answer: "Por defecto la convierte en «n», que es lo habitual para las URL. Pero la «ñ» es una letra propia del alfabeto español, no «una n con virgulilla»: «año» y «ano» son palabras distintas. Así que si estás haciendo trabajo lingüístico y no una dirección web, desactiva esa casilla: se irán solo los acentos y la «ñ» se quedará."
  - question: ¿Por qué no se quitan «ø» ni «ł»?
    answer: "Porque no son diacríticos. En Unicode «á» es «a» más un signo aparte que se puede quitar. En cambio «ø», «ł», «ß» y «æ» son letras independientes sin nada separable, y la limpieza normal no las toca. En modo URL las sustituimos a mano: ø → o, ł → l, ß → ss, æ → ae. En modo normal se quedan: son letras, no acentos."
  - question: ¿Qué hace el modo URL?
    answer: "Más que quitar signos: pasa el texto a minúsculas, convierte espacios y puntuación en guiones y recorta los guiones de los bordes y los repetidos. De «Peñalara — la Sierra» sale «penalara-la-sierra», una dirección que no se romperá en ningún sistema."
  - question: ¿Funciona con francés, alemán o polaco?
    answer: "Sí, y con cualquier idioma que escriba signos sobre las letras: é, è, ê, ë, ü, ö, ä, ç, ą, ę, ż. No recorremos una tabla de letras, sino que descomponemos el texto según las reglas de Unicode, así que funciona incluso con idiomas que no hemos mirado. La única excepción son las letras independientes como ø y ł."
  - question: ¿Se envía mi texto a algún sitio?
    answer: "No. La limpieza ocurre dentro de tu navegador, en tu dispositivo. La página no envía nada a ningún servidor, no guarda historial y no recuerda ni una línea al cerrar la pestaña."
related:
  - transliteration
  - text-case-converter
  - remove-extra-spaces
---

Escribe en el campo superior y el texto limpio aparece abajo al instante. Los dos interruptores de arriba deciden qué pasa con la «ñ» y si quieres una dirección web lista.

## Qué se quita

- **Acentos**: á, é, í, ó, ú y cualquier otro signo sobre una letra
- **Diéresis**: ü, ö, ä
- **Cedilla, ogonek, anillo**: ç, ą, å y parientes
- **Ñ**: a tu elección, convertida en n o conservada

## Por qué por descomposición y no con una tabla

En Unicode «á» está construida como «a» más un signo de acento aparte. Al descomponer el texto, los signos se retiran con una sola regla, y eso funciona hasta con idiomas en los que no habíamos pensado: checo, polaco, vietnamita.

Una tabla de letras no puede hacerlo: contiene exactamente lo que su autor anotó y enmudece ante la primera letra desconocida.

## Sobre la «ñ»: no es un diacrítico

La «ñ» es una letra del alfabeto español con su propio lugar en el diccionario. La diferencia no es cosmética: «año» y «ano» son palabras distintas. Por eso el interruptor está arriba, a la vista, y no escondido.

## Sobre las letras que no se pueden quitar

Hay letras sin nada que separar: «ø», «ł», «ß», «æ», «đ». En Unicode son caracteres independientes y la limpieza normal pasa de largo. Muchas páginas así tropiezan aquí en silencio y «Malmø» conserva su «ø» dentro del enlace.

Nosotros las sustituimos a mano, pero solo en modo URL. En modo normal se quedan como estaban: son letras, no acentos, y borrarlas sin permiso sería un error.

## Todo se queda contigo

El texto no sale de tu dispositivo. Ni envíos ni registros: cierras la pestaña y no queda nada de él.
