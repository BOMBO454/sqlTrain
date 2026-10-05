---
kind: exercise
id: agg-expensive
title: Дорогие категории
seed: shop
columns: [category, avg_price]
orderMatters: false
level: 3
starter: |
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
solution: |
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
  HAVING AVG(price) >= 500
hints:
  - Среднее уже есть. Осталось оставить не все группы.
  - HAVING AVG(price) >= 500 стоит после GROUP BY.
  - SELECT category, AVG(price) AS avg_price FROM products GROUP BY category HAVING AVG(price) >= 500
---

## Теория

В `HAVING` можно повторить тот же агрегат, что и в списке `SELECT`. Отбрасываются целые категории, а не отдельные дорогие товары.

## Задание

Категории, где средняя цена не меньше 500. Столбцы: category, avg_price.

## Разбор

Чай и кофе проходят порог на учебной витрине. Снеки и напитки остаются за бортом, хотя отдельные товары вроде мёда дорогие: смотрим на среднее категории.
