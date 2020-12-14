-- SQLite
DROP TABLE book_nav;
DROP TABLE book_content;
-- CREATE TABLE book(
--    id INTEGER PRIMARY KEY   AUTOINCREMENT,
--    title           TEXT   ,
--    type            TEXT   ,
--    url       TEXT,
--    nav_index         INT
-- );
CREATE TABLE book_nav(
   id INTEGER PRIMARY KEY   AUTOINCREMENT,
   book_id           INT   ,
   url       TEXT,
   title         INT,
   content TEXT
);
-- CREATE TABLE book_content(
--    id INTEGER PRIMARY KEY   AUTOINCREMENT,
--    nav_id           INT   ,
--    url       TEXT,
--    title         INT
-- );

DELETE FROM book;