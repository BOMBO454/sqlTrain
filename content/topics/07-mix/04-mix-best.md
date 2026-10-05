---
kind: exercise
id: mix-best
title: Лидер продаж
seed: shop
columns: [sku, title, qty]
orderMatters: false
level: 3
starter: |
  SELECT sku, title
  FROM products
solution: |
  SELECT p.sku, p.title, SUM(i.qty) AS qty
  FROM order_items i
  JOIN orders o ON o.id = i.order_id AND o.status = 'paid'
  JOIN products p ON p.sku = i.sku
  GROUP BY p.sku, p.title
  ORDER BY qty DESC, p.sku
  LIMIT 1
hints:
  - Складывать нужно количество из оплаченных заказов, не число строк.
  - При равенстве количества берётся артикул раньше по алфавиту.
  - ORDER BY qty DESC, sku и LIMIT 1.
---

## Теория

`LIMIT` без однозначной сортировки берёт любую строку среди лидеров. Второй ключ, артикул, делает выбор устойчивым: при равном количестве побеждает меньший sku.

## Задание

Товар, которого в оплаченных заказах продано больше всего штук. При равенстве берите артикул, который раньше по алфавиту. Столбцы: sku, title, qty.

## Разбор

Группировка считает сумму qty только по оплаченным заказам. Сортировка ставит максимум наверх, LIMIT оставляет одну строку, алфавит артикула разбирает ничью.
