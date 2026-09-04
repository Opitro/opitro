---
toolSlug: word-frequency
locale: es
category: text
tool: word-frequency
title: Frecuencia de palabras online — analizador de densidad de palabras clave
h1: Frecuencia de palabras en un texto
navName: Frecuencia de palabras
description: "Analizador gratuito de frecuencia de palabras. Crea una lista de frecuencias, mide la densidad de palabras clave y descarta las palabras vacías. El texto no sale del navegador."
faq:
  - question: ¿Qué es la densidad de palabras clave y para qué mirarla?
    answer: "La densidad es la parte que ocupa una palabra concreta dentro del texto, en porcentaje. Vale la pena mirarla por un motivo: enseña si has caído en repetir la misma palabra. Pero no es una cifra que haya que alcanzar: ningún buscador publica un umbral a partir del cual un texto se considera sobreoptimizado, y lo de «no pases del tres por ciento» es folclore del oficio, no una regla. Leer el texto en voz alta es más fiable: si una palabra chirría, es que sobra."
  - question: ¿Qué son las palabras vacías y por qué se quitan?
    answer: "Son las palabras funcionales: preposiciones, conjunciones, pronombres, partículas. Son las más frecuentes de cualquier idioma y no dicen nada del contenido. Sin filtrarlas, la cabeza de la lista la ocupan «de», «la», «que», y no queda nada que analizar. La lista se elige por el idioma del texto y no por el de la página: si analizas un artículo ruso en la versión española, se aplica la lista rusa, y su nombre aparece en la línea de resumen."
  - question: ¿Qué son las dos cifras de repetición?
    answer: "Vienen de las herramientas SEO rusas. La clásica es la raíz cuadrada del número de apariciones de la palabra más frecuente; la académica es la parte que ocupa esa palabra en porcentaje. Las calculamos porque se buscan, pero lo decimos claro: ningún buscador publica una medida así ni fija un umbral. Tómalas como una señal aproximada de que una palabra se repite demasiado, no como una nota."
  - question: ¿Por qué «texto» y «textos» se cuentan por separado?
    answer: "Porque se cuentan formas exactas, no palabras del diccionario. Unir las formas exige análisis morfológico, que a su vez exige un diccionario de varios megabytes: tardaría más en descargarse que en funcionar toda la página. No fingimos saber hacerlo: al estudiar palabras clave, suma tú las formas."
  - question: ¿Qué pasa con las palabras con guion y con apóstrofo?
    answer: "Se quedan enteras. El método habitual —borrar la puntuación con una lista— pega las palabras compuestas y convierte «don’t» en «dont». Nosotros no borramos signos: seleccionamos palabras, es decir letras y cifras con un guion o un apóstrofo opcional dentro."
  - question: ¿Para qué sirve la longitud mínima?
    answer: "Para quitar ruido: letras sueltas, símbolos, restos de código. Por defecto son tres letras, suficiente para limpiar sin perder palabras cortas con significado como «SEO» o «web». Si tu texto se apoya en términos de dos letras, ponlo en dos."
  - question: ¿Hay un límite de tamaño?
    answer: "No se impone ningún límite razonable: el análisis hace una sola pasada por el texto, así que hasta un libro se despacha deprisa. Fíjate más bien en otra cosa: en un texto muy largo los porcentajes se vuelven diminutos, por eso la barra junto a cada palabra se dibuja en relación con la palabra más frecuente y no con el cien por cien. Si no, todas las barras serían igual de cortas."
  - question: ¿Se envía mi texto a algún sitio?
    answer: "No. El análisis ocurre en tu propio navegador. Ni el texto ni su lista de frecuencias se envían a ningún servidor, no se guardan y no quedan al cerrar la pestaña."
related:
  - reading-time
  - remove-duplicate-lines
  - text-diff
---

Pega el texto y la lista de frecuencias aparece al instante, sin pulsar nada.

## Qué muestra la página

- **Una lista de frecuencias** — todas las palabras por número de apariciones, con su porcentaje
- **Palabras totales y únicas** — el tamaño del texto y su variedad léxica
- **Dos cifras de repetición** — medidas tomadas de las herramientas SEO

## Las palabras vacías siguen al idioma del texto

La lista de preposiciones y conjunciones se elige a partir de las propias letras y palabras funcionales, no del idioma de la página. Si analizas un artículo ruso en la versión española, se aplica la lista rusa. Cuál se ha usado aparece en la línea de resumen.

## Las palabras se quedan enteras

El método habitual borra la puntuación con una lista, y las palabras compuestas se pegan mientras «don’t» pasa a «dont». Nosotros no borramos signos: seleccionamos palabras, letras y cifras con un guion o un apóstrofo opcional dentro.

## Lo que esta página no sabe hacer

Cuenta formas exactas, no palabras del diccionario: «texto» y «textos» irán en filas distintas. Solo el análisis morfológico puede unirlas, y eso exige un diccionario de varios megabytes. No fingimos saber hacerlo.
