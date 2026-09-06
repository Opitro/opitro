---
toolSlug: contrast-checker
locale: es
category: dev
tool: contrast-checker
title: Verificador de contraste de color online — Validador WCAG AA y AAA
h1: Verificador de contraste de color (WCAG)
navName: Verificador de contraste
description: "Herramienta profesional para verificar el contraste entre el texto y el fondo online. Comprueba la accesibilidad web según las pautas WCAG de forma 100% local."
faq:
  - question: ¿Qué es la relación de contraste y cómo se calcula?
    answer: "Es la relación entre la luminancia del color más claro y la del más oscuro en la pareja texto-fondo. No se calcula sumando R, G y B, sino a partir de la luminancia relativa: cada canal se linealiza primero (una pantalla no muestra el color de forma lineal) y luego se pondera —el verde aporta casi tres cuartas partes y el azul siete centésimas, porque así funciona la vista—. Los valores van de 1:1, cuando texto y fondo coinciden, a 21:1 en el negro sobre blanco. Nuestro cálculo está contrastado con los números de la propia documentación WCAG: el gris #777777 sobre blanco da 4,478 y NO supera el umbral de 4,5, mientras que #767676 sí."
  - question: ¿En qué se diferencian los niveles AA y AAA?
    answer: "Son dos grados de exigencia. AA es el listón aceptado para sitios comerciales y de la Administración: 4,5:1 para texto normal y 3:1 para texto grande. AAA es más estricto: 7:1 y 4,5:1. Detrás de las cifras hay agudeza visual: el 4,5 apunta a una visión de en torno a 20/40 —el deterioro habitual con la edad, sin contar gafas— y el 7 a unos 20/80. Exigir AAA en todo un sitio no suele ser necesario ni siempre posible; se reserva para donde se sabe que los lectores están en peores condiciones."
  - question: ¿Qué texto cuenta como grande?
    answer: "A partir de 18pt, es decir unos 24 píxeles, o de 14pt si la letra es negrita, alrededor de 18,7 píxeles. Todo lo menor cuenta como texto normal, y su umbral es 4,5, no 3. Aquí se resbala fácil: un titular de 20 píxeles parece grande, pero según las reglas es texto normal y se le exige más."
  - question: ¿Y si el texto o el fondo tienen transparencia?
    answer: "No se puede medir un color transparente: la relación está definida para dos colores sólidos. Averigüe primero qué color resulta realmente sobre el soporte de debajo: un blanco a media transparencia sobre gris produce un gris perfectamente definido, y ese es el que hay que comprobar. Si mete el color transparente tal cual, el número saldrá más bonito que la verdad y en la página real el texto será peor de lo que prometía la comprobación."
  - question: ¿Se puede confiar en ese número a ciegas?
    answer: "A ciegas no. Las propias pautas lo reconocen: la fórmula se lleva mal con los fondos oscuros, y una pareja que cumple con holgura puede verse peor que una clara que aprueba por los pelos. La próxima edición lo calculará de otro modo, por el método APCA. Pero hoy 4,5 es lo que piden los clientes y comprueban las auditorías, así que es lo que calculamos, y al lado mostramos texto real sobre el fondo real para que juzgue también con sus ojos."
  - question: ¿Los colores se envían a alguna parte?
    answer: "No. La comprobación es aritmética dentro de la pestaña; la página no hace ninguna petición de red. Los colores corporativos y las maquetas que no puede enseñar a terceros aquí no se le enseñan a nadie."
related:
  - color-converter
  - color-palette
  - favicon-generator
---

Fije el color del texto y el del fondo: la relación, los niveles y la muestra en vivo se recalculan al instante. El botón entre los campos intercambia ambos colores.

## Qué hacer cuando no cumple

El primer impulso —oscurecer el texto— no siempre es el mejor. A menudo sale más barato retocar el fondo: la superficie que hay tras el texto suele ocupar más área y cambia de forma menos llamativa que las propias letras, sobre todo si las letras son de marca. El segundo camino es el tamaño: a partir de 24 píxeles el umbral baja de 4,5 a 3, de modo que una pareja que suspende para un pie de foto aprueba sin problemas para un titular.

## Dónde importa más el contraste

No en los titulares. El texto grande casi siempre se lee; donde la gente tropieza es en lo pequeño: los rótulos de los campos, las aclaraciones en gris, las opciones de menú desactivadas, el texto de las tablas. Capítulo aparte son los iconos y los contornos de los campos de entrada: a ellos también se les aplica el umbral de 3:1, y es el que más se olvida, aunque un borde invisible estorba tanto como un rótulo pálido.

## Compruebe la pareja, no el color

El contraste es una propiedad de la pareja, no de un color aislado. El mismo gris puede ser impecable sobre blanco e inservible sobre el gris claro de una tarjeta. Por eso hay que comprobar cada combinación real de la maqueta y no «nuestro gris principal» en abstracto: el botón sobre blanco, el mismo botón sobre un panel, el mismo botón al pasar el ratón.
