#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const projectRoot = path.resolve(__dirname);
const arg = process.argv[2];
const defaultName = 'links.txt';
const delayMs = parseInt(process.argv[3], 10) || 700;

let filepath;
if (!arg) {
  filepath = path.join(projectRoot, defaultName);
} else if (path.isAbsolute(arg)) {
  filepath = arg;
} else {
  filepath = path.join(projectRoot, arg);
}

function openUrl(url) {
  const safe = url.replace(/"/g, '\\"');
  const platform = process.platform;
  if (!url) return;
  if (platform === 'win32') {
    exec(`start "" "${safe}"`);
  } else if (platform === 'darwin') {
    exec(`open "${safe}"`);
  } else {
    exec(`xdg-open "${safe}"`);
  }
}

let data;
try {
  data = fs.readFileSync(filepath, 'utf8');
} catch (err) {
  console.error('No se pudo leer el archivo:', filepath);
  console.error('Pasa la ruta al archivo como primer argumento. Ej: node scripts/open-links.js "E:\\path\\links.txt"');
  process.exit(1);
}

const lines = data
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && /^https?:\/\//i.test(line));

if (lines.length === 0) {
  console.log('No se encontraron URLs en', filepath);
  process.exit(0);
}

console.log(`Abriendo ${lines.length} enlaces desde ${filepath} (delay ${delayMs}ms)...`);
lines.forEach((url, i) => {
  setTimeout(() => {
    console.log(`-> ${url}`);
    openUrl(url);
  }, i * delayMs);
});

