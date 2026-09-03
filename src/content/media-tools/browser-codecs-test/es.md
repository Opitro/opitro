---
toolSlug: browser-codecs-test
locale: es
category: device-tests
tool: browser-codecs-test
title: "Prueba de códecs del navegador online — soporte de vídeo y audio"
h1: Soporte de códecs en el navegador
navName: Códecs del navegador
description: "Comprueba qué códecs de audio y vídeo admite tu navegador. Test instantáneo de AV1, HEVC (H.265), AVC (H.264), VP9, FLAC y Opus, sin descargar nada."
faq:
  - question: ¿Qué significa la respuesta «quizá»?
    answer: "Que el navegador reconoció el contenedor pero no responde por el códec de dentro. Un archivo de ese formato puede abrirse o no: el navegador no lo sabe de antemano. Mostramos esa respuesta con su propia etiqueta y no la contamos como compatible: justo ahí engañan muchas tablas parecidas, prometiendo una compatibilidad que no existe."
  - question: ¿Por qué aparece la etiqueta «por hardware» junto a un códec?
    answer: "Significa que el vídeo de ese formato lo descodifica la tarjeta gráfica y no el procesador. Importa más que la compatibilidad misma: un códec sin descodificador por hardware también funciona, pero calienta el aparato y consume el doble de batería. Suele ocurrir con AV1 en equipos de más de un par de años y con HEVC fuera de los dispositivos Apple."
  - question: ¿Por qué mi navegador no admite HEVC (H.265)?
    answer: "El motivo suele ser de licencias y no técnico: por ese códec hay que pagar, y Google no lo integra en Chrome en la mayoría de sistemas. HEVC funciona con solvencia en Safari y en dispositivos con descodificador por hardware. Si tu vídeo en HEVC no abre en Chrome, no hay nada roto."
  - question: ¿Qué es AV1 y para qué sirve?
    answer: "Es el códec de vídeo más nuevo: con la misma calidad ocupa bastante menos espacio y datos, por eso las plataformas se están pasando a él. El precio es la complejidad: los descodificadores de AV1 solo llegaron con procesadores y gráficas recientes, y sin la etiqueta «por hardware» la reproducción calentará tu portátil."
  - question: ¿La página descarga algo para hacer esta comprobación?
    answer: "No. La comprobación es instantánea y totalmente local: la página pregunta al motor del navegador de dos maneras integradas y recibe la respuesta al momento. No se descarga ni un archivo, no se reproduce nada y no se envía nada."
  - question: ¿Para qué me sirve conocer mis códecs?
    answer: "Para entender por qué un vídeo no abre o va a tirones. Si un clip falla en el navegador pero sí va en el reproductor, es cuestión de códec. Si el portátil se calienta con vídeo online, seguramente descodifica el procesador. Si otros no pueden ver un archivo que subiste, quizá convenga un formato más común."
related:
  - webcam-test
  - hdr-test
  - bluetooth-test
---

La página pregunta al motor de tu navegador qué formatos de vídeo y audio sabe abrir y muestra la respuesta en una tabla. La comprobación es instantánea: no se descarga ni se reproduce nada.

## Qué se comprueba

- **Vídeo**: AV1, HEVC (H.265), AVC (H.264) en dos perfiles, VP9, VP8, Theora
- **Audio**: AAC, Opus, MP3, FLAC, Vorbis, WAV y ALAC
- **Fluidez**: si la reproducción irá sin tirones en este aparato
- **Descodificación por hardware**: si del formato se encarga la gráfica y no el procesador

## Tres respuestas en vez de dos

El navegador no responde «sí» o «no», sino de tres formas: no, quizá y probablemente. La respuesta intermedia significa que se reconoció el contenedor, pero del códec interior no se responde.

Muchas tablas parecidas cuentan el «quizá» como compatible, y el visitante recibe una marca verde donde el vídeo no se abrirá. Aquí es una etiqueta aparte y no entra en el recuento.

## Por qué «por hardware» importa más que la compatibilidad

Un códec que descodifica el procesador funciona, pero calienta el aparato y consume el doble de batería. El mismo códec con descodificador en la gráfica no cuesta casi nada.

Por eso junto a la compatibilidad hay dos etiquetas: «fluido», la reproducción irá sin tirones, y «por hardware», de ello se encarga la gráfica. Si AV1 no lleva la etiqueta «por hardware», verlo calentará tu portátil aunque formalmente esté admitido.

## Sobre HEVC y AV1 en particular

HEVC (H.265) es un códec de pago, y Google no lo integra en Chrome en la mayoría de sistemas. Funciona con solvencia en Safari y allí donde hay descodificador por hardware. Es un límite de licencias, no un navegador roto.

AV1 es el más nuevo y el más económico, y las plataformas se están pasando a él. Sus descodificadores solo existen en equipos recientes; en los antiguos funciona a base de procesador.

## Todo se queda contigo

La página pregunta al motor del navegador y obtiene la respuesta al instante. No se descarga ni un archivo, no se recopila ningún dato de tu dispositivo y no se envía nada.
