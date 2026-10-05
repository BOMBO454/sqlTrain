---
kind: exercise
id: win-lag
title: Предыдущая дата
seed: shop
columns: [order_id, prev_date]
orderMatters: true
level: 3
starter: |
  SELECT id, created_at
  FROM orders
solution: |
  SELECT id AS order_id,
         LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS prev_date
  FROM orders
  ORDER BY customer_id, created_at, id
hints:
  - Предыдущее значение в окне берёт LAG.
  - Окно — заказы одного клиента по дате и id.
  - У первого заказа клиента prev_date пустой. Это нормально.
---

## Теория

`LAG` читает столбец строки, которая в окне стоит перед текущей. Если перед ней никого нет, результат пустой, а не ошибка.

## Задание

Для каждого заказа покажите его номер и дату предыдущего заказа того же клиента. Предыдущий — более ранняя дата, а в тот же день — меньший id. Столбцы: order_id, prev_date. Порядок: клиент, дата, номер.

## Разбор

PARTITION BY не даёт подсмотреть дату чужого клиента. Первый заказ группы получает NULL. Сортировка ответа совпадает с порядком окна, так проще сверять.
