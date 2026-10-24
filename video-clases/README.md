# Video-clases interactivas · guía completa

Sistema para crear **vídeos animados y narrados que enseñan legislación de verdad**: dibujos ilustrados con *motion graphics*, voz en castellano generada sin conexión, y un reproductor que **se para para preguntarte** (pausas activas, casos prácticos, ronda rápida, vaciado de memoria y plan de repaso espaciado).

Ejemplos incluidos:

| Cápsula | Carpeta | Qué demuestra |
|---|---|---|
| La Corona (CE, arts. 56–65) | `capsulas/corona/` | Dibujos de personajes, baraja española como metáfora, objetos que se mueven |
| Derechos fundamentales (CE, Título I) | `capsulas/derechos-fundamentales/` | Mapa en forma de edificio, «historia de una vida», medallas, casos prácticos |

Cada cápsula terminada es una carpeta `dist/` con `index.html` + `audio/*.mp3`. Se puede subir tal cual a cualquier hosting estático o servir desde la plataforma.

---

## 1. Cómo está construido (visión general)

```
video-clases/
├── motor/
│   ├── player.html        ← reproductor + estilos + piezas comunes (plantilla)
│   └── ilustraciones.js   ← librería de dibujos SVG (personajes, objetos, baraja…)
├── capsulas/<tema>/
│   ├── capsula.js         ← EL CONTENIDO: guion, escenas, dibujos y ejercicios
│   ├── guion.json         ← (generado) frases que lee la voz
│   └── dist/              ← (generado) index.html + audio/*.mp3 + audio/manifest.json
├── herramientas/
│   ├── construir.mjs      ← guion → voz → HTML final
│   ├── generar-voz.py     ← síntesis con Piper (gratis, sin conexión) + MP3
│   └── previsualizar.mjs  ← hoja de contactos de todas las escenas + prueba del flujo
└── voces/                 ← (no se sube a git) modelo de voz .onnx
```

La idea clave: **el motor no sabe nada de la Constitución**. Todo lo que cambia de un tema a otro vive en un único archivo, `capsula.js`. Crear un tema nuevo consiste en escribir ese archivo y ejecutar un comando.

### El ciclo de vida de una escena

1. Cada escena tiene un **guion** (`say`): una lista de frases cortas.
2. La voz lee cada frase y `generar-voz.py` anota **en qué segundo empieza cada frase** (`manifest.json` → `"s": [0, 3.1, 7.9…]`).
3. Cada elemento visual dice **en qué frase aparece** (`at`). El motor lo muestra justo cuando la voz empieza esa frase. Así el dibujo y la voz van siempre sincronizados, también a 1,5×.
4. Cuando la voz acaba la escena:
   - si la escena no tiene ejercicio → pasa a la siguiente;
   - si tiene ejercicio (`act`) → **se para**, abre la tarjeta de pregunta, espera tu respuesta, reproduce el comentario de la voz (`ok`/`ko`/`fb`) y continúa sola a los ~2 s (o con «Seguir»).

Por eso el guion **anuncia la pregunta** («Pausa activa. … ¿quién va antes?»): la narración termina justo con la pregunta, y en ese instante aparece la tarjeta.

---

## 2. Instalación en tu PC (una vez)

Requisitos: **Node 18+** y **Python 3.10+**.

Lo más rápido: `bash video-clases/instalar.sh`. Instala todo, descarga la voz (con copia de reserva desde GitHub) y hace una prueba completa. Si prefieres hacerlo a mano:

```bash
cd video-clases
npm install                               # instala playwright (solo para previsualizar)
npx playwright install chromium
pip install piper-tts lameenc numpy       # voz y conversión a MP3 (sin ffmpeg)
python3 -m piper.download_voices es_ES-sharvard-medium --data-dir voces
```

Si `piper.download_voices` no existe en tu versión, descarga a mano `es_ES-sharvard-medium.onnx` y `es_ES-sharvard-medium.onnx.json` (repositorio `rhasspy/piper-voices` en Hugging Face, carpeta `es/es_ES/sharvard/medium/`) y déjalos en `video-clases/voces/`. Alternativa: el paquete `vits-piper-es_ES-sharvard-medium.tar.bz2` de las *releases* `tts-models` del repositorio `k2-fsa/sherpa-onnx` en GitHub (trae los mismos dos archivos).

