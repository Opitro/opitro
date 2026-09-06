---
toolSlug: markdown-html
locale: es
category: dev
tool: markdown-html
title: Conversor de Markdown a HTML online — Traducir HTML a Markdown
h1: Conversor de formatos Markdown y HTML
navName: Markdown ↔ HTML
description: "Herramienta profesional para convertir Markdown a HTML y viceversa online. Transforma documentación de GitHub en código HTML limpio de forma 100% local."
faq:
  - question: ¿En qué se diferencia Markdown de HTML?
    answer: "Markdown es una notación breve pensada para personas: **negrita**, # título, - lista. Se puede leer y editar como texto corriente sin abrir un editor de código, y por eso en él se escriben los README, las notas y los artículos. HTML es un lenguaje para el navegador: lo mismo se escribe con etiquetas emparejadas, pero se les pueden añadir clases, atributos y estilos. Markdown sabe hacer bastante menos, y esa es su fuerza: no hay nada que romper. La conversión de Markdown a HTML es inequívoca; la inversa no lo es."
  - question: ¿Por qué la conversión inversa pierde el formato?
    answer: "Porque a Markdown le falta aquello en lo que HTML es rico. Clases, tablas anidadas, atributos arbitrarios, maquetación en columnas: no hay manera de escribirlos. Al pasar una página a Markdown se conserva inevitablemente el sentido —títulos, listas, enlaces, énfasis— y se pierde la presentación. No es un fallo de la herramienta sino una propiedad del formato. Si hay que trasladar la maquetación con exactitud, Markdown no es el formato: quédese con el HTML."
  - question: ¿Para qué limpiar las etiquetas al convertir desde HTML?
    answer: "El texto copiado del sitio de otro o de un editor suele venir atiborrado de maquetación de servicio: envoltorios div y span, estilos en línea, bloques invisibles. Sin limpieza se trasladan al Markdown como HTML en bruto y no sale ningún texto «limpio». La limpieza conserva solo las partes con sentido —títulos, párrafos, listas, enlaces, tablas— y descarta lo demás. Además mostramos qué se descartó y cuántas veces, en lugar de quitarlo en silencio."
  - question: ¿Cómo funciona la limpieza y se puede confiar en ella?
    answer: "Funciona a partir de una lista de lo PERMITIDO, no de lo prohibido. Recortar «todo lo peligroso» no puede funcionar: esa lista es infinita —primero script, luego los manejadores de eventos, luego javascript: en un enlace, luego data: con marcado dentro—. Conservamos solo las etiquetas y atributos nombrados de antemano, así que un truco nuevo no aporta nada: no está en la lista. El marcado lo lee el propio navegador y no una búsqueda de texto, de modo que no se le engaña con entradas retorcidas como «scr<script>ipt». Pero esta limpieza tiene un límite: no sustituye la comprobación en el servidor. Si el texto ajeno llega a su sitio, hay que limpiarlo donde se guarda."
  - question: ¿Es segura la vista previa si pego HTML de otra persona?
    answer: "Sí, y no se resuelve con una casilla. La vista previa se ejecuta siempre en un marco cerrado aparte donde la ejecución está prohibida por completo: sea lo que sea que haya en el marcado, allí no se ejecutará ni podrá alcanzar la propia página. La casilla de limpieza gobierna únicamente el texto que usted se lleva. Hacer conmutable la ejecución de scripts ajenos sería un error: al desmarcarla una vez, uno tendría código de otro funcionando junto a sus propios datos."
  - question: ¿Los textos se envían a alguna parte?
    answer: "No. Los README, los artículos y la documentación se analizan en la memoria de la pestaña; la página no hace ninguna petición de red. El analizador se descarga una sola vez con la primera pulsación y luego funciona sin red."
related:
  - json-formatter
  - html-strip
  - text-diff
---

Pegue el texto y tanto la conversión como la vista previa aparecen al instante. Cambiar de dirección devuelve el resultado anterior al campo de entrada, que es la manera cómoda de comprobar la ida y vuelta.

## Empiece por la dirección

Markdown → HTML hace falta cuando el texto está escrito para personas pero tiene que entrar en una plantilla, un correo o un sistema que solo entiende etiquetas. HTML → Markdown es la tarea contraria: llevar una página terminada a un README, a una base de conocimiento o a un editor donde las etiquetas están de más. La segunda dirección es la difícil, y el resultado casi siempre pide un repaso a mano.

## Mejor no desactivar la limpieza

La casilla no está de adorno. El texto de un editor ajeno arrastra la maquetación de ese editor: envoltorios vacíos, estilos invisibles, enlaces a sus imágenes. Todo eso pasa al Markdown como HTML en bruto y se queda ahí para siempre. Solo hay un caso para desactivar la limpieza: cuando sabe con certeza que el original no tiene nada sobrante y quiere conservar las etiquetas tal cual.

## Júzguelo por la vista previa, no por el código

Leer líneas de etiquetas cansa y no sirve: una lista perdida o un título descolocado son casi invisibles en el código y evidentes en la vista previa. Esta la dibuja un navegador de verdad dentro de un marco cerrado, así que se ve exactamente como se verá para su lector.
