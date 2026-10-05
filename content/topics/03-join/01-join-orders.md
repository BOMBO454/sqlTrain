---
kind: exercise
id: join-orders
title: Заказ и клиент
seed: shop
columns: [order_id, name, status]
orderMatters: false
level: 2
starter: |
  SELECT orders.id, customers.name, orders.status
  FROM orders
solution: |
  SELECT o.id AS order_id, c.name, o.status
  FROM orders o
  INNER JOIN customers c ON c.id = o.customer_id
hints:
  - "Имя лежит в другой таблице. Связка: orders.customer_id = customers.id."
  - "Псевдонимы короче: FROM orders o INNER JOIN customers c ON c.id = o.customer_id."
  - SELECT o.id AS order_id, c.name, o.status FROM orders o INNER JOIN customers c ON c.id = o.customer_id
---

## Теория

Если нужное поле лежит в другой таблице, строки связывают по ключу. `orders.customer_id` указывает на `customers.id`. Псевдоним после имени таблицы сокращает запись.

## Задание

К каждому заказу подпишите имя клиента. Столбцы: order_id (это orders.id), name, status. Заказы без клиента в данных не встречаются, хватит внутреннего соединения.

## Разбор

INNER JOIN оставляет только пары, где условие ON истинно. Каждый заказ находит ровно одного клиента.
