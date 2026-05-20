#!/usr/bin/env node
/**
 * Validation script to check rule files and skill frontmatter.
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { parseDocument } from 'yaml'
import { parseRuleFile } from './parser.js'
import { SKILLS, SKILLS_DIR } from './config.js'

function getFrontmatterBlock(content: string): string | null {
  const normalized = content.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  return match ? match[1] : null
}

function hasQuotedFrontmatterValue(frontmatter: string, key: string): boolean {
  const pattern = new RegExp(`^${key}:\\s*"[^"\\n]*"\\s*$`, 'm')
  return pattern.test(frontmatter)
}

async function validate() {
  console.log('Validating rule files...\n')

  let hasErrors = false

  const skillDirs = await readdir(SKILLS_DIR, { withFileTypes: true })
  const discoveredSkillNames = skillDirs
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const skillName of discoveredSkillNames) {
    const skillFile = join(SKILLS_DIR, skillName, 'SKILL.md')
    try {
      const skillContent = await readFile(skillFile, 'utf-8')
      const frontmatter = getFrontmatterBlock(skillContent)

      console.log(`Validating ${skillName} SKILL.md...`)

      if (!frontmatter) {
        console.error(`  ✘ SKILL.md: Missing frontmatter`)
        hasErrors = true
      } else {
        const document = parseDocument(frontmatter)
        const errors = document.errors

        if (errors.length > 0) {
          console.error(
            `  ✘ SKILL.md: Invalid frontmatter YAML - ${errors[0].message}`
          )
          hasErrors = true
        } else {
          const description = document.get('description')

          if (typeof description !== 'string' || description.trim() === '') {
            console.error(
              `  ✘ SKILL.md: Frontmatter description must be a non-empty string`
            )
            hasErrors = true
          }

          if (!hasQuotedFrontmatterValue(frontmatter, 'description')) {
            console.error(
              `  ✘ SKILL.md: Frontmatter description must use double quotes`
            )
            hasErrors = true
          }
        }
      }
    } catch {
      // Knowledge-only or partial skill directories may not have SKILL.md.
    }
  }

  for (const skill of Object.values(SKILLS)) {
    console.log(`Validating ${skill.name}...`)

    const files = await readdir(skill.rulesDir)
    const ruleFiles = files.filter(
      (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md'
    )

    for (const file of ruleFiles) {
      const filePath = join(skill.rulesDir, file)
      try {
        const parsed = await parseRuleFile(filePath, skill.sectionMap)

        // Basic validation
        if (!parsed.rule.title) {
          console.error(`  ✘ ${file}: Missing title`)
          hasErrors = true
        }
        if (!parsed.rule.explanation) {
          console.error(`  ✘ ${file}: Missing explanation`)
          hasErrors = true
        }
        if (parsed.section === 0) {
          console.error(`  ✘ ${file}: Could not determine section`)
          hasErrors = true
        }
      } catch (error) {
        console.error(`  ✘ ${file}: Parse error - ${error}`)
        hasErrors = true
      }
    }

    console.log(`  ✓ Validated ${ruleFiles.length} rule files\n`)
  }

  if (hasErrors) {
    console.error('Validation failed with errors')
    process.exit(1)
  } else {
    console.log('✓ All validations passed')
  }
}

validate()
