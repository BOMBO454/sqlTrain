---
kind: exercise
id: set-places
title: Все города
seed: shop
columns: [city]
orderMatters: true
level: 2
starter: |
  SELECT city
  FROM customers
solution: |
  SELECT city FROM customers WHERE city IS NOT NULL
  UNION
  SELECT city FROM places
  ORDER BY city
hints:
  - "Города лежат в двух таблицах: customers и places."
  - Пустой город клиента в список не входит. Повторы убирает UNION.
  - SELECT city FROM customers WHERE city IS NOT NULL UNION SELECT city FROM places ORDER BY city
---

## Теория

Две таблицы можно сложить, даже если они про разное, лишь бы столбцы совпали. `UNION` убирает город, который есть и у клиента, и в справочнике.

## Задание

Один список городов: непустые города клиентов и все города из places. Повторы не нужны. Один столбец: city. Порядок по названию.

## Разбор

Фильтр IS NOT NULL не пускает пустую ячейку. UNION добавляет города справочника, которых нет у клиентов, и схлопывает общие.
