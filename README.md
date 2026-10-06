# WGWM – Calculadora de series de aproximación

Calculadora de series de aproximación para ejercicios con barra libre. Dado un peso de trabajo, calcula las series y cuántos discos olímpicos de cada denominación necesitas juntar antes de empezar.

Basado en los programas de [warmup-reps](https://github.com/nmunson/warmup-reps) por nmunson, licenciado bajo GPLv3.

## Uso

Sirve la carpeta con cualquier servidor estático (por ejemplo `python3 -m http.server`) y abre `index.html`; los módulos ES no cargan desde `file://`. La app usa hash routing (`#/` calculadora, `#/opciones` configuración) y persiste tus datos en `localStorage`.

## Programas incluidos

- Starting Strength
- 5×5
- Max Single
- Greyskull LP

## Licencia

[GPLv3](LICENSE) — este proyecto es software libre. Los programas en `data/programs.js` se derivan de warmup-reps, también GPLv3.

## Uso de IA

hecho con DeepSeek y Claude Sonnet 5.5 (por pereza y prisa)