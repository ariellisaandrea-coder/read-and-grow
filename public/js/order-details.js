const orderMessage =
    document.querySelector("#order-message");

const orderDetails =
    document.querySelector("#order-details");

const backToOrdersButton =
    document.querySelector("#back-to-orders");

const backToStoreButton =
    document.querySelector("#back-to-store");


backToOrdersButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "orders.html";

    }
);


backToStoreButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


const jwtToken =
    localStorage.getItem("jwtToken");


const urlParams =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    Number(
        urlParams.get("id")
    );


if (!jwtToken) {

    orderMessage.textContent =
        "Please log in to view your order.";


    setTimeout(function() {

        window.location.href =
            "login.html";

    }, 1500);

} else if (
    !Number.isInteger(orderId) ||
    orderId <= 0
) {

    orderMessage.textContent =
        "Invalid order ID.";

} else {

    loadOrder();

}


function createLabelParagraph(
    label,
    value
) {

    const paragraph =
        document.createElement("p");


    const strong =
        document.createElement("strong");


    strong.textContent =
        label + ":";


    paragraph.appendChild(
        strong
    );


    paragraph.appendChild(
        document.createTextNode(
            " " + String(value ?? "")
        )
    );


    return paragraph;

}


function createMoneyParagraph(
    label,
    value
) {

    const paragraph =
        document.createElement("p");


    const numericValue =
        Number(value);


    const formattedValue =
        Number.isFinite(numericValue)
            ? numericValue.toFixed(2)
            : "0.00";


    paragraph.textContent =
        label + ": $" +
        formattedValue;


    return paragraph;

}


function loadOrder() {

    orderMessage.textContent =
        "Loading order details.";


    fetch(
        `/api/orders/${orderId}`,
        {
            headers: {
                "Authorization":
                    "Bearer " + jwtToken
            }
        }
    )

    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load order."
                    );

                }

                return data;

            });

    })

    .then(function(data) {

        console.log(
            "Order details response:",
            data
        );


        if (
            !data.success ||
            !data.order
        ) {

            throw new Error(
                "Invalid order response."
            );

        }


        const order =
            data.order;


        const items =
            order.items;


        if (
            !Array.isArray(items)
        ) {

            throw new Error(
                "Invalid order items."
            );

        }


        orderMessage.textContent =
            "Order loaded successfully.";


        const fragment =
            document.createDocumentFragment();


        // ==========================================
        // ORDER ID
        // ==========================================

        fragment.appendChild(
            createLabelParagraph(
                "Order ID",
                order.id
            )
        );


        // ==========================================
        // STATUS
        // ==========================================

        fragment.appendChild(
            createLabelParagraph(
                "Status",
                order.status
            )
        );


        // ==========================================
        // PAYMENT METHOD
        // ==========================================

        fragment.appendChild(
            createLabelParagraph(
                "Payment Method",
                order.payment_method
            )
        );


        // ==========================================
        // ORDER DATE
        // ==========================================

        const orderDate =
            new Date(
                order.created_at
            );


        fragment.appendChild(
            createLabelParagraph(
                "Order Date",
                orderDate.toLocaleString()
            )
        );


        // ==========================================
        // BOOKS HEADING
        // ==========================================

        const booksHeading =
            document.createElement("h3");


        booksHeading.textContent =
            "Books Purchased";


        fragment.appendChild(
            booksHeading
        );


        // ==========================================
        // ORDER ITEMS
        // ==========================================

        items.forEach(
            function(item) {

                const itemContainer =
                    document.createElement("div");


                itemContainer.className =
                    "order-item";


                const title =
                    document.createElement("h4");


                title.textContent =
                    String(
                        item.title || ""
                    );


                itemContainer.appendChild(
                    title
                );


                const quantity =
                    document.createElement("p");


                quantity.textContent =
                    "Quantity: " +
                    String(
                        item.quantity ?? ""
                    );


                itemContainer.appendChild(
                    quantity
                );


                itemContainer.appendChild(
                    createMoneyParagraph(
                        "Unit Price",
                        item.unitPrice
                    )
                );


                itemContainer.appendChild(
                    createMoneyParagraph(
                        "Subtotal",
                        item.subtotal
                    )
                );


                itemContainer.appendChild(
                    document.createElement("hr")
                );


                fragment.appendChild(
                    itemContainer
                );

            }
        );


        // ==========================================
        // TOTAL
        // ==========================================

        const totalHeading =
            document.createElement("h3");


        const total =
            Number(order.total);


        totalHeading.textContent =
            "Total: $" +
            (
                Number.isFinite(total)
                    ? total.toFixed(2)
                    : "0.00"
            );


        fragment.appendChild(
            totalHeading
        );


        // ==========================================
        // DISPLAY
        // ==========================================

        orderDetails.replaceChildren(
            fragment
        );

    })

    .catch(function(error) {

        console.error(
            "Order details error:",
            error
        );


        orderMessage.textContent =
            error.message ||
            "Unable to load order details.";

    });

}