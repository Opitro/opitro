---
toolSlug: mock-data
locale: es
category: dev
tool: mock-data
title: Generador de datos de prueba online — crear datos falsos (JSON, CSV, SQL)
h1: Generador de datos de prueba
navName: Datos de prueba
description: "Genera datos de prueba online: nombres, correos, teléfonos, fechas y UUID en cuatro idiomas. Salida en JSON, CSV o SQL INSERT. Correos solo en example.com. Todo en tu navegador."
faq:
  - question: ¿Qué son los datos de prueba y para qué sirven?
    answer: "Son registros inventados con aspecto real: nombres, correos, teléfonos, fechas, identificadores. Hacen falta cuando la interfaz ya se está montando y la base sigue vacía, cuando quieres ver cómo se comporta una lista con mil filas o cuando la documentación necesita un ejemplo. Y sobre todo permiten no meter datos de personas reales en el desarrollo."
  - question: ¿Por qué los nombres están en el idioma de la página?
    answer: "Porque probar una aplicación en español con «John Smith» no dice nada. Con nombres ingleses no se ve si un apellido largo cabe en la columna ni si la ordenación aguanta una eñe o un acento. Los diccionarios son propios y cubren cuatro idiomas."
  - question: ¿Por qué los correos son de example.com?
    answer: "Esos dominios están reservados para ejemplos por una norma propia (RFC 2606): el correo enviado allí no llega físicamente a nadie. Muchos generadores usan test.com, que es un dominio real con un dueño real que un día recibe la prueba de otro."
  - question: ¿Se puede llamar a los teléfonos generados?
    answer: "No, y es importante. No existe un rango «de ficción» reservado en ningún país salvo Estados Unidos, así que un número nuestro puede coincidir con uno real. Para el inglés usamos el rango 555-01xx, reservado justo para esto."
  - question: ¿Y el escapado en SQL?
    answer: "Los valores se escapan: la comilla simple se duplica. Sin eso el nombre O'Brien parte la sentencia en dos. Los números y booleanos van sin comillas y el nombre de la tabla se comprueba."
  - question: ¿Cuántos registros se pueden generar?
    answer: "Hasta 5000 de una vez. El límite no está en el cálculo, que es rápido, sino en el cuadro de salida: a los navegadores les cuesta dibujar textos muy largos."
  - question: ¿Se envían los datos a alguna parte?
    answer: "No. Todo se calcula en tu navegador. La estructura de tus futuras tablas y los datos no van a ningún sitio y desaparecen con la pestaña."
related:
  - json-formatter
  - csv-json
  - sql-formatter
---

Construye el esquema: el nombre del campo a la izquierda, el tipo a la derecha. Elige formato y cantidad y pulsa Generar.

## Datos en el idioma de la página

Una aplicación en español necesita nombres en español: con «John Smith» no se ve cómo aguanta la maquetación un apellido largo ni una eñe.

## Correo solo en example.com

Esos dominios están reservados para ejemplos y el correo allí no llega a nadie. Muchos generadores usan `test.com`, que es un dominio real.

## Los valores de SQL se escapan

El nombre `O'Brien` partiría la sentencia en dos. La comilla se duplica, los números y booleanos van sin comillas.
