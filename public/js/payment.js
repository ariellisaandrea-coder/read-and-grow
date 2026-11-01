/*
==================================================
READ AND GROW - PAYMENT PAGE
==================================================
*/

const cardInput = document.querySelector("#card-number");
const expiryInput = document.querySelector("#card-expiry");
const cvvInput = document.querySelector("#card-cvv");
const payButton = document.querySelector("#pay-button");
const paymentMessage = document.querySelector("#payment-message");

/*
==================================================
HELPERS
==================================================
*/

function showMessage(text) {
    paymentMessage.textContent = text;
}

function getJwtToken() {
    return localStorage.getItem("jwtToken");
}

function getCart() {
    const savedCart = localStorage.getItem("readAndGrowCart");
    if (!savedCart) return [];

    try {
        const cart = JSON.parse(savedCart);
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Invalid cart in localStorage:", error);
        return [];
    }
}

/*
Normalize cart items to the shape the server expects:
{ bookId: number, quantity: number }
*/
function normalizeCartItems(cart) {
    return cart
        .map(function (item) {
            const bookId = Number(item.bookId ?? item.id);
            const quantity = Number(item.quantity ?? 1);
            return { bookId, quantity };
        })
        .filter(function (item) {
            return (
                Number.isSafeInteger(item.bookId) &&
                item.bookId > 0 &&
                Number.isSafeInteger(item.quantity) &&
                item.quantity > 0
            );
        });
}

/*
==================================================
VALIDATION
==================================================
*/

function validateCardDetails(cardNumber, expiry, cvv) {
    if (!/^\d{12,19}$/.test(cardNumber)) {
        return "Enter a valid card number (12-19 digits).";
    }

    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) {
        return "Enter a valid expiry date (MM/YY).";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        return "Enter a valid CVV.";
    }

    return null;
}

/*
==================================================
PAYMENT HANDLER
==================================================
*/

async function handlePayment() {
    const cardNumber = cardInput.value.trim().replace(/\s/g, "");
    const expiry = expiryInput.value.trim();
    const cvv = cvvInput.value.trim();

    // 1. Validate card fields
    const validationError = validateCardDetails(cardNumber, expiry, cvv);

    if (validationError) {
        showMessage(validationError);
        return;
    }

    // 2. Validate auth
    const jwtToken = getJwtToken();

    if (!jwtToken) {
        showMessage("Please log in before paying.");
        return;
    }

    // 3. Validate cart
    const cart = getCart();
    const items = normalizeCartItems(cart);

    if (items.length === 0) {
        showMessage("Your cart is empty.");
        return;
    }

    // 4. Send request
    showMessage("Processing payment...");
    payButton.disabled = true;

    try {
        /*
        The server endpoint /api/payments/card creates the order
        AND marks it paid in a single step. It expects:
            { cardNumber, expiry, cvv, items }
        */
        const response = await fetch("/api/payments/card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                cardNumber,
                expiry,
                cvv,
                items
            })
        });

        /*
        Read the body as text first so we can give a helpful
        error when the server returns HTML instead of JSON
        (e.g. a 404 that falls through to index.html).
        */
        const rawText = await response.text();

        let data = null;

        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("Server returned non-JSON:", rawText.slice(0, 200));
            throw new Error(
                `Server error (${response.status}). Please try again.`
            );
        }

        if (!response.ok) {
            throw new Error(data.message || "Payment failed.");
        }

        // 5. Success
        console.log("Server response:", data);
        showMessage("Payment successful! Redirecting...");
        payButton.textContent = "Payment Complete";

        // Build a full receipt the confirmation page can render
const receipt = {
    orderId: data.orderId,
    total: data.total,
    status: data.status,
    paidAt: new Date().toISOString(),
    items: items.map(function (item) {
        const cartMatch = cart.find(function (c) {
            const cId = Number(c.id ?? c.bookId);
            return cId === item.bookId;
        }) || {};

        return {
            bookId: item.bookId,
            title: cartMatch.title || cartMatch.name || "Unknown book",
            quantity: item.quantity,
            unitPrice: Number(cartMatch.price) || 0,
            subtotal: (Number(cartMatch.price) || 0) * item.quantity
        };
    })
};

localStorage.setItem("lastOrder", JSON.stringify(receipt));

        setTimeout(function () {
            window.location.href = "confirmation.html";
        }, 1500);

    } catch (error) {
        console.error("Payment error:", error);
        showMessage(error.message || "There was a problem processing the payment.");
        payButton.disabled = false;
    }
}

/*
==================================================
EVENT LISTENERS
==================================================
*/

payButton.addEventListener("click", handlePayment);