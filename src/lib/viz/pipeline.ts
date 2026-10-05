import { SQLITE, sqlParser } from '../sql/parser.ts'

export type StageKind = 'source' | 'join' | 'where' | 'group' | 'having' | 'select' | 'order'

export type StagePlan = {
  kind: StageKind
  title: string
  detail: string
  sql: string
}

export type Pipeline =
  | { supported: true; stages: StagePlan[]; narrative: string }
  | { supported: false; reason: string; outline: string[] }

type Ast = Record<string, unknown>

export function buildPipeline(sql: string): Pipeline {
  const stripped = sql.trim().replace(/;+\s*$/u, '')
  if (!stripped) {
    return { supported: false, reason: 'Пустой запрос нечего разбирать.', outline: [] }
  }
  let parsed: unknown
  try {
    parsed = sqlParser.astify(stripped, SQLITE)
  } catch {
    return {
      supported: false,
      reason: 'Пошаговые строки появятся, когда запрос разберётся как SELECT.',
      outline: ['Синтаксис пока не похож на законченный SELECT.'],
    }
  }
  const list = Array.isArray(parsed) ? parsed : [parsed]
  if (list.length !== 1) {
    return {
      supported: false,
      reason: 'Пошаговый разбор рассчитан на один оператор.',
      outline: [`Операторов: ${list.length}.`],
    }
  }
  const ast = list[0] as Ast
  if (ast.type !== 'select' || ast.set_op || ast._next) {
    return {
      supported: false,
      reason: 'Пошаговые строки доступны для одного SELECT без UNION.',
      outline: outlineOf(ast),
    }
  }
  const from = Array.isArray(ast.from) ? (ast.from as Ast[]) : null
  if (!from || from.length === 0 || from.some((item) => !item.table || item.expr)) {
    return {
      supported: false,
      reason: 'Пошаговые строки доступны для прямого SELECT по таблицам, без подзапроса во FROM.',
      outline: outlineOf(ast),
    }
  }
  const { with: cte, ...rest } = ast
  if (hasNestedSelect(rest, true)) {
    return {
      supported: false,
      reason: 'В запросе есть вложенный SELECT. Итог посчитать можно, пошаговые строки — для запроса без подзапросов.',
      outline: outlineOf(ast),
    }
  }
  if (hasWindow(rest)) {
    return {
      supported: false,
      reason: 'Оконная функция считает строку вместе с соседями. Итог есть, пошаговые срезы для OVER не строятся.',
      outline: outlineOf(ast),
    }
  }

  const stages: StagePlan[] = []
  const push = (stage: StagePlan) => {
    if (stages.some((item) => item.sql === stage.sql)) return
    stages.push(stage)
  }

  push({
    kind: 'source',
    title: `Таблица ${String(from[0].table)}`,
    detail: from[0].as ? `Псевдоним ${String(from[0].as)}` : 'Все строки источника',
    sql: sqlify(stageAst(ast, { from: [stripJoin(from[0])], columns: star(), where: null, groupby: null, having: null, orderby: null, limit: null, distinct: null })),
  })

  for (let i = 1; i < from.length; i += 1) {
    const item = from[i]
    const slice = from.slice(0, i + 1).map((entry, index) => (index === 0 ? stripJoin(entry) : entry))
    const joinName = String(item.join ?? 'список таблиц')
    push({
      kind: 'join',
      title: `${joinName} ${String(item.table)}`,
      detail: item.on ? `Условие: ${exprText(item.on)}` : 'Без условия ON',
      sql: sqlify(stageAst(ast, { from: slice, columns: star(), where: null, groupby: null, having: null, orderby: null, limit: null, distinct: null })),
    })
  }

  if (ast.where) {
    push({
      kind: 'where',
      title: 'Фильтр WHERE',
      detail: exprText(ast.where),
      sql: sqlify(stageAst(ast, { columns: star(), groupby: null, having: null, orderby: null, limit: null, distinct: null })),
    })
  }

  const groupColumns = groupList(ast.groupby)
  if (groupColumns.length > 0) {
    push({
      kind: 'group',
      title: 'Группировка',
      detail: groupColumns.map(exprText).join(', '),
      sql: sqlify(
        stageAst(ast, {
          columns: [
            ...groupColumns.map((expr) => ({ expr, as: null })),
            {
              expr: { type: 'aggr_func', name: 'COUNT', args: { expr: { type: 'star', value: '*' } } },
              as: 'rows_in_group',
            },
          ],
          having: null,
          orderby: null,
          limit: null,
          distinct: null,
        }),
      ),
    })
  }

  if (ast.having) {
    push({
      kind: 'having',
      title: 'Фильтр групп HAVING',
      detail: exprText(ast.having),
      sql: sqlify(stageAst(ast, { orderby: null, limit: null })),
    })
  }

  const columnText = Array.isArray(ast.columns) ? (ast.columns as unknown[]).map(colLabel).join(', ') : '*'
  push({
    kind: 'select',
    title: ast.distinct ? 'Столбцы результата, DISTINCT' : 'Столбцы результата',
    detail: columnText,
    sql: sqlify(stageAst(ast, { orderby: null, limit: null })),
  })

  if (ast.orderby || ast.limit) {
    const bits = []
    if (Array.isArray(ast.orderby)) {
      bits.push(
        (ast.orderby as Ast[])
          .map((item) => {
            const dir = String(item.type ?? 'ASC').toUpperCase() === 'DESC' ? 'по убыванию' : 'по возрастанию'
            return `${exprText(item.expr)} ${dir}`
          })
          .join(', '),
      )
    }
    if (ast.limit) bits.push(`не больше ${limitText(ast.limit)}`)
    push({
      kind: 'order',
      title: ast.limit && ast.orderby ? 'Сортировка и предел' : ast.limit ? 'Предел' : 'Сортировка',
      detail: bits.join(' · '),
      sql: sqlify(ast),
    })
  }

  return { supported: true, stages, narrative: narrate(ast, from, cte) }
}

