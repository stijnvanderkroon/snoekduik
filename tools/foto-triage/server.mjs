#!/usr/bin/env node
/**
 * Dev-only triage server. NOT part of the deployed site.
 *
 * Serves tools/foto-triage/index.html plus the probe data, and accepts verdicts
 * back at POST /api/oordelen, which it writes to data/fotoOordelen.json.
 *
 * The page also keeps every verdict in localStorage and can export it as JSON,
 * so a dead server never costs an hour of clicking.
 *
 * Usage: node tools/foto-triage/server.mjs [--port 8787]
 */

import { createServer } from 'node:http';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const PROBE_PATH = join(ROOT, 'data', 'fotoProbe.json');
const VERDICTS_PATH = join(ROOT, 'data', 'fotoOordelen.json');

const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 8787;

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
};

/** Write to a temp file then rename, so an interrupted write cannot truncate existing verdicts. */
async function writeAtomic(path, contents) {
  const tmp = `${path}.tmp`;
  await writeFile(tmp, contents);
  await rename(tmp, path);
}

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return send(res, 200, await readFile(join(HERE, 'index.html')), 'text/html; charset=utf-8');
    }

    if (req.method === 'GET' && url.pathname === '/api/probe') {
      if (!existsSync(PROBE_PATH)) {
        return send(res, 404, JSON.stringify({ fout: 'data/fotoProbe.json ontbreekt, draai eerst de probe' }));
      }
      return send(res, 200, await readFile(PROBE_PATH));
    }

    if (req.method === 'GET' && url.pathname === '/api/oordelen') {
      return send(res, 200, JSON.stringify(await readJson(VERDICTS_PATH, { schemaVersion: 1, oordelen: {} })));
    }

    if (req.method === 'POST' && url.pathname === '/api/oordelen') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const incoming = JSON.parse(Buffer.concat(chunks).toString('utf8'));

      // Merge rather than replace: two tabs open should not clobber each other.
      const current = await readJson(VERDICTS_PATH, { schemaVersion: 1, oordelen: {} });
      const merged = { ...current.oordelen, ...incoming.oordelen };
      await writeAtomic(
        VERDICTS_PATH,
        `${JSON.stringify({ schemaVersion: 1, bron: 'tools/foto-triage', oordelen: merged }, null, 2)}\n`,
      );
      return send(res, 200, JSON.stringify({ ok: true, aantal: Object.keys(merged).length }));
    }

    send(res, 404, JSON.stringify({ fout: 'niet gevonden' }));
  } catch (err) {
    send(res, 500, JSON.stringify({ fout: String(err.message ?? err) }));
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Fototriage draait op http://localhost:${PORT}\n`);
  process.stdout.write(`Oordelen worden geschreven naar ${VERDICTS_PATH}\n`);
});
