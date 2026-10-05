---
kind: exercise
id: set-all
title: С повторами
seed: shop
columns: [name]
orderMatters: true
level: 2
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
  UNION ALL
  SELECT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'кофе'
  ORDER BY name
hints:
  - Тот же состав, но повторы нужно сохранить.
  - Для этого UNION ALL, не UNION.
  - ORDER BY name в самом конце.
---

## Теория

`UNION ALL` не тратит время на поиск дублей и не прячет их. Если человек купил обе категории, его имя стоит в ответе дважды. Это другой результат, чем у `UNION`.

## Задание

Те же оплатившие чай или кофе, но кто оплатил обе категории, должен быть в списке дважды. Один столбец: name. Порядок по имени.

## Разбор

Запросы те же. ALL оставляет оба вхождения, сортировка ставит одинаковые имена рядом.
