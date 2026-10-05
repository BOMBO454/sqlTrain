---
kind: exercise
id: join-managers
title: Кто чей руководитель
seed: staff
columns: [employee, manager]
orderMatters: false
level: 3
starter: |
  SELECT name
  FROM employees
solution: |
  SELECT e.name AS employee, m.name AS manager
  FROM employees e
  LEFT JOIN employees m ON m.id = e.manager_id
hints:
  - Таблицу можно присоединить к себе. Два псевдонима обязательны, иначе имя столбца двусмысленно.
  - LEFT JOIN, потому что у части людей manager_id пустой.
  - SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id
---

## Теория

Таблицу можно соединить саму с собой. Тогда у неё два псевдонима: один для сотрудника, другой для его руководителя. Без псевдонимов имя столбца двусмысленно.

## Задание

Для каждого сотрудника выведите его имя и имя руководителя. Столбцы: employee, manager. Если руководителя нет, manager пустой. Руководитель — тоже строка employees, связь через manager_id.

## Разбор

e — сотрудник, m — его руководитель. Условие m.id = e.manager_id. Алла и Дина остаются с пустым manager.
