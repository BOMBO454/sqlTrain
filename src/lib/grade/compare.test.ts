import { describe, expect, it } from 'vitest'
import { compareTables } from './compare.ts'

describe('compareTables', () => {
  it('принимает те же строки в другом порядке, если порядок не важен', () => {
    const grade = compareTables(
      { columns: ['name'], values: [['Вера'], ['Анна']] },
      { columns: ['name'], values: [['Анна'], ['Вера']] },
      false,
    )
    expect(grade.status).toBe('ok')
  })

  it('требует порядок, когда задание про сортировку', () => {
    const grade = compareTables(
      { columns: ['name'], values: [['Вера'], ['Анна']] },
      { columns: ['name'], values: [['Анна'], ['Вера']] },
      true,
    )
    expect(grade.status).toBe('mismatch')
  })

  it('отличает почти: значения те, имена другие', () => {
    const grade = compareTables(
      { columns: ['title'], values: [['Ассам']] },
      { columns: ['product'], values: [['Ассам']] },
      false,
    )
    expect(grade.status).toBe('almost')
  })

  it('сравнивает средние с допуском', () => {
    const grade = compareTables(
      { columns: ['avg_price'], values: [[535.0000001]] },
      { columns: ['avg_price'], values: [[535]] },
      false,
    )
    expect(grade.status).toBe('ok')
  })
})
