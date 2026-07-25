const selectedPayment =
localStorage.getItem(
"selectedPayment"
);


const demoCardInput =
document.querySelector(
"#demo-card-number"
);
const demoCvvInput =
document.querySelector(
"#demo-cvv"
);


const payButton =
document.querySelector(
"#pay-button"
);


const paymentMessage =
document.querySelector(
"#payment-message"
);


payButton.addEventListener(
"click",
function () {

const cardNumber =
demoCardInput.value.trim();


if (
cardNumber === ""
) {

paymentMessage.textContent =
"Please enter a sample card number.";

return;

}


if (
!/^\d+$/.test(
cardNumber
)
) {

paymentMessage.textContent =
"Use digits only for this demo.";

return;

}
const cvv =
demoCvvInput.value.trim();

if (
!/^\d{3}$/.test(cvv)
) {

paymentMessage.textContent =
"Enter a 3-digit demo CVV.";

return;

}


paymentMessage.textContent =
"Processing payment...";


payButton.disabled =
true;


setTimeout(
function () {

const savedCart =
localStorage.getItem(
"readAndGrowCart"
);


const cart =
JSON.parse(savedCart) || [];


let total = 0;


cart.forEach(function (book) {

total =
total +
book.price *
book.quantity;

});


const order = {

items: cart,

total: total,

paymentMethod: "card",
demoCardNumber: cardNumber,
status: "paid"

};


fetch(
"/api/orders",
{

method: "POST",

headers: {

"Content-Type":
"application/json"

},

body:
JSON.stringify(order)

}

)

.then(function (response) {

return response.json();

})

.then(function (data) {

console.log(
"Server response:",
data
);


paymentMessage.textContent =
"Payment successful!";


payButton.textContent =
"Payment Complete";
setTimeout(
function () {

window.location.href =
"confirmation.html";

},
1500
);

})

.catch(function (error) {

console.error(
"Order error:",
error
);

paymentMessage.textContent =
"There was a problem sending the order.";

});

},
2000
);

}
);