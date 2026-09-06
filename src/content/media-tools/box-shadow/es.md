---
toolSlug: box-shadow
locale: es
category: dev
tool: box-shadow
title: Generador de box-shadow CSS online — Crear sombras de sombreado web
h1: Generador de sombras box-shadow CSS
navName: Generador de sombras
description: "Herramienta profesional para crear sombras box-shadow online. Ajusta el desplazamiento, desenfoque, propagación y color para obtener códigos CSS listos para producción."
faq:
  - question: ¿De qué se encargan el desenfoque y la propagación?
    answer: "El desenfoque suaviza el borde de la sombra. A cero la sombra calca el objeto, como recortada en papel; cuanto mayor es el valor, más ancha es la franja en la que la sombra se desvanece. La propagación cambia el tamaño de la sombra antes del desenfoque: en positivo la infla en todas direcciones alejándola del objeto, en negativo la recoge hacia dentro. Un truco que conviene conocer: una propagación algo negativa junto con mucho desenfoque da una sombra recogida bajo el objeto en lugar de esparcida a su alrededor, que es justo el aspecto de la sombra de una tarjeta apoyada en una mesa."
  - question: ¿Cómo hago una sombra que no parezca una pegatina?
    answer: "Con capas. La sombra real es nítida junto al objeto y se vuelve más difusa y débil al alejarse; con una sola capa no se puede expresar eso y hay que elegir entre nítida y difusa. Por eso se apilan varias: una capa cercana con poco desenfoque sostiene el contorno, y las lejanas, muy desenfocadas y con opacidad decreciente, aportan la difusión. Lo importante es que la opacidad caiga más deprisa de lo que crece el desenfoque: si todas las capas tienen la misma, la sombra sale sucia. El botón «sombra suave lista» coloca tres capas así de golpe, y luego se editan como cualquier otra."
  - question: ¿Influye el orden de las capas?
    answer: "Sí. La primera capa de la lista se dibuja sobre las demás. Con capas negras idénticas no se nota, pero póngalas de distinto color o marque una como interior y reordenarlas cambia la imagen aunque los números sigan siendo los mismos. El orden del código es el mismo que el de la lista en la página."
  - question: ¿En qué se diferencia una sombra interior?
    answer: "La sombra normal cae hacia fuera, más allá de los bordes del elemento, y da la impresión de que está elevado. La interior se dibuja por dentro, a lo largo de sus bordes, y el objeto parece hundido. Las sombras interiores suelen ir en los campos de entrada y los interruptores, en todo lo que debe leerse como un rebaje. En una sombra interior la propagación funciona al revés: un valor positivo la engrosa hacia dentro."
  - question: ¿Por qué desaparece o se recorta mi sombra?
    answer: "Casi siempre por un overflow: hidden en algún elemento padre. La sombra no ocupa sitio en la maqueta —se pinta sobre sus vecinos y no los aparta, al contrario que un borde—, así que un padre al que se le ha dicho que recorte todo lo que sobresalga recortará también la sombra. El segundo caso es que la sombra se meta bajo un elemento vecino que queda por encima en el orden de apilamiento. Y el tercero, el más simple: la sombra es negra sobre fondo oscuro y sencillamente no se ve."
  - question: ¿Las sombras ralentizan la página?
    answer: "Normalmente no, pero un desenfoque grande en muchos elementos a la vez sale caro al desplazarse, porque el navegador recalcula el desenfoque de cada uno. Se nota en listas de cientos de filas donde cada tarjeta lleva sombra. Si ocurre, reduzca el desenfoque o deje la sombra solo en aquello que de verdad deba parecer elevado."
  - question: ¿Se envía algún dato a alguna parte?
    answer: "No. Todo el trabajo consiste en armar una cadena y dejar que el navegador la dibuje, y ocurre dentro de la pestaña. La página no hace ninguna petición de red."
related:
  - css-gradient
  - color-converter
  - color-palette
---

Mueva los deslizadores y tanto la muestra como el código cambian al instante. Las capas se apilan en una lista: cada una muestra su propio fragmento de código, y al pulsar una se selecciona para editarla.

## El fondo aquí es claro a propósito

Una sombra es casi siempre negra y semitransparente. Sobre fondo oscuro sencillamente no se ve, y estaría ajustándola a ciegas. Por eso el panel de vista previa es claro aunque el resto del sitio sea oscuro: una herramienta tiene que enseñar lo que se está ajustando, no verse uniforme a cualquier precio.

## Empiece con una capa y añada el resto después

Primero acierte con la dirección y el tamaño: unos pocos píxeles de desplazamiento hacia abajo, un desenfoque del doble y una opacidad de alrededor de un tercio. Eso ya es una sombra decente. Las capas sirven cuando quiera que el objeto parezca elevado de verdad, pero añadirlas sobre una base mala no lleva a ninguna parte: tres capas malas no son mejores que una.

## El desplazamiento lateral hace falta menos de lo que parece

En las interfaces se da por hecho que la luz viene de arriba, así que la sombra va hacia abajo y de lado apenas o nada. Un desplazamiento horizontal visible se lee de inmediato como «sol de costado» y obliga a que todas las demás sombras de la página se comporten igual. Es más fácil dejar el desplazamiento lateral a cero y encargar el trabajo al vertical y al desenfoque.
