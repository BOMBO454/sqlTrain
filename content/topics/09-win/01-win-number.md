---
kind: exercise
id: win-number
title: Номер заказа
seed: shop
columns: [name, order_id, place]
orderMatters: true
level: 3
starter: |
  SELECT id
  FROM orders
solution: |
  SELECT c.name,
         o.id AS order_id,
         ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.created_at, o.id) AS place
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  ORDER BY c.name, place
hints:
  - Нумерация внутри клиента — ROW_NUMBER() OVER (PARTITION BY ...).
  - "Порядок внутри окна: дата, затем id. Столбцы name, order_id, place."
  - ORDER BY c.name, place уже для ответа.
dialectNote: В PostgreSQL у агрегатов в окне бывает FILTER (WHERE ...). В SQLite этого нет, условие ставят обычным WHERE до окна.
---

## Теория

`ROW_NUMBER` даёт 1, 2, 3 внутри каждой перегородки. Второй ключ в окне обязателен, если в один день у клиента два заказа: иначе номера могут разъехаться.

## Задание

Для каждого заказа покажите имя клиента, номер заказа и порядковый номер этого заказа у клиента: 1 — самый ранний. В один день более ранним считайте меньший id. Столбцы: name, order_id, place. В ответе сортируйте по имени и номеру.

## Разбор

PARTITION BY клиента начинает нумерацию заново. ORDER BY даты и id фиксирует, кто получает место 1. Сортировка ответа на окно не влияет.
