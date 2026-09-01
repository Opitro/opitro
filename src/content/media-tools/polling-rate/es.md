---
toolSlug: polling-rate
locale: es
category: device-tests
tool: polling-rate
title: Frecuencia de sondeo del ratón — comprueba los hercios online
h1: Frecuencia de sondeo del ratón
navName: Frecuencia de sondeo
description: "Comprueba cuántas veces por segundo tu ratón informa de su posición. La medida usa los eventos reales, no los fotogramas de la pantalla. Gratis y sin registro."
faq:
  - question: ¿Qué es la frecuencia de sondeo?
    answer: "Es cuántas veces por segundo el ratón le dice al ordenador dónde está, medido en hercios. Los ratones de oficina funcionan a 125 Hz, es decir, informan cada ocho milisegundos. Los de juego dan 500 o 1000, y algunos modelos recientes 4000 u 8000."
  - question: ¿Por qué me sale menos de lo anunciado?
    answer: "Suele ser una de tres cosas: el ratón está en un concentrador USB, la conexión inalámbrica entró en ahorro de energía, o el procesador está ocupado. Algunos portátiles también recortan la frecuencia con batería. Antes de culpar al ratón, conéctalo directamente y repite la medida."
  - question: ¿Por qué otras webs muestran 60 o 120 Hz con cualquier ratón?
    answer: "Porque cuentan lo que no toca. El navegador agrupa los eventos de movimiento y los entrega una vez por fotograma: si cuentas esos grupos, a todo el mundo le sale la frecuencia de su pantalla. Los eventos reales están dentro del grupo, y nosotros lo desmontamos."
  - question: ¿Cómo hago bien la medida?
    answer: "Mueve el ratón por la zona con suavidad, sin levantarlo y sin pausas, durante varios segundos. En las pausas no llegan eventos y la media baja."
  - question: ¿Funciona con el panel táctil o el dedo?
    answer: "No, a propósito. El panel táctil y la pantalla táctil tienen su propia frecuencia, pero funciona de otra manera y no se compara con la del ratón."
  - question: ¿Importa la frecuencia de sondeo para jugar?
    answer: "Importa, pero menos de lo que se cree. El salto de 125 a 500 Hz se nota: la latencia baja de ocho milisegundos a dos. El salto de 1000 a 4000 es una fracción de milisegundo."
related:
  - mouse-test
  - click-speed
  - keyboard-test
---

Mueve el ratón por la zona unos segundos y la página mostrará cuántas veces por segundo informa de su posición.

## Qué muestra la prueba

- **Hercios ahora** — la frecuencia de la última fracción de segundo
- **Máximo** — el mejor valor de toda la medida
- **Media** — sobre todos los eventos; esta es la frecuencia real de tu ratón
- **Muestras** — cuántos eventos de movimiento se han recogido

El gráfico muestra si la frecuencia es estable. En un ratón sano la línea es casi plana; los bajones significan que se pierden eventos por el camino.

## Con qué compararse

| Frecuencia | Qué significa |
|---|---|
| 125 Hz | Ratón de oficina normal, unos 8 ms de latencia |
| 250–500 Hz | Ratón de juego económico, 2–4 ms |
| 1000 Hz | El estándar para jugar, alrededor de 1 ms |
| 2000–8000 Hz | Modelos caros de los últimos años |

## Por qué nuestro número es más honesto

El navegador **agrupa** los eventos de movimiento y los entrega una vez por fotograma. Si cuentas esos grupos, cualquier ratón sale a 60 o 120 Hz: la frecuencia del monitor. Por eso tantas pruebas muestran a todo el mundo la misma cifra.

Los eventos reales están dentro del grupo. Nosotros lo desmontamos y obtenemos lo que el ratón envió de verdad.

## Lo que conviene saber

Mueve el ratón con suavidad y sin parar: en las pausas no llegan eventos y la media cae. Un número por debajo del anunciado no siempre es una avería.

Al lado puedes [comprobar los botones y la rueda](/es/mouse-test) y [medir tu velocidad de clic](/es/click-speed).
