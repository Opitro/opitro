---
toolSlug: url-encode-decode
locale: es
category: dev
tool: url-encode-decode
title: Codificar URL online — codificador y decodificador de enlaces
h1: Codificación y decodificación URL
navName: Codificación URL
description: "Herramienta gratuita para codificar y decodificar URL online. Convierte espacios, acentos y caracteres especiales a percent-encoding, o despliega un enlace cifrado en texto legible."
faq:
  - question: ¿Qué es la codificación URL (percent-encoding)?
    answer: "Es la forma de escribir dentro de una dirección web caracteres que allí no están permitidos. El estándar solo admite en una dirección un conjunto limitado de letras latinas, cifras y unos pocos símbolos; todo lo demás se sustituye por un signo de porcentaje y el código hexadecimal del byte. Un espacio pasa a %20 y la letra «ñ» a %C3%B1. El navegador lo deshace por su cuenta, y por eso en la barra de direcciones ves texto normal."
  - question: ¿Qué diferencia hay entre codificar un enlace entero y un solo valor?
    answer: "Codificar un enlace entero no toca los caracteres estructurales de la dirección: los dos puntos, las barras, el interrogante, el ampersand. Los espacios y las letras acentuadas sí se codifican, y el enlace sigue funcionando: se puede pulsar. Codificar un solo valor lo codifica absolutamente todo, incluido «://». Eso hace falta cuando una dirección va dentro de otra como parámetro; sin ello, un ampersand ajeno partiría la consulta en dos."
  - question: ¿Qué modo elijo si solo quiero enviar un enlace con acentos?
    answer: "Un enlace entero. Las letras y los espacios se convierten en códigos de porcentaje y la estructura de la dirección queda intacta: obtienes un enlace largo pero plenamente funcional, que no se romperá en ningún mensajero ni en ningún correo."
  - question: ¿Por qué una letra se convierte en dos pares de caracteres?
    answer: "Porque en UTF-8 una letra acentuada ocupa dos bytes y el percent-encoding codifica cada byte por separado: «ñ» es %C3%B1. Una letra latina simple ocupa un byte, así que le bastaría un código. Por lo mismo, las direcciones con alfabetos no latinos salen tan largas: cada letra cuesta seis caracteres."
  - question: ¿Qué significa el error de secuencia % rota?
    answer: "Significa que la cadena tiene un signo de porcentaje que no va seguido de dos dígitos hexadecimales. Ocurre cuando el enlace se copió incompleto o cuando el texto lleva un porcentaje corriente, por ejemplo «50% de descuento». Una cadena así no se puede deshacer, porque no se sabe qué representa ese porcentaje. Lo decimos claramente en vez de mostrar un campo vacío."
  - question: ¿Por qué los caracteres ! ' ( ) * quedan sin codificar?
    answer: "Porque para el estándar actual de direcciones son estructurales y no necesitan codificarse. Así se comporta la función integrada del navegador, y los enlaces no se rompen por ello. Algunos sistemas antiguos sí los piden codificados, pero es un caso raro que se resuelve aparte y no con una regla general."
  - question: ¿Se envían mis enlaces a algún sitio?
    answer: "No. Todo se calcula dentro de tu navegador: los enlaces, los tokens y los parámetros de consulta no van a ninguna parte, no se registran y no sobreviven al cierre de la pestaña."
related:
  - base64-encode-decode
  - transliteration
  - remove-diacritics
---

Elige la dirección con los botones y escribe un enlace o un texto en el campo de arriba: el resultado aparece abajo al instante.

## Dos alcances al codificar

- **Un enlace entero** — los caracteres estructurales se quedan donde están y el enlace sigue siendo pulsable
- **Un solo valor** — se codifica todo, incluidos «://» y el ampersand

La diferencia se ve mejor con un ejemplo. La dirección `https://opitro.com/búsqueda?q=hola mundo` codificada entera queda como `https://opitro.com/b%C3%BAsqueda?q=hola%20mundo`, larga pero pulsable. Codificada como un solo valor, también se codifican «https://» y el interrogante: esa cadena ya no se puede abrir, pero sí se puede anidar sin peligro dentro de otra dirección.

## La decodificación siempre es completa

La vuelta se hace con el método que también despliega `%2F` y `%3F`. El segundo método, más prudente, deja esos códigos intactos a propósito: con él un enlace «descodificado» se quedaría a medias en porcentajes, y eso parece una avería.

## Por qué las direcciones con acentos son tan largas

En UTF-8 una letra acentuada ocupa dos bytes, y cada byte se escribe con tres caracteres: un porcentaje y dos cifras. Son seis caracteres por letra. La palabra «búsqueda» se convierte en trece.
