---
toolSlug: webcam-test
locale: es
category: device-tests
tool: webcam-test
title: "Prueba de cámara online — test de webcam en PC, portátil o móvil"
h1: Prueba de cámara
navName: Prueba de cámara
description: "Herramienta para probar tu cámara web online. Mide los fotogramas reales, la resolución y la relación de aspecto, y evalúa la calidad de imagen desde tu navegador."
faq:
  - question: El navegador dice que la cámara está ocupada. ¿Qué hago?
    answer: "Cierra todo lo que pueda estar reteniéndola: videollamadas, la aplicación de cámara, el programa de streaming. La mayoría de cámaras solo atienden a un programa a la vez, y una videollamada minimizada la retiene igual que una abierta. Después recarga la página y vuelve a encender la cámara."
  - question: ¿Por qué la resolución es menor que la de las especificaciones?
    answer: "Pedimos a la cámara su máximo —1920 por 1080—, pero entrega lo que puede y lo que el sistema le permite. Si la fila indica 1280 por 720, ese es el límite real de tu cámara en el navegador. En portátiles suele ser incluso menor: los fabricantes montan sensores sencillos."
  - question: Los fotogramas saltan y bajan. ¿Está rota la cámara?
    answer: "Lo más probable es que no. Casi cualquier webcam reduce a la mitad su tasa con poca luz para que cada fotograma recoja más luz y la imagen no se oscurezca. Contamos los fotogramas reales, así que la cifra baja con la iluminación. Enciende una luz y volverá. Los tirones constantes con luz abundante ya son otra historia."
  - question: ¿Por qué no se muestra el códec?
    answer: "Porque un flujo en vivo no tiene. El navegador recibe de la cámara fotogramas ya listos y entre ambos no hay compresión: el códec aparece después, al grabar un archivo o enviar vídeo a una llamada. Nombrar aquí un códec sería inventarlo."
  - question: ¿Adónde va la imagen de la cámara?
    answer: "A ninguna parte. El flujo vive en la memoria de la pestaña; la foto la genera el navegador y se guarda en tu propio disco. Ningún fotograma se sube ni se almacena: esta página no tiene ni subida ni grabación."
  - question: ¿Cómo pruebo la segunda cámara del móvil?
    answer: "Cuando hay más de una cámara, bajo la imagen aparece el botón «otra cámara», que alterna entre la frontal y la trasera. Conviene probar ambas: en los móviles falla más la frontal, porque está junto al auricular, por donde entran polvo y humedad."
related:
  - phone-sensors-test
  - mic-test
  - touchscreen-test
---

Pulsa «encender la cámara» y concede el acceso. A la izquierda aparece la imagen en vivo, sin marcos ni efectos: la neblina, las manchas de color y las bandas se ven enseguida. A la derecha corren las cifras: resolución, proporción y los fotogramas reales, que cambian ante tus ojos.

## Qué se comprueba

- **La imagen**: nitidez, color, manchas en el cristal y bandas en el sensor
- **Resolución y proporción**: lo que la cámara entrega de verdad
- **Fotogramas reales**: se cuentan los de la cámara, no los de la pantalla
- **La tasa declarada**: al lado, para comparar
- **Espejo y foto**: puedes reflejar la imagen y guardarla como archivo

## Por qué importan más los fotogramas reales que los declarados

Una cámara cuya caja dice «treinta fotogramas» da quince o veinte en una habitación con una lámpara normal. No es un engaño ni una avería: con poca luz la cámara alarga la exposición de cada fotograma, o la imagen saldría oscura. Se paga con fluidez.

Por eso hay dos cifras juntas: la que declara la cámara y la que contamos nosotros. Cuando la real queda claramente por debajo, la página escribe «cae», y eso es una pista para añadir luz, no para llevar la cámara al taller. Tapa media lente con la mano y verás caer el número en segundos.

## Si la cámara no arranca

Tres causas cubren casi todos los casos. Acceso denegado: quita el bloqueo con el icono de cámara de la barra de direcciones. Cámara ocupada: cierra las videollamadas del todo, una ventana minimizada la retiene igual. No hay cámara: en un portátil revisa la tapa de privacidad y los ajustes del sistema.

## La imagen se queda contigo

El flujo vive solo en la memoria de la pestaña. La foto la hace el navegador y aterriza en tu disco. En esta página no hay subida, ni grabación, ni almacenamiento en servidor.
