import { describe, expect, it } from 'vitest'
import { explainSqlError } from './errors.ts'

describe('explainSqlError', () => {
  it('переводит отсутствие столбца', () => {
    const text = explainSqlError('no such column: customers.nickname')
    expect(text.title).toContain('nickname')
    expect(text.hint.length).toBeGreaterThan(0)
  })

  it('оставляет неизвестное сообщение как есть', () => {
    expect(explainSqlError('disk I/O error').title).toBe('disk I/O error')
  })
})
