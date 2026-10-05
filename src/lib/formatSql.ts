import { formatDialect, sqlite } from 'sql-formatter'

export function formatSql(sql: string): string {
  return formatDialect(sql, { dialect: sqlite, tabWidth: 2, keywordCase: 'upper' })
}
