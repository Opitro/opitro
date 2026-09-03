---
toolSlug: remove-duplicate-lines
locale: es
category: text
tool: remove-duplicate-lines
title: "Eliminar líneas duplicadas online — quitar repetidos de una lista"
h1: Eliminar líneas repetidas
navName: Líneas repetidas
description: "Herramienta para eliminar líneas duplicadas online. Limpia listas, exportaciones y textos de elementos repetidos conservando solo los valores únicos."
faq:
  - question: ¿Por qué no se eliminan líneas que parecen idénticas?
    answer: "Casi siempre por un espacio invisible al principio o al final. «manzana» y «manzana » se ven iguales, pero para un programa son líneas distintas. Activa «ignorar espacios en los bordes» y se fundirán en una. La segunda causa habitual son las mayúsculas, que tienen su propio interruptor."
  - question: ¿Cambia el orden de la lista al limpiarla?
    answer: "No. Se queda la primera aparición de cada línea, el resto desaparece y la posición de las supervivientes no se toca. La lista limpia sigue pareciendo la misma lista. Si la quieres alfabética, ordénala en la página vecina: es otra acción."
  - question: ¿Qué línea sobrevive si solo se diferencian por mayúsculas?
    answer: "La que apareció primero, con sus mayúsculas y sus espacios. Los interruptores afectan solo a la comparación: pediste quitar repetidos, no reescribir la lista. Así que si primero iba «Manzana», lo que queda es «Manzana» y no «manzana»."
  - question: ¿Qué pasa con las líneas vacías?
    answer: "Por defecto cuentan como líneas normales, así que varias vacías se reducen a una. Si no las quieres en absoluto, activa «eliminar líneas vacías» y desaparecerán del todo, antes incluso de buscar duplicados."
  - question: ¿Cuántas líneas aguanta la página?
    answer: "Decenas de miles se procesan al instante: la comparación usa una tabla hash y no compara cada línea con todas las demás. Una lista de cien mil líneas irá con retraso perceptible, pero terminará igualmente, y todo ello sin enviar tus datos a ninguna parte."
  - question: ¿Se envía mi lista a algún sitio?
    answer: "No. La limpieza ocurre dentro de tu navegador, en tu dispositivo. La página no envía nada a ningún servidor, no guarda historial y no recuerda ni una línea al cerrar la pestaña."
related:
  - sort-lines
  - remove-extra-spaces
  - text-case-converter
---

Pega la lista en el campo —un elemento por línea— y pulsa «quitar duplicados». La fila bajo el campo muestra cuántas líneas había, cuántas únicas quedan y cuántos repetidos se han ido.

## Tres interruptores que lo deciden todo

- **Ignorar mayúsculas**: «Manzana» y «manzana» cuentan como lo mismo
- **Ignorar espacios en los bordes**: también «manzana» y «manzana »
- **Eliminar líneas vacías**: las vacías se van del todo en vez de reducirse a una

## Por qué a veces sobreviven líneas idénticas

Es la queja más frecuente con estas páginas y la causa casi siempre es la misma: un espacio invisible. Tras copiar de una hoja de cálculo o de un documento, la mitad de las líneas arrastra un espacio o un tabulador al final. El ojo no lo ve, pero para un programa «manzana» y «manzana » son líneas distintas.

Por eso «ignorar espacios en los bordes» viene activado de entrada. La segunda causa son las mayúsculas: «Madrid» y «madrid». Tiene su propio interruptor, también activado.

## El orden de la lista no cambia

Se queda la primera aparición de cada línea, el resto desaparece y todo lo demás mantiene su sitio. La lista limpia parece la misma lista, solo que más corta.

Es una decisión deliberada: la gente suele limpiar exportaciones donde el orden significa algo por sí mismo. Quien quiera orden alfabético va a la página de ordenación, que es otra acción.

## Qué sobrevive exactamente

La línea que apareció primero, con sus mayúsculas y sus espacios. Los interruptores afectan a la comparación, nunca al resultado: pediste quitar repetidos, no reescribir la lista.

## Todo se queda contigo

La lista no sale de tu dispositivo. Ni envíos ni registros: cierras la pestaña y no queda nada de ella.
