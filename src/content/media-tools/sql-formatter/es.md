---
toolSlug: sql-formatter
locale: es
category: dev
tool: sql-formatter
title: Formateador SQL online — embellecer y organizar código SQL
h1: Formateador SQL
navName: Formateador SQL
description: "Formatea SQL online: sangrías, saltos de línea, mayúsculas de palabras clave, doce dialectos. Comprimir a una línea no rompe cadenas, comentarios ni indicaciones al optimizador."
faq:
  - question: ¿Para qué formatear consultas SQL?
    answer: "Una consulta generada por un programa o escrita con prisa suele llegar como una única línea de media pantalla. No se puede leer y menos aún depurar. Formatearla pone un salto antes de cada cláusula, sangra las subconsultas y unifica el estilo de las palabras clave. Después se ve de un vistazo dónde acaba una condición, cuántas uniones hay y qué se está seleccionando."
  - question: ¿Por qué elegir dialecto si SQL es uno solo?
    answer: "Solo comparten el esqueleto. Las comillas de dólar de PostgreSQL, las comillas invertidas de MySQL, los corchetes de T-SQL, los bloques de PL/SQL: un análisis genérico se equivoca en todos ellos y puede estropear la consulta."
  - question: ¿Qué falla en la compresión habitual de SQL?
    answer: "Rompe la consulta en tres sitios a la vez, y los tres en silencio. Los dos espacios dentro de 'Madrid,  Gran Vía' son datos, no sangría. Todo lo que sigue a un doble guion es un comentario hasta el final de la línea; al unir las líneas se comenta el resto entero de la consulta. Y una indicación como /*+ INDEX(t idx) */ parece un comentario pero decide el plan de ejecución."
  - question: ¿Qué estilo de mayúsculas elijo?
    answer: "Es cuestión de gusto y de acuerdo con el equipo. Las mayúsculas son lo de los manuales y destacan el esqueleto de la consulta entre los nombres de tablas. Las minúsculas quedan más discretas en el código moderno. También está «no cambiar»."
  - question: ¿Qué hace el salto antes de AND y OR?
    answer: "Coloca la conjunción al principio de la línea en lugar de al final de la anterior. En una condición larga de cinco o seis comprobaciones se ve de inmediato cuántas hay y dónde acaba cada una."
  - question: ¿Cómo de grande puede ser la consulta?
    answer: "Las consultas normales, incluso de cientos de líneas, se procesan al instante. En scripts muy largos lo que sufre no es el análisis sino el propio cuadro de texto."
  - question: ¿Se envía la consulta a alguna parte?
    answer: "No. Todo se calcula en tu navegador. Los esquemas de tablas, las consultas de producción y la analítica no van a ningún sitio y desaparecen con la pestaña."
related:
  - json-formatter
  - csv-json
  - json-schema-validator
---

Pega una consulta: se formatea mientras escribes. El dialecto, la sangría y el estilo de las palabras clave se eligen arriba.

## Comprimir a una línea no rompe la consulta

Sustituir todos los espacios por uno estropea tres cosas a la vez: los datos dentro de las cadenas, los comentarios tras `--` y las indicaciones al optimizador `/*+ ... */`.

## El dialecto importa

Comillas de dólar de PostgreSQL, comillas invertidas de MySQL, corchetes de T-SQL, bloques de PL/SQL: el análisis genérico falla en todos. Doce motores a elegir.

## Mayúsculas y saltos como los escribe tu equipo

Mayúsculas, minúsculas o «no cambiar». El salto antes de AND y OR pone la conjunción al principio de la línea.
