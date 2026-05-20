#!/usr/bin/env node
/**
 * Efficiency test suite for skills
 * Tests context efficiency, build overhead, and load performance
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { performance } from 'perf_hooks'
import { SKILLS } from './config.js'

// Efficiency benchmarks
const BENCHMARKS = {
  // Maximum acceptable context usage (% of 200K Claude context)
  maxContextUsage: 15, // 15% = 30,000 tokens

  // Maximum acceptable build overhead (% increase over source)
  maxBuildOverhead: 50, // 50% overhead is acceptable

  // Minimum content efficiency (% of useful content vs overhead)
  minContentEfficiency: 60, // At least 60% should be actual content

  // Maximum file size (KB)
  maxFileSize: 100, // 100 KB

  // Maximum tokens per rule (for consistency)
  maxTokensPerRule: 600,

  // Minimum rules per skill
  minRules: 1,
}

interface TestResult {
  name: string
  passed: boolean
  value: number
  threshold: number
  unit: string
  message: string
}

interface SkillMetrics {
  skillName: string
  agentsTokens: number
  agentsSize: number
  ruleCount: number
  sourceTokens: number
  buildOverhead: number
  contentEfficiency: number
  contextUsage: number
  avgTokensPerRule: number
  loadTimeMs: number
  tests: TestResult[]
  passed: boolean
}

/**
 * Estimate tokens (1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return Math.ceil(normalized.length / 4)
}

/**
 * Format number with separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Run efficiency tests on a skill
 */
async function testSkillEfficiency(skillName: string): Promise<SkillMetrics> {
  const skill = SKILLS[skillName]
  const tests: TestResult[] = []

  // Measure load time
  const loadStart = performance.now()
  const agentsContent = await readFile(skill.outputFile, 'utf-8')
  const loadTimeMs = performance.now() - loadStart

  // Calculate metrics
  const agentsTokens = estimateTokens(agentsContent)
  const agentsSize = agentsContent.length
  const contextUsage = (agentsTokens / 200000) * 100

  // Count source files
  const files = await readdir(skill.rulesDir)
  const ruleFiles = files.filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md'
  )
  const ruleCount = ruleFiles.length

  // Calculate source tokens
  let sourceTokens = 0
  for (const file of ruleFiles) {
    const filePath = join(skill.rulesDir, file)
    const content = await readFile(filePath, 'utf-8')
    sourceTokens += estimateTokens(content)
  }

  const buildOverhead = ((agentsTokens - sourceTokens) / sourceTokens) * 100
  const contentEfficiency = (sourceTokens / agentsTokens) * 100
  const avgTokensPerRule = agentsTokens / ruleCount

  // Test 1: Context Usage
  tests.push({
    name: 'Context Usage',
    passed: contextUsage <= BENCHMARKS.maxContextUsage,
    value: contextUsage,
    threshold: BENCHMARKS.maxContextUsage,
    unit: '%',
    message: `Uses ${contextUsage.toFixed(2)}% of Claude's 200K context`,
  })

  // Test 2: Build Overhead
  tests.push({
    name: 'Build Overhead',
    passed: buildOverhead <= BENCHMARKS.maxBuildOverhead,
    value: buildOverhead,
    threshold: BENCHMARKS.maxBuildOverhead,
    unit: '%',
    message: `Build adds ${buildOverhead.toFixed(1)}% overhead`,
  })

  // Test 3: Content Efficiency
  tests.push({
    name: 'Content Efficiency',
    passed: contentEfficiency >= BENCHMARKS.minContentEfficiency,
    value: contentEfficiency,
    threshold: BENCHMARKS.minContentEfficiency,
    unit: '%',
    message: `${contentEfficiency.toFixed(1)}% of output is content`,
  })

  // Test 4: File Size
  tests.push({
    name: 'File Size',
    passed: (agentsSize / 1024) <= BENCHMARKS.maxFileSize,
    value: agentsSize / 1024,
    threshold: BENCHMARKS.maxFileSize,
    unit: 'KB',
    message: `AGENTS.md is ${(agentsSize / 1024).toFixed(2)} KB`,
  })

  // Test 5: Tokens Per Rule
  tests.push({
    name: 'Avg Tokens/Rule',
    passed: avgTokensPerRule <= BENCHMARKS.maxTokensPerRule,
    value: avgTokensPerRule,
    threshold: BENCHMARKS.maxTokensPerRule,
    unit: 'tokens',
    message: `Average ${avgTokensPerRule.toFixed(0)} tokens per rule`,
  })

  // Test 6: Minimum Rules
  tests.push({
    name: 'Rule Count',
    passed: ruleCount >= BENCHMARKS.minRules,
    value: ruleCount,
    threshold: BENCHMARKS.minRules,
    unit: 'rules',
    message: `Skill has ${ruleCount} rules`,
  })

  // Test 7: Load Performance
  tests.push({
    name: 'Load Time',
    passed: loadTimeMs < 100, // Should load in under 100ms
    value: loadTimeMs,
    threshold: 100,
    unit: 'ms',
    message: `Loads in ${loadTimeMs.toFixed(2)}ms`,
  })

  const passed = tests.every((t) => t.passed)

  return {
    skillName,
    agentsTokens,
    agentsSize,
    ruleCount,
    sourceTokens,
    buildOverhead,
    contentEfficiency,
    contextUsage,
    avgTokensPerRule,
    loadTimeMs,
    tests,
    passed,
  }
}

