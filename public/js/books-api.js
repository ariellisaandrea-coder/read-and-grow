console.log("books-api.js is working");
const booksContainer = document.querySelector("#books-container"); fetch("/api/books")
.then(function (response) { return response.json(); }) .then(function (books) { 
books.forEach(function (book) { const bookCard = document.createElement("div");
bookCard.classList.add("book-card"); bookCard.innerHTML = ` <h3>${book.title}</h3> 
<p> Author: ${book.author} </p>
<p> Price: $${book.price} </p>
<button class="add-to-cart" data-id="${book.id}" data-book="${book.title}" data-price="${book.price}">
Add to Cart </button> `; booksContainer.appendChild(bookCard); }); }) .catch(function (error)
{ console.error("Error loading books:", error); });