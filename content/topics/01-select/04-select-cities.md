---
kind: exercise
id: select-cities
title: Разные города
seed: shop
columns: [city]
orderMatters: false
level: 1
starter: |
  SELECT city
  FROM customers
solution: |
  SELECT DISTINCT city
  FROM customers
hints:
  - Одинаковые города сейчас повторяются по разу на клиента.
  - DISTINCT ставится сразу после SELECT и схлопывает одинаковые строки результата.
  - SELECT DISTINCT city FROM customers
---

## Теория

`DISTINCT` схлопывает одинаковые строки результата в одну. Пустое значение тоже участвует: один `NULL` остаётся одной строкой.

## Задание

Выведите различные значения city из customers. Пустой город тоже значение: его не выбрасывайте. Столбец: city.

## Разбор

У нескольких клиентов один город, поэтому без DISTINCT Казань встретится трижды. NULL у Егора остаётся одной строкой: пустое — тоже значение.
