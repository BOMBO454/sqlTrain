---
kind: exercise
id: win-tree
title: Все подчинённые
seed: staff
columns: [name]
orderMatters: true
level: 3
starter: |
  SELECT name, manager_id
  FROM employees
solution: |
  WITH RECURSIVE tree AS (
    SELECT id, name, manager_id
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id
    FROM employees e
    JOIN tree t ON e.manager_id = t.id
  )
  SELECT name
  FROM tree
  WHERE manager_id IS NOT NULL
  ORDER BY name
hints:
  - Цепочка «руководитель — подчинённый» обходится рекурсивным WITH.
  - Якорь — сотрудники без руководителя. Шаг — те, чей manager_id указывает на уже найденных.
  - В ответ не входят сами корни. ORDER BY name.
dialectNote: В PostgreSQL пишут WITH RECURSIVE так же. Глубину на всякий случай ограничивают, если в данных возможен цикл.
---

## Теория

Рекурсивный `WITH` состоит из якоря и шага через `UNION ALL`. Шаг присоединяет сотрудников, чей руководитель уже попал в дерево. Так находятся и те, кто подчиняется руководителю через промежуточное звено.

## Задание

Имена всех, кто кому-то подчиняется прямо или через цепочку руководителей. Сами сотрудники без руководителя в ответ не входят. Один столбец: name. Порядок по имени.

## Разбор

Якорь берёт корни, шаг спускается по manager_id. Фильтр manager_id IS NOT NULL убирает корни, но оставляет всех, кого шаг добавил ниже.
