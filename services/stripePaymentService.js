const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


async function createStripeCheckoutSession(order, orderItems) {

const lineItems = orderItems.map(function(item) {

return {
price_data: {
currency: "usd",

product_data: {
name: item.title,

description: item.author
? `By ${item.author}`
: undefined
},

unit_amount:
Math.round(item.unit_price * 100)
},

quantity: item.quantity
};

});


const session =
await stripe.checkout.sessions.create({

mode: "payment",

line_items: lineItems,

success_url:
"http://localhost:3000/confirmation.html?session_id={CHECKOUT_SESSION_ID}",

cancel_url:
"http://localhost:3000/checkout.html?payment=cancelled",

metadata: {
orderId: String(order.id),
userId: String(order.user_id)
}

});


return session;
}


async function retrieveStripeCheckoutSession(sessionId) {

return await stripe.checkout.sessions.retrieve(
sessionId
);

}


function constructStripeWebhookEvent(
rawBody,
signature
) {

return stripe.webhooks.constructEvent(
rawBody,
signature,
process.env.STRIPE_WEBHOOK_SECRET
);

}
module.exports = {
createStripeCheckoutSession,
retrieveStripeCheckoutSession,
constructStripeWebhookEvent
};
