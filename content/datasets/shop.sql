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
  (1, 'Анна', 'Казань', 'anna@example.com'),
  (2, 'Борис', 'Москва', 'boris@example.com'),
  (3, 'Вера', 'Казань', 'vera@example.com'),
  (4, 'Глеб', 'Самара', 'gleb@example.com'),
  (5, 'Дина', 'Москва', 'dina@example.com'),
  (6, 'Егор', NULL, 'egor@example.com'),
  (7, 'Жанна', 'Казань', 'zhanna@example.com');
INSERT INTO products (sku, title, category, price) VALUES
  ('tea-1', 'Ассам', 'чай', 450),
  ('tea-2', 'Сенча', 'чай', 620),
  ('cof-1', 'Эспрессо', 'кофе', 890),
  ('cof-2', 'Фильтр', 'кофе', 540),
  ('choco', 'Шоколад', 'снеки', 210),
  ('honey', 'Мёд', 'снеки', 730),
  ('cookie', 'Печенье', 'снеки', 180),
  ('cocoa', 'Какао', 'напитки', 360),
  ('tea-3', 'Габа', 'чай', 450),
  ('nuts', 'Орехи', 'снеки', 210);
INSERT INTO orders (id, customer_id, status, created_at) VALUES
  (1, 1, 'paid', '2024-05-02'),
  (2, 1, 'paid', '2024-07-14'),
  (3, 2, 'new', '2024-07-01'),
  (4, 3, 'paid', '2024-08-20'),
  (5, 3, 'cancelled', '2024-03-01'),
  (6, 4, 'paid', '2024-09-09'),
  (7, 5, 'new', '2024-06-15'),
  (8, 7, 'paid', '2024-11-02');
INSERT INTO order_items (id, order_id, sku, qty, price) VALUES
  (1, 1, 'tea-1', 2, 450),
  (2, 1, 'honey', 1, 730),
  (3, 2, 'cof-1', 1, 890),
  (4, 3, 'cookie', 3, 180),
  (5, 4, 'tea-2', 2, 620),
  (6, 4, 'choco', 1, 210),
  (7, 5, 'cof-2', 1, 540),
  (8, 6, 'cocoa', 4, 360),
  (9, 7, 'honey', 2, 730),
  (10, 8, 'tea-1', 1, 450),
  (11, 8, 'cookie', 2, 180);

CREATE TABLE places (
  city TEXT PRIMARY KEY
);
INSERT INTO places (city) VALUES
  ('Казань'),
  ('Москва'),
  ('Пермь');
