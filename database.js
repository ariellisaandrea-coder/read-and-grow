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

created_at TEXT NOT NULL

)
`).run();

console.log(
"Orders table is ready."
);
module.exports = db;

