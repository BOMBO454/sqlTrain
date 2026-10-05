---
kind: exercise
id: select-top
title: Три самых дорогих
seed: shop
columns: [title, price]
orderMatters: true
level: 1
starter: |
  SELECT title, price
  FROM products
solution: |
  SELECT title, price
  FROM products
  ORDER BY price DESC
  LIMIT 3
hints:
  - Сначала отсортируйте по цене, потом отрежьте хвост.
  - DESC переворачивает порядок. LIMIT 3 оставляет три первые строки уже отсортированного результата.
  - SELECT title, price FROM products ORDER BY price DESC LIMIT 3
---

## Теория

`LIMIT` отрезает хвост уже построенного результата. Сначала сортируют, потом ограничивают. `LIMIT` без `ORDER BY` берёт произвольные строки.

## Задание

Три товара с наибольшей ценой. Столбцы: title, price. Сначала более дорогие. Порядок строк важен. Цены в этой витрине не совпадают.

## Разбор

LIMIT режет уже отсортированный поток. Если поставить его без ORDER BY, «первые три» будут случайными.
