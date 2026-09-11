---
toolSlug: htaccess-generator
locale: es
category: dev
tool: htaccess-generator
title: Generador de .htaccess online — Crear archivo de configuración Apache
h1: Generador de archivos .htaccess
navName: "Generador de .htaccess"
summary: "Redirecciones, HTTPS, www: archivo listo"
description: "Herramienta profesional para generar archivos .htaccess para servidores Apache online. Configura redirecciones 301, forzado de HTTPS, compresión y caché al instante de forma local."
faq:
  - question: ¿Qué es .htaccess y en qué carpeta va?
    answer: "Es un archivo de configuración del servidor web Apache que rige una carpeta y todo lo que hay dentro de ella. Permite cambiar el comportamiento del servidor sin tocar la configuración global, y por eso se convirtió en la herramienta principal allí donde la configuración global queda fuera de alcance: es decir, en casi cualquier alojamiento corriente. Va en la raíz del sitio, la misma carpeta donde está index.php o index.html. Cada proveedor la llama de una forma: public_html, www, httpdocs. Las reglas se aplican a ella y a todo su interior."
  - question: ¿Por qué un sitio puede caerse tras instalar un .htaccess?
    answer: "Hay dos fallos, y ambos son frecuentes. El primero es un 500 en cada petición: el archivo contiene una línea que Apache no entiende, o el alojamiento no permite sobrescribir ese parámetro. El segundo, más traicionero, es un bucle infinito de redirecciones: el navegador muestra «demasiadas redirecciones» y se rinde. El bucle aparece cuando una regla devuelve la petición al mismo sitio del que vino. Por eso pedimos que guarde el archivo anterior antes de sustituirlo: no habrá a qué volver si el viejo ya no existe. Compruebe justo después de subirlo: la portada y una página interior."
  - question: ¿Por qué importa la casilla «detrás de un intermediario»?
    answer: "Porque sin ella, forzar HTTPS tumba un sitio que está detrás de Cloudflare. El intermediario termina él mismo la conexión segura y la petición llega a su Apache como HTTP normal: el servidor ve http y manda diligentemente al visitante a https. Este vuelve a llegar, otra vez por el intermediario, otra vez como HTTP normal, y así sin fin. No lo suponemos: lo demostramos en un servidor real; el mismo archivo sin la casilla responde 301 a una petición que ya venía por https. Con la casilla, la herramienta consulta además la cabecera X-Forwarded-Proto y el bucle no se forma."
  - question: ¿Para qué unificar los espejos y por qué con un 301?
    answer: "Los buscadores tratan http://sitio, https://sitio, http://www.sitio y https://www.sitio como cuatro direcciones distintas con contenido idéntico. El peso de sus páginas se reparte entre ellas y ninguna posiciona como podría. Una redirección permanente con código 301 le dice al buscador que la mudanza es definitiva, y el peso acumulado pasa a la dirección que usted eligió. Una redirección temporal (302) no hace eso: el buscador deja el peso en la dirección antigua, a la espera de un regreso."
  - question: ¿Por qué el esquema y el host se corrigen con una regla y no con dos?
    answer: "Dos reglas separadas producen dos redirecciones seguidas: http://www.sitio → https://www.sitio → https://sitio. Para una persona es retraso de más en cada visita a través de un enlace antiguo; para el buscador, un salto de más en la cadena. Nosotros juntamos ambas condiciones en una sola regla y el salto sigue siendo uno. Está medido en un servidor real, no razonado: la prueba cuenta la longitud de la cadena."
  - question: ¿La protección contra hotlinking bloqueará a mis propios visitantes?
    answer: "No, porque permitimos el origen vacío. No es evidente, pero importa: el origen está vacío cuando se abre una imagen directamente por su enlace, cuando se guarda en disco y para todo aquel que haya desactivado el envío del origen en su navegador. Una regla que prohíbe el origen vacío es el error más común de estas configuraciones, y golpea a los suyos. Tampoco cerramos la puerta a la búsqueda de imágenes: Google, Bing, Yandex y demás siguen en la lista de permitidos, porque cerrarles el paso es perder las visitas que traen."
  - question: ¿Qué fiabilidad tiene el bloqueo por dirección IP?
    answer: "Como remedio contra un visitante pesado, funciona. Como seguridad, no. Una dirección cambia reiniciando el router, y a través del nodo de otro cambia sin pensarlo dos veces. Considérelo un pestillo, no una cerradura: detiene a quien llama por costumbre y no detiene a quien quiere entrar. Por cierto, Apache tiene aquí dos dialectos: la versión 2.4 quiere Require not ip y la 2.2 quiere Deny from. Escribimos los dos, cada uno tras su comprobación de módulo, así que el archivo sirve en cualquiera de ellas."
  - question: ¿Mi configuración va a algún servidor?
    answer: "No. Todo se arma en la memoria de la pestaña y la página no hace ni una sola petición de red. No es un detalle menor: la estructura de su servidor, las rutas de sus carpetas y su lista de bloqueos son un mapa de cómo está construido su sitio, y no tienen por qué acabar en los registros de otro."
related:
  - minify-html
  - unix-timestamp
  - uuid-generator
---

Marque lo que necesite y el archivo se arma solo. El código terminado se puede copiar o descargar como archivo.

## Qué cubre

HTTPS forzado, unificación de espejos hacia www o hacia sin www, prohibición de listar carpetas, bloqueo de direcciones, protección contra hotlinking, compresión de las respuestas, caducidad en el navegador y redirecciones propias «ruta antigua → dirección nueva».

Cada bloque va envuelto en una comprobación de módulo. Eso significa que si su servidor carece, por ejemplo, de mod_deflate, el archivo no se caerá con un 500: esa sección simplemente no se ejecuta.

## Tres puntos donde fallan los generadores ya hechos

**Un sitio detrás de Cloudflare.** El intermediario termina él mismo la conexión segura, la petición llega a Apache como HTTP normal y la regla «redirigir a https» se dispara siempre. El sitio entra en un bucle infinito. Marque «detrás de un intermediario» y añadimos una consulta a la cabecera `X-Forwarded-Proto`.

**Dos redirecciones en lugar de una.** Una regla para el esquema y otra para www producen un salto de más. Nosotros las fundimos en una.

**Protección contra hotlinking que golpea a los propios.** Si se prohíbe el origen vacío, dejan de funcionar la apertura directa de una imagen y su guardado en disco. Aquí el origen vacío está permitido, y la búsqueda de imágenes también.

## Cómo se ha comprobado

Con un Apache de verdad. La prueba levanta httpd 2.4 con `AllowOverride All`, deja el archivo generado en la raíz y lanza peticiones auténticas: con el host sustituido, con la cabecera del intermediario, con un origen ajeno. Lo que se compara no es el texto de las reglas, sino los códigos de respuesta y las cabeceras que el servidor devuelve.

Verificado, entre otras cosas: hay exactamente una redirección y no dos; detrás del intermediario la respuesta es 200 y no un bucle sin fin; un sitio ajeno recibe 403 para una imagen mientras que abrirla directamente da 200; la búsqueda de imágenes no queda cerrada; las hojas de estilo se sirven comprimidas y las imágenes no; las páginas llevan caducidad cero y las imágenes un año. Y se demuestra aparte por qué existe la casilla del intermediario: el mismo archivo sin ella responde 301 a una petición que ya venía por https.

## Guarde el archivo antiguo antes de sustituirlo

Es el único consejo que vale por todos los demás. Un error en `.htaccess` no estropea el aspecto de una página: tumba el sitio entero, y arreglarlo exige acceso a los archivos justo cuando el propio sitio ya no abre.
