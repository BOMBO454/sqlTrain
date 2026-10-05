---
kind: exercise
id: sub-paid
title: Кто уже платил
seed: shop
columns: [name]
orderMatters: false
level: 2
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT name
  FROM customers c
  WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.status = 'paid'
  )
hints:
  - Нужны клиенты, у которых найдётся хотя бы один оплаченный заказ.
  - EXISTS истинен, если внутренний запрос вернул строку. Связь — customer_id.
  - SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')
---

## Теория

`EXISTS` не переносит столбцы внутреннего запроса в ответ. Ему важно лишь, есть ли строка. Связь с внешней строкой пишут в `WHERE` подзапроса.

## Задание

Имена клиентов, у которых есть хотя бы один оплаченный заказ. Один столбец: name.

## Разбор

Для каждого клиента внутренний запрос ищет paid-заказ с его id. Анна подходит, Егор — нет: у него заказов нет вообще.
