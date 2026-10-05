---
kind: exercise
id: mix-repeat
title: Постоянные покупатели
seed: shop
columns: [name, orders_count, revenue]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT c.name,
         COUNT(DISTINCT o.id) AS orders_count,
         SUM(i.qty * i.price) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  GROUP BY c.id, c.name
  HAVING COUNT(DISTINCT o.id) >= 2 AND SUM(i.qty * i.price) >= 1500
hints:
  - "Два условия на группу: число заказов и сумма. Место им в HAVING."
  - Позиции умножают заказ, поэтому заказы считайте через COUNT(DISTINCT o.id).
  - "Порог: не меньше двух оплаченных заказов и выручка не меньше 1500."
---

## Теория

После соединения у заказа несколько строк, по числу позиций. `COUNT(*)` посчитал бы позиции. `COUNT(DISTINCT o.id)` считает заказы. Оба порога — свойства группы, их пишут в `HAVING`.

## Задание

Клиенты с двумя и более оплаченными заказами и выручкой не меньше 1500. Выручка — сумма количества на цену по позициям этих заказов. Столбцы: name, orders_count, revenue.

## Разбор

WHERE оставляет только оплаченные строки. HAVING проверяет уже свёрнутую группу. DISTINCT нужен, потому что соединение с позициями повторяет номер заказа.
