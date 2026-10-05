---
kind: exercise
id: sub-own
title: Крупнее своих
seed: shop
columns: [id]
orderMatters: false
level: 3
starter: |
  SELECT id
  FROM orders
solution: |
  SELECT o.id
  FROM orders o
  JOIN order_items i ON i.order_id = o.id
  GROUP BY o.id
  HAVING SUM(i.qty * i.price) > (
    SELECT AVG(total) FROM (
      SELECT SUM(i2.qty * i2.price) AS total
      FROM orders o2
      JOIN order_items i2 ON i2.order_id = o2.id
      WHERE o2.customer_id = o.customer_id
      GROUP BY o2.id
    )
  )
hints:
  - Сумма заказа — это SUM по его позициям.
  - Сравнивать нужно со средней суммой заказов того же клиента. Подзапрос связан через customer_id.
  - В HAVING сумма текущего заказа больше AVG сумм заказов, где o2.customer_id = o.customer_id.
---

## Теория

Связанный подзапрос ссылается на внешнюю строку. Для каждого заказа он заново считает среднюю сумму заказов именно этого клиента.

## Задание

Номера заказов, чья сумма больше средней суммы заказов того же клиента. Сумма заказа — количество на цену по всем его позициям. Один столбец: id. Заказ из одной позиции сам себе средний и в ответ не входит.

## Разбор

Внешняя группировка даёт сумму текущего заказа. Внутренняя собирает суммы всех заказов того же customer_id. Строгое сравнение отбрасывает единственный заказ клиента.
