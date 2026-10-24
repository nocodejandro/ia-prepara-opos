---
name: video-clase
description: Crea video-clases animadas y narradas de legislación (Constitución, leyes, temario de oposiciones) con dibujos ilustrados, voz en castellano generada sin conexión y pausas activas que preguntan al alumno. Úsala cuando pidan «hazme un vídeo/clase/cápsula de [tema o artículos]», «vídeo interactivo para estudiar X», «clase como la de la Corona», o cambiar/mejorar una cápsula existente en video-clases/capsulas/.
---

# Video-clase interactiva

Todo el sistema está en `video-clases/`. **Lee `video-clases/README.md` entero antes de empezar**: contiene el diseño pedagógico, la referencia de `capsula.js`, la librería de dibujos y la solución de problemas.

## Flujo obligatorio

1. Pide o confirma el bloque exacto (ley + artículos) y, si la plataforma lo indica, la oposición (cambia qué artículos pesan y qué hay que saber literal).
2. Lee el **texto literal vigente** de esos artículos antes de escribir nada. Nunca cifras, plazos ni requisitos de memoria.
3. Diseña en este orden: metáfora global → imagen ancla por artículo → mapa → escenas → ejercicios. Sigue la plantilla de escenas del README (sección 4.1): arranque, pre-test, mapa, una escena por artículo con dibujo, pausa activa cada 3–4 escenas, casos prácticos, trampas, ronda rápida, vaciado y plan de repaso.
4. Crea `video-clases/capsulas/<tema>/capsula.js` copiando la estructura de `capsulas/corona/capsula.js`. Reutiliza `ILU.*`. Si falta un dibujo, añádelo a `motor/ilustraciones.js` con el mismo estilo (README sección 6).
5. Construye: `cd video-clases && node herramientas/construir.mjs capsulas/<tema>`. Corrige todos los avisos.
6. Previsualiza: `node herramientas/previsualizar.mjs capsulas/<tema> --flujo`. **Mira `capsulas/<tema>/preview/hoja.png`** y corrige textos cortados, solapes y cajas con proporción incorrecta. Repite hasta que esté limpio.
7. Pasa la lista de comprobación jurídica (README 4.6) y la final (README 11).
8. Entrega la carpeta `capsulas/<tema>/dist/` y di cuántas escenas, ejercicios y minutos de voz tiene.

## Reglas que no se negocian

- Guion: una idea por frase, segunda persona y presente. La voz nombra la imagen que aparece. Las pausas activas terminan en pregunta.
- Cada elemento visual se engancha a una frase (`at`). Nada aparece «porque sí».
- Distractores = errores reales de examen. Una sola respuesta correcta según el texto literal. Comentarios hablados `ok`/`ko` que enseñan la regla.
- Lienzo 1600×900: contenido entre y = 200 y y = 860, margen lateral 120 px, texto ≥ 26 px.
- No uses en el lienzo clases que ya usa la página (`card`, `act`, `chip`, `opt`, `seg`).
- No toques `motor/player.html` para un tema concreto. Si el motor necesita algo nuevo, hazlo genérico y documéntalo en el README.
- Voz: `es_ES-sharvard-medium`, hablante 1, ritmo 0.8, salvo que el usuario pida otra.