Comprobación:

```bash
node herramientas/construir.mjs capsulas/corona     # regenera voz si hace falta y monta dist/
node herramientas/previsualizar.mjs capsulas/corona --flujo
```

---

## 3. Crear una cápsula nueva, paso a paso

1. **Elige el bloque** (5–10 artículos, 6–9 minutos de voz). Más largo cansa; mejor dos cápsulas.
2. **Lee el texto literal** de los artículos (BOE consolidado). Anota: qué dice cada apartado, cifras, plazos, mayorías, quién hace qué y las excepciones. Las trampas de examen salen de ahí.
3. **Busca la metáfora que lo une todo** (sección 4.3). Ejemplos: la Corona = baraja española; el Título I = un edificio; la Sección 1ª = la historia de una vida.
4. **Elige una imagen ancla por artículo o idea difícil** (Rey bebé en el trono, dado de caras impares, mochila de la responsabilidad).
5. **Escribe `capsula.js`** con la plantilla de escenas de la sección 4.1. Copia `capsulas/corona/capsula.js` como punto de partida.
6. **Construye**: `node herramientas/construir.mjs capsulas/<tema>`. El script avisa si falta algún comentario de ejercicio o si un elemento apunta a una frase que no existe.
7. **Previsualiza**: `node herramientas/previsualizar.mjs capsulas/<tema> --flujo` y abre `capsulas/<tema>/preview/hoja.png`. Busca textos cortados, solapes y huecos vacíos.
8. **Revisa la exactitud jurídica** (sección 4.6) y escucha la voz en el navegador (abre `dist/index.html`).
9. **Publica** la carpeta `dist/`.

Si cambias solo una frase, la voz se regenera **solo para ese clip** (caché por texto).

---

## 4. Diseño pedagógico (lo que hace que funcione)

### 4.1 Plantilla de escenas (el orden importa)

| # | Escena | Técnica | Por qué |
|---|---|---|---|
| 0 | Arranque: título grande, metáfora, ganas | Gancho | Activa la atención y presenta la imagen que lo unirá todo |
| 1 | 3 preguntas antes de estudiar (`pretest`) | Pre-test | Intentar responder antes, aunque falles, mejora lo que retienes después |
| 2 | Mapa del bloque (cartas, edificio…) | Organizador previo | Ver la estructura completa da un «sitio» a cada dato nuevo |
| 3…n | Una escena por artículo o idea, con **dibujo ancla** | Codificación dual | Palabra + imagen = doble huella en la memoria |
| cada 3–4 escenas | **Pausa activa** (`mcq` o `match`) | Recuperación | Sacar la respuesta de la cabeza fija más que releer |
| si hay supuestos | **Caso práctico** (`mcq` con situación real) | Aplicación | Obliga a entender, no solo a repetir |
| listas largas | Mnemotecnia (verbos, palos, puertas…) | Agrupar + mnemotecnia | Reduce 10 elementos sueltos a 2–4 bloques con sentido |
| penúltimas | «5 trampas de examen» | Errores típicos | Ataca justo donde fallan los opositores |
| — | Ronda rápida (`rapid`, 8 × 10 s, temas mezclados) | Práctica intercalada | Mezclar cuesta más y por eso consolida mejor |
| — | Vaciado de memoria (`blurt`, 90 s escribiendo) | Recuerdo libre | Muestra exactamente qué falta |
| última | Pre-test revisado + plan +1/+3/+7/+14 (`end`) | Repaso espaciado | Frena la curva del olvido |

Proporción orientativa: **1 ejercicio cada 2–3 minutos** de voz. La Corona tiene 24 escenas, 7,3 min de narración y 9 ejercicios.

### 4.2 Cómo escribir el guion (`say`)

- **Una idea por frase**: cada frase es un «momento» al que se engancha un elemento visual. Frases de 8–25 palabras.
- **Habla en segunda persona y en presente**: «Imagina…», «Fíjate en…», «Quédate con esto».
- **Anuncia la imagen**: «Imagínalo dentro de una burbuja de cristal». La voz nombra lo que aparece en pantalla.
- **Lo literal, tal cual**: cifras, plazos, «en todo caso», «previa autorización», «español de nacimiento». Lo demás, explicado con palabras sencillas.
- **Las pausas activas terminan en pregunta**: «Pausa activa. [situación]. ¿[pregunta]?». En ese momento se abre la tarjeta.
- **Escribe los números con cifras** («72 horas», «18.2»): la voz los lee bien («dieciocho punto dos»). Evita abreviaturas en lo que se lee (`art.` se expande solo, pero mejor escribe «artículo»).
- Ritmo: la voz va al 0,8 de duración (≈25 % más rápida). Si una escena pasa de ~25 s, pártela.

