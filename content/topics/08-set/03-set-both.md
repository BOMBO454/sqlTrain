---
kind: exercise
id: set-both
title: И чай, и кофе
seed: shop
columns: [name]
orderMatters: true
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'чай'
  INTERSECT
  SELECT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'кофе'
  ORDER BY name
hints:
  - Нужны имена, которые есть в обоих списках.
  - Это INTERSECT между покупателями чая и покупателями кофе.
  - Оба списка — только оплаченные заказы. В конце ORDER BY name.
---

## Теория

`INTERSECT` оставляет строку, только если она целиком нашлась во втором запросе. Это и есть «и то, и другое» без вложенного `EXISTS`.

## Задание

Имена клиентов, которые оплатили и чай, и кофе. Один столбец: name. Порядок по имени.

## Разбор

Первая половина — оплаченный чай, вторая — оплаченный кофе. Пересечение гасит тех, кто есть только в одном списке.
