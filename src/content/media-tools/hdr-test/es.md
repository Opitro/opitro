---
toolSlug: hdr-test
locale: es
category: device-tests
tool: hdr-test
title: Test HDR online — si la pantalla lo admite y está activado
h1: Test de compatibilidad HDR
navName: Compatibilidad HDR
description: "Descubre si el HDR funciona ahora mismo en tu pantalla y qué formatos de vídeo HDR admite tu navegador: HDR10, HLG, AV1, Dolby Vision. Sin instalar nada."
faq:
  - question: ¿La página muestra HDR o solo pregunta por él?
    answer: "Solo pregunta, y conviene decirlo claro. Una página web no puede mostrar HDR de verdad: haría falta un archivo con rango extendido, y los colores normales de una página nunca son más brillantes que el blanco. Lo que el navegador sí sabe con certeza es si la pantalla está ahora en alto rango dinámico y qué formatos HDR puede decodificar. Esas dos respuestas son las que ves aquí."
  - question: Dice que el HDR está desactivado, pero mi monitor lo admite. ¿Por qué?
    answer: "Lo normal es que el HDR esté simplemente apagado en el sistema: en Windows está en Configuración → Sistema → Pantalla → HDR, con un interruptor por monitor. La segunda causa habitual es el cable: el HDR pide HDMI 2.0 o superior, o DisplayPort 1.4, y un cable viejo entrega la imagen sin rango extendido. La tercera es el propio navegador: Firefox tardó en responder a esta consulta, y allí verás un guion en lugar de respuesta."
  - question: ¿Por qué no hay HDR en YouTube si mi pantalla lo admite?
    answer: "Casi siempre es el navegador, no la pantalla. YouTube entrega el HDR en AV1 o VP9 Profile 2, y si el navegador no sabe decodificarlos en rango extendido recibirás la imagen normal. Mira la lista de formatos de abajo: si en AV1 pone «no», no habrá HDR en YouTube con ningún monitor. Cambiar de navegador ayuda: Chrome, Safari y Firefox admiten conjuntos distintos."
  - question: Desde que activé el HDR todo se ve deslavado. ¿Está estropeado?
    answer: "No, es el comportamiento habitual de Windows. Con el HDR activo, el contenido normal se convierte al rango extendido y por defecto suele verse apagado. En esos mismos ajustes de pantalla hay un control de brillo SDR: muévelo hasta que el contenido normal vuelva a verse bien. Un Mac no tiene ese control; allí la conversión suele salir correcta desde el principio."
  - question: ¿Qué significa «profundidad de color 24 bits»?
    answer: "Ocho bits para cada uno de los tres canales, la profundidad de siempre. El HDR quiere más: diez bits por canal, es decir 30 o más. Pero tómatelo como una pista y no como una sentencia: los sistemas informan de esto de forma dispar y en algunas versiones sigue en 24 incluso con el HDR activo. La respuesta de verdad es la primera fila, no esta."
  - question: ¿Puedo comprobar así un televisor?
    answer: "Sí, abriendo la página en el navegador del televisor. Ten en cuenta que los navegadores integrados suelen responder de forma incompleta: puede que no conozcan la consulta del rango dinámico y verás un guion en vez de un sí o un no. Para un televisor es más fiable mirar sus propios ajustes de imagen y la información de la señal de entrada."
  - question: ¿Por qué Dolby Vision casi siempre dice que no?
    answer: Porque los navegadores casi nunca lo llevan. Dolby Vision necesita licencia y suele estar solo en las aplicaciones de los servicios y en los propios televisores; entre navegadores lo maneja poco más que Safari en equipos de Apple. Un «no» aquí no dice nada malo de tu pantalla ni de tu sistema.
related:
  - monitor-color-test
  - refresh-rate
  - screen-burn-in-test
---

La comprobación se hace sola, sin pulsar nada. Arriba está la respuesta principal: si el rango extendido funciona ahora mismo en esta pantalla. Debajo hay dos listas: lo que el navegador sabe de la pantalla y qué formatos de vídeo HDR es capaz de decodificar.

## La pantalla y el navegador no son lo mismo

La mitad de las quejas de «compré un monitor HDR y no hay HDR en ninguna parte» se explican así. La pantalla puede estar en alto rango dinámico mientras el navegador no sabe decodificar HDR10 o AV1, y el vídeo llega normal. También pasa al revés: el navegador lo admite todo pero el HDR está apagado en el sistema. De ahí dos listas y no una respuesta única.

## Si pone que el HDR está desactivado

1. **Mira los ajustes del sistema.** En Windows: Configuración → Sistema → Pantalla → HDR, con su interruptor para cada monitor. En un Mac el HDR se activa solo en las pantallas compatibles.
2. **Mira el cable.** El HDR pide HDMI 2.0 o superior, o DisplayPort 1.4. Un cable viejo entrega la imagen sin rango extendido en silencio, sin error alguno.
3. **Mira el navegador.** No todos responden a esta pregunta: donde no hay respuesta verás un guion, y eso no significa que no haya HDR.

## Lo que esta página no hace

No mide nada. El brillo en nits, el contraste real y lo bien que la pantalla reproduce el HDR quedan fuera del alcance de una página web: para eso hace falta un instrumento. Todo lo que hay aquí son respuestas del navegador, etiquetadas honestamente como tales. Si la imagen se ve apagada o quemada, revisa el [color](/es/monitor-color-test) aparte: allí se ve si la pantalla recorta detalle en sombras y luces.
