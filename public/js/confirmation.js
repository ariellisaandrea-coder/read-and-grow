
/*
==================================================
READ AND GROW - ORDER CONFIRMATION PAGE
SECURITY-HARDENED VERSION
==================================================
*/

const confirmationDetails = document.querySelector(
    "#confirmation-details"
);

const backToStore = document.querySelector(
    "#back-to-store"
);

/*
==================================================
HELPERS
==================================================
*/

// Format monetary values safely.
function formatMoney(amount) {
    const value = Number(amount);

    return "$" + (
        Number.isFinite(value) && value >= 0
            ? value.toFixed(2)
            : "0.00"
    );
}

// Create a DOM element without interpreting text as HTML.
function createElement(tagName, textContent, className) {
    const element = document.createElement(tagName);

    if (textContent !== undefined && textContent !== null) {
        element.textContent = String(textContent);
    }

    if (className) {
        element.className = className;
    }

    return element;
}

// Display an error safely.
function showError(message) {
    confirmationDetails.replaceChildren(
        createElement("p", message, "error-message")
    );
}

// Display a neutral status message safely.
function showMessage(message) {
    confirmationDetails.replaceChildren(
        createElement("p", message)
    );
}

// Accept an ISO date or another valid date value.
function formatDate(value) {
    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
}

/*
==================================================
READ THE LAST ORDER IDENTIFIER
==================================================
*/

// localStorage identifies the order to retrieve.
// It is NOT trusted as proof of payment or ownership.
function loadLastOrderId() {
    const raw = localStorage.getItem("lastOrder");

    if (!raw) {
        return null;
    }

    try {
        const receipt = JSON.parse(raw);

        if (
            !receipt ||
            typeof receipt !== "object" ||
            Array.isArray(receipt)
        ) {
            return null;
        }

        const id = receipt.orderId ?? receipt.id;

        if (
            id === undefined ||
            id === null ||
            !/^[1-9]\d*$/.test(String(id))
        ) {
            return null;
        }

        return String(id);
    } catch (error) {
        console.error(
            "Invalid lastOrder in localStorage:",
            error
        );

        return null;
    }
}

/*
==================================================
NORMALIZE SERVER ORDER ITEMS
==================================================
*/

function normalizeItems(rawItems) {
    let items = rawItems;

    // Some APIs store the items field as JSON text.
    if (typeof items === "string") {
        try {
            items = JSON.parse(items);
        } catch (error) {
            console.error(
                "Could not parse order items:",
                error
            );

            return [];
        }
    }

    if (!Array.isArray(items)) {
        return [];
    }

    return items.filter(function (item) {
        return (
            item &&
            typeof item === "object" &&
            !Array.isArray(item)
        );
    });
}

/*
==================================================
LOAD OFFICIAL BOOK DATA
==================================================
*/

// Book data supplies missing titles only.
// Order quantities and prices remain order data.
async function loadBookTitles() {
    const response = await fetch("/api/books");

    if (!response.ok) {
        throw new Error("Unable to load book details.");
    }

    const data = await response.json();

    const books = Array.isArray(data)
        ? data
        : Array.isArray(data.books)
            ? data.books
            : [];

    return books;
}

/*
==================================================
RENDER ORDER SUMMARY
==================================================
*/

function renderOrderSummary(order) {
    const summary = createElement(
        "dl",
        undefined,
        "order-summary"
    );

    const isPaid = String(order.status || "")
        .toLowerCase() === "paid";

    const orderId = order.id ?? order.orderId;

    const rows = [
        ["Order Number", "#" + orderId],
        ["Status", order.status || "Unknown"],
        [
            isPaid ? "Total Paid" : "Order Total",
            formatMoney(order.total)
        ],
        ["Date", formatDate(order.created_at ?? order.paidAt)]
    ];

    rows.forEach(function (row) {
        summary.append(
            createElement("dt", row[0]),
            createElement("dd", row[1])
        );
    });

    confirmationDetails.replaceChildren(
        summary,
        createElement("h3", "Books Purchased")
    );

    return isPaid;
}

/*
==================================================
RENDER PURCHASED BOOKS
==================================================
*/

