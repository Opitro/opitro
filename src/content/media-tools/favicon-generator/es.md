---
toolSlug: favicon-generator
locale: es
category: dev
tool: favicon-generator
title: Generador de favicon online — Convertir imagen a ICO y PNG para web
h1: Generador de favicon desde imagen
navName: Generador de favicon
description: "Herramienta profesional para crear favicons online. Convierte imágenes PNG, JPG o SVG en formatos ICO y paquetes completos de iconos web de forma local e instantánea."
faq:
  - question: ¿Para qué sirve el archivo favicon.ico si los navegadores modernos admiten PNG?
    answer: "Los navegadores modernos leen perfectamente .png e incluso .svg vectorial. Pero además, navegadores y rastreadores piden /favicon.ico en la raíz del sitio por su cuenta, aunque el código de la página no diga nada de él: es una costumbre heredada de los noventa. Si el archivo no está, cada una de esas peticiones se convierte en un error 404 más en el registro del servidor. No frena el sitio de forma apreciable, pero ese ruido dificulta encontrar los fallos de verdad, y algunos programas antiguos no entienden nada que no sea .ico. Nosotros metemos tres capas en un solo .ico: 16, 32 y 48 píxeles."
  - question: ¿Es seguro subir aquí un logotipo que no puedo enseñar a terceros?
    answer: "Aquí no corre ningún riesgo, y por un motivo concreto. La mayoría de los conversores funcionan así: el archivo viaja a su servidor, allí lo recortan y le devuelven un enlace al resultado; es decir, su logotipo ha estado en el disco de otro. Este funciona de otra manera: la imagen se lee dentro de la propia pestaña, la redimensiona el lienzo del navegador y el archivo comprimido se monta ahí mismo. No se hace ni una sola petición de red — puede comprobarlo usted mismo en la pestaña «Red» de las herramientas de desarrollo. La página sigue funcionando con internet desconectado, una vez cargada."
  - question: ¿De qué tamaño debe ser la imagen de origen?
    answer: "Cuadrada y de al menos 512×512 píxeles: reducir una imagen grande da un resultado más limpio que ampliar una pequeña. También sirve SVG, que escala sin pérdida, pero debe llevar un tamaño o un viewBox, o el navegador no tiene de dónde partir. Si el original mide menos de 180 píxeles, el icono para iOS habrá que estirarlo y los bordes saldrán blandos."
  - question: ¿Y si el logotipo no es cuadrado sino alargado?
    answer: "Entonces aparece una elección entre dos formas. «Recortar al centro» toma un cuadrado del medio: sirve cuando lo importante es la figura central y los laterales pueden perderse. «Encajar entera» reduce la imagen hasta que quepa en el cuadrado y deja transparente el espacio sobrante: el logotipo se conserva completo, pero más pequeño. En ningún caso deformaremos la imagen para que llene el cuadrado: un logotipo distorsionado es peor que uno recortado."
  - question: ¿Qué hay exactamente dentro del .ico y por qué no PNG?
    answer: "Un .ico es un contenedor, no una imagen: dentro viven varias imágenes de distintos tamaños y el sistema toma la que necesita. El nuestro lleva tres capas: 16, 32 y 48 píxeles. Desde Windows Vista se permite meter PNG tal cual, y muchos generadores lo hacen porque el archivo sale más pequeño. Pero hoy el sentido del .ico es enteramente la compatibilidad con lo antiguo: los navegadores modernos se apañan de sobra con .svg. Meter en un archivo pensado para sistemas viejos un formato que esos sistemas no entienden es trabajo perdido. Por eso dentro va BMP normal sin comprimir, como en la descripción original del formato."
  - question: ¿Por qué el icono para iPhone sale sobre fondo blanco?
    answer: "Porque apple-touch-icon no admite transparencia: iOS pone negro detrás de las zonas transparentes. Un logotipo con fondo transparente acaba siendo un cuadrado negro con un dibujo en medio en la pantalla del teléfono. Ese archivo lo rellenamos de blanco de antemano. Los otros tres conservan la transparencia, que en una pestaña de navegador funciona como debe."
  - question: ¿Qué es el archivo site.webmanifest y hace falta?
    answer: "Es un archivo de texto pequeño que le dice al teléfono cómo mostrar su sitio cuando alguien lo añade a la pantalla de inicio: con qué nombre, con qué icono y de qué color pintar la barra de estado. Sin él el acceso directo también funciona, pero el nombre sale del título de la página y el icono es el que el teléfono consiga encontrar. Obligatorio no es, pero es lo que hace que el sitio se abra desde la pantalla de inicio sin barra de direcciones, como una aplicación. Lo incluimos en el archivo comprimido junto con los ficheros de 192×192 y 512×512 a los que apunta, y tomamos el color de la barra del color más frecuente de su propio icono."
related:
  - qr-code
  - barcode
  - base64-file
---

Arrastre una imagen: el icono, siete archivos listos y el código para pegar aparecen al instante. No se sube nada a ninguna parte.

## Cómo es un buen icono

El error habitual es coger el logotipo tal cual. En dieciséis píxeles de él solo queda una mancha: las líneas finas se funden, las letras dejan de leerse y un degradado se vuelve barro. Por eso el icono de un sitio casi siempre es más sencillo que el logotipo: una figura reconocible, uno o dos colores sólidos, y nada de texto por debajo de tres letras. Fíjese en la vista previa a tamaño real, no en la grande: la pequeña es la que decide.

## Si el icono no cambia después de subirlo

Los navegadores guardan los iconos más tiempo que ninguna otra cosa, y recargar la página no los borra. Abra la dirección del archivo directamente — `susitio.es/favicon.ico` — y recargue esa página con Ctrl+F5, Cmd+Shift+R en un Mac. Si en la dirección directa se ve el nuevo y en la pestaña sigue el viejo, espere: el navegador acaba poniéndose al día. Lo más rápido es comprobarlo en una ventana privada.

## Tema oscuro y fondo transparente

La transparencia en un icono es un arma de doble filo. Un logotipo oscuro sobre fondo transparente queda estupendo en una pestaña clara y desaparece en una oscura; uno claro hace lo contrario. Si sus lectores pueden tener cualquiera de los dos temas, es más seguro un fondo opaco de color contrastado, o una figura que lleve dentro tanto claro como oscuro. Comprobarlo es fácil: la vista previa se apoya en un fondo a cuadros y se ve a través allí donde su imagen está vacía.
