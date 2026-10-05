---
kind: exercise
id: expr-month
title: Заказы августа
seed: shop
columns: [id, created_at]
orderMatters: false
level: 2
starter: |
  SELECT id, created_at
  FROM orders
solution: |
  SELECT id, created_at
  FROM orders
  WHERE created_at >= '2024-08-01' AND created_at < '2024-09-01'
hints:
  - Даты записаны как ГГГГ-ММ-ДД, их можно сравнивать как текст.
  - Август — от 2024-08-01 включительно до 2024-09-01 не включая.
  - SELECT id, created_at FROM orders WHERE created_at >= '2024-08-01' AND created_at < '2024-09-01'
dialectNote: В PostgreSQL для этого чаще берут тип date и те же границы. Функция strftime есть в SQLite.
---

## Теория

Пока дата хранится как `ГГГГ-ММ-ДД`, обычное сравнение строк совпадает с календарём. Верхнюю границу удобно ставить на первое число следующего месяца.

## Задание

Заказы, оформленные в августе 2024. Столбцы: id, created_at. Первое августа входит, первое сентября уже нет.

## Разбор

Двойное неравенство держит весь месяц и не требует перечислять дни. Формат даты как раз для такого сравнения.
