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
  (1, 'Ира', 'Казань'),
  (2, 'Лев', 'Москва'),
  (3, 'Нина', 'Самара'),
  (4, 'Олег', 'Казань');
INSERT INTO books (id, title, author, published_year, genre) VALUES
  (1, 'Мастер и Маргарита', 'Булгаков', 1967, 'роман'),
  (2, 'Пикник на обочине', 'Стругацкие', 1972, 'фантастика'),
  (3, 'Дюна', 'Герберт', 1965, 'фантастика'),
  (4, 'Ревизор', 'Гоголь', 1836, 'пьеса'),
  (5, 'Мы', 'Замятин', 1924, 'фантастика');
INSERT INTO loans (id, reader_id, book_id, borrowed_on, returned_on) VALUES
  (1, 1, 1, '2024-01-10', '2024-02-01'),
  (2, 1, 2, '2024-03-01', NULL),
  (3, 2, 3, '2024-04-05', '2024-05-01'),
  (4, 3, 1, '2024-06-01', NULL),
  (5, 4, 5, '2024-07-07', NULL),
  (6, 2, 4, '2024-08-01', '2024-08-20');
