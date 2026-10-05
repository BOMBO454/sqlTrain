---
kind: exercise
id: agg-status
title: Заказы по статусам
seed: shop
columns: [status, orders]
orderMatters: false
level: 2
starter: |
  SELECT status
  FROM orders
solution: |
  SELECT status, COUNT(*) AS orders
  FROM orders
  GROUP BY status
hints:
  - Одно число на группу, не на всю таблицу.
  - В SELECT можно оставить status только вместе с GROUP BY status.
  - SELECT status, COUNT(*) AS orders FROM orders GROUP BY status
---

## Теория

Обычный столбец в `SELECT` рядом с агрегатом должен стоять в `GROUP BY`. Иначе база не знает, какой `status` показать для числа.

## Задание

Сколько заказов в каждом status. Столбцы: status, orders.

## Разбор

GROUP BY status режет заказы на paid, new и cancelled. COUNT считает внутри каждой кучки.
