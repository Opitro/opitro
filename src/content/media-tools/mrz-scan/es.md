---
toolSlug: mrz-scan
locale: es
category: scanners
tool: mrz-scan
title: "Escáner MRZ en línea — lea la zona del pasaporte y del DNI"
h1: "Escáner MRZ"
navName: "Escáner MRZ"
summary: "Leer la zona de lectura mecánica del documento"
description: "Apunte la cámara a las dos líneas de abajo del pasaporte: leemos los campos y recalculamos los dígitos de control. Gratis, sin registro, la foto no sale de aquí."
faq:
  - question: "¿Cómo leo la MRZ de un pasaporte?"
    answer: "Pulse «Cámara» y sostenga el documento de modo que las dos líneas de abajo queden dentro del marco. No hay que pulsar nada más: la página toma fotogramas varias veces por segundo y, en cuanto lee las líneas, congela la imagen y muestra el desglose debajo. Si no hay cámara, pulse «Archivo» y elija una foto de la página con el retrato."
  - question: "¿Qué son los dígitos de control y para qué comprobarlos?"
    answer: "En la MRZ, tras el número del documento, la fecha de nacimiento y la de caducidad va un dígito calculado a partir de ese mismo campo con los pesos 7-3-1. Lo recalculamos y lo comparamos. Si cuadra, el campo se leyó bien, y eso es aritmética, no una impresión. Si no cuadra, aparece una cruz rosa al lado y lo decimos claramente: o la foto se leyó mal, o el documento tiene una errata."
  - question: "¿Qué documentos entiende?"
    answer: "Pasaportes (dos líneas de 44 caracteres), visados, tarjetas de identidad y permisos de residencia (tres líneas de 30) y documentos antiguos (dos de 36). El tipo se deduce solo y lo verá en el encabezado. Las fotos pueden ser JPEG, PNG, WebP o HEIC, todo lo que graban los teléfonos."
  - question: "¿Qué significan las marcas junto a los campos?"
    answer: "Un tic verde: el dígito de control cuadra. Una cruz rosa: no cuadra. Un tic amarillo: la grafía se dedujo del dígito de control, porque el lector confundió un cero con la letra O y la aritmética señaló la única escritura posible. El botón de arriba copia las líneas enteras."
  - question: "¿Adónde va la foto de mi pasaporte?"
    answer: "A ninguna parte. Tanto la lectura como la aritmética ocurren en el propio navegador, en su dispositivo: esta página no tiene servidor propio, así que no hay nada que enviar. En una página a la que se trae un pasaporte, eso no es una frase amable sino la condición para que exista."
  - question: "¿Por qué descarga algo la primera vez?"
    answer: "El lector de caracteres es un programa de unos pocos megabytes y llega una sola vez, cuando usted pulsa la cámara o elige un archivo. Después el navegador lo guarda y la siguiente vez empieza al instante. A propósito no lo traemos al abrir la página: mucha gente entra solo a mirar."
  - question: "¿Puedo escribir las líneas a mano?"
    answer: "Sí, debajo de la ventana hay un campo para eso. Pegue las dos (o tres) líneas y el desglose y las comprobaciones salen al momento, sin necesidad del lector. Va bien para verificar algo tecleado a mano o unas líneas que le hayan enviado como texto."
  - question: "¿Esto demuestra que el documento es auténtico?"
    answer: "No, y nada que corra en un navegador podría hacerlo. Los dígitos de control detectan una lectura errónea o una errata, no una falsificación: quien falsifica un documento calcula esos dígitos igual que nosotros. La comprobación real son el chip, las medidas de seguridad y bases de datos cerradas."
related:
  - qr-scan
  - barcode-scan
  - exif-viewer
---

Apunte la cámara a las dos líneas de abajo de un pasaporte o un DNI: la página las lee sola, las reparte en campos y recalcula cada dígito de control. La foto se queda con usted, porque la lectura ocurre en el navegador.

## Qué es la MRZ

Es la zona de lectura mecánica: dos o tres líneas en la parte inferior del documento, compuestas con una tipografía especial, la OCR-B. Se inventó para los puestos fronterizos: la persona deja el pasaporte, la máquina lee las líneas en un instante y nadie teclea nada. En esas líneas está lo mismo que en la página: apellidos y nombre, número de documento, nacionalidad, fecha de nacimiento, sexo y caducidad.

## Por qué aquí la respuesta se puede comprobar

Tras cada campo importante va un dígito calculado con los pesos 7-3-1, una aritmética sencilla que cualquiera puede repetir. Nosotros la repetimos: cada campo lleva su marca y abajo está el veredicto general. Por eso la respuesta no es «parece que pone esto», sino «el número se leyó bien, el dígito cuadra».

Esa misma aritmética permite reparar la lectura. El lector confunde a veces el cero con la letra O: en la MRZ se parecen mucho. Probamos las grafías en disputa y, si el dígito cuadra exactamente con una de ellas, la mostramos y la marcamos con honradez como deducida. Dentro de las fechas esa reparación está prohibida: allí el estándar solo admite cifras, y un «arreglo» taparía un error real.

## Lo que la página no hace

No demuestra la autenticidad. Los dígitos de control detectan una lectura errónea y una errata, no una falsificación: quien falsifica un documento los calcula igual. La comprobación real son el chip, las medidas de seguridad y las bases cerradas. Prometer más sería mentir.
