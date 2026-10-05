CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  hired_on TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
CREATE TABLE assignments (
  employee_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
INSERT INTO departments (id, name, city) VALUES
  (1, 'Чай', 'Казань'),
  (2, 'Кофе', 'Москва'),
  (3, 'Снеки', 'Самара');
INSERT INTO employees (id, name, dept_id, hired_on, salary, manager_id) VALUES
  (1, 'Алла', 1, '2020-01-15', 180000, NULL),
  (2, 'Борис', 1, '2021-03-01', 120000, 1),
  (3, 'Вера', 2, '2019-11-20', 130000, 1),
  (4, 'Глеб', 2, '2022-06-01', 90000, 3),
  (5, 'Дина', 3, '2023-02-14', 85000, NULL),
  (6, 'Егор', 3, '2024-01-09', 70000, 5),
  (7, 'Жанна', 2, '2024-04-01', 60000, 4);
INSERT INTO projects (id, name, dept_id) VALUES
  (1, 'Осенний лист', 1),
  (2, 'Обжарка', 2),
  (3, 'Витрина', 3);
INSERT INTO assignments (employee_id, project_id, role) VALUES
  (2, 1, 'закупщик'),
  (3, 2, 'обжарщик'),
  (4, 2, 'стажёр'),
  (6, 3, 'мерчандайзер');
