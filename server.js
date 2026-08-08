const express = require("express");
const bcrypt = require("bcrypt"); const crypto = require("crypto");
const db = require("./database"); const app = express();
const PORT = process.env.PORT || 3000;
const books = [

{
id: 1,
title: "Atomic Habits",
author: "James Clear",
category: "Self Improvement",
price: 3.99,
image: "images/atomic-habits.jpg",
description: "A bestselling guide that teaches how small daily habits can produce remarkable long-term results through practical systems instead of relying on motivation alone."
},

{
id: 2,
title: "Deep Work",
author: "Cal Newport",
category: "Self Improvement",
price: 4.99,
image: "images/deep-work.jpg",
description: "Learn how to eliminate distractions, improve focus, and produce high-quality work in a world filled with constant interruptions."
},

{
id: 3,
title: "Zero to One",
author: "Peter Thiel",
category: "Business",
price: 1.99,
image: "images/zero-to-one.jpg",
description: "Peter Thiel explains how entrepreneurs can create innovative companies by building something completely new instead of competing in existing markets."
},

{
id: 4,
title: "Clean Code",
author: "Robert C. Martin",
category: "Programming",
price: 8.99,
image: "images/clean-code.jpg",
description: "One of the most respected programming books ever written, teaching developers how to write clean, maintainable, and professional software."
},

{
id: 5,
title: "The Pragmatic Programmer",
author: "Andrew Hunt & David Thomas",
category: "Programming",
price: 9.99,
image: "images/pragmatic-programmer.jpg",
description: "A timeless guide filled with practical advice, software engineering principles, and career lessons for modern programmers."
},

{
id: 6,
title: "Rich Dad Poor Dad",
author: "Robert Kiyosaki",
category: "Finance",
price: 6.99,
image: "images/rich-dad-poor-dad.jpg",
description: "An introduction to financial literacy that compares two different mindsets about money, investing, assets, and long-term wealth."
},

{
id: 7,
title: "The Psychology of Money",
author: "Morgan Housel",
category: "Finance",
price: 8.49,
image: "images/psychology-of-money.jpg",
description: "Discover why managing money is often more about behavior and decision-making than mathematical skill."
},

{
id: 8,
title: "The Lean Startup",
author: "Eric Ries",
category: "Business",
price: 7.99,
image: "images/lean-startup.jpg",
description: "Learn how startups can build products faster, test ideas with customers, and reduce business risk through continuous innovation."
},

{
id: 9,
title: "The Clean Coder",
author: "Robert C. Martin",
category: "Programming",
price: 7.49,
image: "images/clean-coder.jpg",
description: "A professional handbook that teaches software developers responsibility, communication, discipline, and best practices in real-world projects."
}

];
const bookCount =
db.prepare(
"SELECT COUNT(*) AS total FROM books"
).get();

if(bookCount.total === 0){

const insertBook = db.prepare(`

INSERT INTO books

(title, author, category, price, image, description)

VALUES

(?, ?, ?, ?, ?, ?)

`);


books.forEach(function(book){

insertBook.run(

book.title,

book.author,

book.category,

book.price,

book.image,

book.description

);


});

console.log("Default books inserted.");

}


const sessions = {};
app.use(express.json());
app.get("/api/books", function(request, response){

const books = db.prepare(

"SELECT * FROM books"

).all();

response.json(books);

});
app.get("/api/admin/books", function(request, response){

const books = db.prepare(

"SELECT * FROM books"

).all();

response.json(books);

});
app.post("/api/admin/books", function(request, response){

const insertBook = db.prepare(`

INSERT INTO books

(title, author, category, price, image)

VALUES

(?, ?, ?, ?, ?)

`);

const result = insertBook.run(

request.body.title,

request.body.author,

request.body.category,

Number(request.body.price),

"images/book-placeholder.png"

);

const newBook = db.prepare(

"SELECT * FROM books WHERE id = ?"

).get(result.lastInsertRowid);

console.log("Book saved to database.");

response.json({

message: "Book added successfully",

book: newBook

});

});


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
app.post(
"/api/signup",

async function (request, response) {

const fullName =
request.body.fullName;

const email =
request.body.email;

const password =
request.body.password;

try {

const hashedPassword =
await bcrypt.hash(password, 10);
app.post(
"/api/login",

async function(request, response){

const email =
request.body.email;

const password =
request.body.password;

const getUser =
db.prepare(
"SELECT * FROM users WHERE email = ?"
);

const user =
getUser.get(email);

if(!user){

response.status(401).json({

success:false,

message:"Invalid email or password."

});

return;

}

const passwordMatches =
await bcrypt.compare(

password,

user.password

);

if(!passwordMatches){

response.status(401).json({

success:false,

message:"Invalid email or password."

});

return;

}

const sessionToken =
crypto.randomUUID();

sessions[sessionToken] = {

userId:user.id,

email:user.email

};

console.log(

"User logged in:",

user.email

);

response.json({

success:true,

message:"Login successful.",

token:sessionToken,

fullName:user.full_name

});

}
);


const insertUser =
db.prepare(`
INSERT INTO users
(
full_name,
email,
password,
created_at
)
VALUES
(
?,
?,
?,
?
)
`);

const result =
insertUser.run(
fullName,
email,
hashedPassword,
new Date().toISOString()
);

console.log(
"New user registered:",
email
);

response.json({

success: true,

message:
"Account created successfully."

});

}

catch (error) {

console.error(error);

response.status(500).json({

success: false,

message:
"Unable to create account."

});

}

}
);
app.delete("/api/admin/books/:id", function(request, response){

const id =
Number(request.params.id);

const deleteBook =
db.prepare(

"DELETE FROM books WHERE id = ?"

);

const result =
deleteBook.run(id);

if(result.changes === 0){

response.status(404).json({

message:"Book not found"

});

return;

}

console.log("Book deleted:", id);

response.json({

message:"Book deleted successfully"

});

});
app.put("/api/admin/books/:id", function(request, response){

const updateBook =
db.prepare(`

UPDATE books

SET

title=?,

author=?,

category=?,

price=?

WHERE id=?

`);

const result =
updateBook.run(

request.body.title,

request.body.author,

request.body.category,

Number(request.body.price),

Number(request.params.id)

);

if(result.changes===0){

response.status(404).json({

message:"Book not found"

});

return;

}

console.log("Book updated.");

response.json({

message:"Book updated successfully"

});

});

app.use(express.static("public") );
app.listen(PORT, function () { console.log( `Read and Grow server is running on port ${PORT} `); });
