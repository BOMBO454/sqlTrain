import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { guardExerciseSql } from '../lib/sql/guard.ts'
import { exercises, seeds, topics } from './catalog.ts'

const require = createRequire(import.meta.url)
const initSqlJs = require('sql.js') as () => Promise<{
  Database: new () => {
    run: (sql: string) => void
    prepare: (sql: string) => {
      step: () => boolean
      get: () => unknown[]
      getColumnNames: () => string[]
      free: () => void
    }
    close: () => void
  }
}>

async function columnsOf(seedSql: string, sql: string): Promise<{ columns: string[]; rows: number }> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  try {
    db.run(seedSql)
    const stmt = db.prepare(sql)
    const columns = stmt.getColumnNames()
    let rows = 0
    while (stmt.step()) rows += 1
    stmt.free()
    return { columns, rows }
  } finally {
    db.close()
  }
}

describe('учебные решения', () => {
  it('каждое решение — один разрешённый SELECT и даёт нужные столбцы на обеих базах', async () => {
    expect(exercises).toHaveLength(55)
    expect(topics).toHaveLength(9)
    expect(exercises.every((exercise) => [1, 2, 3].includes(exercise.level))).toBe(true)
    expect(topics.every((topic) => topic.lessons.some((lesson) => lesson.kind === 'theory'))).toBe(true)
    expect(exercises.every((exercise) => exercise.theory.length > 0)).toBe(true)
    for (const exercise of exercises) {
      expect(guardExerciseSql(exercise.solutionSql).ok, exercise.id).toBe(true)
      const pack = seeds[exercise.seedId]
      for (const seedSql of [pack.visible, pack.hidden]) {
        const result = await columnsOf(seedSql, exercise.solutionSql)
        expect(result.columns.map((column) => column.toLowerCase()), exercise.id).toEqual(
          exercise.columns.map((column) => column.toLowerCase()),
        )
        expect(result.rows, exercise.id).toBeGreaterThan(0)
      }
    }
  })
})
