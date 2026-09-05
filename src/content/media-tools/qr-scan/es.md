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
    answer: "Cambia a «Archivo». Puedes elegir un archivo, arrastrar una imagen con el ratón o simplemente copiar una captura y pulsar Ctrl+V, o Cmd+V en Mac. La imagen se descifra al instante y se queda a la vista."
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
  - barcode-scan
  - qr-code
  - base64-file
  - url-encode-decode
---

Apunte la cámara a un código o cargue una imagen. Lo leído se muestra como texto, y nada se abre solo.

## Si el código no se lee

Suelen estorbar tres cosas. **El reflejo**: un código bajo film o sobre papel satinado devuelve la luz de la lámpara; incline el teléfono hacia un lado y el reflejo se va. **Los márgenes recortados**: el código necesita alrededor un borde claro de unos cuatro módulos, sin él el escáner no encuentra el límite. **El encuadre pequeño**: acérquese, para que el código ocupe al menos un tercio del ancho. En cambio un código roto o manchado a menudo sí se lee: el QR recupera hasta un tercio de las celdas perdidas, va incluido en el propio estándar.

## En qué se diferencia de la cámara del teléfono

La cámara de serie ve un código y ofrece abrirlo de inmediato, y el dedo pulsa antes de que el ojo haya leído la dirección. Aquí el orden es el contrario: primero la dirección entera como texto y el servidor real en su propia línea, y solo después el salto, con una pulsación aparte que da usted.

## Un código en la pantalla de otro

Un código en un monitor o en la pantalla de un móvil se fotografía peor que uno en papel: molestan los reflejos y el muaré que sale al no coincidir los puntos de la pantalla con los de la cámara. Es más fácil no fotografiarlo: haga una captura y péguela aquí con Ctrl+V, Cmd+V en un Mac. La lectura sale más precisa, porque la imagen es perfecta.
