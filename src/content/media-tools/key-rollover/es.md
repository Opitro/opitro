---
toolSlug: key-rollover
locale: es
category: device-tests
tool: key-rollover
title: Cuántas teclas a la vez — test de rollover y antighosting del teclado
h1: Cuántas teclas a la vez
navName: Teclas a la vez
description: "Mantén varias teclas a la vez y mira cuántas llegan al ordenador. Prueba de rollover y antighosting, importante para los juegos."
faq:
  - question: ¿Cuántas teclas deberían registrarse a la vez?
    answer: "Un teclado USB corriente llega a seis más los modificadores: así se transmiten los datos, y no es una avería. Los teclados con rollover completo aguantan todas a la vez y el contador pasa de diez. Menos de seis significa que se pierden pulsaciones dentro del propio teclado."
  - question: ¿Qué son el ghosting y el antighosting?
    answer: "Dentro del teclado las teclas están en los cruces de una rejilla. Cuando se mantienen varias de una misma línea, el controlador puede no distinguirlas y o bien pierde una pulsación o se inventa una tercera: esa inventada es el fantasma. El antighosting es el circuito que lo evita, aunque por sí solo no significa que el teclado aguante muchas teclas."
  - question: ¿Por qué se pierden antes las teclas vecinas?
    answer: "Porque en placas baratas las vecinas suelen compartir línea. Prueba con teclas de esquinas opuestas del teclado: normalmente llegan más que ese mismo número de teclas seguidas."
  - question: ¿Cuentan los modificadores?
    answer: Sí, y conviene mantenerlos. Shift, Ctrl y Alt casi siempre se transmiten aparte del resto, así que suman por encima del límite y juegan a tu favor.
  - question: ¿Y si el sistema se quedó con algunas teclas?
    answer: "Entonces nunca contaron, y conviene tenerlo presente. Alt+Tab, la tecla Windows, Cmd+Q y combinaciones similares las reclama el sistema antes que el navegador: no llegan hasta aquí. Prueba con teclas normales: letras, cifras, flechas."
  - question: ¿Importa para los juegos?
    answer: Para los rápidos, sí. Correr en diagonal mientras te agachas y disparas son tres o cuatro teclas más modificadores a la vez. Con seis basta casi siempre; un teclado que falla a las tres dejará tu personaje congelado en el peor momento.
related:
  - keyboard-test
  - mic-test
  - sound-test
---

Mantén pulsadas a la vez tantas teclas como puedas, sin soltarlas. El número grande indica cuántas llegan al ordenador en este momento; al lado se queda el récord del intento.

## Qué comprueba

Un teclado no siempre transmite todo lo que pulsas. Los modelos corrientes tienen un límite a partir del cual las pulsaciones de más simplemente se pierden, y es mejor enterarse antes de que el personaje se quede clavado.

- **Teclado USB corriente** — seis teclas más los modificadores
- **Rollover completo** — todas a la vez, el contador pasa de diez
- **Menos de seis** — se pierden pulsaciones dentro del teclado

## Cómo probar bien

Mantén **también los modificadores**: Shift, Ctrl y Alt viajan aparte y suman por encima del límite. Elige teclas **de esquinas opuestas**: las vecinas de una misma fila comparten línea en placas baratas y se pierden más. Y evita las combinaciones que reclama el sistema, como Alt+Tab o la tecla Windows: esas no llegan al navegador en absoluto, no es que las pierda el teclado.

## Lo que conviene saber

Mostramos exactamente lo que llegó al navegador, ni más ni menos. Cuál se perdió por el camino no se puede saber: el navegador recibe una lista ya montada. Si necesitas comprobar cada tecla por separado, para eso está el [test de teclado](/es/keyboard-test), donde se ve cuál no responde en absoluto.
