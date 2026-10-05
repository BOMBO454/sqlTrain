---
kind: exercise
id: expr-line
title: Сумма строки
seed: shop
columns: [order_id, sku, line_total]
orderMatters: false
level: 2
starter: |
  SELECT order_id, sku
  FROM order_items
solution: |
  SELECT order_id, sku, qty * price AS line_total
  FROM order_items
hints:
  - В списке SELECT можно умножить два столбца.
  - "Имя столбца ответа: line_total."
  - SELECT order_id, sku, qty * price AS line_total FROM order_items
---

## Теория

Цена в позиции и количество живут рядом, а суммы в таблице нет. Её собирают в ответе: `qty * price`.

## Задание

Для каждой позиции заказа покажите номер заказа, артикул и сумму строки. Столбцы: order_id, sku, line_total. Сумма строки — количество, умноженное на цену позиции.

## Разбор

order_items уже хранит цену на момент покупки. Умножение не меняет таблицу, оно только заполняет столбец ответа.
