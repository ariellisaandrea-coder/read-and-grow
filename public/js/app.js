let cart = [];

let cartCount = 0;


const booksContainerElement =
    document.querySelector("#books-container");

const cartCountElement =
    document.querySelector("#cart-count");

const cartItemsElement =
    document.querySelector("#cart-items");


// ==========================================
// ADD BOOK TO CART
// ==========================================

booksContainerElement.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "add-to-cart"
            )
        ) {

            const bookId =
                Number(
                    event.target.dataset.bookId
                );


            if (!Number.isInteger(bookId)) {

                console.error(
                    "Invalid book ID."
                );

                return;
            }


            const existingBook =
                cart.find(function(item) {

                    return (
                        item.bookId === bookId
                    );

                });


            if (existingBook) {

                existingBook.quantity =
                    existingBook.quantity + 1;

            } else {

                cart.push({

                    bookId: bookId,

                    quantity: 1

                });

            }


            updateCartCount();

            displayCart();

        }

    }
);


// ==========================================
// CART BUTTONS
// ==========================================

cartItemsElement.addEventListener(
    "click",
    function(event) {

        const index =
            Number(
                event.target.dataset.index
            );


        if (
            !Number.isInteger(index)
        ) {

            return;
        }


        if (
            event.target.classList.contains(
                "increase-button"
            )
        ) {

            cart[index].quantity =
                cart[index].quantity + 1;

            updateCartCount();

            displayCart();

        }


        if (
            event.target.classList.contains(
                "decrease-button"
            )
        ) {

            if (
                cart[index].quantity > 1
            ) {

                cart[index].quantity =
                    cart[index].quantity - 1;

                updateCartCount();

                displayCart();

            }

        }


        if (
            event.target.classList.contains(
                "remove-button"
            )
        ) {

            cart.splice(index, 1);

            updateCartCount();

            displayCart();

        }

    }
);


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    cartCount =
        cart.reduce(
            function(total, book) {

                return (
                    total +
                    book.quantity
                );

            },
            0
        );


    cartCountElement.textContent =
        cartCount;

}


// ==========================================
// DISPLAY CART
// ==========================================

function displayCart() {

    cartItemsElement.replaceChildren();


    if (cart.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "Your cart is empty.";

        cartItemsElement.appendChild(
            emptyMessage
        );

        return;
    }


    cart.forEach(
        function(book, index) {

            const bookElement =
                document.createElement("div");


            // BOOK ID

            const bookIdParagraph =
                document.createElement("p");

            const bookIdStrong =
                document.createElement("strong");

            bookIdStrong.textContent =
                "Book ID: " +
                String(book.bookId);

            bookIdParagraph.appendChild(
                bookIdStrong
            );

            bookElement.appendChild(
                bookIdParagraph
            );


            // QUANTITY

            const quantityParagraph =
                document.createElement("p");

            quantityParagraph.textContent =
                "Quantity: " +
                String(book.quantity);

            bookElement.appendChild(
                quantityParagraph
            );


            // QUANTITY CONTROLS

            const quantityControls =
                document.createElement("div");

            quantityControls.className =
                "quantity-controls";


            const decreaseButton =
                document.createElement("button");

            decreaseButton.className =
                "decrease-button";

            decreaseButton.dataset.index =
                String(index);

            decreaseButton.textContent =
                "-";


            const quantitySpan =
                document.createElement("span");

            quantitySpan.textContent =
                String(book.quantity);


            const increaseButton =
                document.createElement("button");

            increaseButton.className =
                "increase-button";

            increaseButton.dataset.index =
                String(index);

            increaseButton.textContent =
                "+";


            quantityControls.appendChild(
                decreaseButton
            );

            quantityControls.appendChild(
                quantitySpan
            );

            quantityControls.appendChild(
                increaseButton
            );


            bookElement.appendChild(
                quantityControls
            );


            // REMOVE BUTTON

            const removeButton =
                document.createElement("button");

            removeButton.className =
                "remove-button";

            removeButton.dataset.index =
                String(index);

            removeButton.textContent =
                "Remove";


            bookElement.appendChild(
                removeButton
            );


            // SEPARATOR

            bookElement.appendChild(
                document.createElement("hr")
            );


            cartItemsElement.appendChild(
                bookElement
            );

        }
    );


    // ==========================================
    // CHECKOUT BUTTON
    // ==========================================

    const checkoutButton =
        document.createElement("button");


    checkoutButton.textContent =
        "Proceed to Checkout";


    checkoutButton.className =
        "checkout-button";


    cartItemsElement.appendChild(
        checkoutButton
    );


    checkoutButton.addEventListener(
        "click",
        function() {

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            localStorage.setItem(
                "readAndGrowCart",
                JSON.stringify(cart)
            );


            window.location.href =
                "checkout.html";

        }
    );

}