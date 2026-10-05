import parserModule from 'node-sql-parser'

type SqlParser = {
  astify: (sql: string, opt?: { database?: string }) => unknown
  sqlify: (ast: unknown, opt?: { database?: string }) => string
}

type ParserCtor = new () => SqlParser

function loadCtor(mod: unknown): ParserCtor {
  if (typeof mod === 'function') return mod as ParserCtor
  if (mod && typeof mod === 'object') {
    const record = mod as { Parser?: ParserCtor; default?: unknown }
    if (typeof record.Parser === 'function') return record.Parser
    if (record.default) return loadCtor(record.default)
  }
  throw new Error('node-sql-parser: не найден Parser')
}

export const sqlParser: SqlParser = new (loadCtor(parserModule))()

export const SQLITE = { database: 'sqlite' } as const
