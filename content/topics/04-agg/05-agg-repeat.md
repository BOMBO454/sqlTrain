---
kind: exercise
id: agg-repeat
title: Больше одного заказа
seed: shop
columns: [name, orders]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT c.name, COUNT(*) AS orders
  FROM customers c
  INNER JOIN orders o ON o.customer_id = c.id
  GROUP BY c.name
  HAVING COUNT(*) > 1
hints:
  - Сначала посчитайте заказы на клиента, потом отбросьте группы с одним заказом.
  - WHERE фильтрует строки до группировки и не умеет условие на COUNT. Для групп есть HAVING.
  - SELECT c.name, COUNT(*) AS orders FROM customers c INNER JOIN orders o ON o.customer_id = c.id GROUP BY c.name HAVING COUNT(*) > 1
---

## Теория

Порог «больше одного» — это свойство уже посчитанной группы. Его место в `HAVING`. `WHERE` к этому моменту уже отработал и `COUNT` ещё не видит.

## Задание

Клиенты, у которых заказов больше одного. Столбцы: name, orders. Клиентов без заказов не показывайте.

## Разбор

Анна и Вера проходят порог. INNER JOIN заранее убирает Егора без заказов, HAVING убирает тех, у кого заказ ровно один.
