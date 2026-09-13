---
toolSlug: remove-exif
locale: es
category: images
tool: remove-exif
title: "Borrar EXIF de una foto online gratis — quitar GPS y datos de la cámara"
h1: "Borrar los datos EXIF"
navName: "Borrar EXIF"
summary: "Quitar de la foto las coordenadas y los datos de la cámara"
description: "Quite de la foto las coordenadas, la fecha y los datos de la cámara en el propio navegador, sin recomprimir ni perder calidad. Gratis, sin registro, el archivo no sale de su dispositivo."
faq:
  - question: "¿Pierde calidad la foto al borrar el EXIF?"
    answer: "No. La herramienta no recomprime la imagen ni la convierte a otro formato. Trabaja sobre el archivo: localiza el bloque de servicio donde están escritos los campos, recorta solo eso y deja los píxeles intactos, byte a byte. El consejo habitual de «ábrala y vuelva a guardarla» no sabe hacerlo: cada reguardado de JPEG se come calidad."
  - question: "¿Para qué quitar estos datos antes de publicar una foto?"
    answer: "El teléfono escribe en el archivo las coordenadas del lugar con precisión de unos metros, además de la fecha, la hora y el modelo del aparato. Una foto de un tablón de anuncios señala una casa; otra, el colegio de un niño. Sin esos campos, usted entrega una imagen y nada más."
  - question: "¿Adónde va mi foto?"
    answer: "A ninguna parte. El archivo se lee y se limpia en el propio navegador, en su dispositivo: esta página no tiene servidor propio. La copia limpia se monta aquí mismo y se descarga al instante."
  - question: "¿Por qué se conserva el giro?"
    answer: "Una foto de teléfono suele estar tumbada dentro del archivo, y es un campo de servicio el que le dice que se vea derecha. No dice nada de usted, así que se conserva por defecto; de lo contrario la imagen aparecería girada en algunos programas y usted pensaría que la hemos estropeado. Puede desmarcar la casilla y quitarlo junto con lo demás."
  - question: "¿Qué formatos admite?"
    answer: "JPEG, PNG, WebP y HEIC: todo lo que graban teléfonos y cámaras. En JPEG se van los bloques EXIF, XMP e IPTC; en PNG, los trozos de servicio; en WebP, los trozos EXIF y XMP; en HEIC el campo se edita en su sitio. El perfil de color no se toca: sin él los colores se desviarían, y no contiene nada sobre la persona."
  - question: "¿Y las fotos HEIC del iPhone?"
    answer: "Se limpian igual. En un HEIC los campos están en una parte aparte del archivo y solo esa se toca: los campos que usted conserva se escriben en el mismo sitio y la cola se rellena con ceros. El tamaño del archivo no cambia y los píxeles no se tocan en absoluto."
  - question: "¿Cómo compruebo que los datos han desaparecido?"
    answer: "Abra el [visor EXIF](/es/exif-viewer) y elija el archivo descargado: le mostrará lo que queda. Es una página vecina de este mismo sitio y funciona igual, en su navegador."
  - question: "¿No borran ya las redes sociales los metadatos?"
    answer: "Las grandes sí, al subir la imagen. Pero las fotos viajan a menudo por otros caminos: por correo, como archivo en mensajería, a un tablón de anuncios, a una carpeta compartida. Allí llegan tal cual, con todos sus campos."
related:
  - exif-viewer
  - color-scan
  - qr-scan
---

Elija una foto: los campos desaparecen y el archivo se descarga en el acto. La imagen no se recomprime: los píxeles quedan igual, solo cambia la parte de servicio del archivo.

## Qué se quita exactamente

El modelo de la cámara y del objetivo, la fecha y la hora, los ajustes, el autor y los derechos y, sobre todo, las coordenadas del lugar. El teléfono las escribe en silencio si alguna vez le permitió usar la ubicación, y viajan con la imagen: una foto de un tablón de anuncios lleva derecho a una casa.

## Por qué no se pierde calidad

No abrimos ni volvemos a guardar la foto: trabajamos sobre el archivo. Dentro, los píxeles están aparte de los campos de servicio, y solo estos últimos se recortan. Por eso la copia limpia coincide con el original byte a byte en la imagen y pesa menos.

## Cómo comprobar el resultado

Abra el archivo descargado con el [visor EXIF](/es/exif-viewer) y verá todo lo que queda dentro. Ambas páginas funcionan en el navegador y no envían nada a ninguna parte.
