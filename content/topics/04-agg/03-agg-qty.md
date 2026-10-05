---
kind: exercise
id: agg-qty
title: Сколько штук продали
seed: shop
columns: [title, qty]
orderMatters: false
level: 3
starter: |
  SELECT title
  FROM products
solution: |
  SELECT p.title, SUM(i.qty) AS qty
  FROM order_items i
  INNER JOIN products p ON p.sku = i.sku
  GROUP BY p.title
hints:
  - Сначала соедините позицию с товаром, потом группируйте.
  - SUM(i.qty), группа — p.title. Названия в витрине уникальны.
  - SELECT p.title, SUM(i.qty) AS qty FROM order_items i INNER JOIN products p ON p.sku = i.sku GROUP BY p.title
---

## Теория

Сначала соединение собирает строки, потом `GROUP BY` делит их на кучки, и только затем `SUM` складывает значения внутри кучки.

## Задание

По каждому товару сумма qty по всем позициям. Столбцы: title, qty. Название берите из products, количество суммируйте из order_items.

## Разбор

Ассам встречается в двух заказах, поэтому сумма больше одной позиции. Товар без единой позиции в этот ответ не попадёт: мы стартуем от order_items.