### 4.3 Cómo elegir dibujos que se recuerden

Una buena imagen ancla cumple cuatro condiciones:

1. **Concreta**: una persona, un objeto o una escena, nunca un concepto abstracto.
2. **Exagerada o absurda**: un Rey *bebé* con una corona que le baila, un dado *solo con caras impares*. Lo raro se recuerda.
3. **Unida al contenido por un detalle exacto**: las caras 1, 3 y 5 del dado son literalmente las regencias posibles. El silbato de árbitro es «arbitra y modera».
4. **Que se mueva o actúe**: la corona atraviesa las cuatro puertas; la mochila pasa del Rey al Presidente («responde quien refrenda»).

Ejemplos para otros temas:

| Contenido | Imagen ancla |
|---|---|
| Permiso por nacimiento y cuidado del menor | `ILU.familia()`: un bebé con sus dos progenitores y un corazón que late; un calendario con las semanas de cada uno |
| Mayorías (absoluta / 3/5 / 2/3) | Una tarta cortada en porciones; la porción se agranda según la mayoría |
| Moción de censura constructiva | Un sillón con un candidato *ya sentado* esperando: sin candidato no hay moción |
| Silencio administrativo | Un buzón con telarañas y un reloj de arena |
| Recurso de alzada vs reposición | Una escalera: alzada sube al superior; reposición vuelve al mismo escalón |
| Plazos (1 mes, 3 meses) | Hojas de calendario que caen del techo |

### 4.4 Cómo escribir las preguntas

- **Distractores = errores reales**: cada opción incorrecta debe ser algo que un opositor confundiría de verdad (el 14 en lugar del 15; «español» en lugar de «español de nacimiento»).
- **Una sola respuesta claramente correcta** según el texto literal.
- `why`: una frase con el artículo exacto, que se muestra en pantalla.
- `ok` / `ko`: lo que dice la voz. Empieza con el veredicto («¡Exacto!» / «No. Es…») y repite la regla. El `ko` debe enseñar, no solo corregir.
- **Casos prácticos**: situación cotidiana en 1–2 frases con datos concretos («lunes a las 10:00») → pregunta → explicación con el artículo.
- **Pre-test**: 3 preguntas sobre lo más importante del bloque. No se corrigen en el momento; se revisan al final (`@pretest`).
- **Ronda rápida**: 8 preguntas de *todos* los artículos mezclados, respuesta «¿qué artículo es?» o dato clave.
- **Vaciado**: `items` con número, etiqueta y palabras clave sin tildes (expresión regular). Prueba que reconoce variantes («regencia|regente»).

### 4.5 Diseño visual

- Lienzo fijo de **1600 × 900** que se escala a cualquier pantalla. Margen lateral de 120 px.
- Cabecera automática: etiqueta de técnica (amarilla) + título en y = 58–190. El contenido empieza en y ≥ 200 y termina en y ≤ 860.
- Tamaños mínimos: texto 26 px, títulos de tarjeta 30–34 px. Se ven en móvil gracias a los subtítulos.
- Paleta del lienzo: fondo petróleo `#0e272b`, papel `#f4efe6`, amarillo `#ffcf5a`, coral `#ff7a59`, menta `#63d6b5`, cielo `#8cc8ff`. Amarillo = clave; coral = trampa o prohibición; menta = correcto o excepción.
- Tipografías: **Bricolage Grotesque** (títulos y números) y **Figtree** (texto).
- Una cosa grande por momento. Si en una frase aparecen más de 3 elementos, divide la frase.

### 4.6 Lista de comprobación jurídica

- [ ] Cada cifra, plazo y requisito coincide con el texto consolidado del BOE.
- [ ] Las reformas están fechadas (1992 art. 13.2; 2011 art. 135; 2024 art. 49).
- [ ] Ninguna pregunta tiene dos respuestas defendibles.
- [ ] Lo que se dice literal está entre comillas o dicho tal cual («salvo lo dispuesto…»).
- [ ] Las mnemotecnias no deforman el contenido (el palo de bastos «resume», no sustituye, al art. 62).

