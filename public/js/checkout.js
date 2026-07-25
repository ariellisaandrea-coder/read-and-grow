const checkoutItems = document.querySelector("#checkout-items"); 
const checkoutTotal = document.querySelector("#checkout-total");
const savedCart = localStorage.getItem("readAndGrowCart");
const cart = JSON.parse(savedCart) || [];
function displayCheckoutCart() { checkoutItems.innerHTML = ""; let total = 0;
cart.forEach(function (book) { const subtotal = book.price * book.quantity;
const bookElement = document.createElement("div"); bookElement.innerHTML = `
<p> <strong>${book.name}</strong> </p>
<p> Quantity: ${book.quantity} </p>
<p> Subtotal: $${subtotal.toFixed(2)} </p> <hr> `;
checkoutItems.appendChild( bookElement ); total = total + subtotal; }); 
checkoutTotal.textContent = "Total: $" + total.toFixed(2); } displayCheckoutCart();
const paymentOptions = document.querySelectorAll( 'input[name="payment-method"]' );
const paymentDetails = document.querySelector( "#payment-details" );
paymentOptions.forEach(function (option) { option.addEventListener( "change", function () {
if (option.value === "card") { paymentDetails.innerHTML = ` <h3>Card Payment</h3>
<p>You will continue to a secure payment checkout.</p> `; } if (option.value === "paypal") {
paymentDetails.innerHTML = ` <h3>PayPal</h3> <p> You will continue to PayPal's 
secure checkout. </p> `; } if (option.value === "account") { paymentDetails.innerHTML = `
<h3>Account Payment</h3> <p> Sign in or create an account to continue. </p> `; } } ); });
const continueButton =
document.querySelector(
"#continue-payment"
);


continueButton.addEventListener(
"click",
function () {

let selectedPayment =
null;


paymentOptions.forEach(
function (option) {

if (
option.checked
) {

selectedPayment =
option.value;

}

}
);


if (
selectedPayment ===
null
) {

alert(
"Please choose a payment method."
);

return;

}


localStorage.setItem(
"selectedPayment",
selectedPayment
);


window.location.href =
"payment.html";

}
);