---
kind: exercise
id: agg-avg
title: Средняя цена категории
seed: shop
columns: [category, avg_price]
orderMatters: false
level: 3
starter: |
  SELECT category, price
  FROM products
solution: |
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
hints:
  - AVG считает среднее внутри группы.
  - GROUP BY category, в ответе category и AVG(price) AS avg_price.
  - SELECT category, AVG(price) AS avg_price FROM products GROUP BY category
---

## Теория

`AVG` считает среднее по группе. Если в группе одна цена, среднее совпадает с ней.

## Задание

Средняя price по каждой category. Столбцы: category, avg_price.

## Разбор

У чая две цены, среднее — их полусумма. Какао в категории один, среднее совпадает с ценой.
