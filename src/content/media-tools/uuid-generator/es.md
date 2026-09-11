---
toolSlug: uuid-generator
locale: es
category: dev
tool: uuid-generator
title: Generador de UUID / GUID online — Crear identificadores UUIDv4 gratis
h1: Generador de UUID y GUID
navName: "Generador de UUID"
summary: "UUID v4 y v7, mil de una vez"
description: "Herramienta profesional para generar UUID y GUID online. Crea paquetes de identificadores únicos aleatorios estándar UUIDv4 de forma 100% local e instantánea."
faq:
  - question: ¿Qué diferencia hay entre UUID y GUID?
    answer: "Técnicamente ninguna: son dos nombres para un mismo estándar. UUID arraigó en el mundo abierto: Linux, macOS, Java, Python, Go. GUID es el nombre que usa Microsoft en Windows, MS SQL Server y .NET. La estructura es idéntica: 128 bits escritos con treinta y dos caracteres hexadecimales y separados por guiones en grupos de 8-4-4-4-12. Un identificador hecho aquí sirve para ambos."
  - question: ¿Qué probabilidad hay de obtener dos identificadores iguales?
    answer: "Prácticamente nula, y eso es un cálculo, no una afirmación. La versión cuatro dedica 122 de sus 128 bits al azar; los otros seis llevan marcas estructurales. Son unas 5,3 × 10³⁶ combinaciones. Para que el riesgo de colisión llegue a la mitad habría que crear mil millones de identificadores por segundo durante unos ochenta y seis años. Hemos verificado esa cifra con la fórmula del problema del cumpleaños en lugar de copiarla del artículo de otro. Precisamente por eso las bases de datos distribuidas reparten estas claves sin consultarse entre sí ni comprobarlas."
  - question: ¿Por qué no usar Math.random?
    answer: "Produce números que parecen aleatorios pero salen de un estado interno según una regla conocida. Vistos unos cuantos seguidos, los siguientes se pueden predecir, y así se ha demostrado en la práctica con los generadores que llevan los navegadores. Para barajar cartas en un juego apenas importa; para la clave de un registro sí: adivinar la clave de otro te lleva donde no deberías estar. Nosotros tomamos los bytes de la fuente de aleatoriedad del sistema, la misma sobre la que se construyen las claves de cifrado."
  - question: ¿Qué es la versión 7 y cuándo conviene más que la 4?
    answer: "La versión siete pone delante la hora de creación, así que los identificadores salen en orden ascendente. Eso importa cuando el identificador se convierte en clave primaria: una clave aleatoria obliga a la base a insertar en medio de su índice, partiendo páginas, mientras que una ascendente cae al final. En tablas de millones de filas la diferencia se nota. La contrapartida es que una clave así revela cuándo se creó el registro, con precisión de milisegundos. Si eso no conviene, use la versión cuatro, que aquí sigue siendo la predeterminada."
  - question: ¿Para qué quitar los guiones o usar mayúsculas?
    answer: "Algunas bases y lenguajes almacenan el valor a su manera. Oracle y varios controladores esperan una cadena maciza de 32 caracteres sin guiones, y MongoDB lo guarda como campo binario. Las mayúsculas son costumbre del mundo Microsoft: en .NET y MS SQL Server el valor suele imprimirse en capitales. Nada de esto cambia el identificador en sí: ambas formas significan el mismo número y cualquiera se convierte en la otra sin pérdida."
  - question: ¿Los identificadores se envían a alguna parte?
    answer: "No. Nacen en la memoria de la pestaña, no se escriben en ningún registro y nunca viajan por la red: la página no hace ninguna petición. No es un detalle menor: las claves internas de su proyecto, una vez en el registro de otro, dejan de ser solo suyas."
related:
  - json-formatter
  - mock-data
  - base64-encode-decode
---

Elija cuántos y qué versión: los identificadores aparecen en lista. La forma de escribirlos cambia sobre la marcha, sin emitir otros nuevos: la misma lista, solo que en mayúsculas o sin guiones.

## Qué versión elegir

Si el identificador solo tiene que ser único, la versión cuatro: es lo que la gente pide al decir UUID. Si va a ser clave primaria y las filas se contarán por millones, mire la versión siete: da valores ascendentes y la base deja de partir páginas de índice en cada inserción. Si la hora de creación del registro debe permanecer en secreto, versión cuatro y solo cuatro: la siete se la enseña a cualquiera que sepa leer los primeros doce caracteres.

## Un identificador no es una contraseña

Un UUID es único pero no secreto: ni se comprueba ni se firma, y quien lo conoce obtiene aquello a lo que apunta. Un enlace del tipo «página/uuid» sin comprobación de permisos es acceso concedido por una simple conjetura, y los identificadores se filtran: a los registros, a la barra de direcciones, a los marcadores de otros. Para invitaciones y enlaces de un solo uso emplee un testigo aleatorio aparte, más largo y con caducidad, y no el identificador del registro.

## No compruebe la unicidad

La tentación es fuerte: consultar la base antes de insertar, por si acaso. Eso es una ida y vuelta de más en cada fila por un suceso que no ocurrirá en toda la vida de su sistema. El cálculo de arriba dice justamente eso: preocuparse por las colisiones tiene sentido donde los identificadores son pocos, no donde hay 10³⁶.
