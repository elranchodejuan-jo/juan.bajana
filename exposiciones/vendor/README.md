# Dependencias distribuidas localmente

| Recurso | Versión fija | Procedencia | Licencia |
| --- | --- | --- | --- |
| reveal.js | 5.2.1 | https://registry.npmjs.org/reveal.js/-/reveal.js-5.2.1.tgz | MIT, `reveal/LICENSE` |
| qrcode-generator | 1.4.4 | https://registry.npmjs.org/qrcode-generator/-/qrcode-generator-1.4.4.tgz | MIT, `qrcode/LICENSE` |

Se incluyen solo `reveal.esm.js`, `reveal.css`, `notes.esm.js` y el generador QR. Los encabezados originales se conservan. La licencia completa del generador QR procede del repositorio oficial https://github.com/kazuhikoarase/qrcode-generator/blob/master/LICENSE ; la distribución 1.4.4 declara MIT en su cabecera.

Las fuentes Inter y JetBrains Mono, y los iconos Lucide, reutilizan los archivos y licencias de `/assets/`. Las figuras originales tienen su registro en `../assets/figuras/LICENSES.md`.

Documentación consultada el 17 de octubre de 2026:

- https://revealjs.com/initialization/
- https://revealjs.com/config/
- https://revealjs.com/keyboard/
- https://revealjs.com/speaker-view/
- https://revealjs.com/pdf-export/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

El navegador no necesita acceder a estas direcciones para cargar la exposición. Son referencias de implementación, no dependencias remotas.

## Integridad de los archivos distribuidos

```text
3a850fa5f08101db6f40676c2786e10bd2cd5fff7b12ffdf1e0c434d4e49d90c  qrcode/LICENSE
18ae399f81182bc9de916e9c77b195df20cc58d6f2d55a62b085a299f1bf1780  qrcode/qrcode.js
34014800f4126ac2525e224166f099f26628612e95c41f76d70841b63138c989  reveal/LICENSE
8d3b85056cf4d4aac5af1ac5b67cce3441deff5283f1be6444d2678cdc9256fb  reveal/notes.esm.js
68f915a11ebf7203c0446576b7e952ff61c5dd02134a8a226ffaf62ed42136d2  reveal/reveal.css
50e198be47bef94b553614bdc34979ac60f0a3c24a0280ff378fc3e877a64f01  reveal/reveal.esm.js
```