---

## 5. Referencia de `capsula.js`

```js
const CAPSULA = {
  id: "ce-corona",                       // clave única (guarda progreso en el navegador)
  titulo: "La Corona en modo estudio",   // <title> de la página
  pagina: {
    eyebrow: "Constitución Española · Título II · arts. 56 a 65",
    h1: 'La Corona <em>en modo estudio</em>',
    meta: "24 escenas · 9 ejercicios · voz rápida",
    inicio: { eyebrow: "…", titulo: "…", texto: "…" }   // tarjeta de «Empezar»
  },
  grupos: [["Arranque",[0,1,2]], …],     // índice lateral: [título, [escenas]]
  shots: [ /* escenas */ ]
};
```

### 5.1 Escena

```js
{
  tech: "dib",                 // etiqueta: map pre rec his caso mne con img err mix vac esp gan chu dib
  title: "Art. 59 · El Rey bebé",
  hdr: false,                  // opcional: sin cabecera automática (portada)
  say: ["Frase 0.", "Frase 1.", …],            // lo que lee la voz
  els: [ E(…), E(…) ],                          // elementos visuales
  act: { type: "mcq", … },                      // opcional: ejercicio al final
  ok: [...], ko: [...], fb: [...], hi: [...], lo: [...],   // comentarios hablados
  walker: [{at, x, y}]                          // opcional: muñequito que recorre estaciones
}
```

### 5.2 Elemento: `E(at, x, y, ancho, alto, html, opciones)`

| Opción | Valores | Efecto |
|---|---|---|
| `a` | `up` (defecto), `pop`, `left`, `right`, `stamp`, `grow`, `wipe`, `fade`, `flip`, `drop`, `none` | Animación de entrada. `none` = visible desde el inicio |
| `d` | segundos | Retraso respecto al inicio de la frase `at` |
| `out` | índice de frase | Desaparece al empezar esa frase |
| `move` | `[{at, x, y}]` | Se desplaza a (x, y) al empezar cada frase indicada (corona por las puertas, mochila) |
| `z` | número | Capa (para que un objeto pase por delante) |

`html` puede ser cualquier HTML. Atajos disponibles:

- `ic("crown", color)`: icono plano. Lista en `IC` dentro de `motor/player.html`.
- `callout(icono, título, detalle, color)`: tarjeta con icono.
- `tile(icono, número, título, detalle, color)`, `st(...)`/`st2(...)`: estaciones de recorrido.
- Clases CSS: `.mega`, `.ttl`, `.sub`, `.txt`, `.txt.s`, `.d`, `.bar`, `.ticker`, `.stamp`, `.cchip` (`.y`, `.c`, `.m`), `.bubble`, `.vig`, `.mcard`, `.fcard`, `.trap`, `.tile`, `.bracket`, `.vline`, `.caseico`, `.caseline`, `.bignum`. Para colores dentro del texto: `.hl` (amarillo), `.co` (coral), `.mi` (menta), `.sk` (cielo).
- Contenido dinámico: `"@pretest"` (tus respuestas iniciales) y `"@cal0"`…`"@cal3"` (fechas de repaso).

**Ojo:** no uses en el lienzo nombres de clase que ya usa la página (`card`, `act`, `chip`, `opt`, `seg`…). Una colisión rompe el diseño: así ocurrió con `.act`.

### 5.3 Ejercicios (`act`)

```js
// Pre-test (3 preguntas, no se corrige en el momento) → comentario: fb
{type:"pretest", qs:[{q:"…", o:["…","…","…"], a:1}, …]}

// Pregunta / caso práctico → comentarios: ok y ko
{type:"mcq", q:"…", o:["…","…","…"], a:1, why:"Art. 57.1: …"}

// Relacionar → comentario: fb
{type:"match", q:"Asigna a cada derecho su número", hint:"…", rows:[["Reunión",[19,21,22],21], …]}

// Ronda rápida → comentarios: hi (≥75 %) y lo
{type:"rapid", secs:10, qs:[{q:"…", o:["Art. 56","Art. 57","Art. 62"], a:0}, …]}

// Vaciado de memoria → comentario: fb
{type:"blurt", q:"…", placeholder:"56 Jefe del Estado…", secs:90,
 items:[["56","Jefe del Estado","jefe del estado|simbolo|arbitr"], …, ["26","Trib. de honor","tribunal(es)? de honor",1]]}
//   el 4º valor (1) «consume» el texto encontrado para que no cuente en otro artículo

// Final: resumen + botones de repetir
{type:"end"}
```

