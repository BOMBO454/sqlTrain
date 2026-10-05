---
kind: exercise
id: join-items
title: Позиция и товар
seed: shop
columns: [item_id, title, qty]
orderMatters: false
level: 2
starter: |
  SELECT id, sku, qty
  FROM order_items
solution: |
  SELECT i.id AS item_id, p.title, i.qty
  FROM order_items i
  INNER JOIN products p ON p.sku = i.sku
hints:
  - Название живёт в products, количество — в order_items.
  - "Общий ключ текстовый: sku."
  - SELECT i.id AS item_id, p.title, i.qty FROM order_items i INNER JOIN products p ON p.sku = i.sku
---

## Теория

Ключ бывает и текстовым. Здесь общий столбец — артикул `sku`: по нему к позиции приклеивается название из справочника товаров.

## Задание

В каждой позиции заказа покажите название товара и количество. Столбцы: item_id (order_items.id), title, qty.

## Разбор

Соединение по sku подменяет артикул человеческим названием, qty остаётся из позиции.
