---
kind: exercise
id: set-names
title: Люди и отделы
seed: staff
columns: [name]
orderMatters: true
level: 3
starter: |
  SELECT name
  FROM employees
solution: |
  SELECT name FROM employees
  UNION
  SELECT name FROM departments
  ORDER BY name
hints:
  - "Во втором запросе столбец тоже должен называться совместимо: один текстовый столбец."
  - Названия отделов лежат в departments.name.
  - SELECT name FROM employees UNION SELECT name FROM departments ORDER BY name
---

## Теория

Множества не требуют общего ключа. Им всё равно, что в одной половине люди, а в другой отделы, если наружу смотрит один и тот же по форме столбец.

## Задание

Общий список без повторов: имена сотрудников и названия отделов. Один столбец: name. Порядок по тексту.

## Разбор

Обе выборки отдают один текстовый столбец. UNION ставит их в одну колонку и убирает случайные совпадения.
