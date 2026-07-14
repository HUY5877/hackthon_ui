function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderInline(value) {
  return value
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function renderSafeMarkdown(markdown) {
  if (!markdown) return ''
  const escaped = escapeHtml(markdown).replace(/\r\n/g, '\n')
  const blocks = escaped.split(/\n{2,}/)

  return blocks.map((block) => {
    const value = block.trim()
    if (!value) return ''
    if (value.startsWith('### ')) return `<h3>${renderInline(value.slice(4))}</h3>`
    if (value.startsWith('## ')) return `<h2>${renderInline(value.slice(3))}</h2>`
    if (value.startsWith('# ')) return `<h1>${renderInline(value.slice(2))}</h1>`
    if (value.startsWith('> ')) return `<blockquote>${renderInline(value.slice(2).replaceAll('\n', '<br>'))}</blockquote>`

    const lines = value.split('\n')
    if (lines.every(line => /^[-*] /.test(line))) {
      return `<ul>${lines.map(line => `<li>${renderInline(line.slice(2))}</li>`).join('')}</ul>`
    }
    if (lines.every(line => /^\d+\. /.test(line))) {
      return `<ol>${lines.map(line => `<li>${renderInline(line.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`
    }

    return `<p>${renderInline(value).replaceAll('\n', '<br>')}</p>`
  }).join('')
}
