console.log("Admin dashboard loaded.");

const adminBooks =
document.querySelector("#admin-books");

const form =
document.querySelector("#add-book-form");
let editingBookId = null;
loadBooks();


function loadBooks(){

fetch("/api/admin/books")

.then(function(response){

return response.json();

})

.then(function(books){

displayBooks(books);

})

.catch(function(error){

console.error("Error loading books:", error);

});

}


function displayBooks(books){

adminBooks.innerHTML = "";

books.forEach(function(book){

const card =
document.createElement("div");

card.classList.add("book-card");

card.innerHTML = `

<img src="${book.image}" alt="${book.title}">

<h3>${book.title}</h3>

<p>${book.author}</p>

<p>${book.category}</p>

<p class="price">
$${book.price.toFixed(2)}
</p>

<button
class="edit-button"
data-id="${book.id}">
Edit
</button>

<button
class="delete-button"
data-id="${book.id}">
Delete
</button>

`;

adminBooks.appendChild(card);

});


const deleteButtons =
document.querySelectorAll(".delete-button");

deleteButtons.forEach(function(button){

button.addEventListener("click", function(){

const id =
button.dataset.id;

const confirmed =
confirm("Delete this book?");

if(!confirmed){

return;

}

fetch("/api/admin/books/" + id, {

method:"DELETE"

})

.then(function(response){

return response.json();

})

.then(function(data){

alert(data.message);

loadBooks();

})

.catch(function(error){

console.error(error);

});

});

});


const editButtons =
document.querySelectorAll(".edit-button");

editButtons.forEach(function(button){

button.addEventListener("click", function(){

const id =
Number(button.dataset.id);

fetch("/api/admin/books")

.then(function(response){

return response.json();

})

.then(function(books){

const book =
books.find(function(item){

return item.id === id;

});

if(!book){

return;

}

editingBookId = id;

document.querySelector("#title").value =
book.title;

document.querySelector("#author").value =
book.author;

document.querySelector("#category").value =
book.category;

document.querySelector("#price").value =
book.price;

document.querySelector("button[type='submit']").textContent =
"Update Book";

});

});

}); }



form.addEventListener("submit", function(event){

event.preventDefault();

const book = {

title:
document.querySelector("#title").value,

author:
document.querySelector("#author").value,

category:
document.querySelector("#category").value,

price:
document.querySelector("#price").value

};

let url = "/api/admin/books";

let method = "POST";

if(editingBookId !== null){

url =
"/api/admin/books/" + editingBookId;

method = "PUT";

}

fetch(url,{

method:method,

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(book)

})

.then(function(response){

return response.json();

})

.then(function(data){

alert(data.message);

form.reset();

editingBookId = null;

document.querySelector("button[type='submit']").textContent =
"Add Book";

loadBooks();

})

.catch(function(error){

console.error(error);

});

});


