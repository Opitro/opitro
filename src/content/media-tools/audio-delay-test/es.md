---
toolSlug: audio-delay-test
locale: es
category: device-tests
tool: audio-delay-test
title: Prueba de latencia de audio online — retraso Bluetooth (ms)
h1: Test de retraso del sonido
navName: Retraso del sonido
description: "Mide el retraso del sonido en milisegundos: un destello en el radar y un clic, y un control los junta. Para auriculares Bluetooth, cascos, altavoces y televisores."
faq:
  - question: ¿Cómo funciona?
    answer: "Un haz recorre un círculo y destella en la marca superior, con un clic en el mismo instante. Con auriculares inalámbricos el clic llega después del destello: el sonido tarda en recorrer el enlace de radio. El control adelanta el clic, es decir, lo envía antes. Cuando el destello y el clic te resultan simultáneos, el valor del control es el retraso de tus auriculares."
  - question: ¿Por qué el navegador no puede medirlo solo?
    answer: "Porque no sabe cuándo el sonido llegó físicamente a tu oído. La página entrega el audio al sistema operativo; de ahí pasa por un controlador, un enlace de radio y el propio auricular, y cada paso añade un tiempo del que nadie le informa. La cifra de arriba es la latencia solo de su propia ruta, hasta la salida del aparato. Todo lo que viene después únicamente lo puede captar una persona."
  - question: ¿Qué retraso se considera normal?
    answer: "Unos auriculares con cable dan de 5 a 40 milisegundos, por debajo del umbral de percepción. El Bluetooth corriente con SBC y AAC va de 120 a 300. aptX Low Latency y LE Audio lo bajan a 40–80, pero ambos aparatos deben admitirlos, el móvil y los auriculares. Todo lo que pase de 150 se nota en los labios del cine y estorba en los juegos."
  - question: ¿Por qué en el cine no molesta y en los juegos sí?
    answer: "Porque el reproductor de vídeo conoce el retraso y desplaza la pista de audio él mismo: el sistema le informa de la latencia de salida y el reproductor ajusta la imagen al sonido. Un juego no puede hacerlo: el disparo debe oírse cuando pulsas, y no se puede adelantar porque el suceso aún no ha ocurrido. Por eso los mismos auriculares van bien con una película y estorban en un shooter."
  - question: ¿Cómo reduzco el retraso?
    answer: El cable es la respuesta más eficaz, elimina el problema por completo. Entre lo inalámbrico ayuda un códec de baja latencia, pero los dos aparatos deben hablarlo. En Android a veces se puede elegir el códec en las opciones de desarrollador; en un iPhone no hay ese control. En un televisor busca el modo juego y un ajuste manual del audio, normalmente en milisegundos.
  - question: El retraso difiere entre izquierdo y derecho. ¿Qué es eso?
    answer: Es una desincronía entre los propios auriculares, no culpa de la fuente. En los modelos totalmente inalámbricos las dos mitades se sincronizan entre sí y ese enlace a veces falla. Comprueba cada oído por separado con los botones izquierdo y derecho; suele arreglarse reiniciándolos y volviendo a emparejarlos.
  - question: ¿Cómo de exacta es esta medida?
    answer: Lo bastante para distinguir el cable del Bluetooth y un buen códec de uno malo, pero no es una medición de laboratorio. En el resultado entra tu tiempo de reacción visual y también cómo dibuja tu pantalla el destello. Una dispersión de 20 a 30 milisegundos entre intentos es normal, así que mide varias veces y quédate con la media.
related:
  - tone-generator
  - sound-test
  - hearing-test
---

Ponte los auriculares y pulsa «Arrancar el radar». El haz recorrerá el círculo y destellará en la marca superior junto con un clic. Mueve el control hasta que el destello y el clic te resulten simultáneos: ese número es tu retraso.

## Por qué un haz y no un simple parpadeo

El haz enseña **cuándo** va a llegar el destello y el ojo tiene tiempo de prepararse. Con un parpadeo repentino la coincidencia se capta la mitad de bien, porque comparas dos sucesos que no esperabas. Una vuelta completa dura 1200 milisegundos y las marcas van cada cien.

## Qué significan las cifras

- **menos de 50 ms**: sonido por cable. Imperceptible incluso jugando.
- **50–150 ms**: buen Bluetooth. Invisible en cine, ya molesto para disparar.
- **más de 150 ms**: códec barato o Bluetooth antiguo. Se nota en los labios.

## Lo que esta página no hace

No mide el retraso por su cuenta: es imposible desde un navegador, que no tiene forma de saber cuándo llegó el sonido a tu oído. La cifra de arriba es la latencia de su propia ruta, de la página a la salida del aparato; nada de lo que ocurre después, en la radio y en el auricular, entra ahí. Por eso mide la persona, y su tiempo de reacción forma parte del resultado. Mide varias veces y quédate con la media.
