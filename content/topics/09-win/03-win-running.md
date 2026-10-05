---
kind: exercise
id: win-running
title: Нарастающая выручка
seed: shop
columns: [order_id, created_at, running]
orderMatters: true
level: 3
starter: |
  SELECT id, created_at
  FROM orders
solution: |
  WITH paid AS (
    SELECT o.id AS order_id, o.created_at, SUM(i.qty * i.price) AS revenue
    FROM orders o
    JOIN order_items i ON i.order_id = o.id
    WHERE o.status = 'paid'
    GROUP BY o.id
  )
  SELECT order_id,
         created_at,
         SUM(revenue) OVER (ORDER BY created_at, order_id) AS running
  FROM paid
  ORDER BY created_at, order_id
hints:
  - Сначала сверните каждый оплаченный заказ в одну сумму.
  - Потом SUM(revenue) OVER (ORDER BY дата, номер) копится от первого заказа к текущему.
  - Неоплаченные заказы в WITH не входят.
---

## Теория

Обычный `SUM` с `GROUP BY` схлопнул бы все заказы в одно число. `SUM(...) OVER (ORDER BY ...)` оставляет строку заказа и подставляет сумму от начала окна до этой строки включительно.

## Задание

По оплаченным заказам покажите номер, дату и нарастающую выручку: сумма этого заказа и всех оплаченных заказов раньше него. В один день более ранним считайте меньший номер. Выручка заказа — сумма количества на цену его позиций. Столбцы: order_id, created_at, running. Порядок — по дате и номеру.

## Разбор

WITH готовит одну строку на заказ, иначе окно увидело бы позиции. ORDER BY в OVER задаёт, что именно считается «раньше».
