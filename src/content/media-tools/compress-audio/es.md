---
toolSlug: compress-audio
locale: es
category: audio
tool: compress
title: Comprimir audio online gratis — reducir el tamaño del archivo
h1: Comprimir un archivo de audio
navName: Comprimir
description: Reduce el peso de un archivo de audio — elige el bitrate y verás el tamaño resultante al momento. Con ajustes listos para correo, mensajería y Discord. Gratis, sin registro, no se sube nada.
faq:
  - question: ¿De dónde sale el tamaño que aparece bajo el control?
    answer: No es una estimación sino aritmética exacta — bitrate por duración dividido entre ocho. Para MP3 a bitrate constante ese es el tamaño, con un par de puntos porcentuales de sobrecarga. Comprobado midiendo — a 40 kbps sobre un archivo de tres segundos, los 15 KB prometidos dieron un archivo de 15.240 bytes.
  - question: ¿Por qué el control salta algunos números?
    answer: Porque MP3 solo conoce una escalera fija de bitrates — 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256 y 320. No existe nada intermedio. Antes se podía elegir, por ejemplo, 150, y el codificador escribía 160 en silencio; ahora el número en pantalla es siempre el que acaba en el archivo.
  - question: ¿Cuánto sufre el sonido?
    answer: Hasta 128 kbps el habla y los pódcast aguantan bien. La música se degrada de forma perceptible a 96 y por debajo — lo primero que se va son los agudos y la sensación de aire. Por debajo de 64 kbps el codificador además baja la frecuencia de muestreo a 24 kHz, así que también suena más apagado. Usa el botón de reproducir para oír el resultado antes de descargar.
  - question: ¿Puedo recuperar la calidad después?
    answer: No. La compresión con pérdidas es de ida — lo que se descarta no vuelve. Si puede que necesites el original, guárdalo antes de comprimir.
  - question: ¿Por qué no puedo elegir formato?
    answer: Aquí todo gira en torno al tamaño a un bitrate dado, y eso significa MP3. WAV no tiene bitrate del que hablar y OGG usa otra escala de calidad. Si necesitas otro formato, usa el [conversor de audio](/es/audio-converter).
  - question: ¿Tiene sentido comprimir un MP3 ya comprimido?
    answer: Lo tiene si hay un límite de tamaño que cumplir, pero la calidad cae más de lo normal porque se apila pérdida sobre pérdida. Parte de una fuente mejor siempre que puedas.
related:
  - audio-converter
  - remove-silence
---

Sube un archivo y mueve el control — el tamaño resultante aparece debajo mientras lo haces. Los botones preparados fijan un bitrate para un trabajo concreto — correo, mensajería, Discord, archivo. Escucha y descarga.

## Para qué sirve

- **Un adjunto que no sale** — los servicios de correo suelen cortar en 20 o 25 MB
- **La grabación larga de una clase** que hay que mandar entera
- **Notas de voz para mensajería**, donde importa más la velocidad de envío que la calidad de estudio
- **Liberar espacio** en el móvil o en la nube para un archivo de grabaciones

Una regla práctica — habla a 64 o 96 kbps, un pódcast con música a 128, música para escuchar a 192 y más. Baja de 64 solo cuando el tamaño importe de verdad más que el sonido.