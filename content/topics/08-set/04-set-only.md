---
kind: exercise
id: set-only
title: Чай без кофе
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
  EXCEPT
  SELECT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'кофе'
  ORDER BY name
hints:
  - Из списка покупателей чая надо вычесть покупателей кофе.
  - Оператор EXCEPT. Оба списка по оплаченным заказам.
  - ORDER BY name один, после обоих запросов.
dialectNote: В Oracle ту же разность называют MINUS. В PostgreSQL есть и EXCEPT ALL, он сохраняет лишние копии. Здесь нужен обычный EXCEPT.
---

## Теория

`EXCEPT` вычитает второй результат из первого. Порядок половин важен: чай EXCEPT кофе — это не то же самое, что кофе EXCEPT чай.

## Задание

Имена клиентов, которые оплатили чай и не оплачивали кофе. Отменённый кофе здесь не считается покупкой кофе. Один столбец: name. Порядок по имени.

## Разбор

Обе половины смотрят только status = paid. Человек с оплаченным чаем и отменённым кофе остаётся: во второй список он не попал.
