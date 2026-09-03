---
toolSlug: text-diff
locale: es
category: text
tool: text-diff
title: Comparar dos textos online — buscar diferencias y cambios (diff)
h1: Comparación de dos textos
navName: Comparar textos
description: "Comparación gratuita de dos textos online. Encuentra líneas o palabras modificadas, eliminadas y añadidas, en dos columnas o en un solo flujo. Los textos no salen del navegador."
faq:
  - question: ¿Cómo funciona la comparación de dos textos?
    answer: "La herramienta busca la cadena de cambios más corta que convierte el primer texto en el segundo: qué se quitó, qué se añadió y qué se mantuvo. El método se llama algoritmo de Myers y trabaja en un tiempo proporcional al número de cambios, no a la longitud de los textos. Por eso dos documentos casi idénticos se comparan al instante aunque tengan miles de líneas."
  - question: ¿Qué diferencia hay entre comparar por líneas y por palabras?
    answer: "Por líneas se mira el código, las listas y la configuración: se ve qué línea se sustituyó entera, igual que en un historial de versiones. Por palabras se miran artículos, libros y contratos: se ve el cambio concreto dentro de un párrafo largo. Si en una frase se cambió una palabra, la comparación por líneas dirá «esta línea cambió» y la comparación por palabras te enseñará la palabra."
  - question: ¿Por qué marca diferencias que yo no veo?
    answer: "Casi siempre por algo invisible: un espacio sobrante al final de la línea, una tabulación en lugar de espacios, una mayúscula distinta. Para eso están los dos interruptores de arriba: ignorar mayúsculas y minúsculas e ignorar espacios de más. El segundo viene activado, porque los espacios al final de línea son la causa más frecuente de diferencias falsas."
  - question: ¿Es seguro pegar aquí un contrato o código ajeno?
    answer: "Sí. Toda la comparación ocurre dentro de tu navegador: los textos no se envían a ningún servidor, no se registran y no se guardan. Al cerrar la pestaña no queda nada. Eso importa justo con contratos, correspondencia privada y código de trabajo: no se pueden entregar a una web desconocida."
  - question: ¿Qué significan los colores?
    answer: "El fondo rojizo marca lo que estaba en el primer texto y ha desaparecido del segundo. El verdoso marca lo que no estaba y ha aparecido. Lo que coincide no se resalta. El resaltado va en el fondo y las letras siguen blancas: las letras de color sobre fondo oscuro se leen peor y cansan en un texto largo."
  - question: ¿Qué indica el porcentaje de coincidencia?
    answer: "La proporción de fragmentos que quedaron intactos: líneas si comparas por líneas, palabras si comparas por palabras. Cien por cien significa que los textos son iguales. Es una medida aproximada de parecido, no una puntuación de plagio: para buscar texto copiado hace falta otro tipo de herramienta."
  - question: ¿Hay un límite de tamaño?
    answer: "No hay un límite duro, pero sí sentido común: dos libros casi idénticos se comparan deprisa, mientras que dos textos completamente distintos de varios miles de líneas harán pensar a la pestaña. Todas las herramientas de comparación funcionan así: el esfuerzo depende del número de diferencias, no del volumen."
related:
  - remove-duplicate-lines
  - sort-lines
  - text-case-converter
---

Pega los dos textos: las diferencias aparecen al instante, sin pulsar nada.

## Dos formas de comparar

- **Por líneas** — para código, listas y configuración: se ve qué línea se sustituyó entera
- **Por palabras** — para artículos y contratos: se ve el cambio concreto dentro de un párrafo

## Dos formas de mostrarlo

- **En dos columnas** — antes a la izquierda, después a la derecha, una frente a otra
- **En un solo flujo** — lo quitado va justo antes de lo añadido, como en un historial

## Por qué no hay botón

El algoritmo de Myers encuentra la cadena de cambios más corta en un tiempo proporcional al número de cambios. Cuatro mil líneas con tres modificaciones se despachan en menos de un milisegundo: no hay nada que esperar, y un botón de «buscar diferencias» sería un gesto de más.

## Diferencias falsas

Un espacio sobrante al final de la línea, una tabulación en vez de espacios, una mayúscula distinta: son los motivos habituales de que una comparación marque diferencias donde una persona no ve ninguna. Los dos interruptores de arriba las quitan.

## Tus textos se quedan contigo

Un contrato, una conversación privada o código de trabajo se comparan en tu propio navegador. No se envía nada a ningún servidor, no se guarda nada y no queda nada al cerrar la pestaña.
