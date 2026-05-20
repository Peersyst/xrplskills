#!/usr/bin/env node
/**
 * Token counter to measure context cost of skills
 */

import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { SKILLS } from './config.js'

/**
 * Approximate token count using character-based estimation
 * Rule of thumb: 1 token ≈ 4 characters for English text
 * This is a rough estimate but good enough for comparison
 */
function estimateTokens(text: string): number {
  // Remove excessive whitespace for more accurate counting
  const normalized = text.replace(/\s+/g, ' ').trim()
  return Math.ceil(normalized.length / 4)
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Calculate percentage
 */
function percentage(part: number, total: number): string {
  return ((part / total) * 100).toFixed(1) + '%'
}

/**
 * Count tokens in a skill
 */
async function countSkillTokens(skillName: string) {
  const skill = SKILLS[skillName]
  if (!skill) {
    console.error(`Unknown skill: ${skillName}`)
    return
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log(`📊 Token Analysis: ${skill.title}`)
  console.log(`${'='.repeat(70)}\n`)

  // Count tokens in compiled AGENTS.md
  let agentsTokens = 0
  let agentsSize = 0
  try {
    const agentsContent = await readFile(skill.outputFile, 'utf-8')
    agentsTokens = estimateTokens(agentsContent)
    agentsSize = agentsContent.length
    console.log(`📄 Compiled AGENTS.md:`)
    console.log(`   Tokens:     ${formatNumber(agentsTokens)}`)
    console.log(`   Characters: ${formatNumber(agentsSize)}`)
    console.log(`   File size:  ${(agentsSize / 1024).toFixed(2)} KB\n`)
  } catch (error) {
    console.log(`❌ AGENTS.md not found. Run 'pnpm build' first.\n`)
  }

  // Count tokens in individual rule files
  console.log(`📁 Individual Rule Files:\n`)
  const files = await readdir(skill.rulesDir)
  const ruleFiles = files.filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md'
  )

  let totalRulesTokens = 0
  let totalRulesSize = 0
  const fileStats: { name: string; tokens: number; size: number }[] = []

  for (const file of ruleFiles.sort()) {
    const filePath = join(skill.rulesDir, file)
    const content = await readFile(filePath, 'utf-8')
    const tokens = estimateTokens(content)
    const size = content.length

    totalRulesTokens += tokens
    totalRulesSize += size
    fileStats.push({ name: file, tokens, size })
  }

  // Display individual file stats
  fileStats.forEach(({ name, tokens, size }) => {
    console.log(`   ${name.padEnd(40)} ${formatNumber(tokens).padStart(8)} tokens`)
  })

  console.log(`\n   ${'─'.repeat(60)}`)
  console.log(`   Total (${ruleFiles.length} files):`.padEnd(40) +
              `${formatNumber(totalRulesTokens).padStart(8)} tokens`)
  console.log(`   Total size:`.padEnd(40) +
              `${(totalRulesSize / 1024).toFixed(2)} KB\n`)

  // Count metadata and sections
  let metadataTokens = 0
  let sectionsTokens = 0

  try {
    const metadataContent = await readFile(skill.metadataFile, 'utf-8')
    metadataTokens = estimateTokens(metadataContent)
  } catch {}

  try {
    const sectionsContent = await readFile(
      join(skill.rulesDir, '_sections.md'),
      'utf-8'
    )
    sectionsTokens = estimateTokens(sectionsContent)
  } catch {}

  console.log(`📝 Supporting Files:\n`)
  console.log(`   metadata.json:`.padEnd(40) +
              `${formatNumber(metadataTokens).padStart(8)} tokens`)
  console.log(`   _sections.md:`.padEnd(40) +
              `${formatNumber(sectionsTokens).padStart(8)} tokens\n`)

  // Calculate overhead
  const supportingFilesTokens = metadataTokens + sectionsTokens
  const totalSourceTokens = totalRulesTokens + supportingFilesTokens

  console.log(`${'='.repeat(70)}`)
  console.log(`📈 Summary:\n`)
  console.log(`   Source files total:`.padEnd(40) +
              `${formatNumber(totalSourceTokens).padStart(8)} tokens`)
  console.log(`   Compiled AGENTS.md:`.padEnd(40) +
              `${formatNumber(agentsTokens).padStart(8)} tokens`)

  if (agentsTokens > 0) {
    const overhead = agentsTokens - totalRulesTokens
    const efficiency = ((totalRulesTokens / agentsTokens) * 100).toFixed(1)

    console.log(`   Build overhead:`.padEnd(40) +
                `${formatNumber(overhead).padStart(8)} tokens (${percentage(overhead, agentsTokens)})`)
    console.log(`   Content efficiency:`.padEnd(40) +
                `${efficiency}%`)

    console.log(`\n💡 Context Savings:\n`)
    console.log(`   Loading individual files would require reading ${ruleFiles.length} files`)
    console.log(`   Loading AGENTS.md requires reading just 1 file`)
    console.log(`   File I/O reduction: ${((1 - 1/ruleFiles.length) * 100).toFixed(1)}%`)
  }

  console.log(`\n${'='.repeat(70)}\n`)

  // Claude context comparison
  if (agentsTokens > 0) {
    console.log(`📊 Claude Context Usage:\n`)
    const claudeContext = 200000 // Claude's context window
    const percentOfContext = ((agentsTokens / claudeContext) * 100).toFixed(2)
    console.log(`   AGENTS.md uses ~${percentOfContext}% of Claude's 200K context window`)
    console.log(`   Remaining context: ~${formatNumber(claudeContext - agentsTokens)} tokens\n`)
  }
}

/**
 * Compare multiple skills
 */
async function compareSkills() {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`📊 Skill Token Comparison`)
  console.log(`${'='.repeat(70)}\n`)

  for (const skillName of Object.keys(SKILLS)) {
    const skill = SKILLS[skillName]
    try {
      const agentsContent = await readFile(skill.outputFile, 'utf-8')
      const tokens = estimateTokens(agentsContent)
      const size = (agentsContent.length / 1024).toFixed(2)

      console.log(`${skill.title.padEnd(35)} ${formatNumber(tokens).padStart(8)} tokens  (${size} KB)`)
    } catch {
      console.log(`${skill.title.padEnd(35)} (not built yet)`)
    }
  }
  console.log()
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--compare')) {
    await compareSkills()
  } else if (args.length > 0) {
    const skillName = args[0]
    await countSkillTokens(skillName)
  } else {
    // Default: analyze all skills
    for (const skillName of Object.keys(SKILLS)) {
      await countSkillTokens(skillName)
    }
  }
}

main()
