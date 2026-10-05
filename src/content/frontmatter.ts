/** Небольшой разбор шапки урока: ключи, списки, блоки `|` и строки в кавычках. */

export function parseFrontmatter(source: string): { data: Record<string, unknown>; body: string } {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  if (!text.startsWith('---\n')) throw new Error('шапка должна начинаться со строки ---')
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) throw new Error('шапка не закрыта строкой ---')
  return {
    data: parseMap(text.slice(4, end)),
    body: text.slice(end + 5).replace(/^\n/, ''),
  }
}

export function markdownSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = body.replace(/\r\n/g, '\n').split(/^## /m)
  for (const part of parts) {
    if (!part.trim()) continue
    const breakAt = part.indexOf('\n')
    const title = (breakAt < 0 ? part : part.slice(0, breakAt)).trim()
    const text = (breakAt < 0 ? '' : part.slice(breakAt + 1)).trim()
    sections[title] = text
  }
  return sections
}

function parseMap(raw: string): Record<string, unknown> {
  const lines = raw.split('\n')
  const data: Record<string, unknown> = {}
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }
    const match = /^([A-Za-z_][\w]*):\s*(.*)$/.exec(line)
    if (!match) throw new Error(`не понял строку шапки: ${line}`)
    const key = match[1]
    const rest = match[2] ?? ''
    if (rest === '|') {
      const block: string[] = []
      index += 1
      while (index < lines.length) {
        const current = lines[index] ?? ''
        if (current === '') {
          let look = index
          while (look < lines.length && lines[look] === '') look += 1
          const next = lines[look] ?? ''
          if (!next.startsWith('  ')) break
          block.push('')
          index += 1
          continue
        }
        if (!current.startsWith('  ')) break
        block.push(current.slice(2))
        index += 1
      }
      data[key] = block.join('\n')
      continue
    }
    if (rest === '') {
      const items: unknown[] = []
      index += 1
      while (index < lines.length && /^\s+-\s+/.test(lines[index] ?? '')) {
        items.push(parseScalar((lines[index] ?? '').replace(/^\s+-\s+/, '')))
        index += 1
      }
      data[key] = items
      continue
    }
    data[key] = parseScalar(rest)
    index += 1
  }
  return data
}

function parseScalar(raw: string): unknown {
  const value = raw.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map((part) => parseScalar(part))
  }
  if (value.startsWith('"')) return JSON.parse(value) as unknown
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) return value.slice(1, -1)
  if (/^-?\d+$/.test(value)) return Number(value)
  return value
}
