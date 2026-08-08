const Database = require("better-sqlite3");

const db = new Database("read-and-grow.db");

console.log(
"Database connected successfully."
);

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (

id INTEGER PRIMARY KEY AUTOINCREMENT,

items TEXT NOT NULL,

total REAL NOT NULL,

payment_method TEXT NOT NULL,

status TEXT NOT NULL,
created_at TEXT NOT NULL ) `).run(); console.log("Orders table is ready." );
module.exports = db;
const createUsersTable = db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
full_name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
created_at TEXT NOT NULL
) `); createUsersTable.run(); console.log("Users table is ready.");
db.prepare(`
CREATE TABLE IF NOT EXISTS books (

id INTEGER PRIMARY KEY AUTOINCREMENT,

title TEXT NOT NULL,

author TEXT NOT NULL,

category TEXT NOT NULL,

price REAL NOT NULL,

image TEXT NOT NULL

)
`).run();


console.log("Books table is ready.");
try {

db.prepare(`
ALTER TABLE books
ADD COLUMN description TEXT
`).run();

console.log("Description column added.");

} catch (error) {

console.log("Description column already exists.");

}

