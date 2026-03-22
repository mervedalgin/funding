import { describe, it, expect } from 'vitest'
import { isValidHttpsUrl, isSecureImageUrl, sanitizeText } from '../validation'

describe('isValidHttpsUrl', () => {
  it('accepts valid https URLs', () => {
    expect(isValidHttpsUrl('https://example.com')).toBe(true)
    expect(isValidHttpsUrl('https://example.com/path?q=1')).toBe(true)
    expect(isValidHttpsUrl('https://sub.domain.com:8443/api')).toBe(true)
  })

  it('rejects http URLs', () => {
    expect(isValidHttpsUrl('http://example.com')).toBe(false)
  })

  it('rejects javascript: URLs', () => {
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(isValidHttpsUrl('data:text/html,<h1>Hi</h1>')).toBe(false)
  })

  it('rejects blob: URLs', () => {
    expect(isValidHttpsUrl('blob:https://example.com/uuid')).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(isValidHttpsUrl('not-a-url')).toBe(false)
    expect(isValidHttpsUrl('')).toBe(false)
    expect(isValidHttpsUrl('://missing-scheme')).toBe(false)
  })
})

describe('isSecureImageUrl', () => {
  it('accepts null (no image)', () => {
    expect(isSecureImageUrl(null)).toBe(true)
  })

  it('accepts empty string', () => {
    expect(isSecureImageUrl('')).toBe(true)
  })

  it('accepts https URLs', () => {
    expect(isSecureImageUrl('https://example.com/image.jpg')).toBe(true)
  })

  it('rejects http URLs', () => {
    expect(isSecureImageUrl('http://example.com/image.jpg')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(isSecureImageUrl('data:image/png;base64,abc')).toBe(false)
  })

  it('rejects relative paths', () => {
    expect(isSecureImageUrl('/images/photo.jpg')).toBe(false)
    expect(isSecureImageUrl('../photo.jpg')).toBe(false)
  })
})

describe('sanitizeText', () => {
  it('strips script tags and their content', () => {
    expect(sanitizeText('Hello<script>alert(1)</script>World')).toBe('HelloWorld')
  })

  it('strips script tags case-insensitively', () => {
    expect(sanitizeText('<SCRIPT>bad</SCRIPT>clean')).toBe('clean')
  })

  it('strips HTML tags', () => {
    expect(sanitizeText('<p>Hello</p> <b>World</b>')).toBe('Hello World')
  })

  it('normalizes whitespace', () => {
    expect(sanitizeText('  hello   world  ')).toBe('hello world')
  })

  it('handles multiline script blocks', () => {
    const input = 'before<script>\nconsole.log("evil")\n</script>after'
    expect(sanitizeText(input)).toBe('beforeafter')
  })

  it('returns empty string for tag-only input', () => {
    expect(sanitizeText('<div><span></span></div>')).toBe('')
  })

  it('preserves plain text', () => {
    expect(sanitizeText('Normal text without tags')).toBe('Normal text without tags')
  })
})
