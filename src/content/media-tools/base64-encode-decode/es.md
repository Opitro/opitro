---
toolSlug: base64-encode-decode
locale: es
category: text
tool: base64-encode-decode
title: Base64 online — codificador y decodificador de texto (encode / decode)
h1: Codificación y decodificación Base64
navName: Base64
description: "Herramienta gratuita para codificar y decodificar Base64 online. Convierte texto plano a Base64 o despliega una cadena ya hecha, con acentos y eñes correctos y forma segura para enlaces."
faq:
  - question: ¿Qué es la codificación Base64 y para qué sirve?
    answer: "Base64 es una forma de escribir cualquier dato con sesenta y cuatro caracteres sencillos: letras latinas, cifras y un par de símbolos. Hace falta allí donde el canal solo entiende texto plano y estropea todo lo demás: en las cabeceras del correo, en los adjuntos, en los tokens, en las imágenes escritas dentro de la propia página. Los datos no cambian; lo que cambia es la manera de anotarlos."
  - question: ¿Base64 es cifrado? ¿Puedo esconder ahí una contraseña?
    answer: "No, y no debes. Base64 es una notación, no un cifrado: no hay clave y cualquiera puede deshacer la cadena en un segundo, incluso en esta misma página. Los datos en Base64 están tan protegidos como una carta en un sobre de cristal. Si de verdad quieres ocultar algo, necesitas cifrado, que es una cosa completamente distinta."
  - question: ¿Es seguro decodificar Base64 en este sitio?
    answer: "Sí. La cadena no sale de tu dispositivo: tanto codificar como decodificar lo hace tu propio navegador, dentro de la pestaña. No enviamos nada a un servidor, no registramos nada y no guardamos nada. Al cerrar la pestaña no queda rastro."
  - question: ¿Por qué otras webs dan error con acentos y eñes?
    answer: "Porque la función integrada del navegador solo entiende bytes del 0 al 255, y una letra acentuada no cabe en uno — de ahí la queja sobre caracteres fuera del rango Latin1. La salida es pasar el texto a UTF-8 antes de codificar. Nosotros lo hacemos por la vía moderna, así que «Año», los emojis y cualquier otro signo pasan sin error."
  - question: ¿Qué hace el interruptor de forma segura para enlaces?
    answer: "Cambia dos caracteres y quita un tercero: «+» pasa a «-», «/» pasa a «_» y los «=» del final se descartan. El motivo es que «+» y «/» significan otra cosa dentro de una dirección web y rompen el enlace. Así se escriben exactamente las partes de un token JWT. Al decodificar aceptamos las dos formas, la normal y la segura, así que para esa dirección el interruptor no hace falta."
  - question: ¿Por qué la cadena es más larga después de codificar?
    answer: "Así funciona el formato: cuatro caracteres Base64 guardan tres bytes de datos, de modo que la anotación crece alrededor de un tercio. Es el precio de pasar por canales que solo esperan letras latinas simples. Si tu cadena creció justo un tercio, todo está bien y no se perdió nada."
  - question: ¿Por qué dice que dentro hay datos binarios en vez de mostrar texto?
    answer: "Significa que la cadena es válida pero lo que hay dentro no son letras. En Base64 no solo viaja texto: también imágenes, tipografías y archivos comprimidos. Esos datos se descodifican sin un solo error, pero no se pueden mostrar con letras; saldría basura. En lugar de fingir que es texto, decimos claramente cuántos bytes hay dentro."
  - question: ¿Por qué no detecta la dirección automáticamente?
    answer: "Porque no se puede hacer con honestidad. La palabra «test» es a la vez una palabra corriente y una cadena Base64 perfectamente válida: al deshacerla salen tres caracteres ilegibles. Una web que adivina acabará, tarde o temprano, convirtiendo tu texto en basura sin decir nada. Por eso la dirección la eliges tú con un botón, y la página solo sugiere cuando lo escrito parece de la otra."
related:
  - url-encode-decode
  - transliteration
  - text-case-converter
---

Elige la dirección con los botones y escribe en el campo de arriba: el resultado aparece abajo al instante, sin pulsar ningún botón de «convertir».

## Dos direcciones

- **Texto → Base64** — el texto corriente se convierte en una cadena de letras latinas y cifras
- **Base64 → texto** — una cadena ya hecha se despliega en forma legible

## Los acentos y las eñes pasan sin error

La función integrada del navegador entiende solo bytes del 0 al 255, y una letra acentuada no cabe en uno: de ahí la conocida queja sobre caracteres fuera del rango Latin1. Nosotros pasamos el texto a UTF-8 antes de codificar, y por la vía moderna, no con una función retirada hace años del lenguaje. Por eso «Año», los emojis y cualquier otro signo se codifican como es debido.

## La forma segura para enlaces

Dentro de una dirección web los caracteres «+» y «/» significan otra cosa y rompen el enlace. Por eso existe una segunda forma: «+» sustituido por «-», «/» por «_» y los «=» del final descartados. Así se escriben exactamente las partes de un token JWT.

Al decodificar se aceptan las dos formas, la normal y la segura. El interruptor solo importa al codificar.

## Lo que esta herramienta no hace

Base64 no es cifrado. Cualquiera deshace la cadena sin ninguna clave, así que esconder contraseñas ahí no sirve de nada. No prometemos una protección que el formato no tiene.
