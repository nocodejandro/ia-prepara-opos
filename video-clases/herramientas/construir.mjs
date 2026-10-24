#!/usr/bin/env node
/* =====================================================================
   construir.mjs · monta una video-clase lista para publicar
   ---------------------------------------------------------------------
   Uso:   node herramientas/construir.mjs capsulas/corona [--sin-voz]
   Pasos:
     1. Carga las piezas comunes del motor + ilustraciones + capsula.js
        en un contexto aislado y saca el guion (frases de cada escena y
        de cada comentario de ejercicio).
     2. Escribe <capsula>/guion.json y llama a generar-voz.py, que solo
        vuelve a sintetizar los clips cuyo texto ha cambiado.
     3. Inyecta ilustraciones, cápsula y tiempos del audio en
        motor/player.html → <capsula>/dist/index.html (+ dist/audio/).
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const capDir = path.resolve(process.argv[2] || "");
const sinVoz = process.argv.includes("--sin-voz");
if (!process.argv[2] || !fs.existsSync(path.join(capDir, "capsula.js"))) {
  console.error("Uso: node herramientas/construir.mjs capsulas/<tema> [--sin-voz]");
  process.exit(1);
}
const leer = (p) => fs.readFileSync(p, "utf8");
const plantilla = leer(path.join(RAIZ, "motor/player.html"));
const ilustraciones = leer(path.join(RAIZ, "motor/ilustraciones.js"));
const capsulaJs = leer(path.join(capDir, "capsula.js"));

/* 1. Guion */
const ini = plantilla.indexOf("/*@@COMUNES-INICIO@@*/"), fin = plantilla.indexOf("/*@@COMUNES-FIN@@*/");
const comunes = plantilla.slice(ini, fin);
const ctx = vm.createContext({});
const CAPSULA = vm.runInContext(`${comunes}\n${ilustraciones}\n${capsulaJs}\n;CAPSULA`, ctx, { filename: "capsula.js" });
const guion = [];
CAPSULA.shots.forEach((s, i) => {
  if (!Array.isArray(s.say) || !s.say.length) throw new Error(`La escena ${i} no tiene "say"`);
  guion.push({ id: `s${i}`, frases: s.say });
  for (const k of ["fb", "ok", "ko", "hi", "lo"]) if (s[k]) guion.push({ id: `s${i}-${k}`, frases: s[k] });
  if (s.act && ["mcq"].includes(s.act.type) && !(s.ok && s.ko)) console.warn(`Aviso: la escena ${i} (mcq) no tiene ok/ko`);
  if (s.act && ["pretest", "match", "blurt"].includes(s.act.type) && !s.fb) console.warn(`Aviso: la escena ${i} (${s.act.type}) no tiene fb`);
  if (s.act && s.act.type === "rapid" && !(s.hi && s.lo)) console.warn(`Aviso: la escena ${i} (rapid) no tiene hi/lo`);
  (s.els || []).forEach((e, j) => { if (e.at >= s.say.length) console.warn(`Aviso: escena ${i}, elemento ${j}: at=${e.at} pero solo hay ${s.say.length} frases`); });
});
fs.writeFileSync(path.join(capDir, "guion.json"), JSON.stringify(guion, null, 1));
const palabras = guion.filter(g => !g.id.includes("-")).reduce((n, g) => n + g.frases.join(" ").split(/\s+/).length, 0);
console.log(`Guion: ${CAPSULA.shots.length} escenas, ${guion.length} clips, ~${palabras} palabras de narración.`);

/* 2. Voz */
const dist = path.join(capDir, "dist"); fs.mkdirSync(path.join(dist, "audio"), { recursive: true });
if (!sinVoz) {
  const py = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
  const r = spawnSync(py, [path.join(RAIZ, "herramientas/generar-voz.py"), capDir], { stdio: "inherit" });
  if (r.status !== 0) { console.error("Falló la generación de voz."); process.exit(r.status || 1); }
}
const manPath = path.join(dist, "audio", "manifest.json");
const manifest = fs.existsSync(manPath) ? JSON.parse(leer(manPath)) : {};
const NARR = Object.fromEntries(Object.entries(manifest).map(([k, v]) => [k, { d: v.d, s: v.s }]));

/* 3. HTML final */
const html = plantilla
  .replace("{{TITULO}}", CAPSULA.titulo)
  .replace("/*@@ILUSTRACIONES@@*/", () => ilustraciones)
  .replace("/*@@CAPSULA@@*/", () => capsulaJs)
  .replace("/*@@NARR@@*/{}", () => JSON.stringify(NARR));
fs.writeFileSync(path.join(dist, "index.html"), html);
const mp3 = fs.readdirSync(path.join(dist, "audio")).filter(f => f.endsWith(".mp3"));
const kb = mp3.reduce((n, f) => n + fs.statSync(path.join(dist, "audio", f)).size, 0) / 1024;
console.log(`Listo: ${path.relative(process.cwd(), path.join(dist, "index.html"))} · ${mp3.length} audios (${(kb / 1024).toFixed(1)} MB)`);
