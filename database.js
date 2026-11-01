const Database = require("better-sqlite3");

const db = new Database("read-and-grow.db");

console.log(
"Database connected successfully."
);


/*
==================================================
DATABASE SETTINGS
==================================================
*/

db.pragma("foreign_keys = ON");


/*
==================================================
USERS TABLE
==================================================
*/

db.prepare(`
CREATE TABLE IF NOT EXISTS users (

id INTEGER PRIMARY KEY AUTOINCREMENT,

full_name TEXT NOT NULL,

email TEXT NOT NULL UNIQUE,

password TEXT NOT NULL,

role TEXT NOT NULL DEFAULT 'user',

created_at TEXT NOT NULL

)
`).run();

console.log(
"Users table is ready."
);


/*
==================================================
BOOKS TABLE
==================================================
*/

db.prepare(`
CREATE TABLE IF NOT EXISTS books (

id INTEGER PRIMARY KEY AUTOINCREMENT,

title TEXT NOT NULL,

author TEXT NOT NULL,

category TEXT NOT NULL,

price REAL NOT NULL,

image TEXT NOT NULL,

description TEXT

)
`).run();

console.log(
"Books table is ready."
);


/*
==================================================
USERS TABLE MIGRATION
==================================================
Add role column to older databases.
==================================================
*/

try {

db.prepare(`
ALTER TABLE users
ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
`).run();

console.log(
"Role column added."
);

}

catch (error) {

if (
!error.message.includes(
"duplicate column name"
)
) {

throw error;

}

}


/*
==================================================
BOOKS TABLE MIGRATION
==================================================
Add description column to older databases.
==================================================
*/

try {

db.prepare(`
ALTER TABLE books
ADD COLUMN description TEXT
`).run();

console.log(
"Description column added."
);

}

catch (error) {

if (
!error.message.includes(
"duplicate column name"
)
) {

throw error;

}

}


/*
==================================================
ORDERS TABLE
==================================================
*/

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (

id INTEGER PRIMARY KEY AUTOINCREMENT,

user_id INTEGER,

items TEXT,

total REAL NOT NULL,

payment_method TEXT NOT NULL,

status TEXT NOT NULL,

created_at TEXT NOT NULL,

FOREIGN KEY (user_id)
REFERENCES users(id)

)
`).run();

console.log(
"Orders table is ready."
);


/*
==================================================
ORDERS TABLE MIGRATION
==================================================
Add user_id to older orders tables.
==================================================
*/

try {

db.prepare(`
ALTER TABLE orders
ADD COLUMN user_id INTEGER
`).run();

console.log(
"user_id column added to orders."
);

}

catch (error) {

if (
!error.message.includes(
"duplicate column name"
)
) {

throw error;

}

}


/*
==================================================
ORDER ITEMS TABLE
==================================================
*/

db.prepare(`
CREATE TABLE IF NOT EXISTS order_items (

id INTEGER PRIMARY KEY AUTOINCREMENT,

order_id INTEGER NOT NULL,

book_id INTEGER NOT NULL,

quantity INTEGER NOT NULL,

unit_price REAL NOT NULL,

subtotal REAL NOT NULL,

FOREIGN KEY (order_id)
REFERENCES orders(id)
ON DELETE CASCADE,

FOREIGN KEY (book_id)
REFERENCES books(id)

)
`).run();

console.log(
"Order items table is ready."
);


/*
==================================================
LIBRARY TABLE
==================================================
*/

db.prepare(`
CREATE TABLE IF NOT EXISTS library (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
book_id INTEGER NOT NULL,
order_id INTEGER NOT NULL,
progress INTEGER NOT NULL DEFAULT 0,
current_chapter INTEGER NOT NULL DEFAULT 1,
purchased_at TEXT NOT NULL,
last_read_at TEXT,
UNIQUE(user_id, book_id),



FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE,

FOREIGN KEY (book_id)
REFERENCES books(id),

FOREIGN KEY (order_id)
REFERENCES orders(id)

)
`).run();

console.log(
"Library table is ready."
);











try {
db.prepare(`
ALTER TABLE library
ADD COLUMN current_chapter INTEGER NOT NULL DEFAULT 1
`).run();

console.log(
"current_chapter column added to library."
);

} catch (error) {

if (
!error.message.includes(
"duplicate column name"
)
) {

throw error;

}

}



db.prepare(`
CREATE TABLE IF NOT EXISTS book_chapters (
id INTEGER PRIMARY KEY AUTOINCREMENT,
book_id INTEGER NOT NULL,
chapter_number INTEGER NOT NULL,
title TEXT NOT NULL,
content TEXT NOT NULL,
FOREIGN KEY (book_id)
REFERENCES books(id)
ON DELETE CASCADE,
UNIQUE(book_id, chapter_number)
)
`).run();

console.log("Book chapters table is ready.");




/*
==================================================
EXPORT DATABASE
==================================================
*/

module.exports = db;