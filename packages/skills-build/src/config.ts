/**
 * Configuration for the build tooling
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Base paths
export const SKILLS_DIR = join(__dirname, '../../..', 'skills')
export const BUILD_DIR = join(__dirname, '..')

// Skill configurations
export interface SkillConfig {
  name: string
  title: string
  description: string
  skillDir: string
  rulesDir: string
  metadataFile: string
  outputFile: string
  sectionMap: Record<string, number>
}

export const SKILLS: Record<string, SkillConfig> = {
  'go-design': {
    name: 'go-design',
    title: 'Go Code Organization & Design',
    description: 'Go project structure, API design, and function/method patterns',
    skillDir: join(SKILLS_DIR, 'go-design'),
    rulesDir: join(SKILLS_DIR, 'go-design/rules'),
    metadataFile: join(SKILLS_DIR, 'go-design/metadata.json'),
    outputFile: join(SKILLS_DIR, 'go-design/AGENTS.md'),
    sectionMap: {
      code: 1,
      function: 2,
    },
  },
  'go-data': {
    name: 'go-data',
    title: 'Go Data Types & Control Flow',
    description: 'Go slices, maps, integers, strings, range loops, and control structures',
    skillDir: join(SKILLS_DIR, 'go-data'),
    rulesDir: join(SKILLS_DIR, 'go-data/rules'),
    metadataFile: join(SKILLS_DIR, 'go-data/metadata.json'),
    outputFile: join(SKILLS_DIR, 'go-data/AGENTS.md'),
    sectionMap: {
      data: 1,
      control: 2,
      string: 3,
    },
  },
  'go-errors': {
    name: 'go-errors',
    title: 'Go Error Management',
    description: 'Go error handling, wrapping, sentinel errors, and panic patterns',
    skillDir: join(SKILLS_DIR, 'go-errors'),
    rulesDir: join(SKILLS_DIR, 'go-errors/rules'),
    metadataFile: join(SKILLS_DIR, 'go-errors/metadata.json'),
    outputFile: join(SKILLS_DIR, 'go-errors/AGENTS.md'),
    sectionMap: {
      error: 1,
    },
  },
  'go-concurrency': {
    name: 'go-concurrency',
    title: 'Go Concurrency',
    description: 'Go goroutines, channels, mutexes, sync primitives, and data races',
    skillDir: join(SKILLS_DIR, 'go-concurrency'),
    rulesDir: join(SKILLS_DIR, 'go-concurrency/rules'),
    metadataFile: join(SKILLS_DIR, 'go-concurrency/metadata.json'),
    outputFile: join(SKILLS_DIR, 'go-concurrency/AGENTS.md'),
    sectionMap: {
      concurrency: 1,
      concurrent: 2,
    },
  },
  'go-performance': {
    name: 'go-performance',
    title: 'Go Performance & Quality',
    description: 'Go standard library usage, testing patterns, and performance optimization',
    skillDir: join(SKILLS_DIR, 'go-performance'),
    rulesDir: join(SKILLS_DIR, 'go-performance/rules'),
    metadataFile: join(SKILLS_DIR, 'go-performance/metadata.json'),
    outputFile: join(SKILLS_DIR, 'go-performance/AGENTS.md'),
    sectionMap: {
      stdlib: 1,
      testing: 2,
      optimization: 3,
    },
  },
}

// Default skill
export const DEFAULT_SKILL = 'go-design'

// Legacy exports for backwards compatibility
export const SKILL_DIR = SKILLS[DEFAULT_SKILL].skillDir
export const RULES_DIR = SKILLS[DEFAULT_SKILL].rulesDir
export const METADATA_FILE = SKILLS[DEFAULT_SKILL].metadataFile
export const OUTPUT_FILE = SKILLS[DEFAULT_SKILL].outputFile

// Test cases are build artifacts, not part of the skill
export const TEST_CASES_FILE = join(BUILD_DIR, 'test-cases.json')
