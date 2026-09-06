---
toolSlug: minify-css
locale: es
category: dev
tool: minify-css
title: Minificador CSS online — Comprimir código CSS y optimizar estilos
h1: Minificador de código CSS
navName: Minificador CSS
description: "Herramienta profesional para minificar y comprimir código CSS online. Elimina espacios en blanco, comentarios y optimiza tus hojas de estilo de forma 100% local."
faq:
  - question: ¿Por qué no se pueden quitar todos los espacios sin más?
    answer: "Porque en CSS hay lugares donde el espacio forma parte de la gramática. El más conocido es <code>calc(100% - 10px)</code>. Quite los espacios alrededor del menos y obtendrá <code>calc(100%-10px)</code>, una expresión no válida que el navegador descarta en silencio junto con toda la declaración. Lo mismo con las consultas de medios: <code>@media screen and (min-width:600px)</code> deja de funcionar sin el espacio antes del paréntesis. Nosotros leemos el archivo carácter a carácter y sabemos dónde estamos, así que esos espacios se quedan."
  - question: ¿Es cierto que #ffffff siempre puede acortarse a #fff?
    answer: "Dentro del valor de una propiedad, sí, siempre que coincidan los pares de caracteres. Pero ese mismo texto al principio de una regla es un selector por identificador: <code>#aabbcc { }</code> busca un elemento con ese identificador, y acortarlo desligaría la regla de su elemento. La única diferencia está en dónde aparece el texto, y por eso una sustitución por patrón no sirve aquí: ve la cadena, pero no ve el lugar. Nosotros acortamos colores solo dentro de valores."
  - question: ¿Por qué 0px pasa a 0 y 0s no?
    answer: "Porque un cero sin unidad solo vale para una longitud. Para el tiempo no es válido: el navegador no acepta <code>transition: 0</code>, necesita <code>0s</code>. Los porcentajes dentro de <code>@keyframes</code> tampoco se tocan: allí <code>0%</code> es el número de un paso, no un tamaño. Y dentro de <code>calc</code> la unidad tiene que quedarse: <code>calc(100% - 0px)</code> funciona y <code>calc(100% - 0)</code> no. Quitamos la unidad solo a las longitudes y solo fuera de los cálculos."
  - question: ¿Qué pasa con las propiedades personalizadas (--nombre) y var()?
    answer: "No las tocamos en absoluto, y eso es necesidad más que prudencia. El navegador guarda el valor de una propiedad personalizada literalmente —como una corriente de caracteres— y solo lo analiza donde se sustituye mediante var(). Acorte ahí «0px» a «0» y un <code>calc(100% - var(--nombre))</code> situado en un archivo completamente distinto dejará de funcionar. El fallo aparece lejos de donde se acortó y cuesta mucho encontrarlo. Por la misma razón no se toca el contenido de var() ni de color-mix()."
  - question: ¿Cuánto se reduce el archivo?
    answer: "Pasamos por la herramienta las 83 hojas de estilo de este sitio, reales y no escritas para lucirse. El peso total bajó de 901 KB a 508 KB, es decir un 43,6%. Es lo típico en hojas escritas a mano, con sangrías y comentarios. Un archivo que ya ha pasado por un empaquetador encogerá bastante menos: apenas le sobra nada."
  - question: ¿Cómo se aseguraron de que no se rompía nada?
    answer: "El juez no somos nosotros, sino el propio navegador. Cada uno de los 83 archivos se minificó, y después el original y la versión minificada se pasaron al analizador del navegador para comparar el conjunto de reglas construidas: mismos selectores, mismas propiedades, mismos valores. Coincidieron todos. Además, veinticuatro páginas terminadas del sitio se dibujaron en dos ventanas a la vez comparando los estilos calculados de cada nodo; a esas alturas var() ya está sustituido, así que lo que se comprueba es el significado. Y se verificó aparte que el juez no duerme: si se estropea un calc a propósito, la declaración desaparece y él lo detecta."
related:
  - minify-html
  - minify-js
  - color-converter
---

Pegue su hoja de estilo y pulse el botón. La fila de arriba lleva a los vecinos: el minificador de HTML y el de JavaScript.

## Qué hace la herramienta

Quita los comentarios, salvo los que empiezan por `/*!`: por acuerdo general ahí va una licencia, y descartarla no sería optimizar sino robar. Reduce espacios y saltos de línea. Acorta colores: `#aabbcc` a `#abc`, `rgb(0,0,0)` a `#000`. Quita ceros sobrantes: `0.50rem` a `.5rem`, `0px` a `0`. Elimina el último punto y coma de cada bloque.

Cada una de estas sustituciones puede desactivarse con una casilla si no la quiere.

## Cuatro puntos donde otros se equivocan

**Los espacios en `calc`.** Es gramática, no aritmética: `calc(100%-10px)` no es válido y la declaración se cae entera.

**La almohadilla al principio de una regla.** Ahí `#aabbcc` es un selector por identificador, no un color.

**El cero sin unidad.** Vale para una longitud; no para un tiempo, no dentro de `calc` y no para el número de paso de `@keyframes`.

**Las propiedades personalizadas.** El navegador guarda su valor literalmente y solo lo analiza al sustituirlo. Comprimir dentro de ellas rompe la página lejos de donde se comprimió.

## Cómo se ha comprobado

83 hojas de estilo de este sitio se minificaron y se pasaron al analizador del propio navegador: el conjunto de reglas coincidió en todos los casos. Aparte, veinticuatro páginas terminadas se dibujaron en dos ventanas a la vez y se compararon los estilos calculados de cada nodo, unos 4700 nodos. A esas alturas `var()` ya está sustituido y el almacenamiento literal ha quedado atrás, así que lo que se compara es el significado. Coincidió todo.
