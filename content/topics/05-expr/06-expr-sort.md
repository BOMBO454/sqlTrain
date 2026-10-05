---
kind: exercise
id: expr-sort
title: Свой порядок статусов
seed: shop
columns: [id, status]
orderMatters: true
level: 3
starter: |
  SELECT id, status
  FROM orders
solution: |
  SELECT id, status
  FROM orders
  ORDER BY CASE status WHEN 'paid' THEN 1 WHEN 'new' THEN 2 ELSE 3 END, id
hints:
  - ORDER BY умеет сортировать по выражению, не только по столбцу.
  - Сначала paid, потом new, потом остальные. Внутри группы — по id.
  - SELECT id, status FROM orders ORDER BY CASE status WHEN 'paid' THEN 1 WHEN 'new' THEN 2 ELSE 3 END, id
---

## Теория

Порядок по умолчанию — алфавит или число. Свой порядок задают ключом сортировки: `CASE` превращает статус в 1, 2 или 3, и база сортирует уже эти числа.

## Задание

Все заказы: сначала оплаченные, затем новые, затем отменённые. Внутри одной группы — по возрастанию id. Столбцы: id, status. Порядок строк важен.

## Разбор

CASE не попадает в ответ, он только управляет ORDER BY. Второй ключ id разбирает заказы с одинаковым статусом.
