---
toolSlug: css-gradient
locale: es
category: dev
tool: css-gradient
title: Generador de degradados CSS online — Crear linear y radial gradient para web
h1: Generador de degradados CSS
navName: "Generador de degradados CSS"
summary: "Componga el degradado y llévese el CSS"
description: "Herramienta profesional para crear degradados CSS online. Ajusta puntos de color, ángulos de inclinación y opacidad para obtener códigos CSS limpios y listos para producción."
faq:
  - question: ¿En qué se diferencian el degradado lineal y el radial?
    answer: "El lineal lleva los colores a lo largo de una recta, y la dirección la fija un ángulo: 0° va de abajo arriba, 90° de izquierda a derecha, 180° de arriba abajo. Sirve para fondos, cabeceras y botones, allí donde se busca una transición uniforme. El radial se expande en círculos desde un centro y hace otra cosa: resplandor, volumen, un viñeteado suave. La regla es sencilla: si la transición debe ser un fondo que no se note, lineal; si es un objeto en sí misma —una mancha de luz, un brillo—, radial."
  - question: ¿Para qué poner un color sólido de reserva en el código?
    answer: "Para cuando el degradado no llegue a dibujarse. No hablamos solo de navegadores antiquísimos: los clientes de correo recortan estilos complejos, el modo lectura simplifica la presentación, algunos proxies comprimen el código. Si el fondo no se dibuja y el texto encima es blanco, la página deja de leerse. La línea background-color asegura contra eso. Y qué color se pone ahí importa: tomamos el del centro de la transición y le quitamos la transparencia. Muchos generadores ponen el primer color de la fila, pero si ese es transparente el fondo de reserva se queda en nada, es decir, el seguro falla justo cuando hace falta."
  - question: ¿Por qué el ángulo de CSS no coincide con el de mi editor?
    answer: "Porque se miden de otra manera. En CSS el ángulo se cuenta desde «arriba» en sentido horario: 0° va de abajo arriba y 90° de izquierda a derecha. En los editores gráficos el cero suele apuntar a la derecha y el ángulo crece en sentido antihorario. Por eso un degradado traído tal cual de una maqueta suele salir girado: hay que recalcular el ángulo o, más sencillo, ajustarlo a ojo aquí y llevarse la línea ya hecha."
  - question: ¿De dónde sale el halo gris en un degradado?
    answer: "De mezclar mal la transparencia. Cuando la transición va de un color a transparente y el navegador o el editor mezcla a lo bruto, hacia el extremo transparente se cuela el negro y aparece una franja gris sucia. Lo correcto es el alfa premultiplicado, que es lo que hacen los navegadores actuales. Nosotros lo calculamos igual, y por eso el color de reserva y la vista previa coinciden con lo que verá en su propia página. Si de verdad quiere ese halo para comparar, ponga el punto transparente del mismo color que el vecino, y no blanco o negro."
  - question: ¿Cuántos puntos puedo poner?
    answer: "Los que quiera, pero un degradado necesita al menos dos: el último no se puede quitar. Al pulsar en una zona libre de la barra se añade un punto, y toma el color que ya había en ese lugar: añadirlo no cambia la imagen, y a partir de ahí se puede mover. Los puntos se arrastran con el ratón; si arrastra uno por encima de otro, el orden del código se rehace solo."
  - question: ¿Se envía algún dato a alguna parte?
    answer: "No. Todo el trabajo consiste en armar una cadena y dejar que el navegador la muestre, y ocurre dentro de la pestaña. La página no hace ninguna petición de red."
related:
  - color-converter
  - color-palette
  - contrast-checker
---

Arrastre los puntos por la barra y cambie color y opacidad: el código de abajo se actualiza al instante. Pulsando en una zona libre de la barra se añade un punto.

## Dos líneas en vez de una

El código sale en dos líneas: primero el color sólido y después el degradado. Así hay que pegarlo, porque el orden importa. Un navegador que entiende degradados aplicará ambas y mostrará la de arriba sobre la de abajo. Un navegador o un cliente de correo que no lo entienda se saltará la línea que no sabe interpretar y se quedará con el fondo sólido. Una línea en lugar de dos funciona justo hasta el primer correo abierto en un cliente antiguo.

## La opacidad de un punto no es la del bloque

Se confunden con facilidad. La propiedad `opacity` vuelve translúcido el bloque entero, con su texto y su borde. La opacidad de un punto concreto solo afecta al color en ese lugar del degradado: las letras encima siguen sólidas. Si quiere que el fondo se desvanezca hacia el borde mientras el pie de foto sigue legible, eso se hace con un punto de opacidad cero, no con la opacidad del bloque.

## No se pase con el número de puntos

Cinco o seis puntos en un degradado casi siempre significan que la transición se ha vuelto rayada: el ojo capta las junturas allí donde la velocidad de cambio del color da un salto. Dos o tres dan una transición tranquila que no pelea con el contenido. La excepción son los cortes deliberados: si pone dos puntos exactamente en el mismo lugar, no obtiene una transición sino un borde limpio, y eso es un recurso legítimo para franjas y separadores.
