---
toolSlug: escape-unescape
locale: es
category: dev
tool: escape-unescape
title: Escape y unescape online — escapar caracteres especiales HTML, JS, CSS
h1: Escapar caracteres especiales
navName: Escapar caracteres
description: "Herramienta gratuita para escapar y desescapar caracteres especiales en HTML, JavaScript y CSS. El desescapado va en una sola pasada y no estropea las barras."
faq:
  - question: ¿Qué es escapar y para qué sirve?
    answer: "Consiste en sustituir los caracteres que tienen un significado especial en un sitio concreto por una forma segura de escribirlos. En HTML el corchete angular abre una etiqueta, así que el texto «<div>» hay que escribirlo como «&lt;div&gt;» o el navegador lo tomará por código. Dentro de una cadena de JavaScript los especiales son la comilla y la barra invertida."
  - question: ¿Por qué hay tres modos y no uno?
    answer: "Porque cada contexto tiene sus caracteres especiales y sus reglas. Una cadena segura en HTML no lo es dentro de JavaScript y viceversa: HTML escapa los corchetes angulares y el ampersand, JavaScript las comillas y las barras, CSS lo escribe todo en códigos hexadecimales. No existe un escapado universal, y prometerlo sería mentir."
  - question: ¿Por qué el desescapado se hace en una sola pasada?
    answer: 'Porque una cadena de reemplazos estropea el texto. Si primero conviertes «\n» en salto de línea y luego «\\» en barra, la secuencia «\\n» —una barra invertida y la letra n— acaba siendo un salto de línea. Y eso ya son otros datos: así se escribe una ruta de archivo. Recorremos la cadena de izquierda a derecha y decidimos en cada barra.'
  - question: ¿Escapar protege frente a ataques?
    answer: "No, y afirmar lo contrario es peligroso. Escapar vuelve seguro un texto para un sitio concreto, pero no valida nada. La protección real se construye en el servidor: analizando y comprobando los datos, con consultas preparadas y una política de seguridad de contenido."
  - question: ¿Por qué CSS lleva un espacio tras el código?
    answer: 'Lo exige el lenguaje. Un escape hexadecimal puede tener hasta seis dígitos y, sin separador, la cifra siguiente se pega: «\41 2» es la letra A y un 2, mientras que «\412» es un carácter completamente distinto.'
  - question: ¿Qué pasa con las entidades desconocidas?
    answer: "Se devuelven enteras, tal como entraron. Una entidad rara o una pareja con barra que no entendemos no se descartan. Perder un trozo de código ajeno es peor que dejarlo sin convertir."
  - question: ¿Se envían mis datos a algún sitio?
    answer: "No. Todo ocurre en tu propio navegador. El código, la configuración y las cadenas protegidas no van a ningún servidor, no se guardan y no quedan al cerrar la pestaña."
related:
  - html-strip
  - url-encode-decode
  - base64-encode-decode
---

Elige adónde va el texto y en qué sentido convertirlo. El resultado aparece al instante.

## Tres contextos, tres juegos de reglas

- **HTML** — corchetes angulares, ampersand y comillas pasan a entidades
- **JavaScript y JSON** — comillas, barras invertidas, saltos de línea y tabulaciones
- **CSS** — los caracteres se escriben en códigos hexadecimales

Una cadena segura en HTML no lo es dentro de JavaScript. No existe un escapado universal.

## Por qué el desescapado va en una sola pasada

Una cadena de reemplazos estropea el texto. Si conviertes primero `\n` en salto de línea y luego `\\` en barra, la secuencia `\\n` acaba siendo un salto de línea. Y eso ya son otros datos.

## Lo que escapar no hace

No protege frente a ataques. El texto se vuelve seguro para un sitio concreto, pero no se valida nada. La protección real se construye en el servidor.
