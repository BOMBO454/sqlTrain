---
kind: exercise
id: select-alias
title: Своё имя столбца
seed: shop
columns: [sku, product]
orderMatters: false
level: 1
starter: |
  SELECT sku, title
  FROM products
solution: |
  SELECT sku, title AS product
  FROM products
hints:
  - AS задаёт имя столбца в результате и не переименовывает столбец в таблице.
  - "Второе поле: title AS product."
  - SELECT sku, title AS product FROM products
---

## Теория

`AS` даёт столбцу имя в ответе. В самой таблице столбец не переименовывается. Проверка сверяет подписи, поэтому имя из условия нужно повторить точно.

## Задание

Из products выведите артикул и название. Столбцы результата: sku и product. Название в таблице называется title, в ответе его нужно переименовать.

## Разбор

Проверка сверяет имена столбцов. title в таблице и product в ответе — разные подписи одной и той же величины.
