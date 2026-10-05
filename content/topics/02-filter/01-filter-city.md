---
kind: exercise
id: filter-city
title: Клиенты из Казани
seed: shop
columns: [name, city]
orderMatters: false
level: 1
starter: |
  SELECT name, city
  FROM customers
solution: |
  SELECT name, city
  FROM customers
  WHERE city = 'Казань'
hints:
  - Лишние строки убирает WHERE, а не SELECT.
  - "Текст сравнивают с текстом в одинарных кавычках: city = 'Казань'."
  - SELECT name, city FROM customers WHERE city = 'Казань'
---

## Теория

Сравнение текста идёт с текстом в одинарных кавычках. `WHERE` стоит после `FROM` и не меняет набор столбцов.

## Задание

Имена и города клиентов, у которых city равен Казань. Столбцы: name, city.

## Разбор

WHERE проверяет каждую строку источника и оставляет те, где условие истинно.
