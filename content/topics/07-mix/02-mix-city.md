---
kind: exercise
id: mix-city
title: Выручка по городу
seed: shop
columns: [city_label, revenue]
orderMatters: false
level: 3
starter: |
  SELECT city
  FROM customers
solution: |
  SELECT COALESCE(c.city, 'город не указан') AS city_label,
         COALESCE(SUM(i.qty * i.price), 0) AS revenue
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  LEFT JOIN order_items i ON i.order_id = o.id
  GROUP BY city_label
hints:
  - Город без оплат тоже нужен, со нулём. Это LEFT JOIN.
  - Пустой город подпишите «город не указан». Пустую сумму замените на 0.
  - GROUP BY подписи города. SUM по позициям только оплаченных заказов.
---

## Теория

Внутреннее соединение выкинет город, где оплат не было. `LEFT JOIN` сохраняет клиентов, а `COALESCE` превращает пустую сумму в ноль. Группируют уже по подписи, чтобы пустые города сели в одну строку.

## Задание

Выручка оплаченных заказов по городам. Город без таких заказов тоже покажите, с нулём. Пустой город подпишите «город не указан». Столбцы: city_label, revenue.

## Разбор

Левое соединение оставляет клиента без оплаченного заказа. SUM по пустым полям даёт NULL, внешний COALESCE делает 0. Города с оплатами суммируют свои позиции.
