CREATE TABLE readers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  published_year INTEGER,
  genre TEXT NOT NULL
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  reader_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  borrowed_on TEXT NOT NULL,
  returned_on TEXT,
  FOREIGN KEY (reader_id) REFERENCES readers(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
INSERT INTO readers (id, name, city) VALUES
  (1, 'Инга', 'Казань'),
  (2, 'Роман', 'Москва');
INSERT INTO books (id, title, author, published_year, genre) VALUES
  (1, 'Нос', 'Гоголь', 1836, 'повесть'),
  (2, 'Солярис', 'Лем', 1961, 'фантастика');
INSERT INTO loans (id, reader_id, book_id, borrowed_on, returned_on) VALUES
  (1, 1, 1, '2024-02-02', NULL),
  (2, 2, 2, '2024-03-03', '2024-04-04');
