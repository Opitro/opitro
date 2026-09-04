---
toolSlug: list-generator
locale: es
category: text
tool: list-generator
title: Generador de listas online — secuencias numéricas y alfabéticas
h1: Generador de listas
navName: Generador de listas
description: "Generador gratuito de listas. Series numéricas con cualquier paso, secuencias de letras en cuatro alfabetos, prefijo, sufijo y numeración, también para tu propia lista."
faq:
  - question: ¿Para qué sirve un generador de listas?
    answer: "Quita el trabajo mecánico de teclear secuencias. Un programador obtiene datos de prueba, un almacenero la numeración de ubicaciones y lotes, un organizador los números de entradas, un maquetador elementos de lista ya montados con sus etiquetas. Todo eso antes se escribía a mano o se armaba con fórmulas en una hoja de cálculo."
  - question: ¿Cómo funciona el paso?
    answer: "El paso es la distancia entre números vecinos. Por defecto es uno: 1, 2, 3. Para los pares, empieza en 2 con paso 2. Para una cuenta atrás, empieza en cien, termina en cero y pon el paso en menos diez. El paso decimal también funciona: de 0 a 0,3 con paso 0,1 da exactamente cuatro líneas."
  - question: ¿Por qué no se admite un paso de cero?
    answer: "Porque esa serie no terminaría nunca: el número ni crece ni decrece mientras se siguen añadiendo líneas hasta que la pestaña se cuelga. Lo detectamos antes de empezar y decimos qué pasa."
  - question: ¿Y si el paso va en sentido contrario?
    answer: "Lo decimos en lugar de devolver una lista vacía. Una serie «de 1 a 100 con paso menos uno» nunca llega al final. Esa combinación casi siempre es una errata en el signo, y devolver nada en silencio te dejaría adivinando."
  - question: ¿De verdad fallan los pasos decimales en otras herramientas?
    answer: "En la mayoría, sí, y la culpa no es del programa sino de la aritmética binaria. En ella 0,3 dividido entre 0,1 da 2,9999999999999996 y la última línea de la serie desaparece. Y sumar 0,1 tres veces da 0,30000000000000004 en vez de 0,3. Nosotros multiplicamos por una potencia de diez y contamos con enteros."
  - question: ¿Qué alfabetos admite la serie de letras?
    answer: "Cuatro: el latino, el español con Ñ, el ruso con Ё y el ucraniano con Ґ, Є, І, Ї. El alfabeto se elige según el idioma de la página y se puede cambiar a mano. Las mayúsculas se eligen aparte."
  - question: ¿Por qué aparecen letras que los documentos no usan?
    answer: "Porque damos el alfabeto entero. Las normas de estilo para listas con letras saltan las que se confunden con cifras o entre sí. Pero la regla no es universal, y si quitáramos letras en silencio te quedarías preguntando por qué falta una. Borrar una línea es más fácil que adivinar."
  - question: ¿Puedo formatear mi propia lista en vez de generar una?
    answer: "Sí, ese es el tercer modo. Pega una columna de una hoja de cálculo y el prefijo, el sufijo y la numeración se aplican a tus líneas. Una lista escueta se convierte en elementos HTML listos, líneas de código o una lista numerada. Las líneas en blanco siguen en blanco y no reciben número."
related:
  - sort-lines
  - remove-duplicate-lines
  - case-converter
---

Elige qué generar, ajusta las opciones y la lista aparece al instante.

## Tres modos

- **Serie numérica** — desde y hasta con cualquier paso, decimal y negativo incluidos
- **Serie de letras** — latino, español con Ñ, ruso, ucraniano
- **Mi lista** — prefijo, sufijo y numeración aplicados a tus líneas

## Lo que se detecta antes de empezar

**Un paso de cero** — esa serie no termina nunca y la pestaña se cuelga.

**Un paso al revés** — «de 1 a 100 con paso menos uno» nunca llega al final. Suele ser una errata en el signo, así que lo decimos.

## El paso decimal se cuenta con enteros

En aritmética binaria 0,3 dividido entre 0,1 da 2,9999999999999996 y la última línea desaparece. Sumar 0,1 tres veces da 0,30000000000000004.

Multiplicamos por una potencia de diez y contamos con enteros: la serie de 0 a 0,3 con paso 0,1 sale limpia, cuatro líneas.

## Sobre las listas con letras en documentos

Las normas de estilo saltan las letras que se confunden con cifras. Damos el alfabeto entero: borrar una línea es más fácil que preguntarse por qué falta una letra.
