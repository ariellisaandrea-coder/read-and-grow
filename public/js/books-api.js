console.log("books-api.js is working");

const booksContainer =
document.querySelector("#books-container");

let books = [];


// ==============================
// LOAD BOOKS FROM SERVER
// ==============================

fetch("/api/books")
.then(function(response) {

if (!response.ok) {
throw new Error("Failed to load books.");
}

return response.json();

})
.then(function(data) {

books = data;

displayBooks(books);

})
.catch(function(error) {

console.error(
"Error loading books:",
error
);

const errorMessage = document.createElement("p");

errorMessage.textContent = "Unable to load books.";

booksContainer.replaceChildren(errorMessage);

});


// ==============================
// DISPLAY BOOKS
// ==============================

function displayBooks(bookList) {

    booksContainer.innerHTML = "";

    if (bookList.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No books found.";

        booksContainer.appendChild(
            emptyMessage
        );

        return;
    }


    bookList.forEach(function(book) {

        const bookCard =
            document.createElement("div");

        bookCard.classList.add(
            "book-card"
        );


        // ==============================
        // BOOK IMAGE
        // ==============================

        const image =
            document.createElement("img");

        image.src =
            String(book.image || "");

        image.alt =
            String(book.title || "");


        // ==============================
        // BOOK TITLE
        // ==============================

        const title =
            document.createElement("h3");

        title.textContent =
            String(book.title || "");


        // ==============================
        // AUTHOR
        // ==============================

        const author =
            document.createElement("p");

        author.textContent =
            String(book.author || "");


        // ==============================
        // CATEGORY
        // ==============================

        const category =
            document.createElement("p");

        category.textContent =
            String(book.category || "");


        // ==============================
        // DESCRIPTION
        // ==============================

        const description =
            document.createElement("p");

        description.classList.add(
            "description"
        );

        description.textContent =
            String(
                book.description ||
                "No description available."
            );


        // ==============================
        // PRICE
        // ==============================

        const price =
            document.createElement("p");

        price.classList.add(
            "price"
        );

        price.textContent =
            `$${Number(book.price).toFixed(2)}`;


        // ==============================
        // ADD TO CART BUTTON
        // ==============================

        const addToCartButton =
            document.createElement("button");

        addToCartButton.classList.add(
            "add-to-cart"
        );

        addToCartButton.dataset.bookId =
            String(book.id);

        addToCartButton.textContent =
            "Add to Cart";


        // ==============================
        // BUILD BOOK CARD
        // ==============================

        bookCard.appendChild(image);

        bookCard.appendChild(title);

        bookCard.appendChild(author);

        bookCard.appendChild(category);

        bookCard.appendChild(description);

        bookCard.appendChild(price);

        bookCard.appendChild(
            addToCartButton
        );


        booksContainer.appendChild(
            bookCard
        );

    });

}