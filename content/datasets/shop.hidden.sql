CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  email TEXT
);
CREATE TABLE products (
  sku TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (sku) REFERENCES products(sku)
);
INSERT INTO customers (id, name, city, email) VALUES
  (10, 'Ася', 'Казань', 'asya@example.com'),
  (11, 'Марк', 'Омск', 'mark@example.com'),
  (12, 'Кира', NULL, 'kira@example.com'),
  (13, 'Нора', 'Казань', 'nora@example.com'),
  (14, 'Лев', 'Тула', 'lev@example.com'),
  (15, 'Яна', 'Казань', 'yana@example.com');
INSERT INTO products (sku, title, category, price) VALUES
  ('tea-1', 'Ассам', 'чай', 400),
  ('tea-2', 'Сенча', 'чай', 500),
  ('cof-1', 'Эспрессо', 'кофе', 900),
  ('cof-2', 'Фильтр', 'кофе', 700),
  ('choco', 'Шоколад', 'снеки', 200),
  ('honey', 'Мёд', 'снеки', 300),
  ('cookie', 'Печенье', 'снеки', 150),
  ('cocoa', 'Какао', 'напитки', 250),
  ('tea-3', 'Габа', 'чай', 400),
  ('nuts', 'Орехи', 'снеки', 200);
INSERT INTO orders (id, customer_id, status, created_at) VALUES
  (20, 10, 'paid', '2024-08-01'),
  (21, 11, 'new', '2024-01-02'),
  (22, 10, 'paid', '2024-09-01'),
  (23, 11, 'cancelled', '2024-04-01'),
  (24, 14, 'paid', '2024-01-10'),
  (25, 14, 'paid', '2024-01-20'),
  (26, 15, 'paid', '2024-10-05');
INSERT INTO order_items (id, order_id, sku, qty, price) VALUES
  (1, 20, 'tea-1', 1, 400),
  (2, 20, 'honey', 2, 300),
  (3, 22, 'cof-1', 1, 900),
  (4, 21, 'cookie', 1, 150),
  (5, 24, 'tea-1', 1, 400),
  (6, 25, 'tea-2', 1, 100),
  (7, 26, 'cof-1', 1, 900);

CREATE TABLE places (
  city TEXT PRIMARY KEY
);
INSERT INTO places (city) VALUES
  ('Казань'),
  ('Омск'),
  ('Пермь');
