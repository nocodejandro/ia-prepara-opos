#!/usr/bin/env node
/* =====================================================================
   previsualizar.mjs · hoja de contactos de todas las escenas + prueba
   ---------------------------------------------------------------------
   Uso:  node herramientas/previsualizar.mjs capsulas/corona [--flujo]
   - Abre dist/index.html en Chromium (Playwright), dibuja cada escena
     en su estado final y genera <capsula>/preview/hoja.png (3 columnas).
   - Con --flujo además pulsa «Empezar», salta a la primera pausa activa,
     responde y comprueba que la voz comenta y que pasa a la escena siguiente.
   - Muestra los errores de JavaScript de la página.
   Requisito: npm install  y  npx playwright install chromium
   (o CHROMIUM_PATH=/ruta/a/chromium para usar un Chromium ya instalado)
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const capDir = path.resolve(process.argv[2] || "");
const html = path.join(capDir, "dist", "index.html");
if (!fs.existsSync(html)) { console.error("Primero: node herramientas/construir.mjs " + process.argv[2]); process.exit(1); }
const salida = path.join(capDir, "preview"); fs.mkdirSync(salida, { recursive: true });

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--autoplay-policy=no-user-gesture-required"] });
const pagina = await navegador.newPage({ viewport: { width: 1300, height: 1000 } });
const errores = []; pagina.on("pageerror", e => errores.push(e.message));
await pagina.goto(pathToFileURL(html).href); await pagina.waitForTimeout(1500);
await pagina.screenshot({ path: path.join(salida, "pagina.png"), fullPage: true });

const n = await pagina.evaluate(() => window.__motor.SHOTS.length);
await pagina.evaluate(() => { document.getElementById("startOv").hidden = true; });
const imgs = [];
for (let i = 0; i < n; i++) {
  await pagina.evaluate(i => { const m = window.__motor; m.S.i = i; m.build(i); m.S.t = 999; m.render(true); }, i);
  await pagina.waitForTimeout(120);
  imgs.push((await pagina.locator("#stagebox").screenshot()).toString("base64"));
}
const hoja = await navegador.newPage({ viewport: { width: 1600, height: 1000 } });
await hoja.setContent(`<body style="margin:0;background:#333;font:14px sans-serif;color:#fff;display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${imgs.map((b, i) => `<div><div style="padding:2px 6px">${i}</div><img style="width:100%" src="data:image/png;base64,${b}"></div>`).join("")}</body>`);
await hoja.screenshot({ path: path.join(salida, "hoja.png"), fullPage: true });
console.log("Hoja de contactos:", path.relative(process.cwd(), path.join(salida, "hoja.png")));

if (process.argv.includes("--flujo")) {
  await pagina.reload(); await pagina.waitForTimeout(800);
  const estado = () => pagina.evaluate(() => { const m = window.__motor; return `escena=${m.S.i} fase=${m.S.phase} t=${m.S.t.toFixed(1)} audio=${m.clip} pausado=${m.audio.paused}`; });
  await pagina.click("#startBtn"); await pagina.waitForTimeout(2500); console.log("arranque:", await estado());
  const q = await pagina.evaluate(() => window.__motor.SHOTS.findIndex(s => s.act && s.act.type === "mcq"));
  await pagina.selectOption("#speed", "1.5");
  await pagina.click(`.seg >> nth=${q}`);
  await pagina.waitForFunction(() => window.__motor.S.phase === "act", null, { timeout: 60000 });
  console.log("pausa activa:", await estado());
  await pagina.click("#actCard .opt >> nth=0"); await pagina.waitForTimeout(1500); console.log("comentario:", await estado());
  await pagina.waitForFunction(q => window.__motor.S.i === q + 1, q, { timeout: 60000 });
  console.log("siguiente escena:", await estado());
}
console.log(errores.length ? "ERRORES:\n" + errores.join("\n") : "Sin errores de JavaScript.");
await navegador.close();
