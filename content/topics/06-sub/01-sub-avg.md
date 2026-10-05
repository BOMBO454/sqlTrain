---
kind: exercise
id: sub-avg
title: Дороже среднего
seed: shop
columns: [sku, title, price]
orderMatters: false
level: 2
starter: |
  SELECT sku, title, price
  FROM products
solution: |
  SELECT sku, title, price
  FROM products
  WHERE price > (SELECT AVG(price) FROM products)
hints:
  - В WHERE можно сравнить столбец с одним числом из другого SELECT.
  - Среднее по всем товарам считает AVG(price).
  - SELECT sku, title, price FROM products WHERE price > (SELECT AVG(price) FROM products)
---

## Теория

Подзапрос в скобках без связи со внешней строкой считается один раз. `AVG` возвращает одно число, и `WHERE` сравнивает с ним цену каждой строки.

## Задание

Товары, которые дороже средней цены по всему справочнику. Столбцы: sku, title, price.

## Разбор

Внутренний SELECT не смотрит на текущую строку. Он один раз считает среднее, внешний оставляет только цены строго выше.
