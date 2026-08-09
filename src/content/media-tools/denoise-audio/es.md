---
toolSlug: denoise-audio
locale: es
category: audio
tool: denoise
title: Quitar el ruido de fondo de un audio online gratis — siseo y zumbido
h1: Reducción de ruido
navName: Reducción de ruido
description: Quita el ruido de fondo constante de una grabación — siseo, zumbido de ventilador, estática de micrófono. Tres intensidades, y puedes compararlo con el original de oído al momento. Gratis, sin registro, no se sube nada.
faq:
  - question: ¿Con qué tipo de ruido funciona?
    answer: Con el constante y parejo — un ventilador o un aire acondicionado, el siseo de una sala, la estática de un micrófono barato, el fondo de una cinta. El algoritmo construye un retrato espectral de ese fondo y lo resta de la grabación.
  - question: ¿Y los ruidos secos, un portazo o un perro?
    answer: Los sonidos puntuales se quedan. La herramienta está pensada para un fondo presente todo el rato; un evento aislado en medio de una grabación le resulta indistinguible de la señal útil.
  - question: ¿Cuánto limpia en realidad?
    answer: Medido sobre una grabación con siseo unos 35 dB por debajo de la señal — en modo fuerte el nivel de ruido bajó casi a la mitad, la relación señal-ruido pasó de 34,8 a 39,2 dB, y el sonido útil salió con su nivel intacto.
  - question: ¿Por qué en mi grabación no ha cambiado nada?
    answer: Lo más probable es que el ruido sea demasiado alto. Cuando su nivel se acerca al de la voz, el algoritmo lo trata como parte de la señal útil. Probado — con ruido a solo 13 dB por debajo de la señal, la limpieza no consigue absolutamente nada. Esas grabaciones se arreglan volviendo a grabar, no procesando.
  - question: ¿Por qué en modo fuerte la voz suena como bajo el agua?
    answer: Es el precio de una limpieza agresiva — junto con el ruido se van los detalles flojos del habla. Empieza en suave, compara con el original usando el interruptor, y sube solo mientras la voz siga sonando natural.
  - question: ¿Cómo comparo el antes y el después?
    answer: Elige una intensidad y el proceso arranca solo, y luego suena el resultado. El interruptor de Original y Resultado alterna entre los dos sobre la marcha, desde el mismo punto de la grabación.
  - question: ¿En qué formato se guarda el resultado?
    answer: MP3, WAV o M4A, a tu elección. Antes solo había MP3, lo que hacía que limpiar un WAV devolviera un archivo con pérdidas; eso ya no pasa.
---

Sube una grabación y elige una intensidad de limpieza — el proceso empieza al momento y el resultado suena solo. Alterna entre el original y el resultado para valorar la diferencia con honestidad, y descarga.

## Para qué sirve

- **Grabaciones de móvil en interiores** con aire acondicionado o ruido de calle debajo
- **Entrevistas con un micrófono barato** y estática constante
- **Digitalizaciones de cinta o vinilo** con siseo parejo
- **Llamadas y clases** grabadas junto al ventilador de un ordenador

Claro con los límites: esto es resta espectral de un fondo, no restauración de voz por redes neuronales. Con ruido parejo funciona bien, pero cuanto más limpia, más sufre la propia voz. Si el ruido está más alto que la voz, aquí no hay nada que hacer — ningún procesado lo va a salvar.

Cerca: [mejorar el sonido](/es/audio-enhancer), que combina la limpieza con el nivelado y el ecualizador, además del [ecualizador](/es/audio-equalizer) para cortar un zumbido concreto y [quitar el silencio](/es/remove-silence).