---

## 6. Ilustraciones (`motor/ilustraciones.js`)

Estilo: **plano, sin contornos, sombra de bloque suave y personajes de cabeza grande**. Todos comparten la paleta `P`. Cada función devuelve un `<svg class="ilu">` que se adapta a la caja del elemento: **respeta su proporción** al darle ancho y alto (persona 2:3; carta 220:340).

| Función | Qué dibuja |
|---|---|
| `ILU.persona({tipo, pose, expr, head})` | Personaje. `tipo`: `rey`, `reina`, `principe`, `princesa`, `presidente`, `presidenta`, `regente`, `tutor`, `mujer`, `hombre`, `madre`, `padre`. `pose`: `normal`, `cetro`, `jura`, `copa`, `saludo`, `cartas`, `libro`. `expr`: `normal`, `feliz`, `serio`, `mareado`. `head`: `corona`, `coronita`, `tiara`, `null` |
| `ILU.bebeRey()` | Rey bebé en un trono enorme con la corona bailando |
| `ILU.carta(palo)` · `ILU.dorso()` · `ILU.abanico()` · `ILU.palo(nombre, animación)` | Baraja española: rey de un palo (`oros`, `copas`, `espadas`, `bastos`), reverso, abanico de cartas, símbolo del palo |
| `ILU.hemiciclo()` | Cortes Generales |
| `ILU.dado(n)` | Dado que rueda al aparecer |
| `ILU.cupula()` | Burbuja de cristal con brillo |
| `ILU.mochila()` | Mochila (responsabilidad) |
| `ILU.pergamino(texto)` · `ILU.documento({firma, tachado})` | Pergamino con sello; documento con firma que se dibuja sola o tachado |
| `ILU.bolsa()` · `ILU.palacio()` · `ILU.arco(n, color)` · `ILU.anillosRotos()` · `ILU.silbato()` · `ILU.globo()` · `ILU.coronaObj()` | Objetos ancla |
| `ILU.venn(a, b, "x · y · z")` | Diagrama de dos conjuntos |
| `ILU.familia()` | Madre, padre y bebé con corazón (permisos por nacimiento, protección de la familia) |

Animaciones en bucle (clase en un `<g>` del SVG): `bob` (flotar), `float`, `spin`, `sway` (balanceo desde la base), `wig` (bailar), `pulse`, `clink`/`clinkr` (brindis), `shine`. Al aparecer: `roll` (dados) y `draw` (trazos que se dibujan solos).

### Añadir un dibujo nuevo

1. Dibuja en un `viewBox` pequeño (100×100 para objetos, 200×300 para personas) con formas simples: `rect`, `circle`, `ellipse`, `path`.
2. Colores de `P`. Sombra: repite la mitad derecha con `fill="#000" opacity=".15"`.
3. Mete las partes que se mueven en `<g class="bob">` (o la animación que toque).
4. Devuelve `svgW("0 0 W H", contenido)` y añádelo al objeto `ILU` del final.
5. Para combinar personajes en una escena, usa `personaG(...)` dentro de `<g transform="translate(x y) scale(s)">` (mira `ILU.familia`).

Ejemplo, escena sobre el permiso por nacimiento:

```js
{tech:"dib", title:"Permiso por nacimiento",
 say:["Imagina a esta familia: acaba de nacer su bebé.",
      "Cada progenitor tiene su propio permiso, intransferible.",
      "Y una parte es obligatoria justo después del parto."],
 els:[E(0,120,220,560,400,ILU.familia(),{a:"pop"}),
      E(1,760,240,720,150,callout("check","Un permiso por progenitor","intransferible","var(--mi)")),
      E(2,760,420,720,150,callout("clock","Tramo obligatorio","inmediatamente tras el parto","var(--co)"))]}
```

(Las semanas y detalles concretos se toman siempre de la norma vigente al escribir la cápsula.)

