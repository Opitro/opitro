---
toolSlug: number-base-converter
locale: es
category: dev
tool: number-base-converter
title: Conversor de sistemas de numeración online — Convertir Binario, Decimal, HEX
h1: Conversor de sistemas de numeración
navName: "Conversor de bases numéricas"
summary: "Base 2, 8, 10, 16, todas a la vez"
description: "Herramienta profesional para convertir números entre diferentes bases: binario, octal, decimal y hexadecimal. Realiza conversiones matemáticas de forma instantánea y 100% local."
faq:
  - question: ¿Cómo funciona realmente la conversión entre binario y hexadecimal?
    answer: "Apenas hace falta calcular. La forma binaria se parte en grupos de cuatro dígitos desde la derecha, y cada grupo es exactamente un carácter hexadecimal: 1010 es A, 0010 1010 es 2A. La coincidencia no es casual: dieciséis es dos elevado a la cuarta, así que cuatro bits agotan justo un carácter. De ahí la costumbre de escribir direcciones de memoria y máscaras de bits en hexadecimal: 64 bits se encogen a 16 caracteres sin perder nada."
  - question: ¿Por qué no basta con parseInt y toString?
    answer: "Porque un número corriente de JavaScript guarda enteros exactos solo hasta 2 elevado a 53, y el hexadecimal hace falta justo pasada esa línea. Compruébelo: parseInt('FFFFFFFFFFFFFFFF', 16).toString(16) devuelve 10000000000000000, un uno con ceros en lugar de dieciséis letras F. El número se redondeó al leerlo. Nosotros calculamos con BigInt, cuya precisión no se agota, y contrastamos las respuestas con python3, donde los enteros tampoco tienen tope."
  - question: ¿Por qué no hay decimales?
    answer: "Porque para ellos no existe una respuesta honesta. La parte fraccionaria en binario es casi siempre infinita: el 0,1 decimal es 0,000110011001100… repitiéndose sin fin. Cualquier resultado mostrado habría que cortarlo, es decir, presentar una aproximación como exacta. Preferimos no admitir el punto en los campos antes que descartar la fracción en silencio."
  - question: ¿En qué se usan de verdad el octal y el hexadecimal?
    answer: "El hexadecimal son los códigos de color en la web, las direcciones de memoria, las máscaras de bits, los hashes y los códigos de caracteres. El octal se ha replegado casi por completo a los permisos de Linux y Unix: los permisos se escriben en tríos de bits (lectura, escritura, ejecución), y un trío de bits es exactamente un dígito octal. Por eso 0755 se lee de un vistazo: 7 es rwx para el propietario, 5 es r-x para los demás."
  - question: ¿Cuántos bits ocupa mi número?
    answer: "Bajo los campos se muestran dos cosas: cuántos dígitos binarios ocupa el número y en qué tamaño habitual cabe: 8, 16, 32 o 64 bits. Eso suele ser lo que hace falta saber: 255 todavía cabe en un byte, 256 ya no; 65535 ocupa exactamente 16 bits. Para los números negativos no mostramos el tamaño: depende de cómo se codifiquen y no hay una única respuesta correcta."
  - question: ¿Mis números van a algún servidor?
    answer: "No. Convertir entre bases son unas pocas líneas de aritmética; no necesita ni servidor ni red. La página no hace ninguna petición de red: todo se calcula en la memoria de la pestaña. Funciona también sin internet, una vez abierta la página."
related:
  - hash-generator
  - unix-timestamp
  - color-converter
---

Escriba un número en cualquiera de los cuatro campos y los otros tres se recalculan sobre la marcha. Los caracteres imposibles sencillamente no aparecen: un 2 no entra en el campo binario, el 8 y el 9 no entran en el octal, las letras posteriores a la F no entran en el hexadecimal.

## Cuatro bits, un carácter hexadecimal

Dieciséis es dos elevado a la cuarta, así que cuatro dígitos binarios agotan exactamente un carácter hexadecimal. De ahí sale todo el cálculo mental cómodo: `1010` = A, `0010 1010` = 2A. El octal funciona igual pero en tríos: tres bits, un dígito.

## Por qué BigInt y no un número corriente

Un número corriente de JavaScript guarda enteros exactos solo hasta 2⁵³. El hexadecimal hace falta justo donde esa línea ya se ha cruzado: una dirección de memoria, una máscara, un trozo de hash son 64 bits. La vía habitual con `parseInt` devuelve `10000000000000000` para `FFFFFFFFFFFFFFFF`: un uno con ceros. Aquí eso no ocurre.

## Sin decimales, y no es un olvido

El 0,1 decimal es infinito en binario. No se puede mostrar exacto, y cortarlo sería dar una aproximación por exacta. El punto no se admite en los campos.

## Cómo se ha comprobado

Contra `python3`: sus enteros tampoco tienen tope, y `format(x, 'b')`, `'o'` y `'X'` los escribieron otras personas. Se pasaron 75 números: redondos, de frontera (255, 256, 65535, 2⁵³, 2⁶⁴−1) y aleatorios de hasta 128 bits, en ambos sentidos y en las cuatro bases. Aparte se verificó aquello para lo que se hizo todo esto: pasado 2⁵³ el método de manual da una respuesta equivocada y este da la correcta.
