type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string }

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inlineHtml(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.92em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function blocksOf(source: string): Block[] {
  const chunks = source.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  return chunks.filter((chunk) => chunk.trim()).map((chunk) => {
    const lines = chunk.split('\n').map((line) => line.trimEnd())
    const heading = /^(#{1,3})\s+(.+)$/.exec(lines[0] ?? '')
    if (lines.length === 1 && heading) {
      return { type: 'heading', level: heading[1].length, text: heading[2] }
    }
    if (lines.every((line) => /^[-*] /.test(line.trim()))) {
      return { type: 'list', items: lines.map((line) => line.trim().replace(/^[-*] /, '')) }
    }
    return { type: 'paragraph', text: lines.map((line) => line.trim()).filter(Boolean).join(' ') }
  })
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {blocksOf(text).map((block, index) => {
        if (block.type === 'heading') {
          const Tag = block.level <= 2 ? 'h2' : 'h3'
          return (
            <Tag
              key={index}
              className="font-display text-3xl leading-none font-semibold"
              dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }}
            />
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
              ))}
            </ul>
          )
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }} />
      })}
    </div>
  )
}
