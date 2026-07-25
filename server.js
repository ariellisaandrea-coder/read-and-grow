const express = require("express"); const db = require("./database"); const app = express();
const PORT = process.env.PORT || 3000;
const books = [ { id: 1, title: "Atomic Habits", author: "James Clear", price: 3.99 },
{ id: 2, title: "Deep Work", author: "Cal Newport", price: 4.99 },
{ id: 3, title: "Zero to One", author: "Peter Thiel", price: 1.99 } ]; 
app.use(express.json());
app.get("/api/books", function (request, response) { response.json(books); });
app.get("/api/orders", function (request, response) { response.json(orders); });
app.post(
"/api/orders",
function (request, response) {

const order =
request.body; const insertOrder = db.prepare(` INSERT INTO orders ( items, total, payment_method, status,
created_at ) VALUES ( ?, ?, ?, ?, ? ) `); const result = insertOrder.run(JSON.stringify(order.items),
order.total, order.paymentMethod, order.status, new Date().toISOString() );





console.log(
"Order saved to database."
);


console.log(
"Order ID:", result.lastInsertRowid
);


response.json({

message:
"Order saved successfully.", orderid: result.lastInsertRowid



});

}
);

app.use(express.static("public") );
app.listen(PORT, function () { console.log( `Read and Grow server is running on port ${PORT} `); });