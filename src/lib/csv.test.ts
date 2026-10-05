import { describe, expect, it } from 'vitest'
import { csvToSql, parseCsv, tableToCsv } from './csv.ts'

describe('csv', () => {
  it('понимает кавычки и запятые внутри', () => {
    expect(parseCsv('name,city\n"Анна, мл.",Казань\n')).toEqual([
      ['name', 'city'],
      ['Анна, мл.', 'Казань'],
    ])
  })

  it('собирает CREATE и INSERT и угадывает число', () => {
    const { sql, rowCount } = csvToSql('people', 'name,qty\nАнна,2\n')
    expect(rowCount).toBe(1)
    expect(sql).toContain('"qty" INTEGER')
    expect(sql).toContain("'Анна'")
  })

  it('отказывается от плохого имени таблицы', () => {
    expect(() => csvToSql('1bad', 'a\n1\n')).toThrow()
  })

  it('выгружает таблицу обратно', () => {
    expect(tableToCsv({ columns: ['name'], values: [['А, Б']] })).toBe('name\n"А, Б"')
  })
})
