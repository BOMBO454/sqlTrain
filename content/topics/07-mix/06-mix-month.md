---
kind: exercise
id: mix-month
title: Месяцы выше своих
seed: shop
columns: [month, revenue]
orderMatters: true
level: 3
starter: |
  SELECT created_at
  FROM orders
solution: |
  WITH monthly AS (
    SELECT substr(o.created_at, 1, 7) AS month,
           SUM(i.qty * i.price) AS revenue
    FROM orders o
    JOIN order_items i ON i.order_id = o.id
    WHERE o.status = 'paid'
    GROUP BY month
  )
  SELECT month, revenue
  FROM monthly
  WHERE revenue > (SELECT AVG(revenue) FROM monthly)
  ORDER BY month
hints:
  - Месяц — это первые семь символов даты, ГГГГ-ММ.
  - WITH monthly считает выручку каждого месяца. Потом месяц сравнивают со средним по этой же сводке.
  - ORDER BY month. В ответ входят только месяцы строго выше среднего.
---

## Теория

`WITH` считает сводку один раз и даёт ей имя. Ниже её можно и показать, и усреднить. Без имени пришлось бы повторять всю группировку в подзапросе.

## Задание

Месяцы, в которых оплаченная выручка строго выше средней месячной оплаченной выручки. Месяц в виде ГГГГ-ММ. Столбцы: month, revenue. Порядок — по месяцу.

## Разбор

substr режет дату до месяца, SUM собирает выручку. Внешний WHERE сравнивает каждый месяц со средним по monthly. Сортировка делает порядок проверяемым.
