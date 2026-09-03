---
toolSlug: battery-test
locale: es
category: device-tests
tool: battery-test
title: "Prueba de batería online — carga, consumo y estado del acumulador"
h1: Prueba de batería
navName: Prueba de batería
description: "Diagnóstico de la batería online. Comprueba el nivel de carga y el estado de alimentación, y mide la velocidad de descarga bajo carga desde tu navegador."
faq:
  - question: ¿Se puede saber el desgaste de la batería desde el navegador?
    answer: "No, y no vamos a fingir lo contrario. Al navegador no se le comunica ni la capacidad actual, ni la de diseño, ni el número de ciclos: ninguna de las cifras con las que se calcula el desgaste. Los sitios que muestran «salud 87 %» se la inventan. El desgaste real se consulta en el sistema: en iPhone, Ajustes → Batería → Estado de la batería; en Windows, el comando powercfg /batteryreport; en macOS, Ajustes → Batería → Estado."
  - question: ¿Qué mide entonces esta página?
    answer: "La velocidad de consumo bajo una carga controlada. La página carga el procesador en hilos separados y observa cuánto baja la carga durante el tiempo elegido. De ahí sale el consumo en porcentaje por hora y una estimación de cuánto duraría una carga completa a ese ritmo. No es desgaste, pero es justo la cifra que empeora en una batería cansada."
  - question: ¿Por qué en tres minutos no cambió la carga?
    answer: "Porque el navegador redondea el nivel y, en una batería grande, un punto porcentual tarda más de tres minutos. No es un fallo de la página. Elige una duración mayor —diez o veinte minutos— y la medición saldrá."
  - question: En mi iPhone la página no muestra nada. ¿Por qué?
    answer: "Los datos de batería están cerrados en Safari, y todos los navegadores del iPhone funcionan sobre el motor de Safari, así que ninguno sirve. El motivo es la privacidad: los sitios aprendieron a reconocer a un visitante entre pestañas por su nivel de batería. Los datos en vivo están en navegadores Chromium: Chrome, Edge, Opera y navegadores de Android."
  - question: ¿Qué consumo es normal?
    answer: "Con una carga seria, un móvil nuevo pierde en torno al 15–25 por ciento por hora y un portátil el 20–40, según el procesador y el brillo. Una cifra alta bajo carga no dice nada por sí sola: lo preocupante es que la batería se funda tres veces más rápido de lo habitual en un uso normal. Entonces conviene mirar el desgaste real en el sistema."
  - question: ¿La medición gasta batería?
    answer: "Sí, y no puede ser de otro modo: para medir el consumo hay que consumir. La página carga el procesador durante el tiempo elegido: tres minutos cuestan una fracción de punto, veinte bastante más. Desenchufa el cargador durante la prueba o no habrá nada que medir."
related:
  - phone-sensors-test
  - vibration-test
  - webcam-test
---

La página muestra todo lo que el navegador sabe de la batería: nivel de carga, si estás enchufado o con batería, tiempo hasta la carga completa y autonomía restante. Debajo está la medición del consumo: la página carga el procesador y cuenta a qué velocidad se funde la carga.

## Qué se comprueba

- **Nivel de carga**: en cifra y en barra, se actualiza solo
- **Alimentación**: red o batería, con estimaciones de tiempo
- **Gráfico de carga**: una línea fina en el tiempo; hasta una caída de un punto se ve
- **Consumo bajo carga**: en porcentaje por hora y en horas de autonomía

## Sobre el desgaste, con honestidad

El desgaste de la batería no se puede medir desde una página. Al navegador no se le dice ni la capacidad actual, ni la de diseño, ni los ciclos: ninguno de los números con los que se calcula. Lo único que ofrece el navegador es el nivel de carga en porcentaje, un indicador de carga y estimaciones aproximadas de tiempo.

Por eso aquí no hay una fila de «salud», y cualquier sitio que la muestre se la está inventando.

El desgaste real se consulta en el sistema:

- **iPhone**: Ajustes → Batería → Estado de la batería
- **Android**: Ajustes → Batería; algunos modelos requieren el menú de servicio del fabricante
- **Windows**: el comando `powercfg /batteryreport`
- **macOS**: Ajustes → Batería → Estado

## Qué medimos en su lugar

La velocidad de consumo. Una batería cansada entrega la carga más rápido y cae a saltos, y eso se ve en una medición: la página carga el procesador en hilos separados, para que la ventana no se congele, y cuenta cuánto bajó la carga en el tiempo elegido.

Un móvil nuevo bajo carga pierde un 15–25 por ciento por hora; un portátil, un 20–40. Una cifra alta bajo carga es normal en sí misma; lo preocupante es que se funda tres veces más rápido de lo habitual en un uso normal.

## Todo se queda contigo

Los datos de la batería viven en la memoria de la pestaña. No se envía nada a ninguna parte ni se guarda nada: esta página no tiene ni subida ni almacenamiento.
