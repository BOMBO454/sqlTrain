import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { seeds } from '../../content/catalog.ts'
import { buildPipeline } from './pipeline.ts'

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

describe('buildPipeline', () => {
  it('разбирает соединение и фильтр на шаги', () => {
    const sql = `SELECT c.name, o.id AS order_id
      FROM customers c
      INNER JOIN orders o ON c.id = o.customer_id
      WHERE o.status = 'paid'`
    const pipeline = buildPipeline(sql)
    expect(pipeline.supported).toBe(true)
    if (!pipeline.supported) return
    expect(pipeline.stages.map((stage) => stage.kind)).toEqual(['source', 'join', 'where', 'select'])
    expect(pipeline.narrative).toContain('customers')
  })

  it('не притворяется, что UNION считается по шагам', () => {
    const pipeline = buildPipeline('SELECT name FROM customers UNION SELECT title FROM products')
    expect(pipeline.supported).toBe(false)
  })

  it('не дробит оконную функцию на шаги', () => {
    const pipeline = buildPipeline(
      'SELECT name, ROW_NUMBER() OVER (PARTITION BY city ORDER BY name) AS n FROM customers',
    )
    expect(pipeline.supported).toBe(false)
  })

  it('не дробит подзапрос в WHERE на шаги', () => {
    const pipeline = buildPipeline('SELECT title FROM products WHERE price > (SELECT AVG(price) FROM products)')
    expect(pipeline.supported).toBe(false)
  })

  it('шаги исполняются на учебной базе', async () => {
    const SQL = await initSqlJs()
    const pipeline = buildPipeline(
      "SELECT name, city FROM customers WHERE city = 'Казань' ORDER BY name",
    )
    expect(pipeline.supported).toBe(true)
    if (!pipeline.supported) return
    const db = new SQL.Database()
    db.run(seeds.shop.visible)
    for (const stage of pipeline.stages) {
      const stmt = db.prepare(stage.sql)
      expect(stmt.getColumnNames().length).toBeGreaterThan(0)
      stmt.free()
    }
    db.close()
  })
})
