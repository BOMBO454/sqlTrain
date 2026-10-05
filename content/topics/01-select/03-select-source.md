---
kind: exercise
id: select-source
title: Столбец-константа
seed: shop
columns: [title, category, source]
orderMatters: false
level: 1
starter: |
  SELECT title, category
  FROM products
solution: |
  SELECT title, category, 'каталог' AS source
  FROM products
hints:
  - В списке SELECT может стоять не только столбец, но и текст в кавычках.
  - Текст берите в одинарные кавычки и назовите столбец через AS source.
  - SELECT title, category, 'каталог' AS source FROM products
---

## Теория

В списке `SELECT` может стоять не только столбец, но и постоянное значение. Текст берут в одинарные кавычки, и оно повторяется в каждой строке.

## Задание

Для каждого товара покажите title, category и столбец source со значением 'каталог' в каждой строке.

## Разбор

Литерал повторяется в каждой строке источника. Так помечают выгрузку, не храня метку в таблице.
