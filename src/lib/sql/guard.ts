import { SQLITE, sqlParser } from './parser.ts'

export type GuardResult = { ok: true } | { ok: false; reason: string }

function parseExercise(sql: string): GuardResult {
  let ast: unknown
  try {
    ast = sqlParser.astify(sql, SQLITE)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось разобрать SQL'
    return { ok: false, reason: `Запрос не разбирается: ${message}` }
  }
  const list = Array.isArray(ast) ? ast : [ast]
  if (list.length !== 1) {
    return { ok: false, reason: 'В упражнении нужен один оператор SELECT.' }
  }
  const stmt = list[0] as { type?: string }
  if (stmt?.type !== 'select') {
    return { ok: false, reason: 'В упражнении разрешён только SELECT (можно с WITH).' }
  }
  if (JSON.stringify(stmt).toLowerCase().includes('sqlite_')) {
    return { ok: false, reason: 'Служебные таблицы sqlite_ в упражнении закрыты.' }
  }
  return { ok: true }
}

export function guardExerciseSql(sql: string): GuardResult {
  const stripped = sql.trim().replace(/;+\s*$/u, '')
  if (!stripped) return { ok: false, reason: 'Запрос пустой.' }
  const direct = parseExercise(stripped)
  if (direct.ok) return direct
  let rewritten = stripped
  let changed = false
  if (/\b(intersect|except)\b/i.test(rewritten)) {
    // Разборщик знает UNION, но не INTERSECT и EXCEPT.
    rewritten = rewritten.replace(/\bintersect\b/gi, 'UNION').replace(/\bexcept\b/gi, 'UNION')
    changed = true
  }
  if (/\bover\s*\(\s*order\s+by\b/i.test(rewritten)) {
    // Окно только с ORDER BY в SQLite законно, разборщик ждёт PARTITION.
    rewritten = rewritten.replace(/\bover\s*\(\s*order\s+by\b/gi, 'OVER (PARTITION BY 1 ORDER BY')
    changed = true
  }
  if (!changed) return direct
  const retry = parseExercise(rewritten)
  return retry.ok ? retry : direct
}

export function guardSandboxSql(sql: string): GuardResult {
  const stripped = sql.trim()
  if (!stripped) return { ok: false, reason: 'Запрос пустой.' }
  if (/^\s*(attach|detach|pragma|vacuum|reindex)\b/i.test(stripped)) {
    return { ok: false, reason: 'ATTACH, PRAGMA и VACUUM в песочнице выключены.' }
  }
  if (/load_extension/i.test(stripped)) {
    return { ok: false, reason: 'load_extension выключен.' }
  }
  return { ok: true }
}
