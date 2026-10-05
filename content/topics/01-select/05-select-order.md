---
kind: exercise
id: select-order
title: По алфавиту
seed: shop
columns: [name, city]
orderMatters: true
level: 1
starter: |
  SELECT name, city
  FROM customers
solution: |
  SELECT name, city
  FROM customers
  ORDER BY name
hints:
  - Порядок хранения в таблице заданию не подходит.
  - ORDER BY ставится после FROM. По умолчанию направление — по возрастанию.
  - SELECT name, city FROM customers ORDER BY name
---

## Теория

Сортировка — часть запроса, если порядок важен для читателя. `ORDER BY` ставится после `FROM`. Без слова `DESC` порядок по возрастанию.

## Задание

Список клиентов: name и city, по имени от А к Я. Порядок строк важен.

## Разбор

Без ORDER BY база может отдать строки в любом устойчивом для неё порядке. Для «от А к Я» сортировка — часть ответа, не украшение.
