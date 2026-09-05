---
toolSlug: case-converter
locale: es
category: dev
tool: case-converter
title: Convertir CamelCase a snake_case online — convertidor de estilos de código
h1: Convertidor de CamelCase y snake_case
navName: Convertidor de estilos
description: "Conversor gratuito entre camelCase, PascalCase, snake_case, kebab-case y UPPER_CASE. Funciona con listas, separa bien las siglas y conserva los guiones bajos de los extremos."
faq:
  - question: ¿Qué diferencia hay entre camelCase y snake_case?
    answer: "Son convenciones para escribir nombres compuestos en código. camelCase junta las palabras y marca los límites con mayúsculas: myVariableName. snake_case lo pone todo en minúscula y separa con guiones bajos: my_variable_name. Cada lenguaje tiene su costumbre — JavaScript prefiere camelCase y Python snake_case — así que portar código de uno a otro obliga a reescribir nombres en bloque."
  - question: ¿Para qué sirven kebab-case y UPPER_CASE?
    answer: "kebab-case separa con guiones: my-variable-name. Es la convención para las clases de CSS y para los tramos de una dirección web, donde el guion bajo se lee peor y las mayúsculas no se admiten. UPPER_CASE lo escribe todo en mayúsculas con guiones bajos: MY_VARIABLE_NAME, tradicionalmente para constantes."
  - question: ¿Por qué las siglas no se deshacen en letras?
    answer: "Porque la regla «una mayúscula empieza palabra» no vale con ellas. Con esa regla parseHTTPResponse acabaría en parse_h_t_t_p_response. En realidad la última mayúscula de la serie pertenece a la palabra siguiente: HTTPResponse es HTTP y Response, y el resultado es parse_http_response."
  - question: ¿Qué pasa con la cifra en un nombre como user2Name?
    answer: "Se queda con la palabra de su izquierda, dando user2_name en lugar de user_2_name. Así se escribió el nombre: el 2 forma parte de user2. Lo mismo con parseX509, que da parse_x509."
  - question: ¿Qué ocurre con los guiones bajos de los extremos?
    answer: "Se conservan tal cual. En Python __init__ e init son nombres distintos, y convertir uno en otro rompe el código. Un guion bajo inicial también significa algo: marca un campo interno."
  - question: ¿Puedo pegar una línea entera de código?
    answer: "Mejor no: la herramienta trabaja con listas de nombres, uno por línea. No intentamos analizar líneas completas porque así se estropean las palabras clave y las cadenas de texto. La sangría y las comas finales sí se conservan, de modo que la lista convertida se puede pegar de vuelta sin retoques."
  - question: ¿Se envían los nombres a algún sitio?
    answer: "No. Todo ocurre en tu propio navegador. Los nombres de funciones, campos y tablas no van a ningún servidor, no se guardan y no quedan al cerrar la pestaña."
related:
  - text-case-converter
  - escape-unescape
  - sort-lines
---

Pega una lista de nombres, uno por línea. El resultado aparece al instante.

## Cinco estilos

- **camelCase** — `userFirstName`, la convención de JavaScript
- **PascalCase** — `UserFirstName`, para clases y tipos
- **snake_case** — `user_first_name`, la de Python y las bases de datos
- **kebab-case** — `user-first-name`, para clases CSS y direcciones
- **UPPER_CASE** — `USER_FIRST_NAME`, para constantes

## Tres puntos donde falla la regla ingenua

**Las siglas.** Con «una mayúscula empieza palabra», `parseHTTPResponse` daría `parse_h_t_t_p_response`. En realidad sale `parse_http_response`.

**Las cifras.** `user2Name` es `user2` y `Name`, no tres piezas. Da `user2_name`.

**Los guiones bajos de los extremos.** En Python `__init__` e `init` son nombres distintos.

## La lista vuelve lista para pegar

La sangría y las comas finales se conservan: `  userName,` vuelve como `  user_name,`.
