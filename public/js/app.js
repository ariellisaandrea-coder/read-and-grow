let cart = [];

let cartCount = 0;


const booksContainerElement =
 document.querySelector("#books-container");


const cartCountElement =
 document.querySelector("#cart-count");


const cartItemsElement =
 document.querySelector("#cart-items");


// ADD BOOK TO CART

booksContainerElement.addEventListener(
 "click",
 function (event) {

 if (
 event.target.classList.contains(
 "add-to-cart"
 )
 ) {

 const bookName =
 event.target.dataset.book;


 const bookPrice =
 Number(
 event.target.dataset.price
 );


 const existingBook =
 cart.find(function (item) {

 return item.name === bookName;

 });


 if (existingBook) {

 existingBook.quantity =
 existingBook.quantity + 1;

 } else {

 cart.push({

 name: bookName,

 price: bookPrice,

 quantity: 1

 });

 }


 updateCartCount();

 displayCart();

 }

 }
);


// CART BUTTONS

cartItemsElement.addEventListener(
 "click",
 function (event) {

 const index =
 Number(
 event.target.dataset.index
 );


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


// UPDATE CART COUNT

function updateCartCount() {

 cartCount =
 cart.reduce(
 function (total, book) {

 return total +
 book.quantity;

 },
 0
 );


 cartCountElement.textContent =
 cartCount;

}


// DISPLAY CART

function displayCart() {

 cartItemsElement.innerHTML = "";


 let total = 0;


 cart.forEach(function (book, index) {

 const subtotal =
 book.price *
 book.quantity;


 const bookElement =
 document.createElement("div");


 bookElement.innerHTML = `

 <p>
 <strong>
 ${book.name}
 </strong>
 </p>


 <p>
 Price:
 $${book.price.toFixed(2)}
 </p>


 <div
 class="quantity-controls"
 >

 <button
 class="decrease-button"
 data-index="${index}"
 >
 -
 </button>


 <span>
 ${book.quantity}
 </span>


 <button
 class="increase-button"
 data-index="${index}"
 >
 +
 </button>

 </div>


 <p>
 Subtotal:
 $${subtotal.toFixed(2)}
 </p>


 <button
 class="remove-button"
 data-index="${index}"
 >
 Remove
 </button>


 <hr>

 `;


 cartItemsElement.appendChild(
 bookElement
 );


 total =
 total +
 subtotal;

 });


 const totalElement =
 document.createElement("h3");


 totalElement.textContent =
 "Total: $" +
 total.toFixed(2);


 cartItemsElement.appendChild(
 totalElement
 );


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
 function () {

 if (
 cart.length === 0
 ) {

 alert(
 "Your cart is empty."
 );

 } else {

 localStorage.setItem(
 "readAndGrowCart",
 JSON.stringify(cart)
 );


 window.location.href =
 "checkout.html";

 }

 }
 );

}