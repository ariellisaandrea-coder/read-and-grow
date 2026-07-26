const backToStoreButton =
document.querySelector("#back-to-store");

backToStoreButton.addEventListener(
"click",
function () {

window.location.href = "index.html";

}
);
const confirmationDetails =
document.querySelector(
"#confirmation-details"
);


const savedCart =
localStorage.getItem(
"readAndGrowCart"
);


const cart =
JSON.parse(
savedCart
) || [];


let total = 0;


let orderHTML = "";


cart.forEach(
function (book) {

const subtotal =
book.price *
book.quantity;


total =
total +
subtotal;


orderHTML += `

<p>
<strong>
${book.name}
</strong>
</p>

<p>
Quantity:
${book.quantity}
</p>

<p>
Subtotal:
$${subtotal.toFixed(2)}
</p>

<hr>

`;

}
);


confirmationDetails.innerHTML = `

${orderHTML}

<h3>
Total:
$${total.toFixed(2)}
</h3>

<p>
Payment status:
Successful
</p>

`;