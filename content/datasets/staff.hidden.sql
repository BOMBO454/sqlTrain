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
  (1, 'Архив', 'Казань');
INSERT INTO employees (id, name, dept_id, hired_on, salary, manager_id) VALUES
  (1, 'Мила', 1, '2020-01-01', 100000, NULL),
  (2, 'Ян', 1, '2021-01-01', 80000, 1),
  (3, 'Нина', 1, '2022-02-02', 70000, 2);
INSERT INTO projects (id, name, dept_id) VALUES
  (1, 'Каталог', 1);
INSERT INTO assignments (employee_id, project_id, role) VALUES
  (2, 1, 'опись');
