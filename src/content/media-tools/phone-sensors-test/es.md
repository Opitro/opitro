---
toolSlug: phone-sensors-test
locale: es
category: device-tests
tool: phone-sensors-test
title: "Prueba de sensores de móvil online — test de giroscopio y acelerómetro"
h1: Test de sensores de smartphone online
navName: Test de sensores
description: "Herramienta para probar los sensores del móvil. Prueba el acelerómetro, el giroscopio, el sensor de luz ambiental y la brújula en tiempo real desde el navegador."
faq:
  - question: ¿Por qué hay que pulsar primero un botón de acceso?
    answer: "El navegador no entrega los sensores de movimiento a una página sin tu consentimiento. En el iPhone es una regla explícita: hasta que pulsas un botón tú mismo, la página no recibe ningún dato de inclinación ni de aceleración. Es una protección contra el rastreo: el movimiento de un móvil dice mucho de su dueño. Una pulsación, un aviso del sistema y los indicadores cobran vida."
  - question: ¿Cómo sé si el acelerómetro está sano?
    answer: "Deja el móvil plano sobre una mesa, con la pantalla hacia arriba. El eje Z debe marcar unos 9,8 metros por segundo al cuadrado: es la gravedad terrestre y es la mejor comprobación posible. X e Y deben quedar cerca de cero. Si las cifras son muy distintas, o saltan con el móvil quieto, el sensor miente."
  - question: El punto de inclinación no está centrado aunque el móvil está plano. ¿Está roto?
    answer: "Normalmente no. Casi siempre es la calibración del giroscopio, y la arregla el propio móvil: déjalo en una superficie plana y abre la brújula o los mapas; algunos modelos piden dibujar un ocho en el aire. Si tras calibrar el punto sigue yéndose, entonces sí es el sensor."
  - question: El sensor de luz muestra un guion, ¿está averiado?
    answer: "No, simplemente está cerrado a los sitios web. Los navegadores bloquearon el acceso al luxómetro a propósito: la luz que te rodea insinúa dónde estás y qué haces. Ningún navegador popular expone hoy la luz ambiental a una página; solo las aplicaciones del propio teléfono la conservan. Es un límite del navegador, no una avería."
  - question: La brújula no muestra rumbo. ¿Qué hago?
    answer: "Comprueba primero que la brújula esté activada en los ajustes y mueve el móvil dibujando un ocho: así se calibra el magnetómetro. Ten en cuenta además que los navegadores no ofrecen el rumbo en todas partes: en el iPhone llega como campo aparte, en Android como evento aparte, y la intensidad del campo magnético casi ninguno la expone. Cerca de metal o de altavoces cualquier brújula miente."
  - question: En el ordenador no funciona nada. ¿Por qué?
    answer: "Porque la mayoría de ordenadores no tienen sensores de movimiento: los llevan los móviles, las tabletas y algunos portátiles convertibles. La página escribe honestamente «no hay sensor» en vez de fingir que espera algo. Ábrela en un móvil."
related:
  - touchscreen-test
  - multi-touch-test
  - gamepad-test
---

Pulsa el botón de acceso: el móvil pedirá tu consentimiento y cobrarán vida cuatro indicadores: aceleración en tres ejes, orientación en el espacio, brújula y luz ambiental. Todo se calcula en el propio teléfono; no se envía nada a ninguna parte.

## Qué se comprueba

- **Acelerómetro**: aceleración en X, Y y Z con barras y valor máximo
- **Giroscopio**: cabeceo, alabeo y guiñada; un punto en la diana muestra cómo está el móvil
- **Brújula**: rumbo con aguja y con cifra
- **Luz ambiental**: en lux, allí donde el navegador todavía la ofrece

## La comprobación por gravedad

La prueba más fiable del acelerómetro no necesita más que una mesa. Deja el móvil con la pantalla hacia arriba: el eje Z debe marcar unos 9,8, la aceleración de caída libre, es decir, la gravedad terrestre, que el sensor está obligado a ver siempre. X e Y quedan cerca de cero.

Dale la vuelta y Z pasa a unos −9,8. Ponlo de canto y esos 9,8 se mudan a X o a Y. Si las cifras no cuadran, o saltan con el móvil inmóvil, el sensor está averiado y ninguna calibración lo arreglará.

## Sobre el giroscopio y la calibración

Con el móvil plano sobre una superficie nivelada, el punto de la diana debe quedar justo en el centro. Si se va a un lado, casi siempre es la calibración y no una avería: el teléfono se recalibra solo si lo dejas plano y abres la brújula o los mapas, y algunos modelos piden dibujar un ocho en el aire.

## Lo que un navegador no puede hacer

Los navegadores bloquearon la luz ambiental a propósito: la luz que rodea a una persona insinúa dónde está y qué hace. La intensidad del campo magnético en microteslas se oculta casi en todas partes por la misma razón. Un guion en esas filas es un límite del navegador, no un móvil roto, y la página lo dice con palabras y no con silencio.

El barómetro, el podómetro y el sensor de proximidad no están al alcance del navegador en absoluto: viven solo dentro de las aplicaciones del teléfono.
