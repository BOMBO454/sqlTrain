import type { SqlTable } from './sql/types.ts'

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/u, '')
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i]
    if (quoted) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i += 1
        } else quoted = false
      } else cell += char
      continue
    }
    if (char === '"') {
      quoted = true
      continue
    }
    if (char === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (char === '\n') {
      row.push(cell)
      cell = ''
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      continue
    }
    if (char !== '\r') cell += char
  }
  row.push(cell)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  return rows
}

export function csvToSql(table: string, csv: string): { sql: string; rowCount: number } {
  if (!/^[A-Za-z_][\w]*$/u.test(table)) {
    throw new Error('Имя таблицы: латиница, цифры и _, с буквы.')
  }
  const grid = parseCsv(csv.trim())
  if (grid.length < 2) throw new Error('Нужна строка заголовков и хотя бы одна строка данных.')
  const headers = grid[0].map((header, index) => sanitizeHeader(header, index))
  const body = grid.slice(1)
  const types = headers.map((_, index) => inferType(body.map((row) => row[index] ?? '')))
  const columns = headers.map((header, index) => `"${header}" ${types[index]}`).join(', ')
  const inserts = body
    .map((row) => {
      const values = headers.map((_, index) => literal(row[index] ?? '', types[index])).join(', ')
      return `INSERT INTO "${table}" (${headers.map((header) => `"${header}"`).join(', ')}) VALUES (${values});`
    })
    .join('\n')
  return {
    sql: `CREATE TABLE "${table}" (${columns});\n${inserts}`,
    rowCount: body.length,
  }
}

export function tableToCsv(table: SqlTable): string {
  const lines = [table.columns.map(csvCell).join(',')]
  for (const row of table.values) lines.push(row.map((cell) => csvCell(cell === null ? '' : String(cell))).join(','))
  return lines.join('\n')
}

function sanitizeHeader(header: string, index: number): string {
  const trimmed = header.trim()
  if (/^[A-Za-z_][\w]*$/u.test(trimmed)) return trimmed
  return `col_${index + 1}`
}

function inferType(values: string[]): 'INTEGER' | 'REAL' | 'TEXT' {
  const present = values.map((value) => value.trim()).filter((value) => value !== '')
  if (present.length === 0) return 'TEXT'
  if (present.every((value) => /^-?\d+$/u.test(value))) return 'INTEGER'
  if (present.every((value) => /^-?\d+\.\d+$/u.test(value))) return 'REAL'
  return 'TEXT'
}

function literal(raw: string, type: string): string {
  const value = raw.trim()
  if (value === '') return 'NULL'
  if (type === 'INTEGER' || type === 'REAL') return value
  return `'${value.replaceAll("'", "''")}'`
}

function csvCell(value: string): string {
  if (/[",\n]/u.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}
