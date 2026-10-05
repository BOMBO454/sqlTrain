---
kind: exercise
id: mix-customer
title: Выручка по клиенту
seed: shop
columns: [name, revenue]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT c.name, SUM(i.qty * i.price) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  GROUP BY c.id, c.name
hints:
  - Деньги лежат в позициях, статус — в заказе, имя — у клиента.
  - Нужны только оплаченные. SUM(qty * price), столбец revenue.
  - JOIN orders со status = 'paid', затем order_items, GROUP BY клиента.
---

## Теория

Сумма появляется только после соединения: у клиента нет столбца «выручка». `JOIN` приносит позиции его оплаченных заказов, `SUM` сжимает их в одно число.

## Задание

По каждому клиенту, у которого есть оплаченные заказы, посчитайте выручку: сумма количества на цену по позициям этих заказов. Столбцы: name, revenue. Новые и отменённые заказы не входят.

## Разбор

Условие статуса стоит в ON, поэтому неоплаченные заказы не попадают в сумму. Группировка по id различает тёзок, имя остаётся в ответе.
