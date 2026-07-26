#!/usr/bin/env node
/**
 * Simpele statische server om de app lokaal te bekijken.
 *
 * Nodig omdat de app ES-modules en fetch gebruikt: via file:// blokkeert de
 * browser die allebei. Dit is een ontwikkelhulpje en hoort niet bij de site.
 *
 * Gebruik: node tools/serve.mjs [--port 8080]
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argPort = process.argv.indexOf('--port');
const PORT = argPort > -1 ? Number(process.argv[argPort + 1]) : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

createServer(async (req, res) => {
  const pad = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // normalize plus de ROOT-controle houdt ../-trucs buiten de deur
  const doel = join(ROOT, normalize(pad).replace(/^(\.\.[/\\])+/, ''));
  if (!doel.startsWith(ROOT)) {
    res.writeHead(403).end('403');
    return;
  }

  let bestand = doel;
  try {
    if ((await stat(bestand)).isDirectory()) bestand = join(bestand, 'index.html');
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
    return;
  }

  try {
    const inhoud = await readFile(bestand);
    res.writeHead(200, {
      'Content-Type': MIME[extname(bestand)] ?? 'application/octet-stream',
      // Geen caching tijdens ontwikkelen, anders zie je je eigen wijzigingen niet.
      'Cache-Control': 'no-store',
    }).end(inhoud);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
  }
}).listen(PORT, () => {
  process.stdout.write(`Snoekduik op http://localhost:${PORT}\n`);
});
