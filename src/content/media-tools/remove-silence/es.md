---
toolSlug: remove-silence
locale: es
category: audio
tool: remove-silence
title: Quitar el silencio de un audio online gratis — cortar las pausas
h1: Quitar el silencio
navName: Quitar silencio
description: Corta automáticamente las pausas y los huecos de una grabación, y mira exactamente cuánto ha salido. La sensibilidad es ajustable. Gratis, sin registro, no se sube nada.
faq:
  - question: ¿Qué cuenta como silencio aquí?
    answer: La grabación se recorre en tramos de 20 milisegundos, y un tramo se descarta si nada en él supera el umbral. El control de sensibilidad marca ese umbral — de 1 (quitar solo el silencio casi total) a 10 (cortar de forma agresiva, incluidas respiraciones y ruido de sala).
  - question: ¿Cortará palabras flojas junto con las pausas?
    answer: Con sensibilidad alta puede pasar. Empieza en 3 o 4 y escucha con el botón de reproducir. La línea bajo el ajuste dice cuánto se ha quitado — si de diez minutos han desaparecido ocho, el valor está claramente pasado.
  - question: ¿Por qué dice que no había nada que quitar?
    answer: Porque con la sensibilidad elegida ningún tramo quedó por debajo del umbral — algo típico en música o en una grabación con ruido de fondo apreciable. Sube el valor y prueba otra vez.
  - question: ¿Sobreviven las pausas naturales entre frases?
    answer: No, se va todo el silencio, pausas cortas incluidas. El habla queda más apretada pero también más apresurada, lo que puede sonar poco natural en un pódcast, aunque ahorra tiempo real en una transcripción de trabajo.
  - question: ¿Se oyen los cortes?
    answer: Normalmente no, porque las uniones ocurren a un volumen muy bajo. En música con colas largas una costura puede oírse, y ahí esta herramienta encaja mucho mejor con el habla que con la música.
  - question: ¿Cuánto se reduce el archivo?
    answer: Exactamente en la proporción en que se acortó la duración. La línea bajo el ajuste muestra las dos cosas a la vez — lo que era, en qué se quedó y cuánto salió.
related:
  - trim-audio
  - compress-audio
  - audio-speed
---

Sube una grabación y dale a reproducir — oirás la versión procesada, y bajo el ajuste aparecerá cuánto silencio se ha ido. Si se ha quitado demasiado o demasiado poco, mueve el control y escucha otra vez.

## Para qué sirve

- **Una clase o una llamada grabada** donde la mitad del tiempo son pausas
- **Notas de voz** con silencios largos al principio y al final
- **Una transcripción de trabajo** — escuchar en la mitad de tiempo sin acelerar el habla
- **Notas dictadas** con huecos de pensar entre frases
- **Reducir un archivo sin perder calidad** — el silencio que se va no cuesta nada en sonido, al contrario que comprimir

Un consejo — si hay un zumbido de fondo constante, prueba antes [mejorar el sonido](/es/audio-enhancer), porque el umbral de silencio funciona mucho mejor sobre una grabación limpia.