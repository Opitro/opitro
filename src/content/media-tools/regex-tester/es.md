---
toolSlug: regex-tester
locale: es
category: dev
tool: regex-tester
title: Probador de RegEx online — Probador y depurador de expresiones regulares
h1: Probador de expresiones regulares (RegEx)
navName: "Probador de expresiones regulares"
summary: "Probar la expresión con su propio texto"
description: "Herramienta profesional para probar y depurar expresiones regulares online. Valida tu sintaxis RegEx, encuentra coincidencias de texto y resalta grupos al instante de forma local."
faq:
  - question: ¿Qué son las expresiones regulares y para qué sirven?
    answer: "Son un lenguaje muy escueto para describir patrones de texto. En lugar de «una cadena con letras, luego una arroba, luego un punto y más letras» se escriben unos pocos caracteres, y el motor encuentra todos esos fragmentos en cualquier cantidad de texto. Con ellas se criban registros de servidor, se extraen números y fechas de volcados, se reemplaza por patrón en carpetas enteras y se valida lo que la gente escribe en un formulario. Su fuerza es la brevedad; su debilidad, la misma: veinte caracteres de patrón se leen peor que una página de código corriente, y por eso hay que probar el patrón sobre texto real y no mentalmente."
  - question: ¿Qué hacen las banderas g, i y m?
    answer: "La bandera g busca todas las coincidencias; sin ella la búsqueda se detiene en la primera. La bandera i elimina la diferencia entre mayúsculas y minúsculas. La bandera m mueve las anclas: ^ y $ pasan a significar el principio y el final de cada línea en vez de los de todo el texto. La g tiene una particularidad que se aprende tarde: una expresión con esa bandera recuerda dónde se detuvo, así que la misma expresión aplicada dos veces seguidas no empezará desde el principio la segunda vez. En el código esa es una causa habitual de «funciona una vez sí y otra no»."
  - question: ¿Por qué un patrón pesado no congela la página?
    answer: "Porque la búsqueda no se ejecuta donde vive la página. Una expresión como (a+)+$ contra una cadena de treinta letras «a» tarda años: no tiene ningún error, el motor sencillamente prueba todas las formas de dividir la cadena y son demasiadas. Ese cálculo no se puede detener desde el hilo que lo ejecuta —el habitual try/catch no ayuda, porque no se produce ninguna excepción—. Enviamos la búsqueda a un hilo aparte y esperamos un segundo y medio; si no llega respuesta, se mata el hilo y se le dice claramente que la expresión se ha quedado en bucle. Precisamente por eso conviene descubrir esas trampas aquí y no en su propio servidor."
  - question: ¿Qué muestran los grupos?
    answer: "Las partes del patrón entre paréntesis se capturan por separado y luego se pueden referenciar al reemplazar. Bajo cada coincidencia las listamos todas en orden, y por su nombre cuando el grupo está nombrado. Un grupo que no participó en la coincidencia se muestra con una raya: no es un error, sino el estado normal de una parte opcional."
  - question: ¿Por qué mi expresión encuentra vacío?
    answer: "Porque se lo ha pedido usted. Un patrón como a* o ^ coincide con la cadena vacía, lo que significa que coincide en cada posición del texto. Esas coincidencias las marcamos con una raya fina; de lo contrario parecería que no se ha encontrado nada cuando en realidad se ha encontrado demasiado. Por cierto, un bucle de búsqueda ingenuo se cuelga para siempre con un patrón así: una coincidencia vacía no adelanta el puntero. Nosotros lo adelantamos a mano."
  - question: ¿Las expresiones y los textos se envían a alguna parte?
    answer: "No. Todo se calcula dentro de la pestaña; la página no hace ninguna petición de red. Los registros de servidor y los volcados que no puede enseñar a terceros aquí no se le enseñan a nadie."
related:
  - markdown-html
  - text-diff
  - json-formatter
---

Escriba la expresión arriba y el texto abajo: las coincidencias se resaltan al instante. Una expresión pesada no congelará la página: la búsqueda corre en un hilo aparte que se puede cortar.

## Pruebe sobre texto real, no sobre texto cómodo

El error más común es probar un patrón con tres líneas pulcras y ponerlo en producción. Coja en su lugar un fragmento de verdad: con líneas en blanco, dobles espacios, un último registro truncado, caracteres poco habituales. Ahí es donde los patrones se rompen, no en los ejemplos de manual.

## La avidez explica la mayoría de las sorpresas

`+` y `*` agarran por defecto todo lo que pueden. El patrón `<.+>` sobre `<b>texto</b>` captura la cadena entera en lugar de una etiqueta, porque el punto también coincide con los signos de mayor y menor. El remedio es un signo de interrogación tras la repetición —`<.+?>`— o prohibir el exceso directamente: `<[^>]+>`. Lo segundo suele ser a la vez más rápido y más claro.

## Los paréntesis no son solo para agrupar

Los paréntesis no se limitan a agrupar: recuerdan lo que cayó dentro, y en textos grandes eso cuesta algo. Si un grupo existe solo para que una repetición se aplique a varios caracteres y su contenido no le hace falta, escriba `(?:…)`. Así el motor no guardará nada de más y la lista de grupos no tendrá entradas sobre las que después se pregunte para qué están.
