import { describe, expect, it } from 'vitest'
import { guardExerciseSql, guardSandboxSql } from './guard.ts'

describe('guardExerciseSql', () => {
  it('пускает SELECT и WITH', () => {
    expect(guardExerciseSql("SELECT name FROM customers WHERE city = 'Казань'").ok).toBe(true)
    expect(guardExerciseSql("WITH paid AS (SELECT * FROM orders) SELECT * FROM paid").ok).toBe(true)
  })

  it('пускает INTERSECT и EXCEPT одним оператором', () => {
    expect(guardExerciseSql('SELECT name FROM customers INTERSECT SELECT name FROM customers').ok).toBe(true)
    expect(guardExerciseSql('SELECT name FROM customers EXCEPT SELECT city FROM customers').ok).toBe(true)
    expect(guardExerciseSql('SELECT 1 INTERSECT SELECT 1; SELECT 2').ok).toBe(false)
    expect(guardExerciseSql('SELECT id, SUM(id) OVER (ORDER BY id) AS running FROM orders').ok).toBe(true)
  })

  it('режет запись, второй оператор и sqlite_master', () => {
    expect(guardExerciseSql("INSERT INTO customers (name) VALUES ('x')").ok).toBe(false)
    expect(guardExerciseSql('SELECT 1; SELECT 2').ok).toBe(false)
    expect(guardExerciseSql('SELECT * FROM sqlite_master').ok).toBe(false)
  })
})

describe('guardSandboxSql', () => {
  it('пускает SELECT и CREATE', () => {
    expect(guardSandboxSql('CREATE TABLE t (id INTEGER)').ok).toBe(true)
  })

  it('режет ATTACH', () => {
    expect(guardSandboxSql('ATTACH DATABASE "x" AS other').ok).toBe(false)
  })
})
