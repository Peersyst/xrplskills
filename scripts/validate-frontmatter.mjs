#!/usr/bin/env node
/**
 * Validates YAML frontmatter in every Markdown file under skills/.
 *
 * - Any frontmatter must parse as valid YAML.
 * - Each SKILL.md must have a non-empty `description:` value, double-quoted
 *   to match the convention used across the repo.
 *
 * Exits non-zero on any failure.
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument } from 'yaml'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(REPO_ROOT, 'skills')

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
const QUOTED_DESCRIPTION_RE = /^description:\s*"[^"\n]*"\s*$/m

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(path)))
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(path)
  }
  return out
}

async function main() {
  await stat(SKILLS_DIR)

  const files = await walk(SKILLS_DIR)
  let withFrontmatter = 0
  let failed = 0

  for (const file of files) {
    const content = await readFile(file, 'utf-8')
    const match = content.match(FRONTMATTER_RE)
    const isSkillFile = file.endsWith(`${'/'}SKILL.md`)
    const rel = relative(REPO_ROOT, file)

    if (!match) {
      if (isSkillFile) {
        failed++
        console.error(`✘ ${rel}\n    SKILL.md is missing YAML frontmatter`)
      }
      continue
    }

    withFrontmatter++
    const frontmatter = match[1]
    const doc = parseDocument(frontmatter)
    const fileErrors = []

    for (const err of doc.errors) {
      const line = err.linePos?.[0]?.line
      const col = err.linePos?.[0]?.col
      const where = line ? `:${line}${col ? `:${col}` : ''}` : ''
      fileErrors.push(`${err.name}${where} — ${err.message}`)
    }

    if (isSkillFile && doc.errors.length === 0) {
      const description = doc.get('description')
      if (typeof description !== 'string' || description.trim() === '') {
        fileErrors.push('SKILL.md frontmatter must define a non-empty `description`')
      } else if (!QUOTED_DESCRIPTION_RE.test(frontmatter)) {
        fileErrors.push('SKILL.md frontmatter `description` must be wrapped in double quotes')
      }
    }

    if (fileErrors.length === 0) continue

    failed++
    console.error(`✘ ${rel}`)
    for (const e of fileErrors) console.error(`    ${e}`)
  }

  console.log(
    `\nChecked ${files.length} markdown file(s); ${withFrontmatter} with frontmatter; ${failed} invalid.`,
  )

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
