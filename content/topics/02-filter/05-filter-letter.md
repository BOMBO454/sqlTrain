---
kind: exercise
id: filter-letter
title: Имя на А
seed: shop
columns: [name]
orderMatters: false
level: 2
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT name
  FROM customers
  WHERE name LIKE 'А%'
hints:
  - Шаблон, не точное равенство.
  - LIKE 'А%' — А и что угодно после. Знак % ест любую длину.
  - SELECT name FROM customers WHERE name LIKE 'А%'
dialectNote: В PostgreSQL регистронезависимый поиск пишут через ILIKE. В SQLite для латиницы LIKE обычно не смотрит на регистр, для кириллицы смотрит.
---

## Теория

`LIKE` сравнивает строку с шаблоном. `%` означает «сколько угодно любых символов». Для кириллицы SQLite различает регистр.

## Задание

Клиенты, чьё name начинается на заглавную А. Столбец: name.

## Разбор

В SQLite LIKE для кириллицы учитывает регистр, поэтому шаблон с заглавной А не поймает строчную.
