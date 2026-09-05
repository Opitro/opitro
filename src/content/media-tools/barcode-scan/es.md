---
toolSlug: barcode-scan
locale: es
category: dev
tool: barcode-scan
title: Escáner de código de barras online — leer EAN-13 y UPC con la cámara
h1: Escáner de códigos de barras
navName: Escáner de barras
description: "Lea un código de barras con la cámara o desde una imagen: EAN-13, EAN-8, UPC, Code 128, Code 39, ITF. Comprobamos el dígito de control y mostramos el país donde se emitió el número. Todo en el navegador, sin subir nada."
faq:
  - question: ¿Cómo leo un código de barras que está en una foto o una captura de pantalla?
    answer: "Cambie a «Archivo o captura». Puede elegir un archivo, arrastrar una imagen con el ratón o copiar una captura y pulsar Ctrl+V — Cmd+V en un Mac. La imagen se queda a la vista después de leerla, para que vea exactamente qué archivo se analizó. Si el código está tumbado de lado en la toma, probamos a leerlo también en vertical: no hace falta repetir la foto."
  - question: ¿Por qué el escáner no muestra el nombre del producto ni el precio?
    answer: "Porque los dígitos por sí solos no contienen ningún nombre. La relación entre número y producto está en la base de datos de GS1, y el acceso es de pago. Las páginas que prometen identificar el producto por su código o bien tiran de listas aficionadas incompletas, o bien repiten el primer resultado del buscador, y a menudo se equivocan. Nosotros mostramos lo que realmente está codificado: el formato, el dígito de control y el país donde se emitió el número."
  - question: ¿Qué significan las primeras cifras del código — 84, 400, 690?
    answer: "Son el prefijo de la organización GS1 que emitió el número. 840–849 es España, 000–139 Estados Unidos y Canadá, 400–440 Alemania, 500–509 Reino Unido, 690–699 China, 750 México, 779 Argentina. Ojo con una cosa: el prefijo dice dónde se REGISTRÓ el fabricante, no dónde se fabricó el producto. Una empresa alemana con prefijo 400 puede coser en China. El país de fabricación no se deduce del código: se escribe con letras en el envase."
  - question: ¿Qué es el dígito de control y para qué comprobarlo?
    answer: "La última cifra de un EAN-13, EAN-8 o UPC se calcula a partir de todas las demás: de derecha a izquierda, las cifras se multiplican alternativamente por 3 y por 1, y la suma se completa hasta la decena más próxima. Si no coincide, el código se leyó mal o se tecleó con un error. Es una comprobación fiable: basta con intercambiar dos cifras para romperla. No decimos solo «no es válido», decimos qué cifra debería estar ahí."
  - question: ¿Por qué en el iPhone la cámara en vivo no capta los códigos de barras?
    answer: "En Chrome y en Android el reconocedor está integrado en el propio navegador y lee las barras directamente de la cámara. Safari no lo tiene, así que allí la cámara en vivo busca solo códigos QR. En cambio una foto o un archivo sí se analizan por completo en el iPhone, con el mismo juego de formatos: haga la foto con la cámara normal y cárguela aquí."
  - question: ¿Qué formatos de código de barras lee el escáner?
    answer: "EAN-13 y EAN-8, los códigos de producto del comercio minorista; UPC-A y UPC-E, sus parientes estadounidenses; Code 128 y Code 39, usados en almacén y logística; e ITF, el de las cajas de transporte. Además, códigos QR: si en el encuadre entra un cuadrado en lugar de barras, también lo leeremos."
  - question: ¿Qué es un código que empieza por 2, o por 20–29?
    answer: "Es un código interno de la tienda. Los imprime la propia cadena, normalmente en producto a granel pesado en el mostrador: queso, frutos secos, ensalada de la sección de comida preparada. Fuera de esa tienda no significa nada: en otra cadena los mismos dígitos son otro producto. Marcamos esos códigos de forma explícita, para que la ausencia de país no parezca un fallo."
  - question: El código empieza por 978 o 979, ¿también es un producto?
    answer: "No, es un libro: 978 y 979 son los prefijos del ISBN. Para los códigos que empiezan por 978 mostramos además el antiguo ISBN-10 de diez cifras, que es por el que se busca en los catálogos de biblioteca y en los ficheros antiguos. 9790 no es un libro sino una partitura, un estándar aparte llamado ISMN. Y 977 marca revistas y periódicos, el ISSN."
related:
  - barcode
  - qr-scan
  - qr-code
---

Apunte la cámara a un código o cargue una imagen. Mostramos los dígitos, comprobamos el dígito de control y decimos en qué país se emitió el número.

## El dígito de control se comprueba aquí mismo

La última cifra de un EAN o un UPC se calcula a partir del resto. Si no coincide, el código se leyó mal o se tecleó con un error. Decimos qué cifra debería estar ahí.

## Las primeras cifras indican dónde se emitió, no dónde se fabricó

El prefijo dice en qué oficina de GS1 se registró el fabricante. Una empresa con prefijo `400` puede coser en China. El país de fabricación se escribe con letras en el envase.

## No prometemos nombres de producto

Los dígitos no llevan nombre: eso está en la base de datos de pago de GS1. Mostramos lo que realmente está codificado y no nos inventamos el resto.
