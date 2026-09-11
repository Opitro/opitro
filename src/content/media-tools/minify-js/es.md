---
toolSlug: minify-js
locale: es
category: dev
tool: minify-js
title: Minificador JS online — Comprimir código JavaScript y optimizar scripts
h1: Minificador de código JavaScript (JS)
navName: Minificador JS
summary: "Encoger el script y acortar los nombres"
description: "Herramienta profesional para minificar y comprimir código JavaScript online. Elimina espacios en blanco, comentarios y reduce variables de forma 100% local."
faq:
  - question: ¿Qué diferencia hay entre minificar sin más y acortar los nombres?
    answer: "Minificar sin más quita el formato: espacios sobrantes, saltos de línea, comentarios. La lógica y los nombres se quedan como estaban. Acortar los nombres —lo que suele llamarse mangling— es un trabajo de otro orden: la herramienta analiza el código en un árbol, halla el ámbito de cada variable y sustituye los nombres largos y legibles por letras sueltas. <code>userAge</code> pasa a ser <code>a</code>. En archivos grandes de ahí sale casi todo el ahorro, y además vuelve el código incómodo de leer para un tercero, aunque llamarlo ofuscación sería excesivo: la lógica se ve igual, solo cuesta más seguirla."
  - question: ¿Por qué una biblioteca ajena para JavaScript si para HTML y CSS escribieron la suya?
    answer: "Porque el coste de un error es distinto. En el marcado y los estilos una compresión mal hecha se ve a simple vista: palabras pegadas, sangrías perdidas. En JavaScript queda invisible hasta el momento en que a un usuario deja de funcionarle un botón. Acortar nombres exige conocer con exactitud el ámbito de cada variable; si no, no se distingue el nombre propio del ajeno. Eso no se resuelve con sustituciones por patrón, solo con un análisis real en forma de árbol. Tomamos Terser, el mismo que llevan dentro los empaquetadores de proyectos reales. Pesa 170 KB y se carga solo al pulsar el botón: hasta entonces la página se mantiene ligera."
  - question: ¿Puede el acortado de nombres romper código que funciona?
    answer: "El suyo no: el análisis en árbol garantiza que solo se renombra lo declarado dentro de su propio ámbito. <code>window.algo</code>, <code>document.title</code> y todo lo que llega de fuera queda intacto. Puede romperse en dos casos, ambos relacionados con que el código consulte nombres por su cuenta. Primero: <code>eval</code>, o acceder mediante un nombre construido como cadena; el nombre acortado ya no estará allí. Segundo: comprobaciones del tipo <code>fn.name === 'manejador'</code>; el nombre cambió y la comprobación falla. En ambos casos desmarque la casilla: el archivo saldrá mayor, pero el comportamiento no cambiará."
  - question: ¿Qué ocurre ante un error de sintaxis?
    answer: "La herramienta se detiene y señala el lugar: la línea y la columna donde el análisis tropezó. La pestaña no se congela y la salida no se estropea: usted recibe un mensaje, no medio archivo roto. No es un apaño nuestro: el número de línea viene del mismo análisis que construye el árbol, así que apunta al sitio real y no a uno aproximado."
  - question: ¿La minificación cambia solo el formato o también el código?
    answer: "También el código, y conviene saberlo de antemano. El analizador pliega lo que puede calcularse por adelantado y descarta lo inalcanzable: <code>(price * quantity) * (1 + 0.2)</code> se convierte en <code>price*quantity*1.2</code>. El comportamiento no varía: los valores por omisión de Terser son deliberadamente prudentes y no hacen nada que pueda alterar el funcionamiento del programa. Pero si compara la salida con el original línea a línea, prepárese para ver algo más que espacios eliminados."
  - question: ¿Mi código va a algún servidor?
    answer: "No. El análisis ocurre en la memoria de la pestaña y la página no hace ni una sola petición de red: incluso la biblioteca de análisis se sirve desde este mismo sitio y no desde la red de otro. La lógica de sus aplicaciones y los algoritmos que prefiere no enseñar no salen a ninguna parte."
related:
  - minify-html
  - minify-css
  - escape-unescape
---

Pegue su código y pulse el botón. La fila de arriba lleva a los vecinos: el minificador de HTML y el de CSS.

## Por qué aquí trabaja un analizador de verdad

Para el marcado y los estilos escribimos nuestro propio analizador: allí una compresión mal hecha se ve a simple vista. Para JavaScript eso no vale. Acortar nombres exige conocer el ámbito de cada variable: cuál se declara aquí y cuál llegó de fuera. Sin un árbol no se distingue lo uno de lo otro, y renombrar rompe el código en silencio; no al comprimir, sino después, en manos del usuario.

Por eso aquí trabaja Terser, el mismo analizador que llevan los empaquetadores de proyectos reales. Se carga solo al pulsar el botón: 170 KB, una vez por visita.

## Qué obtendrá

El ejemplo del encargo muestra los dos tipos de trabajo a la vez:

```
function calculateTotal(price, quantity) {
    // Impuesto
    let taxRate = 0.2;
    return (price * quantity) * (1 + taxRate);
}
```

se convierte en

```
function calculateTotal(t,a){return t*a*1.2}
```

Fuera los espacios y el comentario, acortados los nombres y, de paso, plegada la aritmética que puede resolverse por adelantado: `1 + 0.2` pasó a `1.2` y la variable intermedia desapareció por innecesaria. El nombre de la función se mantuvo: está declarada hacia fuera, y renombrarla cortaría el vínculo con quien la llama.

## Cuándo conviene desactivar el acortado de nombres

Cuando el código consulta sus propios nombres: accede mediante `eval`, arma un nombre como cadena o compara `fn.name`. Desmarque entonces la casilla: el resultado pesa más, pero el comportamiento no cambia.
