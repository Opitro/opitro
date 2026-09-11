---
toolSlug: code-diff
locale: es
category: dev
tool: code-diff
title: "Comparar código online — Diff Checker: encontrar diferencias entre dos archivos"
h1: "Diff Checker — comparación de código online"
navName: "Comparador de código"
summary: "Dos archivos comparados: líneas y parche"
description: "Compara dos fragmentos de código online: números de línea, tramos idénticos plegados, copia como parche. Señala las causas invisibles: CRLF, tabuladores, espacios al final. El código no sale del navegador."
faq:
  - question: ¿Por qué el código parece idéntico y la comparación marca diferencias?
    answer: "Casi siempre por un carácter que no se ve: un tabulador donde el otro lado tiene espacios, un espacio al final de la línea, un espacio duro venido de un editor o una marca de orden de bytes al principio del archivo. Esta página nombra la causa sin rodeos, en el recuadro sobre el resultado, y los interruptores de al lado permiten no tenerla en cuenta. Los finales de línea merecen mención aparte: el campo de entrada del navegador iguala por su cuenta la forma de Windows a la de Unix, así que aquí no producen diferencias. Los seguimos señalando, pero como una propiedad de sus archivos y no como la causa de lo que está viendo: en git y en su editor ese archivo aparece cambiado por completo."
  - question: ¿Qué es un espacio duro y cómo acaba dentro del código?
    answer: "Es el carácter U+00A0. Parece un espacio corriente, pero es otro carácter, y ni la comparación ni el propio lenguaje de programación lo tratan como espacio. Llega casi siempre igual: el código se copió de una página web, de un documento o de un mensajero, donde el espacio normal se había convertido en duro durante la maquetación. Nosotros los contamos y mostramos cuántos hay."
  - question: ¿En qué se diferencia esta página de la comparación de textos?
    answer: "En para qué sirve. Aquí hay números de línea, tramos idénticos plegados y copia como parche: lo que hace falta al trabajar con archivos de código. Aquí no hay comparación por palabras ni por letras, ni interruptor de «ignorar mayúsculas»: en código Value y value son cosas distintas, y ese interruptor solo haría daño. Todo eso está, en cambio, en la página de comparación de textos, donde se cotejan contratos y artículos."
  - question: ¿Qué parche copia el botón y qué hago con él?
    answer: "Un unified diff corriente, la misma forma que produce git diff y que entienden los comandos patch y git apply. Las líneas con un menos se han quitado, las de un más se han añadido, las que empiezan por espacio son contexto. Las cabeceras del tipo @@ -12,7 +12,8 @@ dicen en qué línea empieza cada tramo y cuántas líneas abarca. Ese parche se puede adjuntar a un correo, pegar en una incidencia o aplicar con el comando patch."
  - question: ¿Para qué plegar los tramos idénticos?
    answer: "Por lo mismo que lo hace git: en un archivo de mil líneas con un solo cambio no hay por qué recorrer novecientas noventa y nueve líneas iguales. Se dejan tres líneas alrededor de cada cambio —bastan para situarse— y los huecos se pliegan en un único botón con el número de líneas ocultas. Al pulsarlo el hueco se despliega y se queda desplegado."
  - question: ¿Mi código va a algún servidor?
    answer: "No. Comparar es aritmética sobre cadenas; no necesita ni servidor ni red. La página no hace ninguna petición de red: un fuente ajeno, un repositorio privado o un archivo de configuración con claves se procesan en la memoria de la pestaña y no quedan en ninguna parte al cerrarla."
related:
  - text-diff
  - minify-js
  - json-formatter
---

Pegue dos fragmentos de código y las diferencias aparecen al instante, sin pulsar nada.

## Primero, las causas invisibles

Sobre el resultado hay un recuadro con los hallazgos. Responde a la pregunta que surge primero: «si las líneas son iguales, ¿por qué salen distintas?» Buscamos sangría con tabulador frente a espacios, espacios al final de línea, marca de orden de bytes al principio del archivo y espacios duros. Aparte, a partir del texto pegado, los finales de línea distintos: aquí no producen diferencias porque el campo de entrada los iguala, pero conviene saberlo. Si no aparece nada, también lo dice.

## Números de línea y tramos plegados

Los números van en dos columnas: antes a la izquierda, después a la derecha. Una línea quitada tiene número solo a la izquierda; una añadida, solo a la derecha, igual que en un diff corriente. Los tramos idénticos de más de siete líneas se pliegan, dejando tres líneas alrededor de cada cambio.

## Copiar como parche

El botón entrega un unified diff corriente, el mismo que produce `git diff`. Comprobado y no supuesto: cuarenta parches aleatorios se pasaron por el propio comando `patch` del sistema, y los cuarenta produjeron exactamente el archivo esperado.

## Lo que aquí falta a propósito

La comparación por palabras y por letras, y los interruptores de «ignorar mayúsculas» y «ignorar puntuación». En código las mayúsculas siempre importan, y una palabra en medio de una línea no sirve de nada sin el número de línea. Todo eso está en la [página de comparación de textos](/es/text-diff): aquella es para contratos y artículos, esta para archivos de código.

## Cómo se ha comprobado

La búsqueda de diferencias es el algoritmo de Myers, el mismo que usa la comparación de textos. Se contrastó con un método lento pero indudablemente correcto sobre cinco mil pares aleatorios: la cadena de cambios sale mínima y convierte de verdad el primer texto en el segundo. La salida en forma de parche se comprobó con el comando `patch` del sistema.
