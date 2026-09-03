---
toolSlug: stylus-test
locale: es
category: device-tests
tool: stylus-test
title: "Prueba de lápiz óptico online — test de Apple Pencil y stylus"
h1: "Test de stylus — presión e inclinación"
navName: Test de stylus
description: "Prueba gráfica gratuita para lápices ópticos. Evalúa la sensibilidad a la presión, los ángulos de inclinación y la precisión del trazo de tu Apple Pencil o stylus online."
faq:
  - question: ¿Cómo compruebo la sensibilidad a la presión?
    answer: "Elige el marcador y traza una línea apretando cada vez más. El grosor de la línea sigue directamente a la presión, y a su lado suben una barra y un porcentaje. Si la línea sigue plana y el número no se mueve, la presión no llega al navegador. En Windows eso suele significar que Windows Ink está desactivado en la configuración de la tableta."
  - question: ¿Por qué la presión marca exactamente el 50 por ciento?
    answer: "Porque quien dibuja no es un lápiz. Con el dedo y el ratón el navegador informa siempre de 0,5: no es «media fuerza», es «aquí no hay presión real». La función de presión de esta página solo cuenta con lápiz y solo cuando el valor se aparta de esa mitad."
  - question: ¿Cómo compruebo la inclinación del lápiz?
    answer: "Cambia al lápiz e inclínalo: el trazo se vuelve más ancho y más pálido, como dibujado con el costado de la mina, mientras la flecha del indicador redondo se inclina hacia el mismo lado y muestra el ángulo. El Apple Pencil informa de la inclinación, y en las tabletas gráficas casi todos los lápices también, salvo los más sencillos."
  - question: ¿Qué significan los «puntos por segundo»?
    answer: "Son las muestras de posición del lápiz que llegaron a la página en un segundo. Contamos las muestras, no los eventos del navegador: los eventos llegan en un lote una vez por fotograma, así que contarlos daría exactamente 60 con cualquier lápiz. La cifra depende del lápiz, de la pantalla y del navegador, y de ella depende la suavidad del trazo. No es la frecuencia nominal del stylus y no vamos a hacerla pasar por tal."
  - question: ¿Para qué están el círculo, la espiral y la línea recta?
    answer: "Para tener con qué comparar. El temblor y la desviación en los bordes no se detectan en una hoja en blanco: el ojo no tiene dónde agarrarse. Repasa el círculo y la espiral: si el trazo sigue el dibujo con limpieza, el lápiz y la tableta están bien; si cerca de los bordes la línea se desvía o avanza a saltos, se nota enseguida."
  - question: El borrador y el botón lateral no se encienden, ¿está roto el lápiz?
    answer: "No necesariamente. Una función apagada significa «la página no ha visto esto», no «esto no existe». El borrador es el extremo opuesto del lápiz y no todos los modelos lo tienen; el botón lateral suele estar reasignado en el programa del fabricante. El giro sobre el eje no lo informa ni siquiera el Apple Pencil. Da un lápiz por roto cuando falla algo que sí tiene."
related:
  - touchscreen-test
  - multi-touch-test
  - mouse-test
---

Repasa las plantillas tenues con el lápiz. El marcador prueba la presión: el grosor de la línea sigue la fuerza con que aprietas. El lápiz prueba la inclinación: el trazo se apoya más ancho y más pálido, como con el costado de la mina. Los indicadores sobre la hoja viven con el lápiz, y las seis funciones de abajo se encienden cuando la página ve cada una con sus propios ojos.

## Qué se comprueba

- **Sensibilidad a la presión**: barra, porcentaje y grosor vivo del trazo
- **Ángulo de inclinación**: la flecha del indicador muestra hacia dónde y cuánto se inclina el lápiz
- **Puntos por segundo**: cuántas muestras del lápiz llegan a la página; de ahí sale la suavidad
- **Giro, botón lateral, borrador y proximidad**: cada uno como función aparte
- **Temblor y desviación en los bordes**: repasando el círculo, la espiral y la recta

## Sobre la presión y esa mitad

Si la presión marca justo el cincuenta por ciento, quien dibuja no es un lápiz. Con el dedo y el ratón el navegador informa siempre de 0,5, y eso significa «no hay presión real», no «he apretado a medias». Por eso aquí la función de presión solo cuenta con lápiz y solo cuando la cifra se aparta de esa mitad: de lo contrario la página te felicitaría por la presión cada vez que arrastras un dedo.

La segunda causa habitual de una línea plana en el ordenador es tener Windows Ink desactivado en la configuración de la tableta. Mientras esté apagado, la presión sencillamente no llega al navegador, y el lápiz no tiene la culpa.

## Sobre la frecuencia

«Puntos por segundo» es un recuento honesto de las muestras que llegaron a la página. El navegador las entrega en un lote una vez por fotograma, así que contar eventos no sirve: cualquier lápiz daría exactamente 60. Nosotros abrimos el lote y contamos lo que hay dentro.

Un 60 constante suele significar que las muestras no llegaron más rápido. Una buena tableta con un lápiz rápido da 120 o más, y la diferencia se ve: la línea deja de quebrarse en trazos rápidos.

## Lo que esta prueba no hace

No indica la frecuencia nominal del stylus ni sus niveles de presión: esas cifras no se le dan al navegador y no vamos a inventarlas. No distingue un lápiz original de una copia ni mide la latencia: la latencia la componen la pantalla, el sistema y el navegador, y achacársela al lápiz sería deshonesto.
