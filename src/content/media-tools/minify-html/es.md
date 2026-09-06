---
toolSlug: minify-html
locale: es
category: dev
tool: minify-html
title: Minificador HTML online — Comprimir código HTML
h1: Minificador de código HTML
navName: Minificador HTML
description: "Herramienta profesional para minificar y comprimir código HTML online. Elimina espacios en blanco, saltos de línea y comentarios de forma 100% local para optimizar tu web."
faq:
  - question: ¿Por qué no basta con quitar todos los saltos de línea?
    answer: "Porque en el marcado el espacio entre etiquetas a veces es hueco vacío y a veces es un carácter real que se ve en pantalla. Entre elementos de bloque —<div>, <p>, <li>— puede irse del todo y no cambia nada. Entre elementos en línea, no: de «<b>dos</b> <i>palabras</i>» saldría «dospalabras». Así es exactamente como se rompen las páginas tras ser «optimizadas» por herramientas simples, y no se nota enseguida sino cuando alguien lee el sitio terminado. Nuestro minificador mira qué etiquetas hay a ambos lados del espacio y solo lo elimina cuando las dos son de bloque."
  - question: ¿Cuánto se reduce realmente el archivo?
    answer: "Depende de cómo esté escrito. El marcado escrito a mano, con sangrías de cuatro espacios y comentarios, adelgaza entre un 20% y un 40%. El marcado que sale de un empaquetador pierde unos pocos por ciento, porque apenas le sobra nada. Lo comprobamos en veinticuatro páginas terminadas de este sitio: salió entre 1,6% y 4,6%, y esa es la cifra honesta para código ya construido. Las promesas de «hasta un 50% de compresión» suelen medirse sobre un ejemplo deliberadamente descuidado."
  - question: ¿Puede la minificación romper la maquetación?
    answer: "Puede, si el minificador es descuidado. Hay tres puntos peligrosos: el espacio entre elementos en línea, el contenido de <pre> y <textarea> donde cada carácter cuenta, y los comentarios condicionales para versiones antiguas de Internet Explorer, que parecen notas corrientes pero en realidad dan instrucciones al navegador. Los tres los respetamos. Lo comprobamos haciéndolo, no razonándolo: veinticuatro páginas del sitio se minificaron y se dibujaron en dos ventanas a la vez; coincidieron el texto en pantalla, el árbol de elementos y los estilos calculados de cada nodo, unos 4700 nodos en total."
  - question: ¿Qué pasa con los <style> y <script> internos?
    answer: "Con la casilla marcada, el contenido de <style> pasa por nuestro minificador de CSS y el de <script> por un analizador real de JavaScript. Los scripts con otro tipo —<script type=\"application/json\"> y las plantillas— solo se recortan por los bordes; dentro no entramos. Eso son datos, no código, y un analizador de JavaScript los rechazaría."
  - question: ¿Por qué no quitan las comillas de los valores ni las etiquetas de cierre?
    answer: "Porque la ganancia son unos pocos bytes y se rompe ante la primera construcción poco común. Un valor solo puede ir sin comillas si no contiene espacios, comillas, signos igual, ángulos ni apóstrofos, y comprobarlo con fiabilidad cuesta más que los dos caracteres ahorrados. Las etiquetas de cierre opcionales son peor: las reglas para omitirlas ocupan varias páginas del estándar, y un error ahí cambia la estructura del documento. Preferimos que siga funcionando."
  - question: ¿Mi código va a algún servidor?
    answer: "No. El análisis ocurre en la memoria de la pestaña y la página no hace ni una sola petición de red. Importa más de lo que parece: las plantillas de paneles de control, de sistemas internos y de temas comerciales son justo el trabajo por el que le pagan, y no tienen por qué acabar en los registros de otro."
related:
  - minify-css
  - minify-js
  - html-strip
---

Pegue su marcado y pulse el botón. La fila de arriba lleva a los vecinos: el minificador de CSS y el de JavaScript.

## Qué se va y qué se queda

Se van: los comentarios, los espacios y saltos sobrantes, los valores de atributo redundantes (`disabled="disabled"` pasa a `disabled`) y el obsoleto `type="text/javascript"` de los scripts. Los estilos y scripts internos se comprimen con los mismos motores que funcionan en las páginas vecinas.

Se queda todo lo que lleva significado: el contenido de `<pre>` y `<textarea>` hasta el último espacio, los comentarios condicionales para versiones antiguas de Internet Explorer, las comillas de los valores y todas las etiquetas de cierre.

## La única sutileza de verdad: el espacio entre etiquetas

Aquí es donde se separan la herramienta cuidadosa y la descuidada. El espacio entre `</div>` y `<p>` no se dibuja, así que puede irse. El espacio entre `</b>` y `<i>` sí se dibuja, y sin él dos palabras se funden en una. La diferencia no está en cuánto espacio hay, sino en qué etiquetas lo rodean.

Mantenemos una lista de elementos en línea y miramos a ambos vecinos. El espacio desaparece solo cuando los dos son de bloque. En los demás casos se reduce a uno, pero se queda.

## Cómo se ha comprobado

Contrastándolo con el navegador, no razonándolo. Veinticuatro páginas terminadas de este sitio se minificaron, y después el original y la versión minificada se dibujaron en dos ventanas a la vez. Se compararon tres cosas: el texto visible en pantalla, el árbol de elementos y los estilos calculados de cada nodo, unos 4700 nodos. Coincidió todo. Y se comprobó aparte que el juez no duerme: si se funden dos palabras a propósito, lo detecta.
