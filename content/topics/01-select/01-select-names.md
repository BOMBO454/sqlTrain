---
kind: exercise
id: select-names
title: Только имена
seed: shop
columns: [name]
orderMatters: false
level: 1
starter: |
  SELECT *
  FROM customers
solution: |
  SELECT name
  FROM customers
hints:
  - Список после SELECT — это не «всё подряд», а ровно те поля, которые просят.
  - "Имя столбца в customers так и называется: name."
  - SELECT name FROM customers
---

## Теория

Список сразу после `SELECT` — это столбцы **ответа**, а не «вся таблица». Звёздочка означает все столбцы источника и почти никогда не является тем, что просят в задании.

## Задание

Покажите имена всех клиентов. Один столбец: name. Звёздочка здесь лишняя — в ответе не должно быть почты и города.

## Разбор

SELECT перечисляет столбцы результата. customers остаётся как была, в ответ попадает только name каждой строки.
