---
kind: exercise
id: win-rank
title: Место по цене
seed: shop
columns: [category, sku, place]
orderMatters: true
level: 3
starter: |
  SELECT category, sku, price
  FROM products
solution: |
  SELECT category,
         sku,
         RANK() OVER (PARTITION BY category ORDER BY price DESC) AS place
  FROM products
  ORDER BY category, place, sku
hints:
  - Место с ничьей — это RANK, не ROW_NUMBER.
  - Внутри категории сортируйте цену по убыванию.
  - Ответ отсортируйте по категории, месту и артикулу.
---

## Теория

При равной цене `RANK` ставит обеим строкам одно место, а следующее число пропускает. `ROW_NUMBER` так не умеет: он всегда раздаёт разные номера.

## Задание

Для каждого товара — категория, артикул и место по убыванию цены внутри категории. Одинаковая цена — одно место. Столбцы: category, sku, place. Порядок ответа: категория, место, артикул.

## Разбор

Окно режется по category. PRICE DESC ставит дорогие наверх. RANK делит место между равными ценами, сортировка ответа делает проверку однозначной.
