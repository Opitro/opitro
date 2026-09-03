---
toolSlug: rot13
locale: es
category: text
tool: rot13
title: Cifrado ROT13 online — cifrar y descifrar texto (César)
h1: Cifrado ROT13
navName: Cifrado ROT13
description: "Herramienta gratuita de ROT13 online. Cifra un texto o lee una cadena ROT13 con el desplazamiento clásico de 13 letras del cifrado César, con soporte opcional de cirílico."
faq:
  - question: ¿Qué es el cifrado ROT13 y cómo funciona?
    answer: "ROT13 —del inglés «rotate by 13 places», girar 13 posiciones— es un caso particular del antiguo cifrado César. Cada letra latina avanza 13 posiciones por el anillo del alfabeto: la A pasa a N y la B a O. Hay 26 letras latinas y 13 es justo la mitad, así que un segundo desplazamiento idéntico devuelve cada letra a su sitio. Por eso cifrar y descifrar son aquí exactamente la misma acción."
  - question: ¿Afecta el cifrado a las cifras y a la puntuación?
    answer: "No. El ROT13 clásico solo toca letras. Los espacios, las cifras, los puntos, las comas y cualquier otro signo se quedan como están, de modo que la forma de las frases se conserva y el texto cifrado sigue leyéndose como texto, solo que con palabras sin sentido."
  - question: ¿Por qué el cirílico se desplaza 16 y no 13?
    answer: "Porque un desplazamiento que se deshace a sí mismo solo es posible en un alfabeto con un número par de letras: hace falta justo la mitad. El latino tiene 26, así que la mitad es 13. El alfabeto ruso tiene 33 letras y no tiene mitad: si desplazas dos veces 16, «привет» vuelve como «опзбдс». Por eso se usa el recuento habitual de 32 letras, sin la «ё». La mitad es exactamente 16 y todo encaja: la А pasa a Р y la segunda pasada devuelve la А."
  - question: ¿Qué pasa con la letra «ё»?
    answer: "Se queda tal cual, igual que las cifras y los signos. No es un descuido, sino la condición para que el proceso sea reversible: si se incluye la «ё» en el anillo, las letras son 33 y el texto volvería deformado tras dos pasadas. Es mejor dejar una letra intacta que romper la ida y vuelta de todo el texto."
  - question: ¿Y las letras ucranianas і, ї, є, ґ?
    answer: "También se quedan intactas. El alfabeto ucraniano tiene 33 letras, un número impar, así que para él no existe ningún desplazamiento que se deshaga a sí mismo. Cualquier desplazamiento aplicado dos veces devolvería texto dañado. Preferimos decirlo claramente antes que fingir que todo funciona."
  - question: ¿Es seguro ROT13? ¿Puedo proteger algo con él?
    answer: "No, y nunca se pensó para eso. ROT13 no oculta nada: no tiene clave y cualquiera puede deshacer la cadena en un segundo, incluso en esta misma página. Se inventó para otra cosa: tapar la respuesta de un acertijo, el final de una película o una palabrota para que no se lean por accidente al pasar la vista por la pantalla."
  - question: ¿En qué se diferencia ROT13 del cifrado César?
    answer: "ROT13 es el cifrado César con un desplazamiento concreto: trece. En el César el desplazamiento puede ser cualquiera: 1, 5, 20. El trece se ganó nombre propio por una propiedad cómoda: solo con ese desplazamiento cifrar y descifrar coinciden, de modo que no hace falta una segunda clave."
  - question: ¿Se envía mi texto a algún sitio?
    answer: "No. Todo se calcula en tu propio navegador, en tu dispositivo. La página no envía nada a ningún servidor, no guarda historial y no recuerda ni una línea cuando cierras la pestaña."
related:
  - base64-encode-decode
  - transliteration
  - text-case-converter
---

Escribe en el campo de arriba y el resultado aparece abajo al instante. No hay un botón aparte de «descifrar» porque no hace ninguna falta.

## Una sola acción en ambos sentidos

Hay veintiséis letras latinas y trece es justo la mitad. Por eso un desplazamiento de 13 convierte la A en N y la N de vuelta en A. Aplícalo al texto y sale el cifrado; aplícalo al cifrado y vuelve el texto.

## Lo que no cambia

- **Las cifras** — 2026 sigue siendo 2026
- **Espacios y puntuación** — la forma de la frase se conserva
- **Mayúsculas y minúsculas** — «Hola» mantiene su mayúscula
- **La letra «ё»** y las ucranianas **і, ї, є, ґ** — el motivo, más abajo

## Por qué el cirílico se desplaza 16

Un desplazamiento que se deshace a sí mismo solo es posible en un alfabeto con un número par de letras: hace falta justo la mitad. El alfabeto ruso tiene 33 letras y no tiene mitad: dos pasadas de 16 devuelven «опзбдс» en lugar de «привет».

Por eso se usa el recuento habitual de 32 letras, sin la «ё». La mitad es exactamente 16 y todo encaja: **la А pasa a Р** y la segunda pasada devuelve la А.

## Lo que este cifrado no hace

ROT13 no protege nada. No tiene clave y cualquiera lo deshace. Existe para tapar una respuesta de una mirada casual, no de otras personas.
