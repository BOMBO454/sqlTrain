import { describe, expect, it } from 'vitest'
import { markdownSections, parseFrontmatter } from './frontmatter.ts'

describe('parseFrontmatter', () => {
  it('читает блоки, список и кавычки', () => {
    const parsed = parseFrontmatter(`---
kind: exercise
id: sample
title: "Двоеточие: да"
orderMatters: false
level: 2
columns: [name, city]
starter: |
  SELECT name
  FROM customers
hints:
  - "Поле: name"
  - Вторая
  - Третья
---

## Теория

Абзац

## Задание

Сделайте выборку.
`)
    expect(parsed.data.kind).toBe('exercise')
    expect(parsed.data.title).toBe('Двоеточие: да')
    expect(parsed.data.orderMatters).toBe(false)
    expect(parsed.data.level).toBe(2)
    expect(parsed.data.columns).toEqual(['name', 'city'])
    expect(parsed.data.starter).toBe('SELECT name\nFROM customers')
    expect(parsed.data.hints).toEqual(['Поле: name', 'Вторая', 'Третья'])
    expect(markdownSections(parsed.body)['Задание']).toBe('Сделайте выборку.')
    expect(markdownSections(parsed.body)['Теория']).toBe('Абзац')
  })

  it('отказывается от файла без шапки', () => {
    expect(() => parseFrontmatter('просто текст')).toThrow(/шапка/)
  })
})