/**
 * Display test results
 */
function displayResults(metrics: SkillMetrics) {
  const { skillName, tests, passed } = metrics
  const skill = SKILLS[skillName]

  console.log(`\n${'='.repeat(70)}`)
  console.log(`🧪 Efficiency Test: ${skill.title}`)
  console.log(`${'='.repeat(70)}\n`)

  // Display metrics
  console.log(`📊 Metrics:\n`)
  console.log(`   Total tokens:       ${formatNumber(metrics.agentsTokens)}`)
  console.log(`   Source tokens:      ${formatNumber(metrics.sourceTokens)}`)
  console.log(`   File size:          ${(metrics.agentsSize / 1024).toFixed(2)} KB`)
  console.log(`   Rules:              ${metrics.ruleCount}`)
  console.log(`   Avg tokens/rule:    ${metrics.avgTokensPerRule.toFixed(0)}`)
  console.log(`   Load time:          ${metrics.loadTimeMs.toFixed(2)}ms`)
  console.log(`   Context usage:      ${metrics.contextUsage.toFixed(2)}%`)
  console.log(`   Build overhead:     ${metrics.buildOverhead.toFixed(1)}%`)
  console.log(`   Content efficiency: ${metrics.contentEfficiency.toFixed(1)}%`)

  // Display test results
  console.log(`\n🎯 Tests:\n`)

  tests.forEach((test, i) => {
    const icon = test.passed ? '✅' : '❌'
    const status = test.passed ? 'PASS' : 'FAIL'
    const comparison = test.unit === '%' && test.name === 'Content Efficiency'
      ? `≥ ${test.threshold}${test.unit}`
      : `≤ ${test.threshold}${test.unit}`

    console.log(`   ${icon} ${test.name.padEnd(20)} [${status}]`)
    console.log(`      ${test.message}`)
    console.log(`      Threshold: ${comparison}`)
    console.log()
  })

  // Overall result
  console.log(`${'='.repeat(70)}`)
  if (passed) {
    console.log(`✅ ALL TESTS PASSED - Skill meets efficiency benchmarks`)
  } else {
    const failedCount = tests.filter((t) => !t.passed).length
    console.log(`❌ ${failedCount} TEST(S) FAILED - Skill needs optimization`)
  }
  console.log(`${'='.repeat(70)}\n`)

  return passed
}

/**
 * Display benchmarks
 */
function displayBenchmarks() {
  console.log(`\n📋 Efficiency Benchmarks:\n`)
  console.log(`   Context Usage:       ≤ ${BENCHMARKS.maxContextUsage}% of 200K tokens`)
  console.log(`   Build Overhead:      ≤ ${BENCHMARKS.maxBuildOverhead}%`)
  console.log(`   Content Efficiency:  ≥ ${BENCHMARKS.minContentEfficiency}%`)
  console.log(`   File Size:           ≤ ${BENCHMARKS.maxFileSize} KB`)
  console.log(`   Tokens Per Rule:     ≤ ${BENCHMARKS.maxTokensPerRule}`)
  console.log(`   Minimum Rules:       ≥ ${BENCHMARKS.minRules}`)
  console.log(`   Load Time:           < 100ms`)
  console.log()
}

/**
 * Compare skills
 */
async function compareSkills(skillMetrics: SkillMetrics[]) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`📊 Skill Comparison`)
  console.log(`${'='.repeat(70)}\n`)

  console.log(`${'Skill'.padEnd(25)} ${'Tokens'.padStart(10)} ${'Rules'.padStart(8)} ${'Context'.padStart(10)} ${'Status'}`)
  console.log(`${'-'.repeat(70)}`)

  skillMetrics.forEach((metrics) => {
    const skill = SKILLS[metrics.skillName]
    const status = metrics.passed ? '✅' : '❌'
    const contextPct = `${metrics.contextUsage.toFixed(1)}%`

    console.log(
      `${skill.title.padEnd(25)} ` +
      `${formatNumber(metrics.agentsTokens).padStart(10)} ` +
      `${metrics.ruleCount.toString().padStart(8)} ` +
      `${contextPct.padStart(10)} ` +
      `${status}`
    )
  })

  console.log()
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  console.log(`\n🔬 Skill Efficiency Test Suite`)

  if (args.includes('--benchmarks')) {
    displayBenchmarks()
    return
  }

  const skillsToTest = args.length > 0 && !args[0].startsWith('--')
    ? [args[0]]
    : Object.keys(SKILLS)

  const results: SkillMetrics[] = []

  for (const skillName of skillsToTest) {
    try {
      const metrics = await testSkillEfficiency(skillName)
      results.push(metrics)
      displayResults(metrics)
    } catch (error: any) {
      console.error(`\n❌ Error testing ${skillName}: ${error.message}`)
      console.error(`   Make sure to run 'pnpm build' first.\n`)
    }
  }

  if (results.length > 1) {
    compareSkills(results)
  }

  // Exit with error code if any tests failed
  const allPassed = results.every((r) => r.passed)
  if (!allPassed) {
    console.log(`\n💡 Tip: Run 'pnpm tokens' for detailed token analysis\n`)
    process.exit(1)
  } else {
    console.log(`\n✨ All skills meet efficiency benchmarks!\n`)
  }
}

main()
