---
toolSlug: qr-code
locale: es
category: dev
tool: qr-code
title: Generador de códigos QR online — crear código QR gratis (PNG y SVG)
h1: Generador de códigos QR
navName: Código QR
description: "Crea un código QR para un enlace, texto, red Wi-Fi o tarjeta de contacto. Descarga en PNG y SVG, cuatro niveles de corrección. Los acentos se codifican bien. Gratis y en tu navegador."
faq:
  - question: ¿En qué se diferencia descargar en PNG o en SVG?
    answer: "El PNG está hecho de puntos: tiene un tamaño fijo y, muy ampliado, los bordes de los cuadrados se emborronan. Va bien para pantalla. El SVG se describe con fórmulas: se puede estirar hasta el tamaño de un rótulo y los bordes siguen nítidos. Para imprenta, toma el SVG."
  - question: ¿Para qué sirve el nivel de corrección de errores?
    answer: "Es una reserva ante daños. En el código se incorpora información redundante y con ella el lector reconstruye los datos aunque la imagen esté arrugada, rayada o parcialmente tapada. Con el nivel bajo se recupera un 7 por ciento de pérdidas, con el máximo un 30, pero el código crece."
  - question: ¿Por qué aquí los acentos y la eñe no salen como caracteres raros?
    answer: "Porque pasamos la cadena a UTF-8, la forma que esperan todos los lectores. Muchos generadores toman solo el byte bajo de cada carácter: el código se construye e incluso se lee, pero el teléfono muestra un galimatías. El fallo es silencioso y solo se nota con un teléfono real."
  - question: ¿Qué pasa si la contraseña del Wi-Fi lleva un punto y coma?
    answer: "Aquí nada malo. En la cadena de red el punto y coma separa los campos, así que los caracteres \\ ; , : \" del nombre y la contraseña deben escaparse con una barra invertida, y lo hacemos. Sin escapar, el teléfono ve la contraseña solo hasta el primer punto y coma y no conecta, en silencio."
  - question: ¿Para qué está el margen blanco alrededor del código?
    answer: "Forma parte del código, no es un adorno. La norma exige un marco vacío de cuatro módulos: así el lector sabe dónde empieza y acaba el código."
  - question: ¿Se puede meter una tarjeta de contacto en el código?
    answer: "Sí, elige «Tarjeta». Montamos el registro en formato vCard y el teléfono ofrece guardar el contacto completo. Las comas y los puntos y coma dentro de los campos se escapan."
  - question: ¿Se envían los datos a alguna parte?
    answer: "No. El código se construye en tu navegador. Los enlaces, las contraseñas de red y los datos de la tarjeta no van a ningún sitio y desaparecen con la pestaña."
related:
  - base64-file
  - url-encode-decode
  - mock-data
---

Elige qué vas a codificar, rellena los campos y el código aparece al momento. Descárgalo en PNG para pantalla o en SVG para imprenta.

## Los acentos se codifican bien

Muchos generadores toman el byte bajo de cada carácter y el teléfono muestra un galimatías. Nosotros pasamos la cadena a UTF-8.

## Una contraseña de Wi-Fi con punto y coma no rompe el código

En la cadena de red el punto y coma separa los campos, así que dentro de la contraseña debe escaparse.

## El margen blanco forma parte del código

La norma exige un marco vacío de cuatro módulos: así el lector encuentra los bordes.
