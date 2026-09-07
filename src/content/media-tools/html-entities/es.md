---
toolSlug: html-entities
locale: es
category: dev
tool: html-entities
title: Codificador de entidades HTML online — Convertir caracteres especiales a HTML entities
h1: Codificador y decodificador de entidades HTML
navName: Codificador de entidades HTML
description: "Herramienta profesional para codificar y decodificar caracteres especiales en entidades HTML de forma segura. Convierte símbolos web al instante y 100% local."
faq:
  - question: ¿Para qué convertir caracteres especiales en entidades?
    answer: "Porque el navegador no ve letras en el signo «menor que», en el «mayor que» ni en el ampersand: ve marcado. Si muestra un ejemplo de código tal cual, el navegador intentará ejecutarlo: la maquetación se rompe y, en el peor caso, un script ajeno contenido en su propio texto se ejecuta en su página. Sustituir esos caracteres por entidades le dice al navegador: esto son solo letras, muéstralas."
  - question: ¿Por qué hay que sustituir el ampersand primero?
    answer: "Es la trampa principal del escapado hecho a mano. Si convierte primero el «menor que» en entidad y después va a por los ampersands, el ampersand que acaba de escribir dentro de esa misma entidad también será sustituido. Sale un escapado doble y el lector ve la entidad escrita en letras en lugar del carácter. Nosotros recorremos la cadena en una sola pasada, sustituyendo cada carácter exactamente una vez: así estropear el propio trabajo es imposible por principio."
  - question: ¿Por qué el apóstrofo se codifica como número y no como &apos;?
    answer: "Porque esa entidad no existía en HTML 4: llegó con XML y más tarde con HTML5. Los navegadores antiguos y parte de los programas de correo la mostraban literalmente en lugar del apóstrofo. La forma numérica &#39; se entiende siempre y en todas partes, así que usamos esa. Es un caso en el que la forma más corta es peor que la más antigua."
  - question: ¿Hace falta codificar las letras acentuadas o cirílicas?
    answer: "Normalmente no. Las páginas llevan mucho tiempo en UTF-8 y cualquier alfabeto vive en ellas sin codificación; convertirlo en entidades infla el texto cuatro veces sin ningún beneficio. La casilla de no ASCII se conserva para los dos casos en que aún hace falta: correo que viaja por sistemas antiguos y pegado de texto en campos cuya codificación no está declarada ni se puede controlar."
  - question: ¿Escapar protege por sí solo contra XSS?
    answer: "Por sí solo no, y conviene entenderlo. Funciona de forma fiable allí donde el texto va al contenido de la página, entre etiquetas. Dentro del valor de un atributo hacen falta además las comillas, o el valor puede cortarse. Dentro de la etiqueta script las reglas son completamente distintas: allí las entidades no se expanden. Y en la dirección de un enlace escapar no ayuda en absoluto: javascript: sigue funcionando aunque esté escapado."
  - question: ¿Mi código va a algún servidor?
    answer: "No. Codificar es una simple sustitución de caracteres: no necesita servidor ni red, y la página no hace ninguna petición. La descodificación la hacemos con un textarea y no con el innerHTML de un nodo corriente: en ese segundo caso el marcado se analiza de verdad, se crean nodos a partir de la cadena y una imagen con onerror ya empieza a cargarse. Dentro de un textarea el contenido se lee como texto plano."
related:
  - escape-unescape
  - url-encode-decode
  - minify-html
---

Escriba o pegue texto y la conversión ocurre al instante, sin pulsar nada. El botón de las flechas en la ventana de resultado los intercambia: el resultado pasa a ser el original y el modo se invierte. Así se comprueba que lo codificado se descodifica de vuelta exactamente en lo mismo.

## Cinco caracteres, no todos

Solo cinco llevan marcado: el ampersand, el «menor que», el «mayor que», la comilla doble y el apóstrofo. Escapar esos basta. Escaparlo todo no hace daño, pero infla el texto cuatro veces y no mejora nada.

## El orden de las sustituciones

El ampersand va primero: de lo contrario corrompe todas las entidades escritas antes que él. Recorremos la cadena en una sola pasada y sustituimos cada carácter exactamente una vez: así el escapado doble no puede ocurrir por principio, y no «casi nunca».

## Con qué descodificar

El truco habitual es meter la cadena en el `innerHTML` de un nodo corriente y leer `textContent`. No debe hacerse: el marcado se analiza de verdad, se crean nodos a partir de la cadena y una imagen con `onerror` ya empieza a cargarse, aunque el nodo no se inserte en ninguna parte.

Nosotros metemos la cadena en un `<textarea>`. Dentro de él el contenido se lee como texto plano: las etiquetas nunca se convierten en nodos, mientras que las entidades sí se expanden, todas las que el navegador conoce, incluidas las raras.

## Cómo se ha comprobado

Contra `python3`: sus `html.escape` y `html.unescape` los escribieron otras personas y llevan la tabla completa de entidades de HTML5. Aparte se verificó aquello para lo que existe la página: no se produce escapado doble, y lo codificado se descodifica de vuelta al original carácter por carácter, en textos con cirílico, emoji y marcado dentro.
