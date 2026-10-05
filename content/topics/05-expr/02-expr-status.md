---
kind: exercise
id: expr-status
title: Подписи статусов
seed: shop
columns: [id, label]
orderMatters: false
level: 2
starter: |
  SELECT id, status
  FROM orders
solution: |
  SELECT id,
    CASE status
      WHEN 'paid' THEN 'оплачен'
      WHEN 'new' THEN 'новый'
      ELSE 'отменен'
    END AS label
  FROM orders
hints:
  - CASE WHEN ... THEN ... END выбирает одно значение из нескольких.
  - paid — оплачен, new — новый, cancelled — отменен. Столбец зовут label.
  - SELECT id, CASE status WHEN 'paid' THEN 'оплачен' WHEN 'new' THEN 'новый' ELSE 'отменен' END AS label FROM orders
---

## Теория

`CASE` похож на развилку. Простая форма сравнивает одно выражение с набором значений и возвращает первое совпадение. `ELSE` ловит всё остальное.

## Задание

Покажите номер заказа и русскую подпись статуса. paid — оплачен, new — новый, cancelled — отменен. Столбцы: id, label.

## Разбор

В таблице статус по-прежнему латиницей. Подпись существует только в ответе, поэтому её имя задают через AS.
