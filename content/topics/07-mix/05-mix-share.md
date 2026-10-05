---
kind: exercise
id: mix-share
title: Доля категории
seed: shop
columns: [category, share]
orderMatters: false
level: 3
starter: |
  SELECT category
  FROM products
solution: |
  SELECT p.category,
         ROUND(100.0 * SUM(i.qty * i.price) / (
           SELECT SUM(i2.qty * i2.price)
           FROM order_items i2
           JOIN orders o2 ON o2.id = i2.order_id AND o2.status = 'paid'
         ), 1) AS share
  FROM order_items i
  JOIN orders o ON o.id = i.order_id AND o.status = 'paid'
  JOIN products p ON p.sku = i.sku
  GROUP BY p.category
hints:
  - Доля — это выручка категории, делённая на выручку всех оплаченных заказов.
  - 100.0 даёт дробное деление. ROUND(..., 1) оставляет один знак. Столбец share.
  - В знаменателе отдельный SUM по тем же оплаченным позициям, без группировки.
---

## Теория

Деление двух целых в SQLite отбрасывает дробную часть. `100.0` делает делимое дробным, `ROUND` оставляет один знак. Знаменатель — подзапрос без `GROUP BY`, одна общая сумма.

## Задание

Для каждой категории посчитайте её долю в оплаченной выручке, в процентах, один знак после запятой. Выручка позиции — количество на цену. Столбцы: category, share.

## Разбор

Числитель разный у каждой группы, знаменатель один на весь запрос. ROUND выравнивает ответ, чтобы 33.333 не расходился из-за хвоста.
