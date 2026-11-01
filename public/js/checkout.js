const checkoutItems = document.querySelector("#checkout-items");
const checkoutTotal = document.querySelector("#checkout-total");

// ------------------------------------------------------------------
// Normalize cart items into { id, title, price, quantity }.
// ------------------------------------------------------------------

function normalizeItem(raw) {
  if (typeof raw === "number") {
    return {
      id: raw,
      title: null,
      price: null,
      quantity: 1
    };
  }

  return {
    id: raw.id !== undefined
      ? raw.id
      : (raw.bookId !== undefined ? raw.bookId : null),

    title: raw.title || raw.name || null,

    price: raw.price !== undefined
      ? Number(raw.price)
      : null,

    quantity: Number(raw.quantity) || 1
  };
}


// ------------------------------------------------------------------
// Display cart items safely using DOM elements and textContent.
// ------------------------------------------------------------------

function renderCart(fullCart) {
  checkoutItems.replaceChildren();

  let total = 0;

  if (fullCart.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.textContent = "Your cart is empty.";

    checkoutItems.appendChild(emptyMessage);

    checkoutTotal.textContent = "Total: $0.00";

    return;
  }

  fullCart.forEach(function (book) {
    const name = book.title || "Unknown book";
    const qty = Number(book.quantity) || 1;
    const price = Number(book.price) || 0;
    const subtotal = price * qty;

    const bookElement = document.createElement("div");

    const titleParagraph = document.createElement("p");
    const strongTitle = document.createElement("strong");

    strongTitle.textContent = String(name);
    titleParagraph.appendChild(strongTitle);

    const quantityParagraph = document.createElement("p");
    quantityParagraph.textContent = "Quantity: " + qty;

    const subtotalParagraph = document.createElement("p");
    subtotalParagraph.textContent =
      "Subtotal: $" + subtotal.toFixed(2);

    const separator = document.createElement("hr");

    bookElement.appendChild(titleParagraph);
    bookElement.appendChild(quantityParagraph);
    bookElement.appendChild(subtotalParagraph);
    bookElement.appendChild(separator);

    checkoutItems.appendChild(bookElement);

    total += subtotal;
  });

  checkoutTotal.textContent =
    "Total: $" + total.toFixed(2);
}


// ------------------------------------------------------------------
// Load official book data and complete the saved cart.
// ------------------------------------------------------------------

const savedCart = localStorage.getItem("readAndGrowCart");
const rawCart = savedCart ? JSON.parse(savedCart) : [];

console.log("Cart contents:", rawCart);

fetch("/api/books")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Unable to load books.");
    }

    return response.json();
  })
  .then(function (books) {
    const fullCart = rawCart.map(function (raw) {
      const item = normalizeItem(raw);

      const match = books.find(function (book) {
        return book.id === Number(item.id);
      });

      if (match) {
        item.title = item.title || match.title;

        item.price = item.price !== null
          ? item.price
          : Number(match.price);
      }

      return item;
    });

    localStorage.setItem(
      "readAndGrowCart",
      JSON.stringify(fullCart)
    );

    renderCart(fullCart);
  })
  .catch(function (error) {
    console.error("Could not fetch books:", error);

    renderCart(rawCart.map(normalizeItem));
  });


// ------------------------------------------------------------------
// Payment method selection.
// ------------------------------------------------------------------

const paymentOptions = document.querySelectorAll(
  'input[name="payment-method"]'
);

const paymentDetails = document.querySelector("#payment-details");

function displayPaymentDetails(heading, message) {
  paymentDetails.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = heading;

  const description = document.createElement("p");
  description.textContent = message;

  paymentDetails.appendChild(title);
  paymentDetails.appendChild(description);
}

paymentOptions.forEach(function (option) {
  option.addEventListener("change", function () {
    if (option.value === "card") {
      displayPaymentDetails(
        "Card Payment",
        "You will continue to a secure payment checkout."
      );
    } else if (option.value === "paypal") {
      displayPaymentDetails(
        "PayPal",
        "You will continue to PayPal's secure checkout."
      );
    } else if (option.value === "account") {
      displayPaymentDetails(
        "Account Payment",
        "Sign in or create an account to continue."
      );
    }
  });
});


// ------------------------------------------------------------------
// Continue to payment.
// ------------------------------------------------------------------

const continueButton = document.querySelector("#continue-payment");

continueButton.addEventListener("click", function () {
  let selectedPayment = null;

  paymentOptions.forEach(function (option) {
    if (option.checked) {
      selectedPayment = option.value;
    }
  });

  if (selectedPayment === null) {
    alert("Please choose a payment method.");
    return;
  }

  localStorage.setItem("selectedPayment", selectedPayment);

  window.location.href = "payment.html";
});