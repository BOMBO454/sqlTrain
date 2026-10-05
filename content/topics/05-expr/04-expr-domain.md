---
kind: exercise
id: expr-domain
title: Домен почты
seed: shop
columns: [name, domain]
orderMatters: false
level: 2
starter: |
  SELECT name, email
  FROM customers
solution: |
  SELECT name, substr(email, instr(email, '@') + 1) AS domain
  FROM customers
hints:
  - instr находит позицию символа, substr вырезает хвост.
  - "Домен начинается сразу после @. Имя столбца: domain."
  - SELECT name, substr(email, instr(email, '@') + 1) AS domain FROM customers
---

## Теория

Строковые функции не меняют столбец. `instr` возвращает номер символа, `substr` — кусок, начиная с номера. Нумерация в SQLite с единицы.

## Задание

Имя клиента и домен его почты, то есть всё, что после @. Столбцы: name, domain.

## Разбор

Позиция @ плюс один — это первый символ домена. Хвост строки и есть domain.
