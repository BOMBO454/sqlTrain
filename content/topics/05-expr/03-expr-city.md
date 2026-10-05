---
kind: exercise
id: expr-city
title: Город или замена
seed: shop
columns: [name, city_label]
orderMatters: false
level: 2
starter: |
  SELECT name, city
  FROM customers
solution: |
  SELECT name, COALESCE(city, 'город не указан') AS city_label
  FROM customers
hints:
  - Пустой город — это NULL. Его нельзя заменить сравнением.
  - COALESCE(city, 'город не указан') берёт город, а если его нет — запасной текст.
  - SELECT name, COALESCE(city, 'город не указан') AS city_label FROM customers
---

## Теория

`COALESCE` идёт по аргументам слева направо и останавливается на первом непустом. Так в отчёте не остаётся дырки, хотя в таблице город по-прежнему пустой.

## Задание

Имена клиентов и город. Если город пустой, напишите «город не указан». Столбцы: name, city_label.

## Разбор

У Егора city пустой, поэтому в ответе стоит запасная фраза. У остальных COALESCE возвращает сам город.
