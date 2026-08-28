---
toolSlug: mouse-test
locale: es
category: device-tests
tool: mouse-test
title: Test de ratón online — comprobar botones, rueda y doble clic
h1: Test de ratón
navName: Test de ratón
description: "Comprueba todos los botones del ratón, la rueda y el doble clic en un minuto. Detecta el doble clic involuntario, la avería clásica de un botón gastado. En el navegador."
faq:
  - question: El ratón hace doble clic solo, ¿qué es eso?
    answer: "El microinterruptor gastado bajo el botón se dispara dos veces en una sola pulsación. Distinguirlo de tu propio doble clic es fácil por el tiempo: una persona tarda de 100 a 500 milisegundos, mientras que el rebote cabe en cuarenta o menos. La página cuenta esos casos aparte, en la línea «dobles involuntarios»."
  - question: ¿Por qué el botón derecho no abre el menú sobre el dibujo?
    answer: "Durante la prueba nos quedamos con el botón derecho: si no, el menú taparía el dibujo en cada pulsación. Lo mismo con el central, que normalmente activa el desplazamiento. Fuera del dibujo ambos funcionan como siempre."
  - question: Los botones laterales no se encienden, ¿están rotos?
    answer: Lo más probable es que no existan. «Atrás» y «adelante» no están en todos los ratones, y en algunos solo funcionan con el programa del fabricante. Si el botón existe físicamente y no responde, comprueba si lo han reasignado en ese programa.
  - question: ¿Sirve para el panel táctil de un portátil?
    answer: "Sí. El panel táctil envía los mismos eventos que un ratón: pulsar es el botón izquierdo, pulsar con dos dedos el derecho, y el desplazamiento con dos dedos cuenta como rueda. Los paneles táctiles no suelen tener botón central."
  - question: ¿Qué hago si el botón se ha gastado?
    answer: "El microinterruptor se cambia por separado y cuesta céntimos: mucho más barato que un ratón nuevo y media hora de trabajo con soldador. A veces la causa es más simple: polvo bajo el botón que impide el contacto, y basta con soplarlo. Los ratones para juego suelen traer interruptores de repuesto."
  - question: ¿Se puede medir así la precisión o la frecuencia de sondeo?
    answer: No, y no vamos a prometerlo. El navegador ve los eventos del ratón ya procesados por el sistema, así que medir la frecuencia real o la resolución del sensor desde una página es imposible. Aquí se comprueban botones, rueda y doble clic, que es lo que de verdad se estropea.
related:
  - keyboard-test
  - dead-pixel-test
  - key-chatter
---

Pulsa los botones y gira la rueda sobre el dibujo del ratón. El botón pulsado se enciende, el ya comprobado queda marcado: así ves qué llevas y qué falta.

## Qué se comprueba

- **Cinco botones** — izquierdo, derecho, central (pulsar la rueda), atrás y adelante
- **La rueda** — en ambos sentidos, arriba y abajo se cuentan por separado
- **Doble clic** — mostramos el intervalo entre pulsaciones en milisegundos
- **Dobles involuntarios** — la avería clásica de un botón gastado

## Sobre el doble clic involuntario

Es la queja más habitual: pulsas una vez y se registran dos. La culpa es del microinterruptor bajo el botón, que se desgasta y empieza a rebotar. El tiempo los distingue: un doble clic humano lleva de 100 a 500 milisegundos, y el rebote cabe en cuarenta o menos. Pulsar tan rápido es físicamente imposible, por eso esos casos se cuentan aparte.

Se cura cambiando el interruptor: la pieza cuesta céntimos y el trabajo es media hora. A veces basta con soplar el polvo del botón.

## Lo que conviene saber

Sobre el dibujo, los botones derecho y central se comportan distinto a propósito: el menú y el desplazamiento quedan desactivados durante la prueba, o taparían el dibujo. Fuera del dibujo todo funciona como siempre. Al lado tienes el [test de teclado](/es/keyboard-test) y el [test de píxeles muertos](/es/dead-pixel-test).
