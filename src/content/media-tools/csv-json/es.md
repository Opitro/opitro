---
toolSlug: csv-json
locale: es
category: dev
tool: csv-json
title: Conversor de CSV a JSON online — transformar tablas en arrays JSON
h1: Conversor de formatos CSV y JSON
navName: CSV y JSON
description: "Convierte CSV a JSON y al revés online. Las referencias con ceros y los identificadores largos no se estropean, una coma dentro de un campo no rompe la tabla. Gratis y en tu navegador."
faq:
  - question: ¿En qué se diferencia CSV de JSON?
    answer: "CSV es una tabla plana: filas y columnas separadas por coma o punto y coma. Es el formato nativo de las hojas de cálculo y de las exportaciones de bases de datos. JSON es una notación anidada: objetos dentro de objetos, arrays, pares clave-valor. Es el idioma con el que los programas hablan entre sí."
  - question: ¿Por qué aquí la referencia 00123 no se convierte en 123?
    answer: "Porque la comprobación habitual —«parece un número, luego lo es»— estropea los datos en silencio. La referencia 00123 pierde los ceros, el identificador 9007199254740993 pasa a 9007199254740992, el teléfono +34600123456 pierde el signo y el precio 1.50 se vuelve 1.5. Nuestra regla es distinta y exacta: un valor se convierte en número solo si vuelve dígito a dígito."
  - question: ¿Qué hace «números y true/false como tipos reales»?
    answer: "En CSV todo es texto: el formato no tiene tipos. Al pasar a JSON, la cadena \"42\" puede quedarse como cadena o convertirse en el número 42, y las palabras true y false en booleanos. La casilla activa esa conversión."
  - question: ¿Se rompe la tabla si hay una coma dentro de un campo?
    answer: "No. El análisis sigue las reglas del formato en vez de partir por un carácter. La dirección \"Madrid, Gran Vía 1\" entre comillas sigue siendo una columna, un salto de línea entre comillas no parte el registro y una comilla duplicada se lee como una."
  - question: ¿Qué pasa con el JSON anidado al convertir a CSV?
    answer: "El anidamiento se aplana en columnas simples con un punto. El objeto {\"user\":{\"name\":\"Ana\"}} da la columna user.name y un array da tags.0 y tags.1. El orden de las columnas sigue la primera aparición, no el alfabeto."
  - question: ¿Qué separador elijo?
    answer: "Por defecto lo deducimos nosotros contando los caracteres fuera de las comillas. En Excel en español suele ser el punto y coma, en inglés la coma, y en exportaciones de bases de datos a menudo la tabulación. Cuál se ha usado aparece bajo la ventana."
  - question: ¿Se envían los datos a alguna parte?
    answer: "No. Todo se calcula en tu navegador. Las exportaciones, las listas de clientes y los informes no van a ningún sitio y desaparecen con la pestaña."
related:
  - json-formatter
  - json-schema-validator
  - case-converter
---

A la izquierda los datos de origen, a la derecha el resultado. La dirección y el separador se eligen arriba y todo se recalcula mientras escribes.

## Las referencias y los números largos no se estropean

Los conversores corrientes van con «parece un número, luego lo es», y la referencia `00123` pasa a `123`. Aquí un valor se vuelve número solo si regresa dígito a dígito.

## Una coma dentro de un campo no rompe la tabla

El análisis sigue las reglas del formato: `"Madrid, Gran Vía 1"` sigue siendo una columna.

## El anidamiento se aplana en columnas

`{"user":{"name":"Ana"}}` da la columna `user.name`, y un array da `tags.0` y `tags.1`.