function renderItems(items, books) {
    const container = createElement(
        "div",
        undefined,
        "confirmation-items"
    );

    if (items.length === 0) {
        container.append(
            createElement(
                "p",
                "No item details are available for this order."
            )
        );

        confirmationDetails.append(container);
        return;
    }

    items.forEach(function (item) {
        const bookId = Number(item.bookId ?? item.id);

        const book = books.find(function (candidate) {
            return Number(candidate.id) === bookId;
        });

        const title =
            item.title ||
            (book && book.title) ||
            "Book details unavailable";

        const quantity = Number(item.quantity);

        const safeQuantity =
            Number.isInteger(quantity) && quantity > 0
                ? quantity
                : 1;

        const rawUnitPrice =
            item.unitPrice !== undefined
                ? item.unitPrice
                : item.unit_price !== undefined
                    ? item.unit_price
                    : item.price !== undefined
                        ? item.price
                        : book
                            ? book.price
                            : 0;

        const unitPrice = Number(rawUnitPrice);

        const safeUnitPrice =
            Number.isFinite(unitPrice) && unitPrice >= 0
                ? unitPrice
                : 0;

        const rawSubtotal = Number(item.subtotal);

        const subtotal =
            item.subtotal !== undefined &&
            Number.isFinite(rawSubtotal) &&
            rawSubtotal >= 0
                ? rawSubtotal
                : safeUnitPrice * safeQuantity;

        const itemElement = createElement(
            "div",
            undefined,
            "confirmation-item"
        );

        itemElement.append(
            createElement("p", title, "confirmation-book-title"),
            createElement("p", "Quantity: " + safeQuantity),
            createElement(
                "p",
                "Unit Price: " + formatMoney(safeUnitPrice)
            ),
            createElement(
                "p",
                "Subtotal: " + formatMoney(subtotal)
            ),
            document.createElement("hr")
        );

        container.append(itemElement);
    });

    confirmationDetails.append(container);
}

/*
==================================================
FETCH THE AUTHORITATIVE ORDER FROM THE SERVER
==================================================
*/

async function loadOrderConfirmation(orderId) {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        showError(
            "Please sign in to view your order. " +
            "Your order details have not been deleted."
        );

        return;
    }

    showMessage("Loading your order confirmation...");

    try {
        const response = await fetch(
            "/api/orders/" + encodeURIComponent(orderId),
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Accept": "application/json"
                }
            }
        );

        if (response.status === 401) {
            showError(
                "Your login session has expired. " +
                "Please sign in again to view your order."
            );

            return;
        }

        if (response.status === 403 || response.status === 404) {
            showError(
                "This order could not be accessed. " +
                "Please check your account and order details."
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                "The server could not load your order."
            );
        }

        const data = await response.json();

        if (!data || data.success !== true || !data.order) {
            throw new Error(
                "The server returned an invalid order response."
            );
        }

        const order = data.order;

        // Confirm the returned order matches the requested order.
        const returnedId = order.id ?? order.orderId;

        if (
            returnedId === undefined ||
            returnedId === null ||
            String(returnedId) !== String(orderId)
        ) {
            throw new Error(
                "The returned order did not match the request."
            );
        }

        // Never infer a paid status from missing data.
        if (
            typeof order.status !== "string" ||
            !order.status.trim()
        ) {
            throw new Error(
                "The order status is unavailable. " +
                "Please contact support before treating this " +
                "order as paid."
            );
        }

        renderOrderSummary(order);

        const items = normalizeItems(order.items);

        let books = [];

        // Book titles are supplementary display data.
        // Failure to load them must not change order status.
        try {
            books = await loadBookTitles();
        } catch (error) {
            console.error(
                "Could not load book titles:",
                error
            );
        }

        renderItems(items, books);

    } catch (error) {
        console.error(
            "Order confirmation error:",
            error
        );

        showError(
            "We could not load your order confirmation. " +
            "Please try again."
        );
    }
}

/*
==================================================
BACK TO STORE
==================================================
*/

if (backToStore) {
    backToStore.addEventListener("click", function () {
        // Remove stale navigation data, not the server order.
        localStorage.removeItem("lastOrder");
        localStorage.removeItem("readAndGrowCart");

        window.location.href = "index.html";
    });
}

/*
==================================================
INITIALIZE
==================================================
*/

if (!confirmationDetails) {
    console.error(
        "Confirmation page is missing #confirmation-details."
    );
} else {
    const orderId = loadLastOrderId();

    if (!orderId) {
        showError(
            "No recent order was found. " +
            "Please return to the bookstore or check your orders."
        );
    } else {
        loadOrderConfirmation(orderId);
    }
}
