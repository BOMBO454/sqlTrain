---
kind: exercise
id: win-cheap
title: Самый дешёвый
seed: shop
columns: [category, sku, title]
orderMatters: true
level: 3
starter: |
  SELECT category, sku, title, price
  FROM products
solution: |
  WITH ranked AS (
    SELECT category, sku, title,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price, sku) AS place
    FROM products
  )
  SELECT category, sku, title
  FROM ranked
  WHERE place = 1
  ORDER BY category
hints:
  - Пронумеруйте товары категории по возрастанию цены.
  - При равной цене меньший артикул получает меньший номер. Снаружи оставьте place = 1.
  - WITH ranked, затем SELECT ... WHERE place = 1 ORDER BY category.
---

## Теория

Окно нельзя положить в `WHERE` того же SELECT. Сначала его считают во внутреннем запросе или в `WITH`, и только следующий запрос фильтрует номер.

## Задание

Самый дешёвый товар каждой категории. Если цены равны, берите артикул раньше по алфавиту. Столбцы: category, sku, title. Порядок по категории.

## Разбор

ROW_NUMBER с порядком price, sku выдаёт одному товару место 1 даже при ничьей. Внешний фильтр оставляет только это место.
