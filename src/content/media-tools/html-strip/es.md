---
toolSlug: html-strip
locale: es
category: dev
tool: html-strip
title: Eliminar etiquetas HTML online — limpiar el código de un texto
h1: Eliminar etiquetas HTML
navName: Eliminar HTML
description: "Herramienta gratuita para limpiar HTML online. Quita etiquetas, atributos, estilos y scripts, convierte las entidades y no pega las palabras entre párrafos."
faq:
  - question: ¿Por qué es mejor que la limpieza habitual?
    answer: "Porque el código lo analiza el propio navegador y no una regla casera que borra todo lo que hay entre corchetes angulares. Esa regla se desmonta con código real: en una etiqueta con un atributo como title=\"precio < 5\" el primer signo dentro de las comillas corta la etiqueta donde no toca, así que parte del texto real desaparece y parte de la basura se queda."
  - question: ¿Se elimina el contenido de script y style?
    answer: "Sí, entero, con su código dentro. Es importante: si solo se recortan las etiquetas, al texto limpio se le cuelan líneas de programa y reglas de estilo. Se ve en muchas webs limpiadoras, donde el resultado acaba con trozos como «function» o «margin: 0 auto»."
  - question: ¿Qué pasa con entidades como &nbsp;?
    answer: "Vuelven a ser caracteres normales: &nbsp; pasa a espacio, &lt; a corchete angular y &amp; a ampersand. Lo hace el mismo análisis, sin un paso aparte. El espacio duro se sustituye además por uno normal, porque si no se quedaría invisible en el texto y rompería los saltos de línea."
  - question: ¿Por qué no se pegan las palabras entre párrafos?
    answer: "Porque antes de extraer el texto se insertan saltos de línea donde había párrafos, títulos, elementos de lista y etiquetas de salto. Sin eso, «<p>primero</p><p>segundo</p>» saldría como «primerosegundo», el fallo clásico de los limpiadores simples."
  - question: ¿Es seguro pegar aquí código ajeno?
    answer: "Sí. El código se analiza en un documento aparte, sin conexión con esta página: los programas de dentro no se ejecutan, las imágenes no se descargan y no sale ninguna petición. Aunque el código pegado lleve un script, se queda como texto muerto y luego se elimina."
  - question: ¿Qué hace el interruptor de direcciones de enlaces?
    answer: "Conserva la dirección junto al texto del enlace, entre paréntesis. Sirve cuando de un correo o una página hace falta llevarse no solo las palabras sino también adónde llevan. Viene desactivado porque en una limpieza normal las direcciones solo estorban."
  - question: ¿Se envía mi código a algún sitio?
    answer: "No. Todo ocurre en tu navegador. Ni el código original ni el texto resultante se envían a ninguna parte ni se guardan: la maquetación de tus clientes se queda contigo."
related:
  - remove-extra-spaces
  - text-case-converter
  - lorem-ipsum
---

Pega el código en el campo de arriba y el texto limpio aparece abajo al instante.

## Qué se elimina

- **Etiquetas y atributos** — todo el marcado
- **El contenido de script y style** — con su código, no solo las etiquetas
- **Entidades** — &nbsp; pasa a espacio, &lt; a corchete angular, &amp; a ampersand
- **Comentarios** — las notas de trabajo que quedan en el código

## Por qué lo analiza el navegador y no una regla

La regla «borrar todo lo que hay entre corchetes angulares» parece evidente y se desmonta en la primera página real. En una etiqueta con un atributo como `title="precio < 5"` el signo dentro de las comillas corta la etiqueta donde no toca: parte del texto real desaparece y parte de la basura se queda.

El navegador analiza el código con las reglas de verdad del lenguaje. Lo hace en un documento aparte, sin conexión con esta página, así que el código de cualquier procedencia es seguro: los scripts no se ejecutan, las imágenes no se descargan y no sale ninguna petición.

## Las palabras no se pegan

Tomar el texto sin más convierte `<p>primero</p><p>segundo</p>` en «primerosegundo». Aquí los párrafos, los títulos, los elementos de lista y las etiquetas de salto se convierten en saltos de línea: eso es lo que controla el interruptor de arriba.
