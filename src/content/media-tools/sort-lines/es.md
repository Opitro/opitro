---
toolSlug: sort-lines
locale: es
category: text
tool: sort-lines
title: "Ordenar líneas online — ordenar listas alfabéticamente"
h1: Ordenar líneas de texto
navName: Ordenar líneas
description: "Herramienta para ordenar líneas de texto online. Ordena listas alfabéticamente (A-Z, Z-A), por longitud de línea, de forma aleatoria o por valores numéricos."
faq:
  - question: ¿Por qué la «ñ» queda en su sitio y no al final de la lista?
    answer: "Porque las líneas se comparan según las reglas del idioma y no por su número en una tabla de caracteres. En la tabla la «ñ» está lejos de la «n», y una ordenación ingenua la desterraría al final. Comparar por reglas del idioma coloca las letras donde las coloca el diccionario."
  - question: ¿Por qué en orden alfabético el 10 va antes que el 2?
    answer: "Porque eso es el orden alfabético: las líneas se comparan signo a signo y el «1» va antes que el «2». Para listas numeradas está el botón «por números», que lee la cifra entera y pone el 2 delante del 10. Si tu lista lleva números de casa, versiones o puntos numerados, ese es el que necesitas."
  - question: ¿Qué pasa con las líneas sin números al ordenar por números?
    answer: "Bajan al final de la lista y allí conservan el orden alfabético. Descartarlas no es una opción: no las pegaste para nada. Así ves de inmediato dónde acaba la parte numerada y empieza el resto."
  - question: ¿Para qué sirve «ignorar mayúsculas»?
    answer: "Sin esa opción, todas las líneas que empiezan por mayúscula se amontonan arriba y las de minúscula quedan debajo: así funciona la comparación por defecto. Con ella activada, «Manzana» y «manzana» quedan juntas. Las líneas no cambian: el caso solo afecta a la comparación."
  - question: ¿En qué se diferencia «mezclar» de ordenar por un número aleatorio?
    answer: "Barajamos las líneas con el algoritmo de Fisher-Yates: todos los órdenes posibles salen con la misma probabilidad. El truco habitual de «ordenar por un número aleatorio» no tiene esa propiedad y arrastra parte de las líneas hacia el principio: el azar es solo aparente."
  - question: ¿Se envía mi lista a algún sitio?
    answer: "No. La ordenación ocurre dentro de tu navegador, en tu dispositivo. La página no envía nada a ningún servidor, no guarda historial y no recuerda ni una línea al cerrar la pestaña."
related:
  - remove-extra-spaces
  - text-case-converter
  - character-counter
---

Pega la lista en el campo —un elemento por línea— y elige un orden. El contador de debajo muestra cuántas líneas tiene la lista. Llévate el resultado con «copiar el resultado».

## Cinco órdenes

- **Alfabéticamente A-Z** y **Z-A**: la ordenación de siempre
- **Por números**: el 2 va antes que el 10, no después del 1
- **Por longitud**: de las líneas cortas a las largas
- **Mezclar**: un barajado realmente aleatorio

## Por qué aquí el alfabeto es de verdad

Una comparación ingenua de cadenas recorre códigos de caracteres, no el alfabeto. Con ella la «ñ» acaba al final, y una «z» minúscula adelanta a una «A» mayúscula.

Nosotros comparamos según las reglas del idioma de la página. Por eso la «ñ» se queda entre la «n» y la «o» y la lista se ve como se vería en un diccionario.

## Sobre los números

El orden alfabético pone el 10 antes que el 2, y no es un fallo: las líneas se comparan signo a signo y el uno va antes que el dos. Si la lista lleva números de casa, versiones o puntos numerados, usa «por números»: lee la cifra entera.

Las líneas sin número alguno bajan al final y allí siguen en orden alfabético. Así la frontera entre la parte numerada y el resto salta a la vista.

## Sobre el barajado

Las líneas se barajan con el algoritmo de Fisher-Yates: todos los órdenes posibles son igual de probables. El truco corriente de «ordenar por un número aleatorio» no cumple eso: empuja algunas líneas hacia el principio y la aleatoriedad es solo aparente.

## Todo se queda contigo

La lista no sale de tu dispositivo. Ni envíos ni registros: cierras la pestaña y no queda nada de ella.
