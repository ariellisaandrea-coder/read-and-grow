const ordersMessage =
    document.querySelector("#orders-message");

const ordersContainer =
    document.querySelector("#orders-container");

const backToStoreButton =
    document.querySelector("#back-to-store");


const jwtToken =
    localStorage.getItem("jwtToken");


backToStoreButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


if (!jwtToken) {

    ordersMessage.textContent =
        "Please log in to view your orders.";


    setTimeout(function() {

        window.location.href =
            "login.html";

    }, 1500);

} else {

    loadOrders();

}


function createOrderParagraph(
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


function loadOrders() {

    fetch(
        "/api/orders",
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
                        "Unable to load your orders."
                    );

                }

                return data;

            });

    })

    .then(function(data) {

        console.log(
            "Order history response:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(data.orders)
        ) {

            throw new Error(
                "Invalid order history response."
            );

        }


        if (
            data.orders.length === 0
        ) {

            ordersMessage.textContent =
                "You have no orders yet.";

            return;

        }


        ordersMessage.textContent =
            "Here is your order history.";


        data.orders.forEach(
            function(order) {

                const orderElement =
                    document.createElement("div");


                orderElement.className =
                    "order-history-item";


                // ==========================================
                // ORDER TITLE
                // ==========================================

                const orderTitle =
                    document.createElement("h3");


                orderTitle.textContent =
                    "Order #" +
                    String(order.id);


                orderElement.appendChild(
                    orderTitle
                );


                // ==========================================
                // ORDER DATE
                // ==========================================

                const date =
                    new Date(
                        order.created_at
                    );


                const formattedDate =
                    date.toLocaleString();


                orderElement.appendChild(
                    createOrderParagraph(
                        "Date",
                        formattedDate
                    )
                );


                // ==========================================
                // STATUS
                // ==========================================

                orderElement.appendChild(
                    createOrderParagraph(
                        "Status",
                        order.status
                    )
                );


                // ==========================================
                // PAYMENT METHOD
                // ==========================================

                orderElement.appendChild(
                    createOrderParagraph(
                        "Payment Method",
                        order.payment_method
                    )
                );


                // ==========================================
                // TOTAL
                // ==========================================

                const total =
                    Number(order.total);


                const formattedTotal =
                    Number.isFinite(total)
                        ? "$" + total.toFixed(2)
                        : "$0.00";


                orderElement.appendChild(
                    createOrderParagraph(
                        "Total",
                        formattedTotal
                    )
                );


                // ==========================================
                // VIEW ORDER BUTTON
                // ==========================================

                const viewButton =
                    document.createElement("button");


                viewButton.className =
                    "view-order-button";


                viewButton.dataset.orderId =
                    String(order.id);


                viewButton.textContent =
                    "View Order";


                orderElement.appendChild(
                    viewButton
                );


                // ==========================================
                // SEPARATOR
                // ==========================================

                orderElement.appendChild(
                    document.createElement("hr")
                );


                ordersContainer.appendChild(
                    orderElement
                );

            }
        );

    })

    .catch(function(error) {

        console.error(
            "Order history error:",
            error
        );


        ordersMessage.textContent =
            error.message ||
            "Unable to load your orders.";

    });

}


// ==========================================
// VIEW ORDER
// ==========================================

ordersContainer.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.classList.contains(
                "view-order-button"
            )
        ) {

            return;

        }


        const orderId =
            Number(
                event.target.dataset.orderId
            );


        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            console.error(
                "Invalid order ID."
            );

            return;

        }


        window.location.href =
            `order-details.html?id=${orderId}`;

    }
);