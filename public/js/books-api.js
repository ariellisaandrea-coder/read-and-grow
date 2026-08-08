console.log("books-api.js is working");

const booksContainer = document.querySelector("#books-container");

let books = [];

// Load books from the server
fetch("/api/books")
 .then(response => response.json())
 .then(data => {
 books = data;
 displayBooks(books);
 })
 .catch(error => {
 console.error("Error loading books:", error);
 });


// Display books
function displayBooks(bookList) {

 booksContainer.innerHTML = "";

 bookList.forEach(function(book) {

 const bookCard = document.createElement("div");

 bookCard.classList.add("book-card");

 bookCard.innerHTML = `
 <img src="${book.image}" alt="${book.title}">

 <h3>${book.title}</h3>

 <p>${book.author}</p>

 <p>${book.category}</p>

 <p class="price">
 $${book.price.toFixed(2)}
 </p>

 <button
 class="add-to-cart"
 data-book="${book.title}"
 data-price="${book.price}">
 Add to Cart
 </button>
 `;

 booksContainer.appendChild(bookCard);

 });

}


// Category buttons
const categoryButtons = document.querySelectorAll(".category-button");

categoryButtons.forEach(function(button){

 button.addEventListener("click", function(){

 const category = button.dataset.category;

 if(category === "All"){

 displayBooks(books);

 return;

 }

 const filteredBooks = books.filter(function(book){

 return book.category === category;

 });

 displayBooks(filteredBooks);

 });

});


// Search
const searchInput = document.querySelector("#search-input");

searchInput.addEventListener("input", function(){

 const search = searchInput.value.toLowerCase();

 const filteredBooks = books.filter(function(book){

 return (

 book.title.toLowerCase().includes(search) ||

 book.author.toLowerCase().includes(search) ||

 book.category.toLowerCase().includes(search)

 );

 });

 displayBooks(filteredBooks);

});