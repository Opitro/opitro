# Лицензии заимствованного кода

Файлы `piper-tts-web.js`, `piper-phonemize.js` и `voices-static.js` в этой папке -- копия
библиотеки [@mintplex-labs/piper-tts-web](https://www.npmjs.com/package/@mintplex-labs/piper-tts-web)
версии 1.0.5, форка [@diffusion-studio/vits-web](https://github.com/diffusion-studio/vits-web).
Лицензия MIT. Изменения перечислены в шапке `piper-tts-web.js`.

Голосовые модели -- проект [rhasspy/piper](https://github.com/rhasspy/piper), лицензия MIT.
Модели скачиваются с Hugging Face при первом обращении и в этом хранилище не лежат.

Фонемизатор -- [espeak-ng](https://github.com/espeak-ng/espeak-ng), лицензия GPL-3.0,
собранный в WebAssembly. Он не связывается с нашим кодом статически: это отдельный
модуль WebAssembly, который загружается и вызывается во время работы.

MIT License

Copyright (c) 2024 diffusion-studio, Mintplex Labs

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
