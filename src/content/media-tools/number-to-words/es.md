---
toolSlug: number-to-words
locale: es
category: text
tool: number-to-words
title: Números a letras online — convertir cifras en palabras y viceversa
h1: Números a letras
navName: Números a letras
description: "Conversor gratuito de números a letras y al revés. Euros, dólares, rublos y grivnas con las formas correctas, género del numeral y céntimos en cifras. Nada sale del navegador."
faq:
  - question: ¿Por qué se escriben las cantidades en letras en los documentos?
    answer: "Para que no se puedan alterar sin que se note. En cifras basta con añadir un cero o convertir un uno en un siete, mientras que las palabras «mil euros» no se cambian sin dejar rastro. Por eso los contratos, las facturas y los poderes repiten la cantidad en letras, y si las cifras y las letras no coinciden, prevalece la letra."
  - question: ¿Cómo funciona la conversión inversa?
    answer: "La página divide la cadena en numerales y órdenes de magnitud y los suma: «mil cuatrocientos cincuenta euros cincuenta céntimos» se convierte en 1450.50. La dirección se detecta sola: las cifras y las letras no se confunden, así que no hay nada que cambiar. Si aparece una palabra que no conocemos, la página la nombra en lugar de devolver en silencio un número equivocado."
  - question: ¿Por qué «cien» a veces y «ciento» otras?
    answer: "El español dice «cien» cuando el número es exactamente cien y «ciento» cuando viene algo detrás: ciento uno, ciento cincuenta. Es una regla propia del idioma que casi ningún conversor casero respeta, y basta para delatar que el texto lo escribió una máquina."
  - question: ¿Por qué no se dice «un mil»?
    answer: "Porque en español el millar no lleva «uno» delante: se dice «mil», no «un mil». En cambio el millón sí lo lleva: «un millón», «dos millones». Son dos reglas distintas y hay que aplicarlas por separado."
  - question: ¿Los cientos se forman sumando?
    answer: "No. Quinientos, setecientos y novecientos son palabras propias y no «cinco cientos» ni «siete cientos». Además cambian en femenino: «doscientas grivnas», «quinientas grivnas». Todo eso está contemplado."
  - question: ¿Qué hace el interruptor de género?
    answer: "Cambia la forma del numeral en texto simple: «uno» o «una», «veintiún» o «veintiuna». Hace falta al contar objetos. En modo moneda no se pregunta: el género lo aporta la propia moneda."
  - question: ¿Qué es el formato contable?
    answer: "Una escritura en la que los céntimos se quedan en cifras: «Cien euros 00 cts.» Es lo habitual en facturas y órdenes de pago, donde la parte decimal no se escribe con letras. El interruptor aparece en cuanto eliges una moneda."
  - question: ¿Hasta qué número se puede convertir?
    answer: "Hasta los cuatrillones, es decir dieciocho cifras. Más importante todavía: trabajamos con una cadena de dígitos y no con un número. Un número corriente en el navegador guarda enteros exactos hasta unos nueve cuatrillones y a partir de ahí redondea, con lo que la cantidad del documento saldría equivocada. Aquí eso no pasa con ninguna longitud."
  - question: ¿Se envían las cantidades a algún sitio?
    answer: "No. Todo se calcula en tu propio navegador. Ni las cantidades ni el texto de los contratos van a ningún servidor, no se guardan y no sobreviven al cierre de la pestaña."
related:
  - text-case-converter
  - punctuation-remover
  - word-frequency
---

## Qué hace

- **Cinco formatos** — texto simple, euros, dólares, rublos, grivnas
- **Género del numeral** — para contar objetos: una caja, veintiuna cajas
- **Céntimos en cifras** — la forma contable, «Cien euros 00 cts.»
- **Conversión inversa** — de letras a número, nombrando la palabra que no entienda

## Las reglas en las que se falla

«Cien» a secas, «ciento uno» con algo detrás. «Mil», nunca «un mil», pero sí «un millón». Quinientos, setecientos y novecientos son palabras propias y cambian en femenino: «doscientas grivnas».

Son justo los puntos donde se nota que la cantidad la escribió una máquina, así que los comprobamos uno por uno.

## Por qué trabajamos con una cadena de dígitos

Un número corriente en el navegador guarda enteros exactos hasta unos nueve cuatrillones y luego redondea. Para la cantidad de un contrato eso es inaceptable. Nosotros partimos la propia cadena en grupos de tres, así que la longitud da igual.
