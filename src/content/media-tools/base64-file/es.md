---
toolSlug: base64-file
locale: es
category: dev
tool: base64-file
title: Codificador de archivos a Base64 online — convertir imágenes a cadena Base64
h1: Codificador de archivos a Base64
navName: Base64 desde archivo
description: "Codifica archivos a Base64 y Data URL online: imágenes, fuentes, documentos. Mostramos cuánto crece el peso y avisamos cuando incrustar no compensa. El archivo no sale del navegador."
faq:
  - question: ¿Qué es codificar un archivo a Base64 y para qué sirve?
    answer: "Base64 convierte el contenido binario de un archivo en una cadena de caracteres de texto seguros. Hace falta allí donde los datos binarios no pueden viajar y el texto sí: incrustar un icono pequeño en la hoja de estilos, meter una imagen en un campo JSON, mandar un archivo en el cuerpo de una petición."
  - question: ¿Cuánto pesa más el archivo?
    answer: "Alrededor de un tercio: tres bytes se convierten en cuatro caracteres. Es una propiedad del método, no un defecto de la herramienta. Por eso mostramos juntos el tamaño original, el codificado y el aumento en porcentaje."
  - question: ¿Cuándo compensa incrustar y cuándo perjudica?
    answer: "Compensa con cosas pequeñas: un icono, un SVG sencillo, unos pocos kilobytes. El navegador se ahorra una petición aparte. Perjudica con todo lo grande: el archivo crece un tercio y, sobre todo, pierde la caché por separado, así que el navegador lo descarga otra vez con cada página. Y una imagen grande dentro del CSS además retrasa el pintado, porque la hoja se analiza entera."
  - question: ¿En qué se diferencia un Data URL del Base64 puro?
    answer: "El Base64 puro son solo los datos. El Data URL antepone un prefijo con el tipo de archivo: data:image/png;base64, y a continuación los datos. Es el Data URL lo que entienden los navegadores en el src de una imagen y en un url() de CSS."
  - question: ¿Por qué en el cuadro solo se ve parte de la cadena?
    answer: "Porque lo que congela una pestaña no es la codificación sino el dibujado: un cuadro de texto con varios millones de caracteres es muy costoso de pintar. Por eso en el cuadro va el principio y lo decimos claramente, mientras que el botón Copiar entrega la cadena entera."
  - question: ¿Qué archivos admite?
    answer: "Cualquiera: imágenes, fuentes, documentos, audio, archivos comprimidos. El método no mira el contenido, trabaja con bytes. Para las imágenes mostramos además una miniatura y ofrecemos envoltorios listos para la etiqueta de imagen y el fondo CSS."
  - question: ¿Se envía el archivo a alguna parte?
    answer: "No. Se lee en tu propio navegador y no va a ningún sitio: ni a nuestro servidor ni al de nadie."
related:
  - base64-encode-decode
  - url-encode-decode
  - escape-unescape
---

Arrastra un archivo al marco o elígelo del disco. El resultado aparece al momento, junto con un recuento honesto del peso.

## Base64 hace el archivo un tercio más pesado

Tres bytes se convierten en cuatro caracteres: es una propiedad del método. Mostramos el tamaño original, el codificado y el aumento.

## Solo compensa incrustar cosas pequeñas

Un icono o un SVG sencillo: sí. Una imagen grande: no, porque crece, pierde la caché por separado y retrasa el pintado.

## Data URL y Base64 puro son cosas distintas

En el `src` de una imagen y en un `url()` de CSS va el Data URL con el prefijo `data:image/png;base64,`.
