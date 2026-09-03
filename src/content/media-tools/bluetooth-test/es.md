---
toolSlug: bluetooth-test
locale: es
category: device-tests
tool: bluetooth-test
title: "Prueba de Bluetooth online — test del adaptador y de dispositivos"
h1: Prueba de Bluetooth
navName: Prueba de Bluetooth
description: "Diagnóstico de Bluetooth online. Comprueba si tu PC o móvil tiene adaptador disponible y prueba a conectar con un dispositivo inalámbrico desde el navegador."
faq:
  - question: ¿Por qué la página no muestra los dispositivos que hay alrededor?
    answer: "Porque a un sitio no se le permite, y está bien que así sea. La lista de dispositivos cercanos la dibuja el propio navegador en su cuadro, y a la página solo le llega el dispositivo que tú elijas. De otro modo cualquier sitio cartografiaría en silencio tu equipo —auriculares, reloj, coche— y te reconocería por ese conjunto en cualquier otra parte."
  - question: Mis auriculares no aparecen en el cuadro. ¿Están rotos?
    answer: "Lo más probable es que no. El navegador solo ve dispositivos Bluetooth Low Energy que estén anunciándose en ese momento. Los auriculares, altavoces, ratones y teclados usan Bluetooth clásico: nunca saldrán en ese cuadro, aunque estén perfectos. Desde el navegador se comprueban pulseras, sensores, etiquetas y domótica."
  - question: ¿Qué significa «adaptador no encontrado o apagado»?
    answer: "Que el módulo no existe en el aparato o está desactivado en el sistema. Enciende el Bluetooth en los ajustes y recarga la página. Los ordenadores de sobremesa a menudo no llevan módulo: allí hace falta un adaptador USB aparte."
  - question: En mi iPhone el botón no hace nada. ¿Por qué?
    answer: "Safari no tiene Web Bluetooth en absoluto, y todos los navegadores del iPhone funcionan sobre su motor, así que ninguno sirve. Firefox también desactivó la función. Ambos por el mismo motivo: el conjunto de tus dispositivos puede identificarte sin que lo notes. La prueba funciona en Chrome, Edge y Opera en ordenador y en Android."
  - question: ¿Por qué no se muestra la batería del dispositivo?
    answer: "El nivel solo se ve en dispositivos que lo publican mediante el servicio estándar de batería. Muchos fabricantes usan servicios privados: entonces solo su aplicación lee el nivel y al navegador no se lo comunican."
  - question: ¿La página accede a mis dispositivos emparejados?
    answer: "No. Ni a la lista de emparejamientos, ni a archivos, ni a contactos: así está construido el propio protocolo. La página solo conoce el dispositivo que has elegido con tus manos, y todo eso se borra de la memoria al cerrar la pestaña."
related:
  - battery-test
  - phone-sensors-test
  - webcam-test
---

La página muestra si tu navegador admite Web Bluetooth y si ve el adaptador. Después está el botón: el navegador abrirá su propio cuadro con los dispositivos cercanos, y lo que elijas aparecerá en la tabla con su identificador, su estado y, si el aparato lo ofrece, su batería.

## Qué se comprueba

- **El navegador**: si tiene Web Bluetooth siquiera
- **El adaptador**: si el módulo está encendido y el sistema lo ve
- **La conexión**: un enlace real con el dispositivo elegido
- **La batería**: en dispositivos con el servicio estándar

## Por qué un sitio no ve los dispositivos de alrededor

Está pensado así. Una página no puede escanear el aire: la lista la dibuja el navegador en su cuadro y al sitio le llega exactamente un dispositivo, el que has señalado.

Si fuera de otro modo, cualquier sitio copiaría en silencio todo el equipo que te rodea: auriculares, reloj, báscula, coche. Ese conjunto es casi tan único como una huella dactilar y te identificaría en cualquier otra web. Por eso justamente Apple y Mozilla cerraron la función por completo.

## Qué verás en el cuadro de selección

Solo dispositivos Bluetooth Low Energy que se estén anunciando ahora mismo: pulseras, sensores, etiquetas, bombillas y enchufes inteligentes, básculas, termómetros.

Los auriculares, altavoces, ratones y teclados no estarán: funcionan con Bluetooth clásico, al que el navegador no llega. Es la causa más común de confusión en páginas como esta, y no es un adaptador roto.

## Todo se queda contigo

Ni archivos, ni contactos, ni historial de emparejamientos llegan a la página: el protocolo está construido así. El dispositivo elegido vive solo en la memoria de la pestaña y desaparece con ella.