function stageAst(ast: Ast, patch: Ast): Ast {
  return { ...structuredClone(ast), ...patch }
}

function stripJoin(item: Ast): Ast {
  const next = { ...item }
  delete next.join
  delete next.on
  delete next.using
  return next
}

function star(): unknown[] {
  return [{ expr: { type: 'column_ref', table: null, column: '*' }, as: null }]
}

function sqlify(ast: unknown): string {
  return sqlParser.sqlify(ast, SQLITE)
}

function groupList(groupby: unknown): unknown[] {
  if (!groupby || typeof groupby !== 'object') return []
  const columns = (groupby as { columns?: unknown }).columns
  return Array.isArray(columns) ? columns : []
}

function limitText(limit: unknown): string {
  if (!limit || typeof limit !== 'object') return '?'
  const value = (limit as { value?: { value?: unknown }[] }).value
  if (!Array.isArray(value) || value.length === 0) return '?'
  return value.map((item) => String(item.value)).join(' ')
}

function narrate(ast: Ast, from: Ast[], cte: unknown): string {
  const sentences: string[] = []
  if (Array.isArray(cte) && cte.length > 0) {
    const names = (cte as Ast[]).map((item) => String((item.name as Ast | undefined)?.value ?? 'cte'))
    sentences.push(`Сначала считаю временные таблицы ${names.join(', ')}.`)
  }
  const head = String(from[0].table)
  if (from.length === 1) sentences.push(`Беру строки из ${head}.`)
  else {
    const joins = from.slice(1).map((item) => {
      const how = String(item.join ?? 'вместе с')
      const cond = item.on ? ` по условию ${exprText(item.on)}` : ''
      return `${how} ${String(item.table)}${cond}`
    })
    sentences.push(`Беру строки из ${head}, затем ${joins.join('; ')}.`)
  }
  if (ast.where) sentences.push(`Оставляю строки, где ${exprText(ast.where)}.`)
  const groups = groupList(ast.groupby)
  if (groups.length > 0) sentences.push(`Группирую по ${groups.map(exprText).join(', ')}.`)
  if (ast.having) sentences.push(`Оставляю группы, где ${exprText(ast.having)}.`)
  if (Array.isArray(ast.columns)) {
    sentences.push(`В ответе: ${(ast.columns as unknown[]).map(colLabel).join(', ')}.`)
  }
  if (Array.isArray(ast.orderby)) {
    sentences.push('Сортирую результат.')
  }
  if (ast.limit) sentences.push(`Оставляю не больше ${limitText(ast.limit)} строк.`)
  return sentences.join(' ')
}

function outlineOf(ast: Ast): string[] {
  const lines = [`Тип оператора: ${String(ast.type ?? 'неизвестно')}.`]
  if (ast.set_op) lines.push(`Есть операция над множествами: ${String(ast.set_op)}.`)
  return lines
}

function hasNestedSelect(node: unknown, root = false): boolean {
  if (!node || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some((item) => hasNestedSelect(item))
  const record = node as Ast
  if (record.type === 'select' && !root) return true
  return Object.values(record).some((value) => hasNestedSelect(value))
}

function hasWindow(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some((item) => hasWindow(item))
  const record = node as Ast
  if (record.over) return true
  return Object.values(record).some((value) => hasWindow(value))
}

export function exprText(expr: unknown): string {
  if (!expr || typeof expr !== 'object') return ''
  const node = expr as Ast
  switch (node.type) {
    case 'column_ref': {
      const column = typeof node.column === 'string' ? node.column : '*'
      return node.table ? `${String(node.table)}.${column}` : column
    }
    case 'single_quote_string':
    case 'double_quote_string':
      return `'${String(node.value)}'`
    case 'number':
      return String(node.value)
    case 'null':
      return 'NULL'
    case 'star':
      return '*'
    case 'bool':
    case 'boolean':
      return String(node.value)
    case 'binary_expr':
      return `${exprText(node.left)} ${String(node.operator)} ${exprText(node.right)}`
    case 'unary_expr':
      return `${String(node.operator)} ${exprText(node.expr)}`
    case 'aggr_func':
      return `${String(node.name)}(${exprText((node.args as Ast | undefined)?.expr)})`
    case 'function': {
      const nameNode = node.name as Ast | undefined
      const parts = nameNode?.name
      const name = Array.isArray(parts) ? String((parts[0] as Ast | undefined)?.value ?? 'fn') : 'fn'
      const args = (node.args as Ast | undefined)?.value
      const text = Array.isArray(args) ? args.map(exprText).join(', ') : ''
      return `${name}(${text})`
    }
    case 'expr_list': {
      const values = Array.isArray(node.value) ? node.value : []
      return `(${values.map(exprText).join(', ')})`
    }
    default:
      return ''
  }
}

function colLabel(col: unknown): string {
  if (!col || typeof col !== 'object') return '*'
  const node = col as Ast
  const text = exprText(node.expr ?? node)
  const alias = typeof node.as === 'string' ? node.as : (node.as as Ast | null)?.value
  return alias ? `${text} как ${String(alias)}` : text
}
