import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { log } from 'node:console';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { contentManifest } = await server.ssrLoadModule('/src/data/content-manifest.ts');
  await writeFile(new URL('../docs/content-manifest.json', import.meta.url), `${JSON.stringify(contentManifest, null, 2)}\n`);
  log(`Wrote docs/content-manifest.json for ${contentManifest.contentVersion}`);
} finally { await server.close(); }
