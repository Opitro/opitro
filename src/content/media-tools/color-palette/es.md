---
toolSlug: color-palette
locale: es
category: dev
tool: color-palette
title: Generador de paletas de colores online — Crear esquemas de color formales
h1: Generador de paletas de colores
navName: Generador de paletas
description: "Herramienta profesional para generar paletas y esquemas de colores online. Crea combinaciones armónicas (monocromáticas, triadas, complementarias) para diseño web y CSS de forma local."
faq:
  - question: ¿Cómo ayudan las reglas de armonía cromática al diseñar una interfaz?
    answer: "Cada regla resuelve un problema distinto. La complementaria toma el punto opuesto del círculo: ese es el botón que destaca sobre el tono principal, el que se supone que hay que pulsar. La análoga escoge vecinos: una serie suave para fondos, paneles y transiciones, donde el contraste solo estorbaría. La tríada da tres colores independientes que no se pelean entre sí, y va bien allí donde hay muchos elementos que distinguir: barras de un gráfico, etiquetas, estados de tareas. La monocromática es un solo tono en distintas luminosidades: aspecto sobrio y una fuente cómoda de matices para el paso del ratón, la pulsación y el estado desactivado."
  - question: ¿En qué formato conviene exportar la paleta?
    answer: "Las variables CSS son el camino más directo: pega el bloque en :root y los colores de toda la página se gobiernan desde un único sitio. El JSON hace falta cuando la paleta la recoge no el navegador sino la compilación: un tema de Tailwind, un objeto de tema en una aplicación React o Vue, la configuración de un sistema de diseño. Damos ambos con una pulsación, y en el JSON incluimos además el color base y el nombre de la regla, para que más tarde se vea de dónde salió la paleta."
  - question: ¿Por qué cinco muestras si una pareja complementaria son dos colores?
    answer: "Porque cinco resulta más manejable, y dos colores todavía no son una paleta. Pero hacer pasar matices por una regla sería deshonesto, así que bajo cada muestra pone qué es: «base», «opuesto, 180°», «más claro», «más oscuro». La regla de verdad da dos colores en el esquema complementario y tres en la tríada; el resto son matices del mismo tono. Así se ve dónde acaba el cálculo y dónde empieza el relleno."
  - question: ¿Por qué la etiqueta de la muestra unas veces es negra y otras blanca?
    answer: "Se elige por cálculo, no a ojo: calculamos la luminancia relativa tal como la definen las reglas de accesibilidad, donde el componente verde pesa casi tres cuartas partes y el azul siete centésimas, porque así funciona la vista. El truco habitual de sumar R, G y B y compararlo con la mitad se equivoca en los colores saturados. Comprobamos la elección en 60 000 colores aleatorios: la etiqueta siempre es la más contrastada, y aun en el peor caso su contraste es 4,58 frente a un umbral de 4,5."
  - question: ¿Qué hace la tecla Espacio?
    answer: "Genera una paleta aleatoria, una costumbre que los diseñadores conocen de otros selectores. El color aleatorio no es del todo aleatorio: la saturación se mantiene entre el 45 % y el 95 %, y la luminosidad entre el 35 % y el 65 %. No es cuestión de belleza sino de sentido: con un color casi gris un desplazamiento de tono no cambia nada y las cinco muestras salen iguales, y con uno muy oscuro la escalera de luminosidad se pierde en el negro."
  - question: ¿Los colores se envían a alguna parte?
    answer: "No. Todo el trabajo es aritmética sobre un círculo cromático, ocurre dentro de la pestaña y la página no hace ninguna petición de red. Los colores corporativos que no puede enseñar a terceros aquí no se le enseñan a nadie."
related:
  - color-converter
  - favicon-generator
  - qr-code
---

Fije una base —con el cuentagotas o escribiendo el código— y elija una regla. La barra espaciadora da una paleta aleatoria. Bajo cada muestra se indica qué relación guarda con la base.

## Por dónde empezar

No empiece por un color que le guste, sino por el que ya tiene: el del logotipo, el de los enlaces de la versión antigua del sitio, un matiz sacado de una fotografía. Péguelo en el campo y la paleta se construirá a su alrededor, con la base intacta en la fila tal como la introdujo. A partir de ahí es más fácil recorrer reglas que matices: el mismo valor en cuatro esquemas da cuatro estados de ánimo distintos.

## Lo que el cálculo no hará por usted

La regla dice dónde está el segundo color en el círculo, pero no cuánto usar de él. La proporción habitual es que el tono principal ocupe la mayor parte y el secundario aparezca en puntos concretos: un botón, un subrayado, un icono. Reparta los dos a partes iguales y hasta una pareja impecable sobre el papel empezará a pelearse consigo misma.

## Compruébelo sobre texto real

Las muestras convencen porque son grandes. Antes de llevar la paleta a la maqueta, mire el color allí donde va a vivir: una línea fina, un pie de foto de doce píxeles, un icono sobre blanco. Un color magnífico como franja a toda altura resulta a menudo ilegible en texto pequeño, y eso no es un defecto de la paleta sino la diferencia entre un relleno y unas letras.
