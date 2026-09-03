---
toolSlug: gamepad-test
locale: es
category: device-tests
tool: gamepad-test
title: "Probador de gamepad online — test de joystick, drift y latencia"
h1: Test de gamepad y controlador online
navName: Test de gamepad
description: "Herramienta online para probar mandos de Xbox, PlayStation, Nintendo Switch y PC. Comprueba el drift de los joysticks, la precisión de los ejes, los botones, los gatillos y la vibración."
faq:
  - question: La página dice que no ve el mando. ¿Está roto?
    answer: "Casi seguro que no. Los navegadores ocultan los mandos a las páginas hasta que pulsas un botón tú mismo: es una protección de privacidad, no una avería. Pulsa cualquier botón y el mando aparecerá. Si aun así no cambia nada, revisa el cable, la batería y que el mando esté emparejado con este ordenador y no con una consola o un móvil cercano."
  - question: ¿Qué es el drift del stick y cómo se prueba?
    answer: "El drift es cuando un stick suelto sigue enviando movimiento: el personaje anda solo, la mira se desliza, los menús pasan sin ti. Suelta los dos sticks, deja el mando en la mesa y pulsa «probar el drift»: la página vigila las cifras durante cinco segundos. Unas centésimas de desvío las tiene casi cualquier stick y no afectan al juego; cerca de una décima ya es drift de verdad."
  - question: ¿Por qué los botones se llaman «inferior» y «derecho» y no A y B?
    answer: "Porque las letras impresas cambian de un mando a otro: donde uno lleva A, otro lleva una cruz y un tercero no lleva nada. El navegador informa del lugar del botón en la disposición estándar, no de su letra, así que lo nombramos por su lugar. Si tu mando usa una disposición no estándar, la página muestra honestamente los números."
  - question: ¿Se puede medir la latencia y la frecuencia de sondeo?
    answer: "La respuesta honesta es no. El navegador entrega el estado del mando exactamente una vez por fotograma, así que cualquier milisegundo o hercio mostrado aquí describiría tu monitor y no el mando: una pantalla de 60 Hz da 60 y una gaming de 240 da 240, con el mando que sea. Mostramos esa cifra en su propia línea y la etiquetamos «frecuencia del navegador». Los 125, 250 o 1000 Hz de la caja solo se comprueban con el programa del fabricante."
  - question: ¿Por qué los ejes se muestran con cinco decimales?
    answer: "Porque el drift vive en las milésimas. Un stick en reposo casi nunca marca un cero limpio: uno sano se queda en algo como 0,00312, y eso es normal. Con dos decimales ese desvío se redondearía a cero y no distinguirías un stick sano de otro que empieza a irse."
  - question: La vibración no funciona. ¿Es el mando?
    answer: "Normalmente no. No todas las combinaciones admiten vibración desde el navegador: en Safari no la hay con ningún mando, por Bluetooth no siempre funciona y algunos mandos solo la ofrecen a su propio programa. Prueba el mando en un juego: si allí vibra y aquí no, el límite es el navegador, no el aparato."
related:
  - keyboard-test
  - mouse-test
  - click-speed
---

Conecta el mando por cable o Bluetooth y pulsa cualquier botón: hasta entonces el navegador no lo mostrará. Después todo se ve de golpe: el botón pulsado se vuelve blanco, el ya probado conserva su contorno, el punto sigue al stick por su diana y los gatillos llenan barras verticales. A la izquierda corre la telemetría: modelo, disposición y los valores de los ejes con cinco decimales.

## Qué se comprueba

- **Todos los botones**, incluida la cruceta, los bumpers y las pulsaciones de los sticks
- **Ambos sticks**: un punto en la diana y cifras exactas en cada eje
- **Gatillos**: en barras, porque tienen valores intermedios
- **Drift del stick**: como prueba propia de cinco segundos
- **Vibración**: allí donde el navegador la ofrece

## Sobre el drift, la avería clásica

El drift se ve así: no tocas el stick y el personaje anda, la mira se desliza, los menús pasan solos. La causa está dentro: el sensor del stick se desgasta y empieza a mentir sobre su posición, y el mando reenvía esa mentira al juego con toda honestidad.

El drift no se caza pulsando nada, sino no tocando. Suelta los dos sticks, deja el mando en la mesa y lanza la prueba: durante cinco segundos la página vigila las cifras y guarda la mayor separación del cero.

Unas centésimas de desvío las tiene casi cualquier stick, incluso nuevo, y no molestan al jugar. Cerca de una décima ya es el drift por el que se cambian sticks —o mandos enteros—.

## Por qué hay que pulsar un botón primero

No es una avería ni un capricho nuestro. Los navegadores ocultan los mandos a las páginas hasta que una persona pulsa un botón: de lo contrario cualquier sitio podría averiguar en silencio qué equipo tienes conectado y reconocerte por él. Una pulsación y el mando aparece.

## Sobre la latencia y la frecuencia de sondeo, con honestidad

La latencia en milisegundos y la frecuencia de sondeo del mando no se pueden medir desde una página web. El navegador entrega el estado exactamente una vez por fotograma: sesenta veces por segundo en un monitor corriente, ciento veinte o doscientas cuarenta en uno gaming, y la cifra será la misma con cualquier mando. La mostramos en su propia línea, etiquetada «frecuencia del navegador», para que nadie la confunda con una característica del aparato.

Los 125, 250 o 1000 Hz impresos en la caja solo se comprueban con el programa del fabricante, que habla con el mando directamente y se salta el navegador.

## Lo que esta prueba no hace

No mide la latencia ni la frecuencia de sondeo, por el motivo de arriba. Tampoco comprueba el giroscopio, el panel táctil ni la iluminación: el navegador no tiene acceso a ellos, viven en los programas propios de cada fabricante.
