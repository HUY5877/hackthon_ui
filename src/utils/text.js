export function compactText(value, maxLength, fallback = '') {
  const text = String(value || fallback).trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}
