---
toolSlug: remove-exif
locale: es
category: images
tool: remove-exif
title: "Borrar EXIF de una foto online gratis — quitar GPS y datos de la cámara"
h1: "Borrar los datos EXIF"
navName: "Borrar EXIF"
summary: "Quitar de la foto las coordenadas y los datos de la cámara"
description: "Borre los metadatos de una foto: coordenadas, fecha y datos de la cámara, en el propio navegador, sin recomprimir ni perder calidad. Gratis, sin registro, el archivo no sale de ahí."
faq:
  - question: "¿Cómo borro los metadatos de una foto?"
    answer: "Pulse «Elegir fotos» o arrastre los archivos a la ventana negra: hasta veinte a la vez. Cada foto se convierte en una ficha con un número grande encima: cuántas etiquetas se encontraron dentro. A partir de ahí hay dos caminos: el botón «Quitar todas las etiquetas», bajo la ventana, limpia de golpe todas las fotos cargadas; y si prefiere elegir, pulse la papelera junto a las etiquetas que deban irse y luego «Quitar las etiquetas elegidas». Entonces el botón deja su sitio a «Guardar» y en la propia ficha aparece la flecha de descarga."
  - question: "¿Qué formatos admite?"
    answer: "JPEG, PNG, WebP, HEIC y AVIF: todo lo que graban teléfonos y cámaras. Del JPEG se van los bloques EXIF, XMP, IPTC y los comentarios; del PNG los trozos de servicio con etiquetas y pies de foto; del WebP los trozos EXIF y XMP; en el HEIC el bloque se corrige en su sitio, sin mover el resto del archivo."
  - question: "¿Qué hacen los iconos?"
    answer: "La papelera de la fila de una etiqueta la tacha del archivo futuro, y la flecha de vuelta la repone: hasta guardar, todo es reversible. El lápiz junto al nombre cambia cómo se llamará el archivo en el disco (por defecto `no-exif_` y su nombre). La flecha hacia abajo de la ficha descarga esa foto, la cruz la quita de la tira. Con varias fotos abajo aparece «Descargar ZIP»: todas en un archivo."
  - question: "¿Pierde calidad la fotografía?"
    answer: "No. La herramienta no recomprime la foto ni la convierte a otro formato. Trabaja sobre el archivo: busca el bloque de servicio donde están las etiquetas, recorta solo eso y deja los píxeles intactos, byte a byte. El consejo habitual de «ábrala y vuelva a guardarla» no sabe hacerlo: cada guardado de un JPEG se come calidad."
  - question: "¿Adónde va mi foto?"
    answer: "A ninguna parte. El archivo se lee y se limpia en el propio navegador, en su dispositivo: esta página no tiene servidor propio, así que no hay adónde enviarla. La copia limpia se arma aquí mismo y se descarga solo cuando usted pulsa el botón."
  - question: "¿Por qué se conservan el giro y el perfil de color?"
    answer: "Son dos etiquetas que no hablan de usted, sino de la propia imagen. El giro es lo que hace que el encuadre se vea derecho; sin él, algunos programas mostrarían la foto tumbada. El perfil de color mantiene los colores como usted los ve. Por eso «Quitar todas las etiquetas» no las toca, aunque puede quitarlas con su propia papelera."
  - question: "¿Cómo compruebo que los datos se han ido de verdad?"
    answer: "Abra [metadatos de la foto](/es/exif-viewer) y elija el archivo descargado: le mostrará lo que queda dentro. Es la página vecina del mismo sitio y funciona igual: en su navegador."
  - question: "¿Por qué quitar esto antes de publicar una foto?"
    answer: "El teléfono escribe en la foto las coordenadas del lugar con precisión de unos metros, además de la fecha, la hora y el modelo del aparato. Una imagen de un anuncio lleva hasta una casa; otra, hasta el colegio de un niño. Las grandes redes sociales sí borran las etiquetas al subirlas, pero la foto suele viajar por otros caminos: por correo, como archivo en la mensajería, a una carpeta en la nube, y allí llega tal cual."
related:
  - exif-viewer
  - color-scan
  - qr-scan
---

Elija sus fotos —hasta veinte a la vez—, quite las etiquetas con un botón o una a una con las papeleras y descargue los archivos limpios. La imagen no se recomprime: los píxeles quedan igual, solo cambia la parte de servicio del archivo.

## Qué se quita exactamente

El modelo de la cámara y del objetivo, la fecha y la hora, los ajustes, el autor y los derechos y, sobre todo, las coordenadas del lugar. El teléfono las escribe en silencio si alguna vez le permitió usar la ubicación, y viajan con la imagen: una foto de un tablón de anuncios lleva derecho a una casa.

## Por qué no se pierde calidad

No abrimos ni volvemos a guardar la foto: trabajamos sobre el archivo. Dentro, los píxeles están aparte de las etiquetas de servicio, y solo estos últimos se recortan. Por eso la copia limpia coincide con el original byte a byte en la imagen y pesa menos.

## Cómo comprobar el resultado

Abra el archivo descargado con el [página de metadatos](/es/exif-viewer) y verá todo lo que queda dentro. Ambas páginas funcionan en el navegador y no envían nada a ninguna parte.
