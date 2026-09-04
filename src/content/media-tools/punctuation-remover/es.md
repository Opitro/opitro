---
toolSlug: punctuation-remover
locale: es
category: text
tool: punctuation-remover
title: Eliminar signos de puntuación online — quitar la puntuación de un texto
h1: Eliminar signos de puntuación
navName: Quitar puntuación
description: "Herramienta gratuita para eliminar signos de puntuación online. Quita puntos, comas, guiones, comillas de cualquier tipo y símbolos sin pegar las palabras ni tocar los espacios."
faq:
  - question: ¿Para qué quitar la puntuación de un texto?
    answer: "Tres motivos habituales. Para el análisis de frecuencia de palabras, donde los signos estorban al contar. Para normalizar cadenas antes de buscar o cotejar, de modo que «García, J. L.» y «García J L» coincidan. Para el aprendizaje automático, donde el texto se corta en palabras sueltas. También sirve para limpiar exportaciones de hojas de cálculo y bases antiguas donde la puntuación llegó como basura."
  - question: ¿Se pegarán las palabras después de limpiar?
    answer: "No, y esa es la diferencia principal con un borrado a secas. Un signo situado entre dos letras se convierte en espacio en lugar de desaparecer: «Madrid—Barcelona» pasa a «Madrid Barcelona», no a «MadridBarcelona». Un signo junto a un espacio o al borde de la línea simplemente se va, así que los espacios, las sangrías y los saltos de línea quedan intactos."
  - question: ¿Qué signos se eliminan exactamente?
    answer: "Todo lo que Unicode considera puntuación: puntos, comas, dos puntos, rayas y guiones de cualquier longitud, paréntesis, comillas de todo tipo —angulares, bajas, inglesas rectas y curvas—, los puntos suspensivos y los signos de apertura ¿ y ¡. No enumeramos los signos a mano: cualquier lista así acaba quedándose corta y deja en el texto alguna comilla en la que su autor no pensó."
  - question: ¿Qué hace el interruptor de guion y apóstrofo?
    answer: "Los conserva enteros dentro de la palabra. Con él activado, «teórico-práctico», «físico-químico» y «don’t» se quedan como estaban. Sin él se convierten en dos palabras separadas por un espacio. El guion y el apóstrofo comparten interruptor porque se rompen igual y suelen tratarse juntos."
  - question: ¿Por qué el más y el dólar se quitan con otra casilla?
    answer: "Porque, según Unicode, no son puntuación sino símbolos, como el igual, el euro, el signo de número y los emojis. La separación no es invención nuestra: en una fórmula o un precio esos signos hacen falta y en texto limpio estorban, y eso debe decidirlo una persona. Por defecto los símbolos se quedan."
  - question: ¿Se eliminan los emojis?
    answer: "Sí, si activas el segundo interruptor. Y enteros: los iconos compuestos, como una familia de varias figuras, van unidos por caracteres invisibles, y también los quitamos. Si no, el texto conservaría restos invisibles que luego rompen la alineación y la comparación de cadenas."
  - question: ¿Qué pasa con las cifras?
    answer: "Nada, se quedan. Las cifras no son puntuación. Si también hay que quitar los números, eso es otra tarea: lo más habitual es justo lo contrario, conservar fechas, precios y teléfonos y limpiar solo la puntuación que los rodea."
  - question: ¿Se envía mi texto a algún sitio?
    answer: "No. La limpieza ocurre en tu propio navegador. La página no envía nada a ningún servidor, no guarda nada y no recuerda ni una línea al cerrar la pestaña."
related:
  - remove-extra-spaces
  - word-frequency
  - text-case-converter
---

Pega el texto en el campo de arriba y la versión limpia aparece abajo al instante.

## Qué se elimina

- **Toda la puntuación** — puntos, comas, rayas y guiones de cualquier longitud, paréntesis
- **Comillas de todo tipo** — angulares, bajas, inglesas rectas y curvas
- **Puntos suspensivos y los signos ¿ ¡** — los que suelen faltar en las listas caseras
- **Símbolos y emojis** — con un interruptor aparte

## Las palabras no se pegan

Un signo entre dos letras se convierte en espacio en lugar de desaparecer. «Madrid—Barcelona» pasa a «Madrid Barcelona», no a «MadridBarcelona». Un signo junto a un espacio o al borde de la línea simplemente se va, así que los espacios, las sangrías y los saltos de línea quedan intactos.

## Por qué no una lista de signos

Un conjunto fijo entre corchetes siempre queda corto: se le escapan las comillas angulares, las bajas, la raya larga, los signos de apertura. Preguntamos al propio Unicode qué cuenta como puntuación, así que la regla funciona incluso con signos en los que no habíamos pensado.

## Guion y apóstrofo

Se rompen igual, por eso comparten un solo interruptor. Con él, «teórico-práctico» y «don’t» se quedan enteros. Sin él se convierten en dos palabras con un espacio, nunca en una sola pegada.
