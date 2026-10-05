---
kind: exercise
id: filter-price
title: Цена в диапазоне
seed: shop
columns: [title, price]
orderMatters: false
level: 1
starter: |
  SELECT title, price
  FROM products
solution: |
  SELECT title, price
  FROM products
  WHERE price BETWEEN 300 AND 800
hints:
  - Границы включены в ответ.
  - BETWEEN нижняя AND верхняя — то же самое, что price >= 300 AND price <= 800.
  - SELECT title, price FROM products WHERE price BETWEEN 300 AND 800
---

## Теория

`BETWEEN a AND b` включает обе границы. Это то же самое, что «больше либо равно a и меньше либо равно b».

## Задание

Товары с ценой от 300 до 800 включительно. Столбцы: title, price.

## Разбор

180 и 890 снаружи диапазона. 300 и 800, если бы такие цены были, вошли бы.
