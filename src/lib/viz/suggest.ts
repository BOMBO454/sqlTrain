import type { SchemaTable } from '../sql/types.ts'

export type SuggestKind = 'keyword' | 'table' | 'column' | 'function' | 'snippet'

export type SuggestItem = {
  label: string
  detail: string
  insertText: string
  snippet: boolean
  kind: SuggestKind
}

const KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'LIKE',
  'BETWEEN',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'ON',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'ASC',
  'DESC',
  'LIMIT',
  'DISTINCT',
  'AS',
  'WITH',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
]

const FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'IFNULL', 'LENGTH', 'LOWER', 'UPPER', 'TRIM', 'ROUND', 'SUBSTR', 'REPLACE', 'GROUP_CONCAT']

const SNIPPETS: SuggestItem[] = [
  {
    label: 'SELECT … FROM',
    detail: 'сниппет',
    insertText: 'SELECT ${1:*}\nFROM ${2:table}',
    snippet: true,
    kind: 'snippet',
  },
  {
    label: 'LEFT JOIN … ON',
    detail: 'сниппет',
    insertText: 'LEFT JOIN ${1:other} ON ${2:a.id} = ${3:other.a_id}',
    snippet: true,
    kind: 'snippet',
  },
  {
    label: 'GROUP BY',
    detail: 'сниппет',
    insertText: 'GROUP BY ${1:column}\nHAVING ${2:COUNT(*) > 1}',
    snippet: true,
    kind: 'snippet',
  },
  {
    label: 'оконная функция',
    detail: 'сниппет',
    insertText: 'SUM(${1:amount}) OVER (PARTITION BY ${2:customer_id} ORDER BY ${3:created_at})',
    snippet: true,
    kind: 'snippet',
  },
]

const ALIAS_STOP = new Set(['where', 'on', 'join', 'left', 'right', 'inner', 'outer', 'cross', 'group', 'order', 'limit', 'having', 'union', 'as'])

export function suggestSql(sqlBefore: string, schema: SchemaTable[]): SuggestItem[] {
  if (oddQuotes(sqlBefore)) return []
  const dot = sqlBefore.match(/([A-Za-z_\u0400-\u04FF][\w\u0400-\u04FF]*)\.[\w\u0400-\u04FF]*$/u)
  if (dot) {
    const table = resolveAlias(sqlBefore, dot[1], schema)
    const columns = table ? table.columns : schema.flatMap((item) => item.columns)
    const owner = table?.name
    return uniqueColumns(columns, owner)
  }
  if (/\b(from|join)\s+[\w\u0400-\u04FF]*$/iu.test(sqlBefore)) {
    return schema.map((table) => ({
      label: table.name,
      detail: 'таблица',
      insertText: table.name,
      snippet: false,
      kind: 'table' as const,
    }))
  }
  const columns = uniqueColumns(
    schema.flatMap((table) => table.columns.map((column) => ({ ...column, table: table.name }))),
  )
  const words = KEYWORDS.map((keyword) => ({
    label: keyword,
    detail: 'ключевое слово',
    insertText: keyword,
    snippet: false,
    kind: 'keyword' as const,
  }))
  const fns = FUNCTIONS.map((name) => ({
    label: name,
    detail: 'функция',
    insertText: `${name}($0)`,
    snippet: true,
    kind: 'function' as const,
  }))
  return [...columns, ...fns, ...SNIPPETS, ...words]
}

function uniqueColumns(
  columns: { name: string; type: string; table?: string }[],
  owner?: string,
): SuggestItem[] {
  const seen = new Set<string>()
  const items: SuggestItem[] = []
  for (const column of columns) {
    const key = `${owner ?? column.table ?? ''}.${column.name}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      label: column.name,
      detail: `${column.type || 'столбец'}${column.table ? ` · ${column.table}` : ''}`,
      insertText: column.name,
      snippet: false,
      kind: 'column',
    })
  }
  return items
}

export function resolveAlias(sql: string, name: string, schema: SchemaTable[]): SchemaTable | undefined {
  const direct = schema.find((table) => table.name.toLowerCase() === name.toLowerCase())
  if (direct) return direct
  const re = /\b(?:from|join)\s+([A-Za-z_\u0400-\u04FF][\w\u0400-\u04FF]*)(?:\s+(?:as\s+)?([A-Za-z_\u0400-\u04FF][\w\u0400-\u04FF]*))?/giu
  let match = re.exec(sql)
  while (match) {
    const tableName = match[1]
    const alias = match[2]
    if (alias && !ALIAS_STOP.has(alias.toLowerCase()) && alias.toLowerCase() === name.toLowerCase()) {
      return schema.find((table) => table.name.toLowerCase() === tableName.toLowerCase())
    }
    match = re.exec(sql)
  }
  return undefined
}

export function columnHover(word: string, schema: SchemaTable[]): string | null {
  const hits = schema.flatMap((table) =>
    table.columns
      .filter((column) => column.name.toLowerCase() === word.toLowerCase())
      .map((column) => `${column.name} — ${column.type || 'без типа'} · ${table.name}${column.pk ? ' · ключ' : ''}`),
  )
  if (hits.length === 0) return null
  return hits.join('\n\n')
}

function oddQuotes(sql: string): boolean {
  let single = 0
  for (let i = 0; i < sql.length; i += 1) {
    if (sql[i] === "'" && sql[i - 1] !== '\\') single += 1
  }
  return single % 2 === 1
}
