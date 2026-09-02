---
toolSlug: screen-burn-in-test
locale: es
category: device-tests
tool: screen-burn-in-test
title: Test de quemado de pantalla OLED — retención de imagen
h1: Test de quemado de pantalla
navName: Quemado de pantalla
description: "Los rellenos planos de gris y color revelan el quemado y la retención de imagen en OLED, AMOLED y televisores. Útil para revisar un móvil de segunda mano."
faq:
  - question: ¿En qué se diferencian el quemado y la retención de imagen?
    answer: "La retención es temporal: el rastro pálido de lo que había en pantalla hace un momento. Se va sola en minutos u horas, o en una sesión con el modo de igualado, y le pasa incluso a las LCD normales. El quemado es permanente: los emisores bajo una barra de navegación o el logo de un canal han trabajado mucho más que sus vecinos y ahora alumbran menos. Eso es desgaste y no tiene vuelta atrás. La prueba es la misma; la diferencia está en si la marca desaparece."
  - question: ¿Cómo reviso un móvil de segunda mano antes de comprarlo?
    answer: "Abre esta página en el propio móvil, sube el brillo al máximo y apaga el brillo automático. Recorre los rellenos del gris oscuro al gris claro y al blanco, mirando de frente. Fíjate donde siempre hay algo: la barra de navegación abajo, la barra de estado arriba, el recorte de la cámara. Si asoma la silueta pálida de los iconos o de una barra, la pantalla está gastada y hay margen para negociar."
  - question: ¿Por qué comprobar sobre gris y no sobre negro?
    answer: "Sobre negro un OLED simplemente apaga los píxeles, así que no se aprecia ninguna diferencia de desgaste. El quemado se manifiesta como brillo desigual entre zonas contiguas, y eso solo se ve donde los píxeles alumbran de forma pareja y no demasiado fuerte. Por eso la escalera de grises va primero, y el blanco y los colores puros después: en ellos se ve cuál de los tres emisores se ha gastado más."
  - question: ¿El modo de igualado repara la pantalla?
    answer: "No, y conviene decirlo claro. La retención de imagen la elimina del todo, aunque ese rastro se habría ido igualmente, solo que más despacio. El quemado real no tiene arreglo: un emisor no se recupera. Las bandas solo envejecen un poco los píxeles vecinos hasta acercarlos a los gastados, con lo que el borde de la mancha se difumina. Mientras tanto la pantalla se desgasta más, así que tenerlo días enteros es inútil y perjudicial."
  - question: ¿Cuánto debe durar el igualado?
    answer: "Diez minutos bastan para una retención reciente. Si la marca lleva tiempo, tiene sentido una o dos horas. Más no merece la pena: si en dos horas no ha cambiado nada, es quemado, y el tiempo no lo vence. La pantalla no se dormirá durante la sesión: la página la mantiene despierta."
  - question: ¿Una pantalla LCD puede quemarse?
    answer: "No en sentido estricto: en una LCD los píxeles no emiten luz, lo hace una retroiluminación común. Sí puede sufrir retención de imagen —una imagen fija prolongada deja los cristales pegados—, pero el rastro se va solo en unas horas, y antes con las bandas. El brillo desigual en los bordes es fuga de retroiluminación y no tiene que ver con el quemado."
  - question: ¿Cómo evito que la pantalla se queme?
    answer: "Activa el ocultado automático de la barra de navegación y el tema oscuro, pon la pantalla a apagarse en uno o dos minutos y mantén un brillo moderado. Lo que más desgasta son los elementos brillantes e inmóviles: el fondo blanco de un mensajero, el logo de un canal, la interfaz de un juego. Los televisores llevan desplazamiento de imagen incorporado: mejor no desactivarlo."
related:
  - dead-pixel-test
  - stuck-pixel-fixer
  - refresh-rate
---

La comprobación va por rellenos: pulsa un color y la pantalla se llena con él de borde a borde; al pulsar de nuevo pasa al siguiente. Empieza por los grises, que son los que mejor muestran el quemado. Si aparece una marca, cambia a la pestaña «Igualar»: unas bandas lentas de todos los colores ocupan la pantalla y cada píxel pasa por turnos bajo cada una.

## Qué vas a ver

- **La silueta pálida de iconos, una barra o un logo**: quemado o retención de imagen; la única diferencia es si la marca se va
- **Una mancha amarillenta**: es lo normal, el emisor azul envejece antes que el rojo y el verde, así que la zona gastada tira a amarillo
- **Brillo desigual en los bordes**: fuga de retroiluminación en una LCD, nada que ver con el quemado
- **Un punto suelto**: no es quemado, sino un píxel muerto o atascado; tienen [su propia prueba](/es/dead-pixel-test) y [su propio arreglo](/es/stuck-pixel-fixer)

## Hay que mirar bien

Sube el brillo al máximo y apaga el automático: en una pantalla apagada no se ve una marca leve. Mira de frente, porque de lado el panel cambia de color por sí solo. Y limpia la pantalla: las huellas de dedos sobre un relleno gris resultan más convincentes que cualquier quemado.

## Con franqueza sobre el igualado

Elimina la retención de imagen y no repara el quemado. Un emisor que ha trabajado el doble que sus vecinos no vuelve atrás: las bandas solo acercan los píxeles de alrededor a su estado, y así se difumina el borde de la mancha. Si en una o dos horas nada ha cambiado, no tiene sentido seguir: solo estarás desgastando más la pantalla.
