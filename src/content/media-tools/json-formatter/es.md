---
toolSlug: json-formatter
locale: es
category: dev
tool: json-formatter
title: Formateador JSON online — validador y formato de código JSON
h1: Formateador y validador JSON
navName: Formateador JSON
description: "Formatea y valida JSON online: posición exacta del error, compresión a una línea, sangría de 2 o 4 espacios. Los números largos nunca se estropean. Gratis y todo en tu navegador."
faq:
  - question: ¿Qué es JSON y para qué formatearlo?
    answer: "JSON es el formato de texto que hablan casi todas las interfaces de programación. Al viajar por la red se le quitan todos los espacios y saltos de línea para que pese menos, y lo que ve una persona es una única línea de varias pantallas. Formatearlo devuelve la sangría y los saltos: se ve el anidamiento y se encuentra el campo con la vista, sin recurrir al buscador."
  - question: ¿Por qué aquí no se estropean los números largos y en otros sitios sí?
    answer: "Porque la receta habitual —pasar el texto por JSON.parse y JSON.stringify— convierte cada número en un valor de coma flotante, y ahí los enteros solo caben hasta unos 9 billardos. El identificador 9007199254740993 vuelve como 9007199254740992 y 12345678901234567890 como 12345678901234567000. El fallo es silencioso: el texto parece correcto y el valor ya es otro. Nuestro análisis es propio y los números salen con los mismos dígitos con los que entraron."
  - question: ¿Cómo se determina la posición del error?
    answer: "Contamos la línea y la columna nosotros en vez de repetir el mensaje del navegador. Importa porque Chrome, Firefox y Safari redactan el mismo error de forma distinta, y Safari a menudo no indica la posición. Aquí la posición es igual en todas partes, con una explicación en lenguaje llano al lado: una coma colgante, comillas simples en vez de dobles, una cadena sin cerrar."
  - question: ¿Qué significa el aviso de claves repetidas?
    answer: "La misma clave aparece dos veces en un objeto. El formato lo permite, pero al leerlo solo sobrevive el último valor y los anteriores desaparecen sin avisar. No es un error, así que la validación pasa; pero en un archivo de configuración esa errata puede durar meses. Señalamos la clave y la línea en que se repite."
  - question: ¿Por qué mi JSON no pasa la validación si parece correcto?
    answer: "Casi siempre es una de tres cosas. Comillas simples: JSON solo admite dobles, aunque JavaScript acepte ambas. Una coma colgante tras el último elemento: JavaScript la tolera, JSON no. Comentarios: en JSON no existen. Comprobamos de forma estricta, igual que hará cualquier programa que lea después tu archivo."
  - question: ¿Cómo de grande puede ser el archivo?
    answer: "Unos megabytes se procesan en una fracción de segundo. A partir de ahí lo que sufre no es el análisis sino el propio cuadro de texto: a los navegadores les cuesta dibujar textos muy largos. Para archivos de decenas de megabytes es mejor un programa de escritorio."
  - question: ¿Se envían los datos a alguna parte?
    answer: "No. Todo se calcula en tu navegador. Claves, tokens, respuestas de servidores y trozos de configuración no van a ningún sitio, no se guardan y desaparecen con la pestaña."
related:
  - escape-unescape
  - base64-encode-decode
  - case-converter
---

Pega el JSON: se comprueba mientras escribes. La sangría se elige arriba: dos espacios, cuatro, tabulación o ninguna.

## Los números largos quedan intactos

La forma habitual de formatear —pasar el texto por `JSON.parse` y `JSON.stringify`— rompe sin avisar los identificadores grandes: `9007199254740993` vuelve como `…992`. Aquí el análisis es propio y el número sale tal como entró.

## La posición del error es igual en todos los navegadores

La línea y la columna las contamos nosotros, no se toman del mensaje del navegador: Chrome, Firefox y Safari lo redactan de forma distinta. Junto a las coordenadas hay una explicación en lenguaje llano.

## Las claves repetidas se señalan

El estándar las permite, pero al leer solo sobrevive el último valor. La validación pasa, así que no lo llamamos error: avisamos y mostramos la línea.
