/**
 * build-refs.ts
 *
 * Fetches all XLS specs from XRPLF/XRPL-Standards and writes the raw
 * README.md for each one into skills/xrpl-standards/references/<topic>/.
 *
 * Usage:
 *   tsx src/build-refs.ts
 *   XLS_REQUEST_DELAY_MS=200 tsx src/build-refs.ts
 */

import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO_API = 'https://api.github.com/repos/XRPLF/XRPL-Standards/contents/';
const RAW_BASE = 'https://raw.githubusercontent.com/XRPLF/XRPL-Standards/master';

const REFS_DIR = path.resolve(__dirname, '../../../skills/xrpl-standards/references');

const REQUEST_DELAY_MS = parseInt(process.env.XLS_REQUEST_DELAY_MS ?? '150', 10);

// ─── Topic assignments ────────────────────────────────────────────────────────
const TOPIC_MAP: Record<number, string> = {
  1:   'core',
  2:   'ecosystem',
  3:   'ecosystem',
  4:   'ecosystem',
  5:   'core',
  6:   'ecosystem',
  7:   'accounts',
  8:   'core',
  9:   'core',
  10:  'tokens',
  11:  'core',
  12:  'core',
  13:  'core',
  15:  'core',
  16:  'tokens',
  17:  'core',
  18:  'core',
  20:  'tokens',
  21:  'core',
  22:  'core',
  23:  'accounts',
  24:  'tokens',
  25:  'core',
  26:  'tokens',
  30:  'defi',
  32:  'core',
  33:  'tokens',
  34:  'payments',
  35:  'tokens',
  37:  'core',
  38:  'cross-chain',
  39:  'accounts',
  40:  'identity',
  41:  'cross-chain',
  42:  'smart-contracts',
  45:  'core',
  46:  'tokens',
  47:  'data',
  49:  'accounts',
  50:  'core',
  51:  'tokens',
  52:  'tokens',
  54:  'tokens',
  55:  'payments',
  56:  'payments',
  60:  'defi',
  61:  'tokens',
  62:  'defi',
  63:  'identity',
  64:  'accounts',
  65:  'defi',
  66:  'defi',
  67:  'payments',
  68:  'accounts',
  69:  'core',
  70:  'identity',
  71:  'accounts',
  73:  'defi',
  74:  'accounts',
  75:  'accounts',
  76:  'payments',
  77:  'accounts',
  78:  'data',
  80:  'accounts',
  81:  'defi',
  85:  'payments',
  86:  'accounts',
  89:  'tokens',
  94:  'tokens',
  95:  'core',
  96:  'tokens',
  97:  'core',
  100: 'payments',
  101: 'smart-contracts',
  102: 'smart-contracts',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface XlsEntry { number: number; name: string; }
interface RefMeta { number: number; topic: string; title: string; status: string; name: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function httpsGetOnce(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'xrpl-standards-build/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) { resolve(httpsGet(res.headers.location!)); return; }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20_000, () => req.destroy(new Error('timeout')));
  });
}

async function httpsGet(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try { return await httpsGetOnce(url); }
    catch (err) { if (i === retries - 1) throw err; await sleep(1000 * (i + 1)); }
  }
  throw new Error('unreachable');
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function parseFrontmatter(content: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const preMatch = content.match(/<pre>([\s\S]*?)<\/pre>/);
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const block = preMatch?.[1] ?? yamlMatch?.[1] ?? '';
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*(\w[\w-]*):\s*(.+)/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
  }
  return meta;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Building XRPL Standards reference files...\n');

  const topics = [...new Set(Object.values(TOPIC_MAP))];
  for (const topic of topics) fs.mkdirSync(path.join(REFS_DIR, topic), { recursive: true });

  console.log('Fetching XLS directory listing...');
  const body = await httpsGet(REPO_API);
  const dirData: Array<{ name: string; type: string }> = JSON.parse(body);

  const allEntries: XlsEntry[] = [];
  for (const item of dirData) {
    if (item.type !== 'dir') continue;
    const m = item.name.match(/^XLS-(\d+)/i);
    if (m) allEntries.push({ number: parseInt(m[1], 10), name: item.name });
  }
  allEntries.sort((a, b) => a.number - b.number);

  const toDo = allEntries.filter(e => TOPIC_MAP[e.number] !== undefined);
  console.log(`Processing ${toDo.length} specs...\n`);

  const index: RefMeta[] = [];

  for (let i = 0; i < toDo.length; i++) {
    const entry = toDo[i];
    const topic = TOPIC_MAP[entry.number];
    process.stdout.write(`[${i + 1}/${toDo.length}] XLS-${String(entry.number).padStart(4, '0')} ${entry.name.padEnd(48)} `);

    try {
      const readmeUrl = `${RAW_BASE}/${entry.name}/README.md`;
      const readme = await httpsGet(readmeUrl);

      const meta = parseFrontmatter(readme);
      const fileName = `xls-${String(entry.number).padStart(4, '0')}.md`;
      const filePath = path.join(REFS_DIR, topic, fileName);

      fs.writeFileSync(filePath, readme, 'utf-8');

      index.push({
        number: entry.number,
        name: entry.name,
        topic,
        title: meta['title'] ?? entry.name,
        status: meta['status'] ?? '?',
      });

      process.stdout.write(`DONE (${readme.split('\n').length} lines → references/${topic}/${fileName})\n`);
    } catch (err: unknown) {
      process.stdout.write(`FAIL: ${err instanceof Error ? err.message : String(err)}\n`);
    }

    if (i < toDo.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  // Write INDEX.md
  const topicOrder = ['identity', 'tokens', 'defi', 'payments', 'accounts', 'data', 'cross-chain', 'smart-contracts', 'core', 'ecosystem'];
  let indexMd = '# XRPL Standards Index\n\n';
  for (const topic of topicOrder) {
    const entries = index.filter(e => e.topic === topic);
    if (entries.length === 0) continue;
    indexMd += `## ${topic}\n\n| XLS | Title | Status | File |\n|-----|-------|--------|------|\n`;
    for (const e of entries) {
      const file = `references/${topic}/xls-${String(e.number).padStart(4, '0')}.md`;
      indexMd += `| ${e.number} | ${e.title} | ${e.status} | \`${file}\` |\n`;
    }
    indexMd += '\n';
  }
  fs.writeFileSync(path.join(REFS_DIR, 'INDEX.md'), indexMd, 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Built ${index.length} ref files — Index written to references/INDEX.md\n`);
  for (const topic of topicOrder) {
    const count = index.filter(e => e.topic === topic).length;
    if (count > 0) console.log(`  ${topic.padEnd(18)} ${count} specs`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
