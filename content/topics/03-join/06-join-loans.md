---
kind: exercise
id: join-loans
title: Кто что брал
seed: library
columns: [reader, title, borrowed_on]
orderMatters: false
level: 3
starter: |
  SELECT borrowed_on
  FROM loans
solution: |
  SELECT r.name AS reader, b.title, l.borrowed_on
  FROM loans l
  INNER JOIN readers r ON r.id = l.reader_id
  INNER JOIN books b ON b.id = l.book_id
hints:
  - Имя в readers, название в books, дата в loans.
  - "Два JOIN от выдачи: к читателю по reader_id и к книге по book_id."
  - SELECT r.name AS reader, b.title, l.borrowed_on FROM loans l INNER JOIN readers r ON r.id = l.reader_id INNER JOIN books b ON b.id = l.book_id
---

## Теория

Выдача — середина между читателем и книгой. От неё идут два соединения: к человеку по `reader_id` и к книге по `book_id`.

## Задание

По каждой выдаче: имя читателя, название книги и дата borrowed_on. Столбцы: reader, title, borrowed_on.

## Разбор

Выдача — середина. К ней приклеиваются читатель и книга, дата остаётся на месте.
