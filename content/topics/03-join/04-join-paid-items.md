---
kind: exercise
id: join-paid-items
title: Что ушло в оплаченных
seed: shop
columns: [name, title, qty]
orderMatters: false
level: 2
starter: |
  SELECT customers.name
  FROM customers
solution: |
  SELECT c.name, p.title, i.qty
  FROM customers c
  INNER JOIN orders o ON o.customer_id = c.id
  INNER JOIN order_items i ON i.order_id = o.id
  INNER JOIN products p ON p.sku = i.sku
  WHERE o.status = 'paid'
hints:
  - "Цепочка: customers → orders → order_items → products."
  - Каждый JOIN добавляет одну таблицу и одно условие ON. Статус заказа фильтруйте в WHERE.
  - FROM customers c INNER JOIN orders o ON o.customer_id = c.id INNER JOIN order_items i ON i.order_id = o.id INNER JOIN products p ON p.sku = i.sku WHERE o.status = 'paid'
---

## Теория

Несколько `JOIN` читаются слева направо: каждая новая таблица добавляет столбцы и своё условие `ON`. Фильтр по статусу заказа ставят в `WHERE`, когда пары уже собраны.

## Задание

Для оплаченных заказов (status = 'paid') покажите имя клиента, название товара и qty. Столбцы: name, title, qty. Нужны четыре таблицы: клиент, заказ, позиция, товар.

## Разбор

Каждое соединение расширяет строку. WHERE после соединений оставляет только оплаченные. Отменённый заказ Веры в ответ не входит.
