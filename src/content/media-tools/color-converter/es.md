---
toolSlug: color-converter
locale: es
category: dev
tool: color-converter
title: Conversor de colores HEX ↔ RGB ↔ HSL online — Códigos de color CSS
h1: Conversor de colores HEX, RGB y HSL
navName: "Conversor de colores"
summary: "HEX ↔ RGB ↔ HSL, en ambos sentidos"
description: "Herramienta profesional para convertir colores entre formatos HEX, RGB, RGBA, HSL y HSLA online. Calcula códigos de color para desarrollo web y CSS de forma 100% local."
faq:
  - question: ¿Qué diferencia hay entre los espacios de color RGB, HEX y HSL?
    answer: "RGB describe el color con tres cantidades de luz —roja, verde y azul, cada una de 0 a 255—; así funciona cualquier pantalla. HEX es exactamente el mismo modelo escrito en hexadecimal: #00ff00 y rgb(0, 255, 0) son el mismo color, solo cambia la notación. HSL está construido de otra manera, mucho más cercana a cómo piensa una persona en el color: tono en grados sobre un círculo de 0 a 360, saturación en porcentaje y luminosidad en porcentaje. De ahí su utilidad: para oscurecer un color en HSL basta con bajar un número, mientras que en RGB habría que recalcular los tres."
  - question: ¿Cómo se codifica la transparencia en HEX y en RGBA?
    answer: "En rgba() es el cuarto número, una fracción de 0 (totalmente transparente) a 1 (color sólido): rgba(0, 255, 0, 0.5). En HEX se añaden dos caracteres al final: #00ff0080. El 80 hexadecimal es 128, justo la mitad de 255, y por eso ese código significa un verde a media transparencia. Todos los navegadores actuales entienden la forma de ocho caracteres; si necesita cubrir los muy antiguos, use rgba()."
  - question: ¿Por qué a veces el color cambia en una unidad al pasar por HSL y volver?
    answer: "Porque en hsl() se escriben grados y porcentajes enteros, y hay más colores que combinaciones de ese tipo. El plata #c0c0c0 tiene una luminosidad del 75,29 % y el naranja #ffa500 un tono de 38,8°: ninguno cabe en números enteros. Hemos medido cuánto se nota: la diferencia nunca supera 5 escalones de 255, y aproximadamente uno de cada diez colores vuelve exacto. Dentro de la página el color no se desvía por esto: siempre calculamos a partir del RGB y no lo hacemos dar vueltas. Pero si necesita ese tono exacto, llévese el HEX o el RGB, no el HSL."
  - question: ¿Por qué el tono de un gris siempre es cero?
    answer: "El gris no tiene tono en absoluto. Cuando la saturación es cero, el grado deja de significar nada: hsl(0, 0%, 50%), hsl(120, 0%, 50%) y hsl(300, 0%, 50%) son el mismo gris. Mostramos cero en lugar de inventarnos un número bonito: el negro, el blanco y todos los grises sencillamente no tienen tono."
  - question: ¿Qué notaciones de color puedo pegar en el campo?
    answer: "Todas las habituales. Además de #1a2b3c admite los cortos #abc y #abcd, el de ocho caracteres #1a2b3cff, rgb(26, 43, 60), rgba(26, 43, 60, 0.5), porcentajes como rgb(100%, 0%, 0%), hsl(210, 40%, 17%), la notación moderna con barra hsl(210deg 40% 17% / 0.5) e incluso tres números sueltos separados por comas. Eso importa cuando uno copia un color del código de otra persona tal cual está."
  - question: ¿Los colores se envían a alguna parte?
    answer: "No. Toda la conversión es aritmética, ocurre dentro de la propia pestaña y la página no hace ninguna petición de red. Los colores corporativos y las paletas que no puede enseñar a terceros aquí no se le enseñan a nadie: cierre la pestaña y no queda nada."
related:
  - favicon-generator
  - qr-code
  - base64-file
---

Cambie cualquier campo y el resto se recalcula al instante. Los deslizadores están pintados con el propio color, así que se ve adónde lleva un movimiento antes de hacerlo.

## Cuándo conviene HSL y cuándo HEX

El HSL brilla mientras se está eligiendo el color. ¿Necesita una variante más oscura para el paso del ratón? Baje la luminosidad un diez por ciento y lo demás se queda igual. ¿Necesita un tono vecino para un segundo botón? Mueva el tono unos grados. Hacer lo mismo en RGB obliga a adivinar los tres números a la vez. Para llevar un color ya decidido al código, en cambio, es mejor el HEX: es más corto, exacto hasta el último escalón y ajeno a cualquier redondeo.

## Transparencia: dos caminos, los dos válidos

`rgba(0, 255, 0, 0.5)` y `#00ff0080` son el mismo verde a media transparencia. El primero se lee de un vistazo; el segundo es más corto y encaja bien en una variable. Elija según lo que vaya a editar después: la fracción de rgba() es más cómoda de ajustar a mano, y el HEX de ocho caracteres queda más limpio cuando el color vive en una sola línea de un tema.

## El fondo a cuadros no es adorno

Detrás del color hay una cuadrícula fina, y se gana su sitio. Un color semitransparente sobre fondo oscuro parece sencillamente un color más oscuro: a ojo no se distingue «transparente al 50 %» de «oscuro pero sólido». La cuadrícula asoma a través de la transparencia y muestra de inmediato cuánta hay en realidad.
