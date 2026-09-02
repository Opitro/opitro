---
toolSlug: monitor-color-test
locale: es
category: device-tests
tool: monitor-color-test
title: Test de color del monitor online — comprobar la pantalla
h1: Test de color del monitor
navName: Color del monitor
description: "Siete cartas: escala de grises, detalle en sombras y luces, degradados sin bandas, colores puros y sRGB frente a display-p3. Sin instalar nada."
faq:
  - question: ¿Qué comprueban exactamente estas cartas?
    answer: "Tres cosas. La primera, si la pantalla separa tonos cercanos: los escalones de gris, las sombras y las luces enseñan si se come el detalle oscuro o quema el claro. La segunda, la uniformidad de los degradados: las bandas en una rampa suave delatan un panel barato o ajustes de controlador poco afortunados. La tercera, los colores en sí: si el rojo tira a naranja o el gris se va hacia el verde o el azul."
  - question: ¿Cuántos escalones de sombra debería ver?
    answer: "En una pantalla bien ajustada y a oscuras se distinguen casi los dieciocho, salvo el primer par. Si se funden los cinco o seis primeros, la pantalla se come el detalle en sombras: baja el nivel de negro o el contraste en el menú del monitor. Pero antes quita la luz que da sobre la pantalla: bajo una lámpara ningún monitor separa los escalones oscuros."
  - question: ¿De dónde salen las bandas del degradado?
    answer: "Casi siempre de un panel de seis bits que finge ocho parpadeando entre tonos vecinos: las bandas en una rampa son su firma habitual, sobre todo en portátiles baratos. Menos veces son los ajustes: contraste mal puesto, «mejoras» del controlador o un modo de imagen del televisor. Empieza apagando todo el procesado y vuelve a mirar."
  - question: ¿Puedo calibrar el monitor con esto?
    answer: "No. Calibrar es medir el color con un instrumento y construir un perfil; a ojo no lo consigue ninguna carta. Lo que las cartas sí detectan son los fallos gruesos: sombras aplastadas, luces quemadas, una dominante de color en el gris. Eso se corrige en el menú del monitor, no con programas de «calibración a ojo», que solo mueven la curva del controlador."
  - question: ¿Qué significa «más amplia que sRGB» y hace falta?
    answer: "sRGB es la gama normal para la que está hecho casi todo en internet. Las pantallas de gama amplia (display-p3, DCI-P3) muestran rojos y verdes más vivos. Es una ventaja para foto y cine y un inconveniente para la precisión: en ellas las imágenes corrientes se ven sobresaturadas si el sistema no convierte los colores. La última carta te dice cuál tienes: si la mitad derecha se ve claramente más viva, la gama es más amplia."
  - question: ¿Sirve para el televisor y el móvil?
    answer: "Sí, abre la página en el navegador del aparato. En el televisor apaga sin falta el procesado de imagen: modos vívido y dinámico, reducción de ruido, ajuste de contraste. Cambian la imagen por completo y estarías probando eso y no la pantalla. En el móvil desactiva el brillo automático y el modo nocturno."
  - question: El gris se ve con una dominante, ¿está defectuosa?
    answer: "No necesariamente. Suele ser la temperatura de color: muchos monitores vienen en «frío» y el gris tira a azul. Pon 6500 K o «estándar» y vuelve a mirar. Si la dominante sigue y además es desigual —un borde más amarillo que el otro—, eso es falta de uniformidad de la retroiluminación, y ningún ajuste la corrige."
related:
  - dead-pixel-test
  - screen-burn-in-test
  - refresh-rate
---

Pulsa cualquier carta y se abrirá a pantalla completa; al pulsar de nuevo pasa a la siguiente y las flechas avanzan en ambos sentidos. Empieza por los escalones de gris: si ahí todo va bien, la pantalla está en forma y el resto se puede mirar por encima.

## Antes de empezar

1. **Quita la luz.** Corre la cortina o al menos apártate de la lámpara: bajo luz directa ningún monitor separa los escalones oscuros.
2. **Apaga el procesado.** Modo nocturno, brillo automático, «mejoras» del controlador, modos de imagen del televisor. Si no, estarás probando eso.
3. **Mira de frente.** De lado el panel cambia brillo y tono por sí solo, y en los portátiles se nota mucho.

## Qué se considera normal

Los dieciséis escalones de gris se distinguen y la progresión es pareja. En sombras solo se funde el primer par. En luces se ven todos. La rampa suave no tiene bandas. El rojo no tira a naranja, el azul no tira a violeta y el gris sigue siendo gris, sin azul ni verde.

## Lo que esta página no hace

No calibra el monitor ni mide la gama: ninguna de las dos cosas es posible en un navegador. Calibrar es medir con un instrumento, y la gama es un dato que no se averigua mirando una pantalla con esa misma pantalla. Lo único honesto que hay aquí sobre la gama es la última carta: el rojo más intenso de sRGB junto al más intenso de display-p3, y lo resuelve tu propio ojo.
