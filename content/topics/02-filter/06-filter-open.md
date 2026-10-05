---
kind: exercise
id: filter-open
title: Книги на руках
seed: library
columns: [id, book_id]
orderMatters: false
level: 2
starter: |
  SELECT id, book_id, returned_on
  FROM loans
solution: |
  SELECT id, book_id
  FROM loans
  WHERE returned_on IS NULL
hints:
  - NULL проверяют отдельным оператором.
  - IS NULL, не = NULL. Сравнение с NULL само даёт NULL, и строка отфильтровывается.
  - SELECT id, book_id FROM loans WHERE returned_on IS NULL
---

## Теория

Пустое значение проверяют так: `IS NULL`. Запись `= NULL` не подходит: сравнение с неизвестным само неизвестно, и фильтр строку не пропускает.

## Задание

Выдачи, которые ещё не вернули: returned_on пустой. Столбцы: id, book_id. Пустое значение не равно пустой строке и не ловится сравнением = NULL.

## Разбор

Три выдачи без даты возврата остаются. Вернутые имеют дату и в это условие не попадают.
