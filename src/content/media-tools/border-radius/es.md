---
toolSlug: border-radius
locale: es
category: dev
tool: border-radius
title: Generador de border-radius CSS online — Vista previa de esquinas redondeadas
h1: Generador de border-radius CSS
navName: "Generador de esquinas redondeadas"
summary: "Ajuste las esquinas y llévese el CSS"
description: "Herramienta profesional para configurar border-radius online. Diseña esquinas redondeadas simples y elípticas complejas con generación de código CSS instantánea."
faq:
  - question: ¿Qué significa la barra en la propiedad border-radius?
    answer: "Separa dos conjuntos de radios. Cada esquina tiene en realidad dos: uno a lo ancho y otro a lo alto. Antes de la barra van los radios horizontales de las cuatro esquinas y después los verticales. Mientras coinciden, el segundo grupo se omite y la línea queda corta. En cuanto se separan, la esquina deja de ser parte de una circunferencia y pasa a ser parte de una elipse. De esos pares es de donde salen las formas «líquidas» para avatares y fondos decorativos: ocho números en lugar de cuatro."
  - question: ¿Píxeles o porcentajes?
    answer: "Los píxeles dan la misma esquina sea cual sea el tamaño del elemento: ocho píxeles son ocho en un botón pequeño y en un banner ancho. Los porcentajes se miden contra el propio elemento: los radios horizontales contra su anchura y los verticales contra su altura. Por eso border-radius: 50% convierte un cuadrado en círculo y un rectángulo alargado en óvalo. Para botones y tarjetas se suelen usar píxeles, para que la esquina no cambie al estirarse; para avatares y figuras decorativas, porcentajes."
  - question: ¿Por qué con valores altos la forma deja de cambiar?
    answer: "Porque el navegador reduce los radios por su cuenta cuando no caben. La regla es sencilla: si los dos radios de un lado suman más que la longitud de ese lado, TODOS los radios se multiplican por un mismo factor para que quepan. De ahí el efecto que despista a tanta gente: ponga el 100 % en todas las esquinas y no obtendrá «esquinas muy redondas» sino un óvalo liso, y a partir de ahí los deslizadores apenas cambian nada. Lo decimos abiertamente y mostramos cuánto ha comprimido el navegador sus valores."
  - question: ¿En qué orden van las esquinas?
    answer: "En sentido horario desde la superior izquierda: arriba izquierda, arriba derecha, abajo derecha, abajo izquierda. Es fácil equivocarse porque otras propiedades de CSS usan otro orden. El relleno y los bordes cuentan desde el lado superior —arriba, derecha, abajo, izquierda—, es decir, desde los lados y no desde las esquinas. Aquí son esquinas, y la primera es la superior izquierda."
  - question: ¿Cómo hago un círculo perfecto?
    answer: "Poniendo el 50 % en las cuatro esquinas y procurando que el elemento sea cuadrado. Si la anchura y la altura difieren, la misma línea da un óvalo: no es un fallo sino ese mismo cálculo relativo al tamaño. Para un círculo cuyas dimensiones no se conocen de antemano, lo habitual es forzar anchura y altura iguales en vez de fiarlo todo al radio."
  - question: ¿Se envía algún dato a alguna parte?
    answer: "No. Todo el trabajo consiste en armar una cadena y dejar que el navegador la dibuje, y ocurre dentro de la pestaña. La página no hace ninguna petición de red."
related:
  - box-shadow
  - css-gradient
  - color-converter
---

Mueva los deslizadores y tanto la forma como el código cambian al instante. En el modo avanzado cada esquina gana un segundo eje, y de cuatro números salen ocho.

## Empiece con las esquinas enlazadas

La casilla «todas las esquinas iguales» está marcada por algo: nueve de cada diez veces se quiere el mismo radio en todas, y es más cómodo buscarlo con un solo deslizador. Separar las esquinas merece la pena cuando significa algo: redondear solo las dos de arriba en la cabecera de una tarjeta, por ejemplo, o solo las de la izquierda en una pestaña pegada a su vecina.

## El modo avanzado no es para botones

Ocho radios distintos dan una forma «líquida», y en un botón se lee como un error casual. Su sitio está donde la forma es en sí misma un adorno: el fondo de una ilustración, un avatar, una mancha detrás de un titular. El botón de forma aleatoria entrega una ya hecha: elegir ocho números a ciegas es tarea perdida, y es más fácil partir de algo decente y retocarlo.

## Compruébelo al tamaño real

El redondeo en porcentajes cambia junto con el elemento, y una forma bonita en la vista previa puede verse distinta en su sitio, sobre todo si el bloque se estira a lo ancho de la pantalla. Si la forma debe seguir igual a cualquier tamaño, use píxeles; si debe estirarse con el bloque, porcentajes. Es la única decisión de esta página que no puede tomarse a ojo.