---

## 7. La voz

- Motor: **Piper** (síntesis neuronal local, gratis, sin internet al generar).
- Voz: `es_ES-sharvard-medium`, **hablante 1 (femenina)**, `length_scale = 0.8` (≈25 % más rápida que el ritmo normal); pausa entre frases 0,14 s.
- Cada clip se sintetiza **frase a frase**: así sabemos el segundo exacto en que empieza cada frase (`manifest.json → s`). Esa lista es la que sincroniza dibujos y subtítulos.
- Salida MP3 mono a 48 kbps con `lameenc` (≈0,4 MB por minuto). Una cápsula de 8 minutos ocupa unos 3 MB.
- Caché: si el texto, la voz o el ritmo no cambian, el clip no se regenera.
- Cambiar voz o ritmo: `VOZ_HABLANTE=0` (masculina), `VOZ_RITMO=0.9` (más pausada) o `VOZ_MODELO=voces/otra.onnx`.
- La clase 1 («pizarra») usó `es_ES-davefx-medium` (voz masculina) a ritmo normal.
- Clips por escena: `s<n>.mp3` (narración), `s<n>-ok`/`-ko` (pregunta), `s<n>-fb` (pre-test, relacionar, vaciado), `s<n>-hi`/`-lo` (ronda rápida).

---

## 8. El reproductor (`motor/player.html`)

- **Un único `<audio>`** que cambia de `src`: los móviles lo desbloquean con el primer toque en «Empezar».
- **Reloj**: mientras suena la voz, el tiempo de la escena es `audio.currentTime`. Sin voz, avanza un reloj interno a la velocidad elegida. Si el audio no carga en 3,5 s, sigue con el reloj y subtítulos.
- **Fases**: `narr` (narración) → `act` (ejercicio abierto, reloj parado) → `fb` (comentario hablado) → autoavance a los ~1,8 s, o al pulsar «Seguir».
- **Saltos**: la barra de progreso, el índice y ←/→ reconstruyen la escena en el punto exacto, sin animación de entrada.
- **Progreso del alumno**: resultados y plan de repaso en `localStorage` con clave `<id>:res` y `<id>:plan`. Solo en ese navegador. En la plataforma conviene guardarlo en Supabase (sección 9).
- Atajos: espacio, ←/→, V (voz), C (subtítulos), F (pantalla completa).
- Respeta `prefers-reduced-motion` y funciona en tema claro y oscuro (el lienzo es siempre oscuro).

---

## 9. Publicar e integrar en la plataforma

- `dist/` es autónomo: súbelo a Supabase Storage, Netlify o la carpeta `public/` de la app (por ejemplo `public/clases/corona/`) y ábrelo con un `<iframe>` o una ruta propia.
- El HTML carga fuentes de Google Fonts. Sin internet se usan las fuentes del sistema.
- Para personalizar por oposición (ver la propuesta del mapa de relevancia): añade a cada escena `articulos:["57"]` y filtra o marca escenas según la oposición del alumno. Para guardar resultados en Supabase, sustituye `LS.get` y `LS.set` del motor por llamadas a tu API.

---

## 10. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| Un bloque oscuro tapa la página | Colisión de nombre de clase CSS entre lienzo y página (`act`, `card`…). Renombra la del lienzo |
| No suena la voz | El navegador bloquea el audio hasta un toque: la primera reproducción debe salir del botón «Empezar». Comprueba que `dist/audio/` está junto a `index.html` |
| Un dibujo sale deformado | La caja `E(...)` no respeta la proporción del `viewBox` (persona = 2:3) |
| Un elemento no aparece | `at` mayor que el número de frases (`construir.mjs` lo avisa) |
| Texto cortado | Reduce el texto o el `font-size` en línea. Revisa siempre `preview/hoja.png` |
| La voz pronuncia mal algo | Escríbelo como se dice («Juan Carlos Primero») o añade una regla en `normalizar()` de `generar-voz.py` |

---

## 11. Checklist antes de publicar

- [ ] `construir.mjs` sin avisos.
- [ ] `previsualizar.mjs --flujo` sin errores de JavaScript.
- [ ] Hoja de contactos revisada: nada cortado ni solapado.
- [ ] Revisión jurídica (4.6) hecha.
- [ ] Escuchada entera una vez a 1× en el navegador.
