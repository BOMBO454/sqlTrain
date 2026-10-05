---
kind: exercise
id: filter-paid
title: Оплаченные с июня
seed: shop
columns: [id, status, created_at]
orderMatters: false
level: 1
starter: |
  SELECT id, status, created_at
  FROM orders
solution: |
  SELECT id, status, created_at
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2024-06-01'
hints:
  - "Два условия сразу: оба должны выполниться."
  - Между условиями AND. Дата в кавычках, как текст.
  - WHERE status = 'paid' AND created_at >= '2024-06-01'
---

## Теория

`AND` требует, чтобы истинными были оба условия сразу. Дата в формате `ГГГГ-ММ-ДД` сравнивается как текст, и этот порядок совпадает с календарным.

## Задание

Заказы со status = 'paid' и датой created_at не раньше 2024-06-01. Столбцы: id, status, created_at. Дата хранится текстом ISO, обычное сравнение строк для такого формата совпадает с календарным.

## Разбор

Майский оплаченный заказ отсекается датой, июльский со статусом new — статусом. AND требует оба признака.
