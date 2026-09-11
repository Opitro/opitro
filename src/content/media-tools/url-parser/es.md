---
toolSlug: url-parser
locale: es
category: dev
tool: url-parser
title: Parser de URL online — Dividir enlaces en parámetros query
h1: Parser de URL
navName: "Analizador de URL"
summary: "Separar la dirección en partes y parámetros"
description: "Analizador de URL online. Descompone enlaces, parámetros query, host y rutas al instante de forma 100% local."
faq:
  - question: ¿De qué partes se compone una dirección web?
    answer: "Un esquema (https:, por ejemplo), un host (el nombre de dominio o la dirección del servidor), un puerto, una ruta hasta una sección o un archivo, una cadena de consulta tras el signo de interrogación —pares «nombre=valor» unidos por ampersands— y un fragmento tras la almohadilla. También puede escribirse un usuario y una contraseña antes del host: apenas se usa, pero esos enlaces aparecen, y nuestro analizador los señala aparte porque son una fuga."
  - question: ¿Por qué desaparecen algunos de mis parámetros?
    answer: "Lo más probable es que los nombres se repitan. En un enlace como ?a=1&a=2 un análisis corriente devuelve solo el primer valor y el segundo se pierde en silencio: casi todos los analizadores simples cometen ese error. Nosotros mostramos todos los valores en su orden original y marcamos los repetidos. Ocurre sobre todo en enlaces de sistemas publicitarios, donde las etiquetas repetidas son lo habitual."
  - question: ¿Por qué el parámetro llega distinto de como se envió?
    answer: "Casi siempre la culpa es del signo más. En la cadena de consulta el más significa espacio; en la ruta significa más: el mismo carácter con sentidos distintos a cada lado del signo de interrogación. La segunda causa más frecuente es el signo de porcentaje: %2F en una ruta es una barra codificada DENTRO de un segmento, no un separador. La ruta /a%2Fb/c consta de dos segmentos, no de tres, y dejamos esa barra codificada a propósito: mostrar «/a/b/c» falsearía la estructura del enlace."
  - question: ¿Por qué el host se convirtió en letras que empiezan por xn--?
    answer: "Eso es punycode. El navegador convierte los nombres escritos en cirílico o en cualquier otra escritura no latina a esa forma antes de enviarlos: «пример.рф» pasa a ser «xn--e1afmkfd.xn--p1ai». Esa forma es la que llega al servidor y queda en sus registros, por eso la mostramos como valor principal y ponemos al lado la grafía habitual, para que una se reconozca en la otra."
  - question: ¿Llega al servidor el fragmento tras la almohadilla?
    answer: "No. Todo lo que sigue a la almohadilla se lo queda el navegador y no se incluye en la petición. Esa parte no aparecerá nunca en los registros del servidor. De ahí dos consecuencias: no se puede enviar nada al servidor mediante un fragmento, y esconder allí algo secreto no tiene sentido, porque está a la vista en la barra de direcciones y se guarda en el historial."
  - question: ¿Es seguro analizar enlaces con tokens en este sitio?
    answer: "Esta página no hace ninguna petición de red: puede verlo en la pestaña «Red» de su navegador, y nada le impide comprobarnos. Pero lo esencial no está en nosotros. Un enlace con un token es peligroso de por sí: entra entero en los registros de cada servidor del camino, en el historial del navegador, en los marcadores y en la cabecera Referer al seguir otro enlace. Una URL es mal sitio para un token, sin importar dónde la analice."
related:
  - jwt-decoder
  - url-encode-decode
  - hash-generator
---

Pegue un enlace y se analiza al instante, sin pulsar nada. El análisis lo hace el propio navegador, con el mismo código con el que sigue los enlaces.

## Qué se muestra más allá de lo habitual

**Todos los parámetros repetidos.** Un análisis corriente de `?a=1&a=2` devuelve solo el primer valor. Aquí se ven ambos, en su orden original, con los repetidos marcados.

**Dos formas en lugar de una.** Junto a la forma codificada en porcentajes va una legible, pero solo donde descodificar es seguro. Los caracteres que llevan estructura se dejan tal cual.

**El host en punycode y tal como se escribió.** Lo primero es lo que llega al servidor; lo segundo es lo que usted reconoce.

**Usuario y contraseña en el enlace**, si los hay. Dicho claramente: esos enlaces se filtran a los marcadores, al historial y a los registros de otros.

## Por qué %2F no se descodifica

Es una barra codificada **dentro** de un segmento de la ruta. `/a%2Fb/c` son dos segmentos, no tres. Si se descodifica, en pantalla aparecería `/a/b/c` y la estructura del enlace quedaría mal representada. La dejamos como está y lo decimos en su propia línea.

Lo mismo con un ampersand dentro del valor de una consulta: descodificado, parecería un separador.

## Cómo se ha comprobado

Contra `python3 urllib.parse`, un programa distinto y un código distinto: nueve enlaces variados coincidieron en esquema, host, puerto, ruta y todos los pares de parámetros. La conversión inversa de punycode se comprobó con cinco ejemplos ajenos, entre ellos árabe y chino.

Fue justamente esa comparación la que encontró un fallo en nuestra propia capa: al principio descodificábamos `%2F` junto con todo lo demás y mostrábamos `/a/b/c` donde había dos segmentos.
