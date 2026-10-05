import type { Cell, SqlTable } from '../sql/types.ts'

export type Grade =
  | { status: 'ok' }
  | {
      status: 'almost'
      expectedColumns: string[]
      actualColumns: string[]
    }
  | {
      status: 'mismatch'
      message: string
      expectedColumns: string[]
      actualColumns: string[]
      missing: Cell[][]
      extra: Cell[][]
    }

const SAMPLE = 5

export function compareTables(
  actual: SqlTable,
  expected: SqlTable,
  orderMatters: boolean,
): Grade {
  const expectedColumns = expected.columns
  const actualColumns = actual.columns
  const sameNames = sameColumnSet(actualColumns, expectedColumns)

  if (sameNames) {
    const aligned = alignByName(actual, expectedColumns)
    return gradeRows(aligned, expected.values, orderMatters, expectedColumns, actualColumns, false)
  }

  if (actualColumns.length === expectedColumns.length && actualColumns.length > 0) {
    const valuesMatch = rowsEqual(actual.values, expected.values, orderMatters)
    if (valuesMatch) {
      return { status: 'almost', expectedColumns, actualColumns }
    }
  }

  if (actualColumns.length === expectedColumns.length) {
    return gradeRows(
      actual.values,
      expected.values,
      orderMatters,
      expectedColumns,
      actualColumns,
      true,
    )
  }

  return {
    status: 'mismatch',
    message: `Столбцы не совпали. Нужны: ${label(expectedColumns)}. У вас: ${label(actualColumns)}.`,
    expectedColumns,
    actualColumns,
    missing: [],
    extra: [],
  }
}

function gradeRows(
  actual: Cell[][],
  expected: Cell[][],
  orderMatters: boolean,
  expectedColumns: string[],
  actualColumns: string[],
  namesDiffer: boolean,
): Grade {
  if (rowsEqual(actual, expected, orderMatters)) {
    return { status: 'ok' }
  }
  if (orderMatters && rowsEqual(actual, expected, false)) {
    return {
      status: 'mismatch',
      message: namesDiffer
        ? 'Набор значений похож, но порядок строк и имена столбцов не те.'
        : 'Значения те же, но порядок строк другой. Задание просит конкретную сортировку.',
      expectedColumns,
      actualColumns,
      missing: [],
      extra: [],
    }
  }
  const { missing, extra } = multisetDiff(expected, actual)
  const nameNote = namesDiffer ? ` Имена столбцов: нужны ${label(expectedColumns)}.` : ''
  return {
    status: 'mismatch',
    message: `Строк у вас ${actual.length}, ожидалось ${expected.length}.${nameNote}`,
    expectedColumns,
    actualColumns,
    missing: missing.slice(0, SAMPLE),
    extra: extra.slice(0, SAMPLE),
  }
}

function sameColumnSet(actual: string[], expected: string[]): boolean {
  if (actual.length !== expected.length) return false
  const left = new Set(actual.map((name) => name.toLowerCase()))
  return expected.every((name) => left.has(name.toLowerCase()))
}

function alignByName(actual: SqlTable, expectedColumns: string[]): Cell[][] {
  const index = new Map(actual.columns.map((name, i) => [name.toLowerCase(), i]))
  return actual.values.map((row) =>
    expectedColumns.map((column) => {
      const at = index.get(column.toLowerCase())
      return at === undefined ? null : (row[at] ?? null)
    }),
  )
}

function rowsEqual(actual: Cell[][], expected: Cell[][], orderMatters: boolean): boolean {
  if (actual.length !== expected.length) return false
  if (orderMatters) {
    return actual.every((row, i) => rowEqual(row, expected[i] ?? []))
  }
  const left = actual.map(rowKey).sort()
  const right = expected.map(rowKey).sort()
  return left.every((key, i) => key === right[i])
}

function rowEqual(left: Cell[], right: Cell[]): boolean {
  if (left.length !== right.length) return false
  return left.every((cell, i) => cellsEqual(cell, right[i] ?? null))
}

function cellsEqual(a: Cell, b: Cell): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    const scale = Math.max(1, Math.abs(a), Math.abs(b))
    return Math.abs(a - b) <= 1e-6 * scale
  }
  return a === b
}

function cellKey(value: Cell): string {
  if (value === null) return 'null'
  if (typeof value === 'number') {
    const rounded = Math.round(value * 1e6) / 1e6
    return `n:${rounded}`
  }
  return `s:${value}`
}

function rowKey(row: Cell[]): string {
  return row.map(cellKey).join('\u001f')
}

function multisetDiff(expected: Cell[][], actual: Cell[][]): { missing: Cell[][]; extra: Cell[][] } {
  const counts = new Map<string, number>()
  for (const row of expected) {
    const key = rowKey(row)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const extra: Cell[][] = []
  for (const row of actual) {
    const key = rowKey(row)
    const left = counts.get(key) ?? 0
    if (left > 0) counts.set(key, left - 1)
    else extra.push(row)
  }
  const missing: Cell[][] = []
  expected.forEach((row) => {
    const key = rowKey(row)
    const left = counts.get(key) ?? 0
    if (left > 0) {
      counts.set(key, left - 1)
      missing.push(row)
    }
  })
  return { missing, extra }
}

function label(columns: string[]): string {
  if (columns.length === 0) return 'нет столбцов'
  return columns.join(', ')
}
