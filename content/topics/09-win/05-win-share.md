---
kind: exercise
id: win-share
title: Доля позиции
seed: shop
columns: [id, share]
orderMatters: false
level: 3
starter: |
  SELECT id, qty, price
  FROM order_items
solution: |
  SELECT id,
         ROUND(100.0 * qty * price / SUM(qty * price) OVER (PARTITION BY order_id), 1) AS share
  FROM order_items
hints:
  - Знаменатель — сумма строк того же заказа, и это тоже окно.
  - SUM(qty * price) OVER (PARTITION BY order_id). Умножьте на 100.0 и округлите до одного знака.
  - Столбцы id и share.
---

## Теория

Окно без `ORDER BY` видит всю перегородку сразу. Каждая позиция делится на одну и ту же сумму своего заказа, и строки заказа никуда не схлопываются.

## Задание

Для каждой позиции — её id и доля в сумме своего заказа, в процентах, один знак после запятой. Сумма позиции — количество на цену. Столбцы: id, share.

## Разбор

PARTITION BY order_id собирает знаменатель. Числитель остаётся от текущей строки. ROUND приводит долю к одному знаку.
