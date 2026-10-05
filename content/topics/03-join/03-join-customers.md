---
kind: exercise
id: join-customers
title: Клиенты и их заказы
seed: shop
columns: [name, order_id]
orderMatters: false
level: 2
starter: |
  SELECT name
  FROM customers
solution: |
  SELECT c.name, o.id AS order_id
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
hints:
  - Внутреннее соединение выкинет клиента без заказов. Здесь его надо сохранить.
  - "Слева клиенты, справа заказы: LEFT JOIN. Слева та таблица, чьи строки неприкосновенны."
  - SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
dialectNote: RIGHT JOIN держит правую таблицу. В учебных запросах проще всегда ставить сохраняемую таблицу слева и писать LEFT JOIN. В PostgreSQL правое соединение тоже есть.
---

## Теория

Сохраняемую таблицу ставят слева и пишут `LEFT JOIN`. Строка без пары не исчезает: столбцы правой таблицы в ней пустые.

## Задание

Все клиенты и номер заказа, если заказ есть. У кого заказов нет, строка всё равно нужна, а order_id пустой. У кого заказов несколько — несколько строк. Столбцы: name, order_id.

## Разбор

Егор без заказов остаётся с пустым order_id. Анна с двумя заказами даёт две строки: соединение умножает, а не склеивает в список.
