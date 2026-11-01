console.log("Admin dashboard loaded.");

const jwtToken =
localStorage.getItem("jwtToken");

const adminBooks =
document.querySelector("#admin-books");

const form =
document.querySelector("#add-book-form");

let editingBookId = null;


// ======================================
// CHECK LOGIN
// ======================================

if (!jwtToken) {

alert("Please log in first.");

window.location.href = "login.html";

}


// ======================================
// LOAD BOOKS
// ======================================

loadBooks();


function loadBooks() {

fetch("/api/admin/books", {

headers: {

"Authorization":
"Bearer " + jwtToken

}

})

.then(function(response) {

if (!response.ok) {

throw new Error(
"Unable to load books. Server returned " +
response.status
);

}

return response.json();

})

.then(function(books) {

displayBooks(books);

})

.catch(function(error) {

console.error(
"Error loading books:",
error
);

});

}


// ======================================
// DISPLAY BOOKS
// ======================================

function displayBooks(books) {

    adminBooks.innerHTML = "";

    if (books.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No books found.";

        adminBooks.appendChild(
            emptyMessage
        );

        return;
    }

    books.forEach(function(book) {

        const card =
            document.createElement("div");

        card.classList.add(
            "book-card"
        );


        const image =
            document.createElement("img");

        image.src =
            String(book.image || "");

        image.alt =
            String(book.title || "");


        const title =
            document.createElement("h3");

        title.textContent =
            String(book.title || "");


        const author =
            document.createElement("p");

        author.textContent =
            String(book.author || "");


        const category =
            document.createElement("p");

        category.textContent =
            String(book.category || "");


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


        const price =
            document.createElement("p");

        price.classList.add(
            "price"
        );

        price.textContent =
            `$${Number(book.price).toFixed(2)}`;


        // ======================================
        // EDIT BUTTON
        // ======================================

        const editButton =
            document.createElement("button");

        editButton.classList.add(
            "edit-button"
        );

        editButton.dataset.id =
            String(book.id);

        editButton.textContent =
            "Edit";


        editButton.addEventListener(
            "click",
            function() {

                startEditingBook(book);

            }
        );


        // ======================================
        // DELETE BUTTON
        // ======================================

        const deleteButton =
            document.createElement("button");

        deleteButton.classList.add(
            "delete-button"
        );

        deleteButton.dataset.id =
            String(book.id);

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteBook(book.id);

            }
        );


        // ======================================
        // ADD ELEMENTS TO CARD
        // ======================================

        card.appendChild(image);

        card.appendChild(title);

        card.appendChild(author);

        card.appendChild(category);

        card.appendChild(description);

        card.appendChild(price);

        card.appendChild(editButton);

        card.appendChild(deleteButton);

        adminBooks.appendChild(card);

    });

}


// ======================================
// START EDITING BOOK
// ======================================

function startEditingBook(book) {

    editingBookId =
        book.id;


    document.querySelector("#title").value =
        book.title || "";


    document.querySelector("#author").value =
        book.author || "";


    document.querySelector("#category").value =
        book.category || "";


    document.querySelector("#price").value =
        book.price || "";


    document.querySelector("#description").value =
        book.description || "";


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    submitButton.textContent =
        "Update Book";


    form.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================
// FORM SUBMISSION
// ======================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const title =
            document.querySelector("#title").value.trim();


        const author =
            document.querySelector("#author").value.trim();


        const category =
            document.querySelector("#category").value.trim();


        const price =
            Number(
                document.querySelector("#price").value
            );


        const description =
            document.querySelector("#description").value.trim();


        if (
            !title ||
            !author ||
            !category ||
            !description ||
            !Number.isFinite(price) ||
            price < 0
        ) {

            alert(
                "Please enter valid book information."
            );

            return;

        }


        const bookData = {

            title:
                title,

            author:
                author,

            category:
                category,

            price:
                price,

            description:
                description

        };


        // ======================================
        // UPDATE EXISTING BOOK
        // ======================================

        if (editingBookId !== null) {

            fetch(
                "/api/admin/books/" +
                editingBookId,
                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            jwtToken

                    },

                    body:
                        JSON.stringify(
                            bookData
                        )

                }
            )

            .then(function(response) {

                if (!response.ok) {

                    throw new Error(
                        "Unable to update book."
                    );

                }

                return response.json();

            })

            .then(function() {

                alert(
                    "Book updated successfully."
                );

                editingBookId =
                    null;

                form.reset();

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                submitButton.textContent =
                    "Add Book";

                loadBooks();

            })

            .catch(function(error) {

                console.error(
                    "Error updating book:",
                    error
                );

                alert(
                    "Unable to update book."
                );

            });

            return;

        }


        // ======================================
        // ADD NEW BOOK
        // ======================================

        fetch(
            "/api/admin/books",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        jwtToken

                },

                body:
                    JSON.stringify(
                        bookData
                    )

            }
        )

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "Unable to add book."
                );

            }

            return response.json();

        })

        .then(function() {

            alert(
                "Book added successfully."
            );

            form.reset();

            loadBooks();

        })

        .catch(function(error) {

            console.error(
                "Error adding book:",
                error
            );

            alert(
                "Unable to add book."
            );

        });

    }
);


// ======================================
// DELETE BOOK
// ======================================

function deleteBook(bookId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this book?"
        );


    if (!confirmed) {

        return;

    }


    fetch(
        "/api/admin/books/" +
        bookId,
        {

            method:
                "DELETE",

            headers: {

                "Authorization":
                    "Bearer " +
                    jwtToken

            }

        }
    )

    .then(function(response) {

        if (!response.ok) {

            throw new Error(
                "Unable to delete book."
            );

        }

        return response.json();

    })

    .then(function() {

        alert(
            "Book deleted successfully."
        );

        loadBooks();

    })

    .catch(function(error) {

        console.error(
            "Error deleting book:",
            error
        );

        alert(
            "Unable to delete book."
        );

    });

}
