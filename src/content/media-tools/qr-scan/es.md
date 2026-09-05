---
toolSlug: qr-scan
locale: es
category: dev
tool: qr-scan
title: Escáner de código QR online — leer un QR con la cámara o una imagen
h1: Escáner de códigos QR
navName: Escáner QR
description: "Lee un código QR con la cámara, desde una imagen o una captura. Mostramos la dirección completa y avisamos de enlaces engañosos. Nada se abre solo. Todo en tu navegador."
faq:
  - question: ¿Cómo leo un QR guardado como imagen o captura?
    answer: "Cambia a «Archivo o captura». Puedes elegir un archivo, arrastrar una imagen con el ratón o simplemente copiar una captura y pulsar Ctrl+V, o Cmd+V en Mac. La imagen se descifra al instante y se queda a la vista."
  - question: ¿Es seguro dar acceso a la cámara?
    answer: "La imagen de la cámara se descifra en el propio navegador: no sale a la red ni se guarda. Pero hay algo más importante que suele callarse: el peligro real de un código QR no está en la cámara sino en lo que lleva escrito dentro."
  - question: ¿Cuál es el peligro del código en sí?
    answer: "Un código no se puede leer a simple vista: uno se entera de adónde lleva solo después de seguirlo. Sobre eso se montan estafas enteras: una pegatina ajena encima de la auténtica en un parquímetro, en un bar, en una factura. Por eso nuestro escáner no abre nada por su cuenta."
  - question: ¿Qué significa el aviso sobre el signo «@»?
    answer: "En una dirección como https://bank.example@evil.example, todo lo que va antes de la «@» no es el sitio sino un nombre de usuario. El navegador irá a evil.example mientras el lector ve un nombre conocido al principio. Señalamos esas direcciones y mostramos el host real en una línea aparte."
  - question: ¿Y el aviso sobre «xn--»?
    answer: "Así muestra el navegador los nombres de sitio escritos con letras no latinas. Se aprovecha para engañar: un nombre con una letra cirílica se ve idéntico al auténtico pero es otro sitio."
  - question: ¿Por qué la contraseña del Wi-Fi sale sin barras de más?
    answer: "Porque quitamos el escapado. En la cadena de red los caracteres especiales llevan barra invertida, y un escáner que no la quita muestra «Pa\\;ss» en vez de «Pa;ss». Escrita a mano, esa contraseña no funcionaría."
  - question: ¿Qué más se puede leer aparte de enlaces?
    answer: "Todo lo que se mete en los códigos QR: texto normal, una red Wi-Fi, una tarjeta vCard, un teléfono y una dirección de correo. El formato se reconoce solo."
related:
  - qr-code
  - base64-file
  - url-encode-decode
---

Apunta con la cámara o carga una imagen. Lo que contiene se muestra como texto, y nada se abre solo.

## El escáner no abre nada por su cuenta

Un QR no se puede leer a simple vista y sobre eso se montan estafas. Mostramos la dirección completa; la decisión de seguirla es tuya.

## Adónde lleva el enlace de verdad

En `https://bank.example@evil.example` el navegador va a `evil.example`. Señalamos esas direcciones.

## La contraseña del Wi-Fi sale usable

Se quita el escapado, así que la contraseña se puede copiar y escribir sin barras de más.
