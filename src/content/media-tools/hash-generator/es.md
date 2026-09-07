---
toolSlug: hash-generator
locale: es
category: dev
tool: hash-generator
title: Generador de hash online — Crear MD5, SHA-256, SHA-1 desde texto
h1: Generador de hashes MD5 y SHA-256
navName: Generador de hashes
description: "Herramienta profesional para generar hashes criptográficos online. Transforma texto y cadenas en formatos MD5, SHA-1 y SHA-256 de forma 100% local e instantánea."
faq:
  - question: ¿Qué es el hash y en qué se diferencia del cifrado?
    answer: "El hash convierte datos de cualquier tamaño en una cadena de longitud fija, y lo hace en un solo sentido: no existe operación inversa. El cifrado es un camino de ida y vuelta: lo cifrado se puede descifrar con una clave, para eso se inventó. De ahí sus cometidos distintos. Se cifra lo que hay que leer después: mensajes, archivos, una conexión. Se aplica hash a lo que no hace falta leer sino comparar: si el archivo descargado coincide con el original, si la contraseña tecleada es la correcta, si un registro ha sido manipulado."
  - question: ¿Se puede recuperar el texto original a partir del hash?
    answer: "La transformación en sí es irreversible: no existe fórmula inversa. Pero eso no vuelve seguro a cualquier hash. Las cadenas cortas y corrientes se calcularon hace años y están en bases públicas: el MD5 de «123456», «password» o «qwerty» está a una búsqueda de distancia. Esas bases se llaman tablas arcoíris. La irreversibilidad protege una cadena larga e impredecible, no una cualquiera. Cuanto más corto y común es el original, más se parece su hash a una simple nota sobre él."
  - question: ¿Qué es más seguro, MD5 o SHA-256?
    answer: "SHA-256 es el estándar vigente; sobre él se sostienen los certificados de los sitios y las firmas. MD5 está roto, y no es una advertencia sobre el futuro: dos archivos distintos con el mismo MD5 se construyen en un ordenador corriente en segundos. Con él no se puede firmar nada. Aun así, a MD5 le queda un uso honesto: comprobar que un archivo se descargó entero y no se estropeó por el camino. Ahí no se le pide resistir la malicia, solo el accidente."
  - question: ¿Sirve un hash así para guardar contraseñas?
    answer: "No, y esto es lo más importante de la página. MD5 y SHA se calculan muy deprisa, y ahí está justo el problema: una tarjeta gráfica corriente recorre miles de millones de intentos por segundo, y una contraseña corta cae en minutos. Las contraseñas exigen métodos deliberadamente lentos: bcrypt, scrypt, Argon2. Y cada registro necesita su propia añadidura aleatoria —la sal—; de lo contrario contraseñas iguales dan hashes iguales, y romper una las rompe todas de golpe. Un hash de esta página no sirve para guardar contraseñas."
  - question: ¿Por qué otro sitio da un hash distinto para la misma cadena?
    answer: "Casi siempre por una de dos razones. La primera, la codificación. El hash se calcula sobre bytes, no sobre letras, y «привет» en UTF-8 y en windows-1251 son conjuntos de bytes distintos y hashes distintos. Nosotros codificamos en UTF-8; en alfabeto latino la diferencia no se ve, en cirílico se nota enseguida. La segunda, un salto de línea invisible al final. Una orden como echo texto | md5 lo añade por su cuenta y el hash sale distinto. Aquí se calcula exactamente lo que hay en el campo, sin añadidos."
  - question: ¿Mi texto va a algún servidor?
    answer: "No. Todo se calcula en la memoria de la pestaña: SHA lo aporta el propio navegador y MD5 lo calcula nuestro código en la misma página. No se hace ni una sola petición de red. No es un detalle menor: aquí se pega a menudo lo que no debería pegarse en ninguna parte: contraseñas, claves, fragmentos de datos internos."
related:
  - uuid-generator
  - base64-encode-decode
  - minify-js
---

Escriba un texto y los cuatro hashes se calculan solos, sin pulsar nada. La casilla «Mayúsculas» cambia cómo se escribe el valor, no lo que es: el mismo hash, escrito de otro modo.

## Qué calcula qué

SHA-1, SHA-256 y SHA-512 los calcula el propio navegador, el mismo componente sobre el que se sostiene el cifrado de las conexiones. Ahí no hay código nuestro a propósito: una implementación casera de un hash falla pocas veces y de forma invisible, y el precio de ese fallo es una suma de comprobación errónea sobre la que alguien tomará una decisión.

MD5 hubo que escribirlo nosotros: los navegadores lo retiran a propósito para que no se use como protección. El nuestro se contrastó con la orden `md5` del sistema en mil cadenas aleatorias y en cada longitud seguida de cero a doscientos: el límite de bloque de 64 bytes es justo donde las implementaciones caseras de MD5 suelen equivocarse.

## Aplicar un hash a una contraseña no es protegerla

El error más frecuente por el que se llega aquí. La rapidez que se les alaba a estos algoritmos es precisamente el problema con las contraseñas: recorrer miles de millones de intentos por segundo no cuesta nada. Para guardar contraseñas existen métodos deliberadamente lentos —bcrypt, scrypt, Argon2— con una sal aleatoria propia por registro.

## Comprobado contra el sistema

No contra nuestro propio código, sino contra las órdenes `md5` y `shasum` del sistema: veintiuna muestras variadas (cadena vacía, cirílico, japonés, emoji, saltos de línea, longitudes justo en los límites de bloque), mil cadenas aleatorias y todas las longitudes de 0 a 200 seguidas. Coincidió carácter por carácter en todos los casos.
