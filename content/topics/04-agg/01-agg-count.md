---
kind: exercise
id: agg-count
title: Сколько клиентов
seed: shop
columns: [customers]
orderMatters: false
level: 2
starter: |
  SELECT *
  FROM customers
solution: |
  SELECT COUNT(*) AS customers
  FROM customers
hints:
  - Нужна не таблица имён, а одно число.
  - COUNT(*) считает строки. Имя столбца задайте через AS.
  - SELECT COUNT(*) AS customers FROM customers
---

## Теория

`COUNT(*)` считает строки. Без группировки в ответе одна строка и одно число, даже если в таблице тысячи записей.

## Задание

Одно число: сколько строк в customers. Столбец назовите customers.

## Разбор

Агрегат без GROUP BY схлопывает всю таблицу в одну строку.
