---
kind: exercise
id: sub-none
title: Без единого заказа
seed: shop
columns: [name]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT name
  FROM customers c
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
  )
hints:
  - Нужны те, для кого заказ не находится.
  - "NOT EXISTS, а не NOT IN: пустое значение во внутреннем списке ломает NOT IN."
  - SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
dialectNote: В PostgreSQL NOT IN точно так же молчит, если в подзапросе есть NULL. NOT EXISTS ведёт себя одинаково.
---

## Теория

`NOT EXISTS` истинен, когда связанный подзапрос пуст. `NOT IN` при любом `NULL` внутри списка не отбирает никого: сравнение с неизвестным само неизвестно.

## Задание

Имена клиентов, у которых нет ни одного заказа, в любом статусе. Один столбец: name.

## Разбор

Подзапрос ищет любую строку orders с этим customer_id. Если поиск пуст, имя попадает в ответ.
