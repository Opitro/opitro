# Лицензии заимствованного кода

Файл `supertonic-helper.js` -- копия `web/helper.js` из проекта
[supertone-inc/supertonic](https://github.com/supertone-inc/supertonic). Лицензия MIT.

ИЗМЕНЕНИЕ ОДНО: импорт `onnxruntime-web` переписан с голого имени модуля на адрес CDN --
браузер голое имя не разрешает. Версия 1.22.0 та же, на которой Supertonic работает на
стороннем живом сайте.

Модель -- [Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3),
лицензия **OpenRAIL-M**. Веса скачиваются с Hugging Face при первом обращении и в этом
хранилище не лежат: четыре файла ONNX, вместе 380 МБ.

Фонемизатор Supertonic не нужен вовсе: он берёт текст знаками напрямую (словарь на 8321
знак, из них 71 кириллический). Поэтому у него, в отличие от Piper, нет зависимости от
espeak-ng под GPL.
