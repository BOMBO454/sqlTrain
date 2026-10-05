---
kind: exercise
id: filter-category
title: Чай и кофе
seed: shop
columns: [title, category]
orderMatters: false
level: 1
starter: |
  SELECT title, category
  FROM products
solution: |
  SELECT title, category
  FROM products
  WHERE category IN ('чай', 'кофе')
hints:
  - Перечисление через OR работает, IN короче и про него задание.
  - "IN принимает список в скобках: category IN ('чай', 'кофе')."
  - SELECT title, category FROM products WHERE category IN ('чай', 'кофе')
---

## Теория

`IN` — короткое «равно любому из списка». Список пишут в скобках. То же самое можно развернуть в цепочку `OR`, но список читается легче.

## Задание

Товары категорий чай и кофе. Столбцы: title, category.

## Разбор

IN — это сравнение с любым значением из списка. Снеки и напитки в список не входят.
