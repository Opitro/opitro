---
toolSlug: audio-to-midi
locale: es
category: audio
tool: audio-to-midi
title: Audio a MIDI online — saca las notas de una grabación, gratis
h1: Audio a MIDI
navName: Audio a MIDI
description: Sube una grabación y saca las notas — MIDI, partitura para MuseScore o una tabla. Piano roll, acordes, tempo y tonalidad. Todo se calcula en tu navegador y el archivo no sale de tu dispositivo. Gratis, sin registro.
faq:
  - question: ¿Cómo funciona esto?
    answer: Al navegador se descarga un modelo de reconocimiento de notas — alrededor de un megabyte, una sola vez, y después queda en caché. Calcula en tu dispositivo; la grabación no se envía a ningún servidor. El modelo es Basic Pitch, publicado por Spotify con licencia abierta, y hoy por hoy es lo mejor que se puede ejecutar honestamente dentro de un navegador.
  - question: ¿Qué tan preciso es?
    answer: Con una pieza de prueba cuya respuesta estaba escrita de antemano — un pasaje de piano de 28 notas con reverberación de sala, ruido y pulsación irregular — encontró las 28 y no se inventó ninguna. Pero es un ejemplo limpio con un solo instrumento. Con música real sale peor, y conviene tomar el resultado como un buen borrador que vas a corregir, no como una partitura terminada.
  - question: ¿Por qué una canción normal sale hecha un lío?
    answer: "Porque en una canción suenan a la vez batería, bajo, guitarra y voz, y el modelo intenta oír notas sueltas ahí dentro. Esta herramienta está pensada para una fuente cada vez: piano, guitarra, saxofón, una melodía tarareada o silbada. Si tienes que partir de una canción, prueba primero a [quitar la voz](/es/vocal-remover) y transcribir las pistas por separado."
  - question: ¿Qué hace el control de sensibilidad?
    answer: "Mueve el umbral por debajo del cual una nota se considera poco segura. Hacia la izquierda quedan solo las evidentes; hacia la derecha entra todo, basura incluida. No existe un valor correcto único: una grabación limpia pide un ajuste y una en directo pide otro, y por eso es un control y no una constante escondida en el código. El cambio es inmediato; el modelo no se vuelve a ejecutar."
  - question: ¿Cuánto tarda?
    answer: Ocho segundos y medio de audio tardan unos 0,7 segundos, así que una grabación de tres minutos son unos quince segundos. La primera vez suma algo por la descarga del modelo. En un equipo antiguo sin tarjeta gráfica decente va bastante más lento, porque el trabajo recae en el procesador.
  - question: ¿De dónde salen el tempo y la tonalidad?
    answer: De algoritmos aparte, los mismos que hay detrás de [detectar el tempo](/es/change-tempo) y [detectar la tonalidad](/es/detect-key). El tempo se busca en las subidas de volumen, con una comprobación explícita del valor doble, que es el error por el que 140 se lee como 70. La tonalidad sale de qué notas llevan el peso. Conviene mirar ambos números antes de fiarse, sobre todo si la música no tiene un pulso claro.
  - question: ¿Por qué hay tan pocos acordes comparado con otros sitios?
    answer: Porque aquí los acordes caen en el pulso y duran al menos medio compás. Si se estima cada fotograma por separado, el acorde cambia tres veces por segundo — técnicamente más pegado al audio e imposible de tocar. Aquí un cambio de acorde de más cuesta más que una pequeña imprecisión, así que el cifrado sale como lo habría escrito una persona.
  - question: ¿Con qué se abren los archivos descargados?
    answer: El MIDI se abre en cualquier programa de música — GarageBand, FL Studio, Ableton, Logic, Reaper. El tempo y la tonalidad van escritos dentro, así que la pista cae en la rejilla directamente. MusicXML es partitura y lo leen MuseScore, Sibelius y Finale; MuseScore es gratuito e imprime a PDF desde ahí. El CSV es una tabla normal para una hoja de cálculo o tu propio script.
  - question: ¿Puedo obtener la partitura en PDF?
    answer: "Sí. La pestaña Partitura la dibuja en la propia página, y el botón de imprimir abre el diálogo de impresión normal del navegador, donde eliges Guardar como PDF. No hace falta ningún otro programa. Si quieres editar la notación y no solo imprimirla, descarga el MusicXML y ábrelo en MuseScore."
  - question: ¿Qué significa transportar?
    answer: Mover todas las notas arriba o abajo sin cambiar nada más. Sirve cuando la melodía no te entra en la voz o el instrumento está afinado de otra forma. Un semitono es la tecla de al lado; una octava son doce semitonos. El desplazamiento se aplica tanto a lo que descargas como al cifrado de acordes.
  - question: ¿Se sube mi grabación a algún sitio?
    answer: No. Lo único que se descarga es el modelo — de tu dispositivo no sale nada, ni el archivo ni el resultado. Puedes desconectarte de internet en cuanto el modelo haya llegado y todo sigue funcionando.
---

Sube una grabación y obtén las notas: un piano roll, una lista con el tiempo exacto de cada nota, un cifrado de acordes y un archivo MIDI que se abre en cualquier programa de música.

Para qué se usa:

- **Sacar una melodía de oído** — tarárea o tócala y mira qué notas son en realidad
- **Llevar una toma en directo al secuenciador** — la tocas al piano y luego la editas como MIDI
- **Leer la parte de otro** — ver qué se tocó en vez de adivinarlo
- **Conseguir un cifrado de acordes** — pegado al pulso, no cambiando tres veces por segundo
- **Imprimir la partitura** — se dibuja en la página; imprimir o guardar en PDF con un clic

Funciona con la grabación de un instrumento o una voz. Una canción completa con batería y voces sale hecha un lío: es un límite del método, no un ajuste pendiente de tocar.

Las notas se alinean a una rejilla de semicorcheas y lo tocado a la vez se escribe como un acorde por pentagrama — un borrador legible, no una edición grabada.

Cerca: [detectar tonalidad](/es/detect-key), [detectar tempo](/es/change-tempo), [registro vocal](/es/vocal-range), [quitar la voz](/es/vocal-remover), [cambiar el tono](/es/audio-pitch).
