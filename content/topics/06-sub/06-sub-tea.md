---
kind: exercise
id: sub-tea
title: Чай без кофе
seed: shop
columns: [name]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT DISTINCT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'чай'
    AND NOT EXISTS (
      SELECT 1
      FROM orders o2
      JOIN order_items i2 ON i2.order_id = o2.id
      JOIN products p2 ON p2.sku = i2.sku
      WHERE o2.customer_id = c.id AND p2.category = 'кофе'
    )
hints:
  - Сначала оплаченный чай, потом отсутствие кофе у того же клиента.
  - Кофе в любом статусе заказа тоже считается. NOT EXISTS по категории кофе.
  - JOIN до товаров категории чай и NOT EXISTS с p2.category = кофе по тому же customer_id.
---

## Теория

Один и тот же клиент проверяется дважды: внешний запрос требует удачную покупку, внутренний — что другой покупки нет. Отменённый кофе тоже находится, если не фильтровать статус внутри `NOT EXISTS`.

## Задание

Имена клиентов, которые оплатили хотя бы один чай и ни в одном заказе, даже отменённом или новом, не брали кофе. Один столбец: name. Повторов имён быть не должно.

## Разбор

Оплаченный чай находится соединением. NOT EXISTS смотрит все заказы клиента без фильтра статуса, поэтому отменённый кофе тоже исключает человека.
