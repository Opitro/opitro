---
toolSlug: phone-formatter
locale: es
category: text
tool: phone-formatter
title: Formatear números de teléfono online — estandarizar listas a E.164
h1: Formatear números de teléfono
navName: Formato de teléfonos
description: "Herramienta gratuita para estandarizar listas de teléfonos. Formato internacional E.164, solo cifras o forma legible. Los prefijos interurbanos se tratan bien."
faq:
  - question: ¿Qué es el formato internacional E.164?
    answer: "Es el estándar de la Unión Internacional de Telecomunicaciones: el número empieza por un signo más y sigue solo con cifras — código de país, código de red y número de abonado. Sin espacios, paréntesis ni guiones, y con un máximo de quince cifras. Esa es la forma que esperan casi todos los CRM y las plataformas publicitarias."
  - question: ¿Por qué no basta con anteponer el código de país?
    answer: "Porque el prefijo interurbano no forma parte del número. El 0 británico y el 8 ruso sirven para salir a larga distancia. Si antepones el código de país a 067 123-45-67 obtienes +3800671234567: una cifra de sobra y un número que no existe. Primero hay que quitar ese prefijo, y eso es lo que hace esta página."
  - question: ¿Qué pasa con las líneas que no se entienden?
    answer: "Salen exactamente como entraron, marcadas, y se cuentan aparte. Perder en silencio una línea de una lista de clientes es lo peor que podría hacer una herramienta así: ni siquiera te enterarías. Por eso lo no procesado queda a la vista, con una nota de qué falla: letras, longitud o ausencia de cifras."
  - question: ¿Por qué se dejan intactas las líneas con letras?
    answer: "Porque sacarles las cifras es peligroso. En «+34 612 34 56 78 ext. 12» la extensión se pegaría al número principal y saldría un contacto inexistente. Nombres, encabezados de columna y notas van al montón de lo no procesado para que decidas tú."
  - question: ¿Para qué limpiar los números antes de subirlos a un CRM?
    answer: "Porque allí el número identifica a la persona. Los paréntesis, los guiones, los espacios o la falta de código de país hacen que el sistema no reconozca el contacto: crea una ficha duplicada, pierde la coincidencia al subir una audiencia o rechaza la fila con un error. Una forma única resuelve los tres problemas."
  - question: ¿Comprobáis que el número exista?
    answer: "No, y lo decimos claramente: para eso harían falta los directorios de rangos de los operadores, que son enormes y cambian sin parar. Aquí solo se comprueba la forma: código de país, longitud y ausencia de caracteres extraños."
  - question: ¿Por qué la forma legible cambia según el país?
    answer: "Porque así se escribe en cada sitio. Un número español se escribe +34 612 34 56 78; uno americano, +1 (415) 555-2671; uno ruso, +7 (999) 123-45-67. Una sola máscara para todos daría una forma equivocada para media lista."
  - question: ¿Se envían los números a algún sitio?
    answer: "No. Todo ocurre en tu propio navegador. Las listas de clientes y los contactos no van a ningún servidor, no se guardan y no quedan al cerrar la pestaña."
related:
  - remove-duplicate-lines
  - punctuation-remover
  - sort-lines
---

Pega la lista, un número por línea. El resultado aparece al instante.

## Tres formas

- **Internacional** — +34612345678, lo que esperan los CRM y las plataformas
- **Solo cifras** — 34612345678, para cargar en una base de datos
- **Legible** — +34 612 34 56 78, para una carta o una tarjeta

## El prefijo interurbano no cuenta

El 0 británico y el 8 ruso existen para salir a larga distancia. Anteponer el código de país a 067 123-45-67 deja una cifra de sobra. Lo correcto es **+380 67 123-45-67**.

## No se pierde nada

Las líneas que no se entienden salen tal como entraron, marcadas, y se cuentan aparte.

## Lo que no hacemos

No comprobamos si el número existe. Eso exigiría los directorios de rangos de los operadores. Aquí solo se comprueba la forma.
