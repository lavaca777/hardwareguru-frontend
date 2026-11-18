import type { ReactNode } from 'react'

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[]; start: number }
  | { type: 'heading'; level: number; text: string }
  | { type: 'code'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'separator' }

const FENCE = /^```(?:[\w-]+)?\s*$/
const HEADING = /^(#{1,6})\s+(.*)$/
const QUOTE = /^\s*>\s?(.*)$/
const UNORDERED_ITEM = /^\s*[-*+•]\s+(.*)$/
const ORDERED_ITEM = /^\s*(\d+)[.)]\s+(.*)$/
const SEPARATOR = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/
const INLINE_TOKEN_SOURCE =
  '(`[^`\\n]+`|\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__|\\*[^*\\n]+\\*|_[^_\\n]+_|\\[[^\\]]+\\]\\(https?:\\/\\/[^)\\s]+\\))'

export function MarkdownText({ text }: { text: string }) {
  const blocks = parseBlocks(text)

  return (
    <div className="space-y-2 break-words text-sm text-ink">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="whitespace-pre-wrap">
                {renderInline(block.text)}
              </p>
            )
          case 'unordered-list':
            return (
              <ul key={index} className="list-disc space-y-1 pl-4 marker:text-copper">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          case 'ordered-list':
            return (
              <ol
                key={index}
                start={block.start}
                className="list-decimal space-y-1 pl-4 marker:text-copper"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            )
          case 'heading': {
            const level = Math.min(Math.max(block.level, 3), 4)
            const Heading = `h${level}` as 'h3' | 'h4'
            return (
              <Heading key={index} className="font-semibold text-ink">
                {renderInline(block.text)}
              </Heading>
            )
          }
          case 'code':
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-lg border border-line bg-black/30 p-2 text-xs"
              >
                <code className="font-mono">{block.text}</code>
              </pre>
            )
          case 'quote':
            return (
              <blockquote
                key={index}
                className="whitespace-pre-wrap border-l-2 border-copper/50 pl-3 text-muted"
              >
                {renderInline(block.text)}
              </blockquote>
            )
          case 'separator':
            return <hr key={index} className="border-line" />
        }
      })}
    </div>
  )
}

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (FENCE.test(trimmed)) {
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !FENCE.test((lines[index] ?? '').trim())) {
        codeLines.push(lines[index] ?? '')
        index += 1
      }

      index += 1
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }

    const heading = line.match(HEADING)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: (heading[1] ?? '#').length,
        text: heading[2] ?? '',
      })
      index += 1
      continue
    }

    if (SEPARATOR.test(line)) {
      blocks.push({ type: 'separator' })
      index += 1
      continue
    }

    const quote = line.match(QUOTE)
    if (quote) {
      const quoteLines: string[] = []
      let current: RegExpMatchArray | null = quote

      while (current) {
        quoteLines.push(current[1] ?? '')
        index += 1
        current = index < lines.length ? (lines[index] ?? '').match(QUOTE) : null
      }

      blocks.push({ type: 'quote', text: quoteLines.join('\n') })
      continue
    }

    const unordered = line.match(UNORDERED_ITEM)
    if (unordered) {
      const items: string[] = []

      while (index < lines.length) {
        const item = (lines[index] ?? '').match(UNORDERED_ITEM)
        if (!item) break
        items.push(item[1] ?? '')
        index += 1
      }

      blocks.push({ type: 'unordered-list', items })
      continue
    }

    const ordered = line.match(ORDERED_ITEM)
    if (ordered) {
      const items: string[] = []
      const start = Number(ordered[1] ?? 1)

      while (index < lines.length) {
        const item = (lines[index] ?? '').match(ORDERED_ITEM)
        if (!item) break
        items.push(item[2] ?? '')
        index += 1
      }

      blocks.push({ type: 'ordered-list', items, start })
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length && (lines[index] ?? '').trim()) {
      const currentLine = lines[index] ?? ''
      if (startsBlock(currentLine)) break
      paragraphLines.push(currentLine)
      index += 1
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') })
      continue
    }

    // Fallback for a line that starts a block but didn't match above.
    blocks.push({ type: 'paragraph', text: line })
    index += 1
  }

  return blocks
}

function startsBlock(line: string): boolean {
  return (
    FENCE.test(line.trim()) ||
    HEADING.test(line) ||
    SEPARATOR.test(line) ||
    QUOTE.test(line) ||
    UNORDERED_ITEM.test(line) ||
    ORDERED_ITEM.test(line)
  )
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const tokenRegex = new RegExp(INLINE_TOKEN_SOURCE, 'g')

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const key = `${match.index}-${token.length}`

    if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-black/30 px-1 py-0.5 font-mono text-[0.85em] text-copper"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInline(token.slice(2, -2))}
        </strong>,
      )
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(
        <em key={key} className="italic">
          {renderInline(token.slice(1, -1))}
        </em>,
      )
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
      if (link) {
        nodes.push(
          <a
            key={key}
            href={link[2]}
            target="_blank"
            rel="noreferrer noopener"
            className="text-copper underline decoration-copper/40 underline-offset-2 hover:decoration-copper"
          >
            {renderInline(link[1] ?? '')}
          </a>,
        )
      } else {
        nodes.push(token)
      }
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
