---
toolSlug: remove-music
locale: es
category: audio
tool: remove-music
title: "Quitar la música de una canción en línea — dejar solo la voz"
h1: Quitar la música de una canción
navName: Quitar la música
description: "Quédate solo con la voz de una canción: tres métodos, del instantáneo a la red neuronal. Todo se calcula en tu navegador y el archivo no se sube a ningún sitio."
faq:
  - question: ¿En qué se diferencian los tres métodos?
    answer: "«Rápida» es instantáneo y no descarga nada: extrae el centro de la imagen estéreo, donde suele estar la voz. «Normal» separa de verdad voz y música — el modelo se descarga una vez, 38 MB, y se queda en el navegador. «La mejor» hace lo mismo con más limpieza, pero es pesada y funciona en ordenador."
  - question: ¿Qué es el control de fuerza?
    answer: Pertenece solo al «Rápida» y decide cuánto restar. A plena fuerza la música se va junto con parte de la voz; más abajo la voz queda intacta pero el fondo se oye más. Las redes neuronales no tienen nada que ajustar, así que allí el control se oculta.
  - question: ¿Adónde va mi archivo?
    answer: "A ningún sitio. El cálculo ocurre en tu navegador, en tu dispositivo. El modelo se descarga de un repositorio abierto y también se queda contigo: no habrá que bajarlo dos veces."
  - question: ¿Puedo quitar después la voz en vez de la música?
    answer: Sí, el botón «Quitar la voz» está junto a la descarga. El archivo viaja contigo, no hace falta subirlo otra vez, y si la separación ya se hizo, la otra página se abre con el resultado listo.
  - question: ¿Por qué «La mejor» no arranca en el móvil?
    answer: "Está pensada para ordenador: en un móvil ese cálculo llevaría horas y casi con seguridad se cortaría. El botón sigue visible, lo dice claramente y te lleva a «Normal», que funciona en todas partes."
  - question: ¿Saldrá una a capela limpia?
    answer: En grabaciones modernas, casi. En mezclas densas y donde la voz lleva muchos efectos quedan restos de música. Es un límite honesto de cualquier separación, no un fallo.
---

Sube una canción y pulsa «Quitar la música»: arranca «Normal» al momento y la voz aparece abajo como una pista propia. ¿No te convence? Elige otro método: el nuevo resultado se coloca arriba y los anteriores quedan debajo, así puedes compararlos de oído.

## Tres métodos

- **Rápida** — al instante, sin descargar nada. Extrae el centro de la imagen estéreo, donde suele estar la voz; un control ajusta la fuerza.
- **Normal** — la red neuronal, la opción de siempre. Un modelo de 38 MB se descarga una vez y se queda en el navegador.
- **La mejor** — el mejor resultado posible. Funciona solo en ordenador.

## Lo que conviene saber

Todo se calcula en tu dispositivo: ni la canción ni el resultado se envían a ninguna parte. Cada pista terminada tiene su botón de reproducción y su botón de descarga, en MP3 o WAV. Si quieres la base en vez de la voz, al lado tienes [quitar la voz](/es/vocal-remover); y si quieres las dos pistas a la vez, [separar la voz de la música](/es/split-vocal) lo hace de una pasada. El archivo y todo lo ya calculado viajan contigo.
