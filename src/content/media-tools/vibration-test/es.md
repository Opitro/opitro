---
toolSlug: vibration-test
locale: es
category: device-tests
tool: vibration-test
title: "Prueba de vibración de móvil online — test del motor de vibración"
h1: Prueba de vibración del teléfono
navName: Test de vibración
description: "Herramienta para diagnosticar el motor de vibración del móvil. Comprueba si la vibración funciona, prueba distintos patrones hápticos y marca tu propio ritmo desde el navegador."
faq:
  - question: ¿Por qué en el iPhone no vibra nada?
    answer: "Porque Apple cerró la vibración a los sitios web: Safari no da acceso al motor, y todos los navegadores del iPhone funcionan sobre el motor de Safari, así que ninguno sirve. Es un límite del sistema, no un teléfono roto ni un fallo de la página. En un iPhone el motor solo se comprueba desde una aplicación o el menú de servicio."
  - question: La vibración se nota floja. ¿Se está muriendo el motor?
    answer: "Comprueba primero lo evidente: la intensidad se ajusta en el propio teléfono, y una funda o una superficie blanda la amortiguan hasta parecer la mitad. Deja el móvil en la mesa y repite. Si aun así apenas se nota y los patrones cortos salen mudos, el contrapeso está gastado o el soporte se ha aflojado."
  - question: ¿Por qué no se muestra la fuerza de la vibración en cifras?
    answer: "Porque el navegador no la conoce. Lo único que puede hacer es enviar al motor la orden «funciona durante tantos milisegundos», y nada más. Ni la fuerza ni si el motor llegó a moverse le llegan de vuelta a la página. Cualquier cifra de «fuerza de respuesta» sería inventada, así que no la mostramos."
  - question: ¿Qué muestra la cinta con el gráfico cuadrado?
    answer: "El ritmo de la orden enviada al motor: arriba es pulso, abajo es pausa. Viene bien cuando el móvil está sobre algo blando y la vibración apenas se siente: se ve dónde debería estar. La cinta no es una medición del motor —el navegador no puede oírlo— y lo decimos justo debajo."
  - question: ¿Por qué probar los pulsos cortos por separado?
    answer: "Es la prueba más justa de un motor gastado. El contrapeso debe arrancar y frenar en cuarenta o cien milisegundos; uno gastado tarda más y se traga los clics: en lugar de un triple clic nítido sale un zumbido débil. Con vibración continua ese motor todavía parece sano."
  - question: La vibración se corta sola. ¿Qué pasa?
    answer: "Lo más probable es que nada. El navegador cancela la vibración cuando la página pasa a segundo plano, durante una llamada y en modo de ahorro de batería. También hay un tope de duración: una vibración muy larga la acorta el sistema. Vuelve a la página y empieza de nuevo."
related:
  - phone-sensors-test
  - touchscreen-test
  - sound-test
---

Pulsa «iniciar vibración continua»: así se prueba el motor en sí. Después prueba los patrones preparados: llamada, notificación, triple clic y explosión. Un motor gastado se come los pulsos cortos y se nota enseguida. También puedes marcar tu propio ritmo con el dedo en la zona táctil y la página lo repetirá con el motor.

## Qué se comprueba

- **Si el motor funciona siquiera**, con vibración continua
- **Cómo responde a los pulsos cortos**, con cuatro patrones preparados
- **Tu propio ritmo**: lo marcas con el dedo y el teléfono lo repite
- **La cinta del patrón**: muestra dónde debería haber vibración, incluso sobre superficies blandas

## Sobre un motor gastado

Dentro del motor gira un contrapeso sobre un eje. Con los años el eje se afloja y el contrapeso se desgasta, así que el motor necesita más tiempo para arrancar. En una vibración larga apenas se aprecia; por eso la prueba de verdad son los pulsos cortos: un clic de cuarenta milisegundos un motor sano lo entrega nítido y uno gastado lo convierte en un zumbido o lo salta.

El traqueteo o el zumbido metálico con vibración continua suelen ser soporte flojo o polvo dentro. El silencio total mientras la orden se ejecuta significa cable roto o motor muerto; ambas cosas se arreglan cambiando la pieza.

## Lo que esta prueba no hace

No mide la fuerza de la vibración. El navegador solo sabe hacer una cosa: enviar al motor una orden de tantos milisegundos. No lo oye, no conoce su potencia y no puede comprobar si llegó a moverse. Por eso aquí no hay cifra de «fuerza de respuesta» ni la habrá: inventarla sería deshonesto.

No funciona en iPhone: Apple cerró la vibración a los sitios web en todos los navegadores del sistema.

## Todo se queda contigo

La herramienta es gratuita y sin registro. La orden llega al motor directamente desde tu navegador; no se envía nada a ninguna parte ni se guarda nada.
