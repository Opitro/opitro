---
toolSlug: json-schema-validator
locale: es
category: dev
tool: json-schema-validator
title: Validador de JSON Schema online — comprobar JSON contra un esquema
h1: Validación de JSON con JSON Schema
navName: Validador JSON Schema
description: "Valida JSON contra un esquema online: tipos, campos obligatorios, límites y formatos. Todas las discrepancias a la vez, con la ruta al campo. Draft-07, 2019-09 y 2020-12. Gratis y en tu navegador."
faq:
  - question: ¿Qué es JSON Schema y para qué validar con él?
    answer: "Un JSON Schema describe cómo deben ser los datos: qué campos son obligatorios, de qué tipo, en qué rango caen los números, a qué patrón responden las cadenas. Validar con él responde a la pregunta que un validador corriente nunca hace: ¿ha llegado lo que esperábamos? Es una forma barata de detectar un desacuerdo entre dos programas antes de que llegue a los usuarios."
  - question: ¿En qué se diferencia de la validación normal de JSON?
    answer: "Un validador corriente solo mira la sintaxis: si el texto se analiza o no. La validación con esquema mira el sentido. El documento {\"age\": \"cuarenta\"} es impecable de sintaxis y un validador corriente lo dará por bueno. Frente a un esquema que declara la edad como número, falla, y hace bien."
  - question: ¿Qué borradores del estándar admite?
    answer: "Draft-07, 2019-09 y 2020-12. Son incompatibles entre sí: los posteriores, por ejemplo, cambiaron items de los arrays por prefixItems. El correcto se toma del campo $schema de tu esquema y, si no está, validamos con draft-07. Cuál se ha aplicado aparece junto al botón."
  - question: ¿Por qué se muestran todos los errores a la vez?
    answer: "Porque arreglarlos de uno en uno es lento. La validación se ejecuta en el modo que reúne todas las discrepancias en lugar de parar en la primera, y cada una lleva la ruta al campo: /user/age, /items/2/id."
  - question: ¿Qué significa un error del esquema y no de los datos?
    answer: "Significa que lo que hay que arreglar son las reglas, no los datos. Pasa con una palabra clave desconocida, un $ref roto o una errata como \"type\": \"int\" en lugar de \"integer\"."
  - question: ¿Se comprueban formatos como email o fecha?
    answer: "Sí. La palabra clave format con los valores habituales —email, date, date-time, uri, uuid, ipv4, ipv6 y otros— funciona aquí. Conviene saber que el estándar considera format una simple indicación y algunas herramientas no lo comprueban; nosotros sí."
  - question: ¿Se envían los datos a alguna parte?
    answer: "No. La comprobación se hace en tu navegador. Las respuestas de servidores, la configuración y los esquemas no van a ningún sitio y desaparecen con la pestaña."
related:
  - json-formatter
  - escape-unescape
  - base64-encode-decode
---

A la izquierda el esquema, las reglas. A la derecha los datos que se comprueban. La sintaxis de ambas ventanas se revisa mientras escribes; las reglas se aplican tras una pausa corta o al pulsar el botón.

## No es lo mismo que comprobar el JSON

Un validador corriente mira la sintaxis: si el texto se analiza. Aquí se comprueba el sentido: los campos correctos, del tipo correcto y dentro de los límites.

## Todas las discrepancias a la vez

No solo la primera, sino la lista entera, cada una con la ruta al campo: `/user/age`, `/items/2/id`.

## El error del esquema se separa del error de los datos

Una palabra clave desconocida o una errata como `"type": "int"` en vez de `"integer"` es un fallo de las reglas, no de los datos, y se avisa aparte.
