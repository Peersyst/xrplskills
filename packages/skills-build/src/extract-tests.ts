#!/usr/bin/env node
/**
 * Extract test cases from rules for LLM evaluation
 */

import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { Rule, TestCase } from './types.js'
import { parseRuleFile } from './parser.js'
import { SKILLS, TEST_CASES_FILE } from './config.js'

/**
 * Extract test cases from a rule
 */
function extractTestCases(rule: Rule): TestCase[] {
  const testCases: TestCase[] = []

  rule.examples.forEach((example) => {
    const label = example.label.toLowerCase()

    // Identify "bad" examples
    const isBad = label.includes('incorrect') ||
                  label.includes('wrong') ||
                  label.includes('bad') ||
                  label.includes('❌')

    // Identify "good" examples
    const isGood = label.includes('correct') ||
                   label.includes('good') ||
                   label.includes('better') ||
                   label.includes('✅')

    if (isBad || isGood) {
      testCases.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        type: isBad ? 'bad' : 'good',
        code: example.code,
        language: example.language || 'go',
        description: example.description || example.additionalText || `${example.label} example for ${rule.title}`
      })
    }
  })

  return testCases
}

/**
 * Extract tests from a single skill
 */
async function extractTestsForSkill(skillName: string): Promise<TestCase[]> {
  const skill = SKILLS[skillName]
  if (!skill) {
    throw new Error(`Unknown skill: ${skillName}`)
  }

  console.log(`\n📦 Processing skill: ${skill.title}`)
  console.log(`   Rules directory: ${skill.rulesDir}`)

  const files = await readdir(skill.rulesDir)
  const ruleFiles = files.filter(f =>
    f.endsWith('.md') &&
    !f.startsWith('_') &&
    f !== 'README.md'
  )

  const allTestCases: TestCase[] = []

  for (const file of ruleFiles) {
    const filePath = join(skill.rulesDir, file)
    try {
      const { rule } = await parseRuleFile(filePath, skill.sectionMap)
      const testCases = extractTestCases(rule)

      if (testCases.length > 0) {
        console.log(`   ✓ ${file}: ${testCases.length} test cases`)
      }

      allTestCases.push(...testCases)
    } catch (error) {
      console.error(`   ✗ Error processing ${file}:`, error)
    }
  }

  return allTestCases
}

/**
 * Main extraction function
 */
async function extractTests() {
  try {
    console.log('🔍 Extracting test cases from rules...')
    console.log(`Output file: ${TEST_CASES_FILE}`)

    const allTestCases: TestCase[] = []

    // Extract from all skills
    for (const skillName of Object.keys(SKILLS)) {
      const testCases = await extractTestsForSkill(skillName)
      allTestCases.push(...testCases)
    }

    // Write test cases as JSON
    await writeFile(
      TEST_CASES_FILE,
      JSON.stringify(allTestCases, null, 2),
      'utf-8'
    )

    console.log(`\n✅ Extraction complete!`)
    console.log(`   Total test cases: ${allTestCases.length}`)
    console.log(`   Bad examples: ${allTestCases.filter(tc => tc.type === 'bad').length}`)
    console.log(`   Good examples: ${allTestCases.filter(tc => tc.type === 'good').length}`)
    console.log(`   Output: ${TEST_CASES_FILE}`)
  } catch (error) {
    console.error('❌ Extraction failed:', error)
    process.exit(1)
  }
}

extractTests()
