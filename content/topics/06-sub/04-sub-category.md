---
kind: exercise
id: sub-category
title: Категории выше среднего
seed: shop
columns: [category]
orderMatters: false
level: 3
starter: |
  SELECT category
  FROM products
  GROUP BY category
solution: |
  SELECT category
  FROM products
  GROUP BY category
  HAVING AVG(price) > (SELECT AVG(price) FROM products)
hints:
  - Сначала средняя цена внутри категории, потом сравнение с общей средней.
  - Условие на AVG пишут в HAVING. Общая средняя — отдельный SELECT.
  - SELECT category FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products)
---

## Теория

Группировка сжимает товары категории в одну строку. `HAVING` смотрит уже на `AVG` группы. Подзапрос со средней по всей таблице от группировки не зависит и считается отдельно.

## Задание

Категории, у которых средняя цена товаров выше средней цены вообще всех товаров. Один столбец: category.

## Разбор

WHERE здесь не годится: средней по группе ещё нет, пока строки не собраны. HAVING сравнивает готовую среднюю с числом из подзапроса.
