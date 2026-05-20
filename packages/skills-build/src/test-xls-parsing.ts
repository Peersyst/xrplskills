/**
 * Integration test: fetch and parse XLS standards up to XLS_MAX_AMENDMENT.
 *
 * Config (env vars):
 *   XLS_MAX_AMENDMENT    - highest XLS number to test (default: 102)
 *   XLS_REQUEST_DELAY_MS - delay between raw fetches in ms (default: 500)
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO_API = 'https://api.github.com/repos/XRPLF/XRPL-Standards/contents/';
const RAW_BASE = 'https://raw.githubusercontent.com/XRPLF/XRPL-Standards/master';
const EXTRACT_SCRIPT = path.resolve(__dirname, '../../../skills/xls-reference/scripts/extract-spec.py');

const MAX_AMENDMENT = parseInt(process.env.XLS_MAX_AMENDMENT ?? '102', 10);
const REQUEST_DELAY_MS = parseInt(process.env.XLS_REQUEST_DELAY_MS ?? '500', 10);

interface XlsEntry {
  number: number;
  name: string;
}

interface TestResult {
  number: number;
  name: string;
  passed: boolean;
  error?: string;
  outputLines?: number;
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'xls-reference-test/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const location = res.headers.location;
        if (location) {
          resolve(httpsGet(location));
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listXlsDirectories(): Promise<XlsEntry[]> {
  console.log('Fetching XLS directory listing from GitHub API...');
  const body = await httpsGet(REPO_API);
  const data: Array<{ name: string; type: string }> = JSON.parse(body);

  const pattern = /^XLS-(\d+)/i;
  const entries: XlsEntry[] = [];

  for (const item of data) {
    if (item.type !== 'dir') continue;
    const m = item.name.match(pattern);
    if (m) {
      entries.push({ number: parseInt(m[1], 10), name: item.name });
    }
  }

  entries.sort((a, b) => a.number - b.number);
  return entries;
}

function extractSpec(readmeContent: string): string {
  return execSync(`python3 "${EXTRACT_SCRIPT}"`, {
    input: readmeContent,
    encoding: 'utf-8',
    timeout: 15_000,
  });
}

function validateOutput(output: string, name: string): { valid: boolean; error?: string } {
  if (!output || output.trim().length === 0) {
    return { valid: false, error: 'Output is empty' };
  }
  // Some specs use only level-1 (#) headings, or have no headings at all
  // (ecosystem/policy specs with only frontmatter). Both are valid outputs.
  const hasAnyHeading = /^#/m.test(output);
  if (!hasAnyHeading) {
    // Frontmatter-only output is acceptable — it means no implementation content
    const hasFrontmatter = output.includes('<pre>') || output.includes('---');
    if (!hasFrontmatter) {
      return { valid: false, error: 'Output is empty (no frontmatter, no headings)' };
    }
  }
  return { valid: true };
}

async function testAmendment(entry: XlsEntry): Promise<TestResult> {
  const readmeUrl = `${RAW_BASE}/${entry.name}/README.md`;

  try {
    const readme = await httpsGet(readmeUrl);
    let extracted: string;

    try {
      extracted = extractSpec(readme);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        number: entry.number,
        name: entry.name,
        passed: false,
        error: `extract-spec.py failed: ${message}`,
      };
    }

    const { valid, error } = validateOutput(extracted, entry.name);
    return {
      number: entry.number,
      name: entry.name,
      passed: valid,
      error,
      outputLines: extracted.split('\n').length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      number: entry.number,
      name: entry.name,
      passed: false,
      error: `Fetch failed: ${message}`,
    };
  }
}

async function main() {
  console.log(`XLS Parsing Integration Test`);
  console.log(`Max amendment: XLS-${MAX_AMENDMENT}`);
  console.log(`Request delay: ${REQUEST_DELAY_MS}ms`);
  console.log('');

  // Step 1: One API call to list all XLS directories
  let allEntries: XlsEntry[];
  try {
    allEntries = await listXlsDirectories();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to list XLS directories: ${message}`);
    process.exit(1);
  }

  // Step 2: Filter to entries within range
  const entries = allEntries.filter((e) => e.number <= MAX_AMENDMENT);
  console.log(`Found ${allEntries.length} total XLS entries, testing ${entries.length} (up to XLS-${MAX_AMENDMENT})`);
  console.log('');

  // Step 3: Test each amendment
  const results: TestResult[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    process.stdout.write(`[${i + 1}/${entries.length}] XLS-${String(entry.number).padStart(4, '0')} ${entry.name.padEnd(50)} `);

    const result = await testAmendment(entry);
    results.push(result);

    if (result.passed) {
      const note = result.outputLines && result.outputLines < 15 ? ' (frontmatter only)' : '';
      process.stdout.write(`PASS (${result.outputLines} lines${note})\n`);
    } else {
      process.stdout.write(`FAIL: ${result.error}\n`);
    }

    if (i < entries.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // Step 4: Summary
  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log('');
  console.log('='.repeat(60));
  console.log(`RESULTS: ${passed.length}/${results.length} passed`);

  if (failed.length > 0) {
    console.log('');
    console.log('FAILURES:');
    for (const r of failed) {
      console.log(`  XLS-${r.number} (${r.name}): ${r.error}`);
    }
  }

  if (passed.length > 0) {
    const lines = passed.map((r) => r.outputLines ?? 0);
    const avg = Math.round(lines.reduce((a, b) => a + b, 0) / lines.length);
    const max = Math.max(...lines);
    const min = Math.min(...lines);
    console.log('');
    console.log(`Output size (lines): avg=${avg}, min=${min}, max=${max}`);
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
