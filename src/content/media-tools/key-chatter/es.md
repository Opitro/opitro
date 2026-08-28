---
toolSlug: key-chatter
locale: es
category: device-tests
tool: key-chatter
title: Una tecla escribe dos veces — test de rebote del teclado online
h1: Una tecla que escribe dos veces
navName: Rebote de teclas
description: "¿Pulsas una vez y salen dos letras? Comprueba el rebote del teclado: la página caza las repeticiones y muestra cuántos milisegundos las separan."
faq:
  - question: ¿Qué es el rebote de una tecla?
    answer: "Bajo cada tecla hay un interruptor con dos contactos. Al desgastarse, una sola pulsación hace que los contactos se cierren y se abran varias veces en una fracción de segundo: el ordenador recibe dos señales en lugar de una y aparece una letra de más."
  - question: ¿Cómo distinguís el rebote de escribir rápido?
    answer: "Por el tiempo entre eventos. Un doble toque intencionado le lleva a una persona 100 milisegundos o más: el dedo no da para menos. Todo lo que cabe en cuarenta es imposible de pulsar, y lo llamamos rebote sin rodeos. Entre cuarenta y ochenta lo marcamos con cautela: «parece rebote»."
  - question: El test no encuentra nada y las letras se duplican igual. ¿Por qué?
    answer: Algunos teclados y sistemas operativos filtran el rebote antes de que el evento llegue al navegador; entonces aquí sale limpio. Prueba la misma tecla en un editor de texto. Si allí también se duplica y el test calla, la causa puede estar en la repetición de teclas o en las teclas especiales del sistema.
  - question: ¿Cuenta una tecla mantenida?
    answer: "No. Al mantener una tecla, el sistema empieza a repetir el carácter a propósito: es su trabajo, no una avería. El navegador marca esas repeticiones aparte y las saltamos; si no, cualquier barra espaciadora mantenida parecería rota."
  - question: ¿Qué hago si aparece rebote?
    answer: "En teclados de membrana suele bastar una limpieza: una miga o el polvo bajo la tecla impiden que el contacto vuelva. En los mecánicos se cambia un solo interruptor, mucho más barato que un teclado nuevo. En un portátil conviene acudir a un técnico."
  - question: ¿Cuántas pulsaciones hacen falta para comprobarlo?
    answer: Escribe con normalidad un minuto o dos, mejor con texto real. El rebote no aparece en cada pulsación, así que pulsar una tecla diez veces puede no mostrar nada mientras que escribir de verdad lo caza.
related:
  - keyboard-test
  - key-rollover
  - mic-test
---

Escribe como escribes siempre. Si una tecla se dispara dos veces seguidas más rápido de lo que un humano podría, la página lo caza y muestra cuántos milisegundos separaron el segundo evento.

## Cómo leerlo

- **Menos de 40 milisegundos** — rebote seguro: ningún dedo va tan rápido
- **Entre 40 y 80** — parece rebote, aunque escribir muy rápido todavía cae aquí
- **Vacío** — este teclado no repite

La tecla cazada queda marcada en el esquema, y en la lista se guardan su nombre y el tiempo. El caso más reciente siempre va arriba.

## Si aparece rebote

En los teclados de membrana suele ser suciedad: una miga bajo la tecla impide que el contacto vuelva. Ábrelo y límpialo. En los mecánicos se desgasta el interruptor y se cambia de uno en uno, más barato que un teclado nuevo. En un portátil es más seguro ir a un técnico: la tecla se desmonta de otra forma y se rompe con facilidad.

## Lo que conviene saber

Solo vemos lo que llega al navegador. Algunos teclados y sistemas filtran el rebote por su cuenta; entonces aquí sale limpio aunque el interruptor ya esté gastado. Si necesitas saber si una tecla responde siquiera, está el [test de teclado](/es/keyboard-test); y si quieres saber cuántas teclas se registran a la vez, prueba [cuántas teclas a la vez](/es/key-rollover).
