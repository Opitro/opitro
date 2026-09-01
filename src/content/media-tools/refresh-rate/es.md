---
toolSlug: refresh-rate
locale: es
category: device-tests
tool: refresh-rate
title: Test de frecuencia de actualización — comprueba los Hz del monitor
h1: Frecuencia de actualización de pantalla
navName: Frecuencia de pantalla
description: "Descubre la frecuencia real de tu pantalla —60, 120, 144 o 240 Hz— y los fotogramas por segundo del navegador. Medido con fotogramas reales, sin instalar nada."
faq:
  - question: ¿Cómo averigua la página la frecuencia?
    answer: "La pantalla no cuenta nada de sí misma, pero el navegador dibuja fotogramas justo al ritmo al que se refresca la pantalla. Medimos el hueco entre fotogramas: 8,3 milisegundos son 120 Hz; 16,7, son 60."
  - question: ¿Por qué me sale 60 si mi monitor es de 144?
    answer: "Lo más habitual es que la frecuencia no esté activada en los ajustes del sistema: el monitor puede dar 144 pero funciona a 60. En un portátil con batería suele bajarse para ahorrar. El cable también cuenta: 144 Hz necesitan un DisplayPort adecuado o HDMI 2.0 o superior."
  - question: ¿Qué pantalla se mide si tengo varias?
    answer: "Aquella en la que está la ventana del navegador. Arrastra la ventana a otro monitor y pulsa «Medir otra vez»: los números serán distintos, y es lo correcto."
  - question: ¿Qué significa «estabilidad»?
    answer: "Cuánto se parecen los huecos entre fotogramas. En una pantalla sana son casi idénticos y la estabilidad ronda el cien. Los bajones significan que los fotogramas llegan desigualmente, normalmente porque el ordenador está ocupado."
  - question: ¿Qué son los fotogramas perdidos?
    answer: "Fotogramas que el navegador no entregó a tiempo: el hueco salió vez y media más largo de lo normal. Alguna pérdida suelta la tiene todo el mundo."
  - question: ¿Es una prueba de frecuencia o de FPS?
    answer: "Las dos a la vez. El navegador dibuja fotogramas justo al ritmo de la pantalla y no puede ir más rápido, así que los fotogramas por segundo coinciden aquí con la frecuencia. No es lo mismo que los FPS de un juego: el juego puede generar más o menos, pero la pantalla nunca mostrará más que su frecuencia."
  - question: ¿Por qué el número se mueve un poco?
    answer: "En pantallas de frecuencia variable es normal: adaptan la frecuencia a la carga. En una pantalla corriente el número debería quedarse casi quieto."
related:
  - dead-pixel-test
  - polling-rate
  - mouse-test
---

No hay que pulsar nada: la medida empieza sola y dura un par de segundos. No cambies de pestaña: en segundo plano el navegador baja la frecuencia y el número saldría mal.

## Qué muestra la prueba

- **Hercios** — el número principal, cuántas veces por segundo se refresca la pantalla. También son fotogramas por segundo: el navegador dibuja al ritmo de la pantalla, así que los FPS coinciden con la frecuencia
- **Máximo** — el mejor valor de la medida
- **Fotograma, ms** — cuánto dura un fotograma: 60 Hz son 16,7 ms; 120 Hz, 8,3
- **Estabilidad** — cuánto se parecen los huecos entre fotogramas
- **Fotogramas perdidos** — cuántas veces el navegador no llegó a tiempo

El deslizador bajo el número recorre su pista en exactamente un segundo. Le dice al ojo lo que un número no puede: si la imagen se mueve de verdad con suavidad.

## Qué es normal

| Frecuencia | Dónde se ve |
|---|---|
| 60 Hz | Monitores corrientes, la mayoría de portátiles, móviles económicos |
| 90–120 Hz | Móviles y tabletas actuales |
| 144–165 Hz | Monitores para jugar |
| 240 Hz o más | Monitores de competición |

## Si el número es más bajo de lo que debería

Mira primero los ajustes del sistema: muchas veces un monitor de 144 Hz funciona a 60 porque nadie lo activó. En un portátil, conéctalo a la corriente: el modo de ahorro casi siempre baja la frecuencia.

La tercera causa es el cable. Para frecuencias altas hace falta un DisplayPort adecuado o HDMI 2.0 o superior.

## Lo que conviene saber

La medida corresponde a la pantalla donde está la ventana. Con dos monitores, arrastra la ventana y vuelve a medir.

Al lado puedes [buscar píxeles muertos](/es/dead-pixel-test) o, si lo que te interesa es el ratón, [medir su frecuencia de sondeo](/es/polling-rate).
