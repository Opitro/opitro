---
toolSlug: jwt-decoder
locale: es
category: dev
tool: jwt-decoder
title: Decodificador JWT online — Verificar firma y parsear JSON Web Token
h1: Decodificador y validador JWT
navName: Decodificador JWT
description: "Herramienta profesional para decodificar, depurar y verificar la firma de tokens JWT online. Analiza el Header y Payload de forma 100% local en tu navegador."
faq:
  - question: ¿Es seguro introducir la clave secreta en el sitio de otro?
    answer: "Aquí va la respuesta honesta y no la publicitaria. Esta página no hace ninguna petición de red, y puede comprobarlo usted mismo: abra la pestaña «Red» del navegador, escriba una clave y no aparecerá nada. Pero nadie le obliga a creernos, y lo esencial no está en nosotros. La costumbre de pegar claves de producción en páginas web es peligrosa de por sí: la mayoría de esas páginas están hechas de otro modo, y una clave pegada una vez ya no se puede despegar. La regla es simple: pruebe la herramienta ajena con una clave aparte, desechable, y no pegue la de producción en ninguna parte."
  - question: ¿Qué significa «la firma no coincide»?
    answer: "Que el hash de la cabecera y la carga útil calculado con su clave no equivale a la tercera parte del token. Suele haber dos motivos: o la clave no es la que usó el servidor al firmar, o el contenido se alteró después de la firma. Pero hay un tercero del que casi nadie habla: puede haber introducido una contraseña para un token firmado con RS256 o ES256. Esas firmas se verifican con clave pública y no con un secreto compartido, y en ese caso decimos claramente «hace falta una clave pública» en lugar de informar de una firma incorrecta. No es lo mismo."
  - question: ¿Están cifrados los datos dentro del token?
    answer: "No, y este es el error de concepto más común sobre JWT. La cabecera y la carga útil van en el token a la vista —solo escritas en base64url— y cualquiera puede leerlas sin clave alguna. Es justo lo que hace el primer cuadro de esta página: descodifica el token sin pedir clave. La firma protege contra la manipulación, no contra la lectura. Por eso un token no es lugar para contraseñas, números de tarjeta ni documentos de identidad: quien lo tenga en la mano los verá todos."
  - question: "¿Qué es alg: none y por qué merece su propia respuesta?"
    answer: "Es un token sin firma. El estándar lo permite, y en su día sostuvo un ataque real: las bibliotecas aceptaban esos tokens como auténticos, así que bastaba reescribir la carga útil, poner alg: none y borrar la tercera parte para convertirse en administrador. Lo informamos por separado y no junto a «la firma no coincide»: entre una cerradura rota y la ausencia de cerradura hay diferencia, y la persona debe verla."
  - question: ¿Por qué exp muestra una hora equivocada?
    answer: "Casi siempre porque exp y nbf van en SEGUNDOS desde 1970, mientras que el familiar Date.now() de JavaScript devuelve milisegundos. Compararlos directamente es un error de mil veces: un token vivo parece haber caducado en 1970 o durar hasta el quincuagésimo octavo milenio. Nosotros convertimos las marcas en fechas legibles y decimos cuánto queda, calculando siempre en segundos."
  - question: ¿Cómo se comprobó que la firma se calcula bien?
    answer: "Con el programa de otro. Trescientos tokens fueron firmados por el openssl del sistema —del mismo modo en que los firma un servidor— en tres longitudes de HMAC. En los trescientos la clave correcta coincidió y una clave modificada no coincidió en ninguno. Además, el conocido token que se muestra en jwt.io lo lee y verifica nuestra herramienta, y openssl lo reproduce carácter por carácter."
related:
  - hash-generator
  - unix-timestamp
  - json-formatter
---

Pegue un token y se descodifica solo. La clave hace falta únicamente para comprobar la firma: para leer el contenido no se necesita, y en eso está todo el asunto.

## Un token se lee sin clave

Lo primero que conviene entender sobre JWT: no es cifrado. La cabecera y la carga útil están escritas en base64url, una codificación reversible, no una cifra. Cualquiera que tenga el token lee todo su interior en un segundo y sin clave alguna.

La firma protege contra la **manipulación**: no se puede alterar la carga útil y pasar desapercibido. Contra la **lectura** no protege en absoluto. De ahí la regla: un token no es lugar para contraseñas, números de tarjeta ni nada que no enseñaría a un desconocido.

## Tres respuestas en lugar de una

Los descodificadores corrientes conocen dos: firma válida y firma inválida. No basta.

**No hay firma en absoluto.** `alg: none`: un token sin ella. Informarlo como «firma inválida» es incorrecto: la diferencia entre una cerradura rota y la ausencia de cerradura importa.

**No hay con qué comprobarla.** RS256 y ES256 se verifican con clave pública, no con contraseña. Decirle a quien ha escrito una contraseña que la firma es inválida sería mentir.

**No se ha introducido clave.** También su propia respuesta, no «inválida».

## Las marcas de tiempo van en segundos

`exp`, `nbf` e `iat` se registran en segundos desde 1970. El error más frecuente al trabajar con ellas es compararlas con `Date.now()`, que en JavaScript devuelve milisegundos. Es una diferencia de mil veces, y el token parece haber caducado en 1970 o vivir hasta el quincuagésimo octavo milenio. Nosotros convertimos las marcas en fechas y decimos cuánto queda.

## Cómo se ha comprobado

Con el programa de otro y no con nuestro propio código: trescientos tokens firmados por el `openssl` del sistema en tres longitudes de HMAC. La clave correcta coincidió en los trescientos; una clave modificada, en ninguno. Aparte se verificó que manipular un rol en la carga útil lo detecta la firma y que, al mismo tiempo, **se ve al descodificar sin clave alguna**.
