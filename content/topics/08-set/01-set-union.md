---
kind: exercise
id: set-union
title: Чай или кофе
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
  UNION
  SELECT c.name
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_items i ON i.order_id = o.id
  JOIN products p ON p.sku = i.sku
  WHERE p.category = 'кофе'
  ORDER BY name
hints:
  - Это два одинаковых запроса с разной категорией, соединённые UNION.
  - UNION сам убирает человека, который купил и то и другое.
  - В конце один ORDER BY name.
---

## Теория

`UNION` сравнивает строки целиком. Если имя получилось в обоих запросах, в ответе оно одно. Сортировка относится ко всему результату, не к каждой половине.

## Задание

Имена клиентов, которые оплатили чай или кофе. Кто оплатил оба, должен встретиться один раз. Один столбец: name. Порядок по имени.

## Разбор

Две половины ищут оплаченные покупки разных категорий. UNION схлопывает повтор Анны, если она в обеих.
