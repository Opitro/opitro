---
toolSlug: audiobook-check
locale: es
category: audio
tool: audiobook-check
title: Comprobar un audiolibro online — volumen, picos y ruido de fondo
h1: Comprobación de audiolibro
navName: Comprobar audiolibro
description: Comprueba una grabación frente a lo que piden las plataformas de audiolibros — volumen medio, nivel de pico y ruido de fondo. Tres números y un veredicto claro. Gratis, sin registro.
faq:
  - question: ¿Qué requisitos se comprueban?
    answer: Los tres habituales. Volumen medio entre -23 y -18 dB, pico no superior a -3 dB y ruido de fondo no más alto de -60 dB. Son las cifras de ACX, y otras plataformas grandes piden prácticamente lo mismo.
  - question: ¿Qué es el ruido de fondo y cómo se mide?
    answer: Es el nivel del fondo en los huecos — lo alto que sisea la sala cuando nadie habla. Se toma el medio segundo más silencioso de la grabación, porque las pausas entre frases son justo lo que escuchan las plataformas.
  - question: El volumen no pasa, ¿qué hago?
    answer: Si la variación es grande, [nivela primero](/es/dynamic-compressor) y luego [normaliza](/es/normalize-audio). El compresor sube los pasajes flojos hacia los fuertes y normalizar lleva el resultado al techo sin saturar.
  - question: El pico es demasiado alto, ¿qué hago?
    answer: Normalizar baja la grabación para que su momento más alto quede bajo el techo. Si es un chasquido o un golpe aislado, sale más a cuenta cortarlo con [recortar](/es/trim-audio).
  - question: El ruido de fondo es alto, ¿qué hago?
    answer: Pasa la [reducción de ruido](/es/denoise-audio), pero con suavidad, porque una limpieza fuerte le quita vida a la voz. Y ten en cuenta el orden, primero el ruido y después el volumen. Al revés, el compresor sube el ruido junto con el habla.
  - question: ¿Pasar la comprobación garantiza que acepten mi libro?
    answer: No. Medimos lo que se puede medir con números. Las plataformas escuchan además la calidad de la interpretación — respiraciones, chasquidos, consistencia de tono entre capítulos. Esto comprueba los requisitos técnicos, no juzga la grabación.
---

Sube un capítulo y la herramienta mide tres cosas y te dice si pasa. Cada una se marca por separado, así que queda claro qué hay que arreglar.

## Para qué sirve

- **Narrar un audiolibro** para una plataforma con requisitos técnicos
- **Comprobar antes de enviar** — sale más barato que un rechazo y volver a hacerlo
- **Comparar capítulos** para que el libro mantenga un nivel constante
- **Diagnosticar una grabación** — ¿es el volumen o es el ruido?

Comprueba cada capítulo por separado: un capítulo flojo estropea un libro entero, y una media sobre todo el material esconde exactamente eso.

Orden de arreglos — [quitar el ruido](/es/denoise-audio), [nivelar el volumen](/es/dynamic-compressor), [normalizar](/es/normalize-audio) y volver a comprobar.
