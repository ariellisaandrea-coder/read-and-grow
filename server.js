/*
==================================================
READ AND GROW - SERVER
==================================================
*/

require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

/*
==================================================
ENVIRONMENT VALIDATION
==================================================
*/
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not configured.");
    process.exit(1);
}

/*
==================================================
PRODUCTION PROXY
==================================================
*/
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

/*
==================================================
BASIC SECURITY HEADERS
==================================================
*/
app.disable("x-powered-by");

app.use(function (request, response, next) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

/*
==================================================
JSON BODY PARSER
==================================================
*/
app.use(express.json({ limit: "100kb" }));

/*
==================================================
RATE LIMITERS
==================================================
*/
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

/*
==================================================
VALIDATION CONSTANTS
==================================================
*/
const MAX_FULL_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_BOOK_TITLE_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 150;
const MAX_CATEGORY_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_BOOK_PRICE = 1000000;
const MAX_ORDER_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 100;

/*
==================================================
JWT AUTHENTICATION
==================================================
*/
function verifyJWT(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return response.status(401).json({
            success: false,
            message: "JWT authentication required."
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return response.status(401).json({
            success: false,
            message: "Invalid Authorization header."
        });
    }

    const token = authHeader.substring(7);

    if (!token) {
        return response.status(401).json({
            success: false,
            message: "Invalid Authorization header."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
        next();
    } catch (error) {
        return response.status(401).json({
            success: false,
            message: "Invalid or expired JWT."
        });
    }
}

/*
==================================================
ADMIN AUTHORIZATION
==================================================
*/
function requireJWTAdmin(request, response, next) {
    if (!request.user) {
        return response.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (request.user.role !== "admin") {
        return response.status(403).json({
            success: false,
            message: "Admin access required."
        });
    }

    next();
}

/*
==================================================
DEFAULT BOOK DATA
==================================================
*/
const defaultBooks = [
    {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Improvement",
        price: 3.99,
        image: "images/atomic-habits.jpg",
        description: "A bestselling guide that teaches how small daily habits can produce remarkable long-term results through practical systems instead of relying on motivation alone."
    },
    {
        title: "Deep Work",
        author: "Cal Newport",
        category: "Self Improvement",
        price: 4.99,
        image: "images/deep-work.jpg",
        description: "Learn how to eliminate distractions, improve focus, and produce high-quality work in a world filled with constant interruptions."
    },
    {
        title: "Zero to One",
        author: "Peter Thiel",
        category: "Business",
        price: 1.99,
        image: "images/zero-to-one.jpg",
        description: "Peter Thiel explains how entrepreneurs can create innovative companies by building something completely new instead of competing in existing markets."
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        price: 8.99,
        image: "images/clean-code.jpg",
        description: "One of the most respected programming books ever written, teaching developers how to write clean, maintainable, and professional software."
    },
    {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt & David Thomas",
        category: "Programming",
        price: 9.99,
        image: "images/pragmatic-programmer.jpg",
        description: "A timeless guide filled with practical advice, software engineering principles, and career lessons for modern programmers."
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        category: "Finance",
        price: 6.99,
        image: "images/rich-dad-poor-dad.jpg",
        description: "An introduction to financial literacy that compares two different mindsets about money, investing, assets, and long-term wealth."
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Finance",
        price: 8.49,
        image: "images/psychology-of-money.jpg",
        description: "Discover why managing money is often more about behavior and decision-making than mathematical skill."
    },
    {
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "Business",
        price: 7.99,
        image: "images/lean-startup.jpg",
        description: "Learn how startups can build products faster, test ideas with customers, and reduce business risk through continuous innovation."
    },
    {
        title: "The Right kind of Wrong",
        author: "Monica Mccallan",
        category: "Lesbian fiction",
        price: 2.49,
        image: "images/the-right-kind-of-wrong.jpg",
        description: "The lives that they've both been thrown into are all wrong, but they may find out that's exactly what makes everything between them so right."
    },
    {   title: "Fingersmith",
        author: "Sarah Waters",
        category: "Lesbian fiction",
        price: 2.00,
        image: "images/fingersmith.jpg",
        description:"The book starts with Sue Trinder's story. She is an orphan who grows up among petty thieves called fingersmiths."
     },

     {  title: "Tomorrow's Promise",
        author: "Radclyffe",
        category: "Lesbian fiction",
        price: 2.49,
        image: "images/tomorrow's-promise.jpg",
        description:"Two women seek healing on Whitley Point: Adrienne escapes her past while Tanner drowns her grief in wild nights. A summer romance about healing through passion."
     },

     {   title: "Poppy Jenkins",
        author: "Clare Ashton",
        category: "Lesbian fiction",
        price: 2.00,
        image: "images/poppy-jenkins.jpg",
        description:"In a Welsh village, Poppy's quiet life is disrupted when her former best friend Rosalyn returns, sparking potential romance and challenging small-town attitudes."
     }

];

/*
==================================================
BOOK DATABASE BOOTSTRAP
==================================================
*/
const bookCount = db.prepare("SELECT COUNT(*) AS total FROM books").get();

if (bookCount.total === 0) {
    const insertBook = db.prepare(`
        INSERT INTO books (title, author, category, price, image, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertDefaultBooks = db.transaction(function () {
        for (const book of defaultBooks) {
            insertBook.run(
                book.title,
                book.author,
                book.category,
                book.price,
                book.image,
                book.description
            );
        }
    });

    insertDefaultBooks();
    console.log("Default books inserted.");
}

/*
==================================================
HELPER: VALIDATE BOOK INPUT
==================================================
*/
function validateBookInput(body) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);

    if (
        !title || !author || !category ||
        !Number.isFinite(price) || price < 0 || price > MAX_BOOK_PRICE
    ) {
        return { error: "Please provide valid book information." };
    }

    if (
        title.length > MAX_BOOK_TITLE_LENGTH ||
        author.length > MAX_AUTHOR_LENGTH ||
        category.length > MAX_CATEGORY_LENGTH ||
        description.length > MAX_DESCRIPTION_LENGTH
    ) {
        return { error: "One or more book fields are too long." };
    }

    return {
        data: {
            title,
            author,
            category,
            description,
            price: Math.round(price * 100) / 100
        }
    };
}

/*
==================================================
PUBLIC BOOK ROUTES
==================================================
*/
app.get("/api/books", function (request, response) {
    const books = db.prepare("SELECT * FROM books ORDER BY id ASC").all();
    response.json(books);
});

app.get("/api/books/:id", function (request, response) {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return response.status(400).json({
            success: false,
            message: "Invalid book ID."
        });
    }

    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);

    if (!book) {
        return response.status(404).json({
            success: false,
            message: "Book not found."
        });
    }

    response.json({ success: true, book });
});

/*
==================================================
JWT TEST
==================================================
*/
app.get("/api/jwt-test", verifyJWT, function (request, response) {
    response.json({
        success: true,
        message: "JWT verified successfully.",
        user: request.user
    });
});

/*
==================================================
ADMIN BOOK ROUTES
==================================================
*/
app.get("/api/admin/books", verifyJWT, requireJWTAdmin, function (request, response) {
    const books = db.prepare("SELECT * FROM books ORDER BY id ASC").all();
    response.json(books);
});

app.post("/api/admin/books", verifyJWT, requireJWTAdmin, function (request, response) {
    const result = validateBookInput(request.body || {});

    if (result.error) {
        return response.status(400).json({
            success: false,
            message: result.error
        });
    }

    const { title, author, category, description, price } = result.data;

    const insertBook = db.prepare(`
        INSERT INTO books (title, author, category, price, image, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertResult = insertBook.run(
        title,
        author,
        category,
        price,
        "images/book-placeholder.png",
        description
    );

    const newBook = db.prepare("SELECT * FROM books WHERE id = ?").get(
        insertResult.lastInsertRowid
    );

    console.log("Book saved to database:", newBook.id);

    return response.status(201).json({
        success: true,
        message: "Book added successfully.",
        book: newBook
    });
});

app.put("/api/admin/books/:id", verifyJWT, requireJWTAdmin, function (request, response) {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return response.status(400).json({
            success: false,
            message: "Invalid book ID."
        });
    }

    const result = validateBookInput(request.body || {});

    if (result.error) {
        return response.status(400).json({
            success: false,
            message: result.error
        });
    }

    const { title, author, category, description, price } = result.data;

    const updateResult = db.prepare(`
        UPDATE books
        SET title = ?, author = ?, category = ?, price = ?, description = ?
        WHERE id = ?
    `).run(title, author, category, price, description, id);

    if (updateResult.changes === 0) {
        return response.status(404).json({
            success: false,
            message: "Book not found."
        });
    }

    const updatedBook = db.prepare("SELECT * FROM books WHERE id = ?").get(id);

    console.log("Book updated:", id);

    return response.json({
        success: true,
        message: "Book updated successfully.",
        book: updatedBook
    });
});

app.delete("/api/admin/books/:id", verifyJWT, requireJWTAdmin, function (request, response) {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return response.status(400).json({
            success: false,
            message: "Invalid book ID."
        });
    }

    try {
        const result = db.prepare("DELETE FROM books WHERE id = ?").run(id);

        if (result.changes === 0) {
            return response.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        console.log("Book deleted:", id);

        return response.json({
            success: true,
            message: "Book deleted successfully."
        });
    } catch (error) {
        if (error && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            console.warn("Book deletion blocked by foreign-key constraint:", id);
            return response.status(409).json({
                success: false,
                message: "This book cannot be deleted because it is associated with existing orders or library records."
            });
        }

        console.error("Book deletion error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to delete book."
        });
    }
});

/*
==================================================
USER SIGNUP
==================================================
*/
app.post("/api/signup", async function (request, response) {
    const body = request.body || {};

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!fullName || !email || !password) {
        return response.status(400).json({
            success: false,
            message: "Full name, email, and password are required."
        });
    }

    if (fullName.length > MAX_FULL_NAME_LENGTH) {
        return response.status(400).json({
            success: false,
            message: "Full name is too long."
        });
    }

    if (email.length > MAX_EMAIL_LENGTH) {
        return response.status(400).json({
            success: false,
            message: "Email address is too long."
        });
    }

    if (password.length < 8) {
        return response.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        return response.status(400).json({
            success: false,
            message: "Password is too long. Please use a password of 72 bytes or fewer."
        });
    }

    try {
        const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

        if (existingUser) {
            return response.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare(`
            INSERT INTO users (full_name, email, password, created_at)
            VALUES (?, ?, ?, ?)
        `).run(fullName, email, hashedPassword, new Date().toISOString());

        console.log("New user registered:", email);

        return response.status(201).json({
            success: true,
            message: "Account created successfully."
        });
    } catch (error) {
        console.error("Signup error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

/*
==================================================
USER LOGIN
==================================================
*/
app.post("/api/login", loginLimiter, async function (request, response) {
    const body = request.body || {};

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
        return response.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    if (email.length > MAX_EMAIL_LENGTH) {
        return response.status(400).json({
            success: false,
            message: "Email address is too long."
        });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        return response.status(400).json({
            success: false,
            message: "Password is too long."
        });
    }

    try {
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const jwtToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("User logged in:", user.email);

        return response.json({
            success: true,
            message: "Login successful.",
            jwtToken,
            fullName: user.full_name,
            role: user.role
        });
    } catch (error) {
        console.error("Login error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to login."
        });
    }
});

/*
==================================================
USER PROFILE
==================================================
*/
app.get("/api/profile", verifyJWT, function (request, response) {
    const user = db.prepare(`
        SELECT full_name, email FROM users WHERE id = ?
    `).get(request.user.userId);

    if (!user) {
        return response.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    return response.json({
        success: true,
        fullName: user.full_name,
        email: user.email
    });
});

/*
==================================================
HELPER: VALIDATE AND PRICE ORDER ITEMS
==================================================
*/
function validateAndPriceOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return { error: "Order must contain at least one book.", status: 400 };
    }

    if (items.length > MAX_ORDER_ITEMS) {
        return { error: "Order contains too many items.", status: 400 };
    }

    let total = 0;
    const verifiedItems = [];
    const seenBookIds = new Set();

    for (const item of items) {
        const bookId = Number(item?.bookId);
        const quantity = Number(item?.quantity);

        if (
            !Number.isSafeInteger(bookId) ||
            !Number.isSafeInteger(quantity) ||
            bookId <= 0 ||
            quantity <= 0 ||
            quantity > MAX_QUANTITY_PER_ITEM
        ) {
            return { error: "Invalid order item.", status: 400 };
        }

        if (seenBookIds.has(bookId)) {
            return { error: "Duplicate books are not allowed in an order.", status: 400 };
        }

        seenBookIds.add(bookId);

        const book = db.prepare(`
            SELECT id, title, price FROM books WHERE id = ?
        `).get(bookId);

        if (!book) {
            return { error: "One of the selected books was not found.", status: 404 };
        }

        const unitPrice = Number(book.price);

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            return { error: "A selected book has an invalid price.", status: 500 };
        }

        const subtotal = Math.round(unitPrice * quantity * 100) / 100;
        total = Math.round((total + subtotal) * 100) / 100;

        verifiedItems.push({
            bookId: book.id,
            title: book.title,
            quantity,
            unitPrice,
            subtotal
        });
    }

    return { verifiedItems, total };
}

/*
==================================================
HELPER: CREATE ORDER TRANSACTION
==================================================
*/
function insertOrderWithItems(userId, verifiedItems, total, paymentMethod) {
    const createOrder = db.transaction(function () {
        const orderResult = db.prepare(`
            INSERT INTO orders
            (user_id, items, total, payment_method, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            userId,
            JSON.stringify(verifiedItems),
            total,
            paymentMethod,
            "pending",
            new Date().toISOString()
        );

        const orderId = Number(orderResult.lastInsertRowid);

        const insertItem = db.prepare(`
            INSERT INTO order_items
            (order_id, book_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of verifiedItems) {
            insertItem.run(
                orderId,
                item.bookId,
                item.quantity,
                item.unitPrice,
                item.subtotal
            );
        }

        return orderId;
    });

    return createOrder();
}

/*
==================================================
CREATE ORDER
==================================================
*/
app.post("/api/orders", verifyJWT, function (request, response) {
    try {
        const body = request.body || {};
        const userId = request.user.userId;
        const items = body.items;
        const paymentMethod = body.paymentMethod;

        const allowedPaymentMethods = ["card"];

        if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
            return response.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        const priced = validateAndPriceOrderItems(items);

        if (priced.error) {
            return response.status(priced.status).json({
                success: false,
                message: priced.error
            });
        }

        const orderId = insertOrderWithItems(
            userId,
            priced.verifiedItems,
            priced.total,
            paymentMethod
        );

        console.log("Order saved:", orderId);

        return response.status(201).json({
            success: true,
            message: "Order created successfully.",
            orderId,
            total: priced.total,
            status: "pending"
        });
    } catch (error) {
        console.error("Order creation error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to create order."
        });
    }
});


/*
==================================================
GET ONE ORDER
SECURITY-HARDENED VERSION
==================================================
*/

app.get("/api/orders/:id", verifyJWT, function (request, response) {
    try {
        const orderId = Number(request.params.id);

        // Validate the requested order ID.
        if (
            !Number.isSafeInteger(orderId) ||
            orderId <= 0
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        // Retrieve only an order belonging to the authenticated user.
        const order = db.prepare(`
            SELECT
                id,
                user_id,
                items,
                total,
                payment_method,
                status,
                created_at
            FROM orders
            WHERE id = ? AND user_id = ?
        `).get(orderId, request.user.userId);

        if (!order) {
            return response.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Validate the stored order items before returning them.
        let items;

        try {
            items = JSON.parse(order.items);
        } catch (parseError) {
            console.error(
                "Invalid stored order items for order:",
                order.id
            );

            return response.status(500).json({
                success: false,
                message: "Unable to load order details."
            });
        }

        if (!Array.isArray(items)) {
            console.error(
                "Stored order items are not an array for order:",
                order.id
            );

            return response.status(500).json({
                success: false,
                message: "Unable to load order details."
            });
        }

        // Do not expose the internal user_id in the response.
        const {
            user_id,
            items: storedItems,
            ...publicOrder
        } = order;

        return response.json({
            success: true,
            order: {
                ...publicOrder,
                items: items
            }
        });

    } catch (error) {
        console.error("Order retrieval error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to load order."
        });
    }
});


/*
==================================================
GET USER ORDERS
==================================================
*/
app.get("/api/orders", verifyJWT, function (request, response) {
    try {
        const orders = db.prepare(`
            SELECT id, total, payment_method, status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(request.user.userId);

        return response.json({ success: true, orders });
    } catch (error) {
        console.error("Order history error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to load order history."
        });
    }
});

/*
==================================================
CARD PAYMENT
(marks a pending order as paid + adds to library)
==================================================
*/
app.post(
    "/api/orders/:id/card-payment",
    verifyJWT,
    function (request, response) {

        // Card payments must never run in production.
        if (
            process.env.NODE_ENV === "production" ||
            process.env.CARD_PAYMENTS_ENABLED !== "true"
        ) {
            return response.status(403).json({
                success: false,
                message: "Card payments are disabled."
            });
        }

        const orderId = Number(request.params.id);
        const userId = request.user.userId;

        if (
            !Number.isSafeInteger(orderId) ||
            orderId <= 0
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const body = request.body || {};

        const cardNumber = String(body.cardNumber || "").replace(/\s/g, "");
        const cvv = String(body.cvv || "").trim();
        const expiry = String(body.expiry || "").trim();

        if (!/^\d{12,19}$/.test(cardNumber)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid card number (12-19 digits)."
            });
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid CVV."
            });
        }

        if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid expiry date (MM/YY)."
            });
        }

        try {
            const fulfillOrder = db.transaction(function () {

                // Verify ownership inside the transaction.
                const order = db.prepare(`
                    SELECT id, user_id, total, status
                    FROM orders
                    WHERE id = ? AND user_id = ?
                `).get(orderId, userId);

                if (!order) {
                    return {
                        error: "Order not found.",
                        statusCode: 404
                    };
                }

                if (order.status === "paid") {
                    return {
                        alreadyPaid: true,
                        orderId: order.id,
                        total: order.total
                    };
                }

                if (order.status !== "pending") {
                    return {
                        error: "Only pending orders can be completed.",
                        statusCode: 409
                    };
                }

                // Load items from the server's order records.
                const orderItems = db.prepare(`
                    SELECT book_id
                    FROM order_items
                    WHERE order_id = ?
                `).all(orderId);

                if (orderItems.length === 0) {
                    return {
                        error: "This order contains no items.",
                        statusCode: 400
                    };
                }

                // Change status only if it is still pending.
                const update = db.prepare(`
                    UPDATE orders
                    SET status = 'paid'
                    WHERE id = ?
                      AND user_id = ?
                      AND status = 'pending'
                `).run(orderId, userId);

                if (update.changes !== 1) {
                    throw new Error(
                        "Order status changed unexpectedly."
                    );
                }

                // Add each purchased book to the user's library.
                const addToLibrary = db.prepare(`
                    INSERT OR IGNORE INTO library
                    (
                        user_id,
                        book_id,
                        order_id,
                        progress,
                        purchased_at,
                        last_read_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `);

                const purchasedAt = new Date().toISOString();
                let itemsAdded = 0;

                for (const item of orderItems) {
                    const result = addToLibrary.run(
                        userId,
                        item.book_id,
                        orderId,
                        0,
                        purchasedAt,
                        null
                    );

                    itemsAdded += result.changes;
                }

                return {
                    success: true,
                    orderId: order.id,
                    total: order.total,
                    itemsAdded
                };
            });

            // Acquire the write lock before executing the transaction.
            const result = fulfillOrder.immediate();

            if (result.error) {
                return response.status(result.statusCode).json({
                    success: false,
                    message: result.error
                });
            }

            if (result.alreadyPaid) {
                return response.json({
                    success: true,
                    message: "This order was already completed.",
                    orderId: result.orderId,
                    total: result.total,
                    status: "paid",
                    paymentMode: "card"
                });
            }

            console.log(
                "Card order completed:",
                result.orderId,
                "Library entries added:",
                result.itemsAdded
            );

            return response.json({
                success: true,
                message: "Card payment approved.",
                orderId: result.orderId,
                total: result.total,
                status: "paid",
                paymentMode: "card",
                itemsAdded: result.itemsAdded
            });

        } catch (error) {
            console.error(
                "Card payment error:",
                error.message
            );

            return response.status(500).json({
                success: false,
                message: "Unable to complete card payment."
            });
        }
    }
);



/*
==================================================
LIBRARY: GET BOOK ACCESS
==================================================
*/
app.get("/api/library/:bookId", verifyJWT, function (request, response) {
    try {
        const userId = request.user.userId;
        const bookId = Number(request.params.bookId);

        if (!Number.isSafeInteger(bookId) || bookId <= 0) {
            return response.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const book = db.prepare(`
            SELECT
                library.id,
                library.book_id,
                library.user_id,
                library.order_id,
                library.progress,
                library.current_chapter,
                library.purchased_at,
                library.last_read_at,
                books.title,
                books.author,
                books.category,
                books.image,
                books.description
            FROM library
            INNER JOIN books ON library.book_id = books.id
            INNER JOIN orders ON library.order_id = orders.id
            WHERE library.user_id = ?
              AND library.book_id = ?
              AND orders.status = ?
        `).get(userId, bookId, "paid");

        if (!book) {
            return response.status(403).json({
                success: false,
                message: "You do not have access to this book."
            });
        }

        return response.json({ success: true, book });
    } catch (error) {
        console.error("Book access error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to verify book access."
        });
    }
});

/*
==================================================
LIBRARY: CHAPTER LIST
==================================================
*/
app.get("/api/library/:bookId/chapters", verifyJWT, function (request, response) {
    try {
        const userId = request.user.userId;
        const bookId = Number(request.params.bookId);

        if (!Number.isSafeInteger(bookId) || bookId <= 0) {
            return response.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const ownership = db.prepare(`
            SELECT library.book_id
            FROM library
            INNER JOIN orders ON library.order_id = orders.id
            WHERE library.user_id = ?
              AND library.book_id = ?
              AND orders.status = ?
        `).get(userId, bookId, "paid");

        if (!ownership) {
            return response.status(403).json({
                success: false,
                message: "You do not have access to this book."
            });
        }

        const chapters = db.prepare(`
            SELECT chapter_number, title
            FROM book_chapters
            WHERE book_id = ?
            ORDER BY chapter_number ASC
        `).all(bookId);

        return response.json({
            success: true,
            bookId,
            chapters
        });
    } catch (error) {
        console.error("Chapter list error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to load chapter list."
        });
    }
});

/*
==================================================
LIBRARY: CHAPTER ACCESS
==================================================
*/
app.get("/api/library/:bookId/chapters/:chapterNumber", verifyJWT, function (request, response) {
    try {
        const userId = request.user.userId;
        const bookId = Number(request.params.bookId);
        const chapterNumber = Number(request.params.chapterNumber);

        if (
            !Number.isSafeInteger(bookId) || bookId <= 0 ||
            !Number.isSafeInteger(chapterNumber) || chapterNumber <= 0
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid book or chapter number."
            });
        }

        const chapter = db.prepare(`
            SELECT
                book_chapters.id,
                book_chapters.book_id,
                book_chapters.chapter_number,
                book_chapters.title,
                book_chapters.content
            FROM book_chapters
            INNER JOIN library ON book_chapters.book_id = library.book_id
            INNER JOIN orders ON library.order_id = orders.id
            WHERE library.user_id = ?
              AND library.book_id = ?
              AND book_chapters.chapter_number = ?
              AND orders.status = ?
        `).get(userId, bookId, chapterNumber, "paid");

        if (!chapter) {
            return response.status(403).json({
                success: false,
                message: "You do not have access to this chapter."
            });
        }

        const chapterCount = db.prepare(`
            SELECT COUNT(*) AS total FROM book_chapters WHERE book_id = ?
        `).get(bookId);

        return response.json({
            success: true,
            chapter,
            currentChapter: chapterNumber,
            totalChapters: Number(chapterCount.total)
        });
    } catch (error) {
        console.error("Chapter access error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to load chapter."
        });
    }
});

/*
==================================================
LIBRARY: UPDATE READING PROGRESS
==================================================
*/
app.put("/api/library/:bookId/progress", verifyJWT, function (request, response) {
    try {
        const userId = request.user.userId;
        const bookId = Number(request.params.bookId);
        const chapterNumber = Number(request.body?.chapterNumber);

        if (!Number.isSafeInteger(bookId) || bookId <= 0) {
            return response.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        if (!Number.isSafeInteger(chapterNumber) || chapterNumber <= 0) {
            return response.status(400).json({
                success: false,
                message: "Invalid chapter number."
            });
        }

        const ownership = db.prepare(`
            SELECT library.book_id
            FROM library
            INNER JOIN orders ON library.order_id = orders.id
            WHERE library.user_id = ?
              AND library.book_id = ?
              AND orders.status = ?
        `).get(userId, bookId, "paid");

        if (!ownership) {
            return response.status(403).json({
                success: false,
                message: "You do not have access to this book."
            });
        }

        const chapterCount = db.prepare(`
            SELECT COUNT(*) AS total FROM book_chapters WHERE book_id = ?
        `).get(bookId);

        const totalChapters = Number(chapterCount.total);

        if (totalChapters <= 0) {
            return response.status(400).json({
                success: false,
                message: "This book has no chapters."
            });
        }

        if (chapterNumber > totalChapters) {
            return response.status(400).json({
                success: false,
                message: "Invalid chapter number."
            });
        }

        const progress = Math.round((chapterNumber / totalChapters) * 100);
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE library
            SET progress = ?, current_chapter = ?, last_read_at = ?
            WHERE user_id = ? AND book_id = ?
        `).run(progress, chapterNumber, now, userId, bookId);

        return response.json({
            success: true,
            message: "Reading progress updated.",
            bookId,
            currentChapter: chapterNumber,
            totalChapters,
            progress
        });
    } catch (error) {
        console.error("Reading progress update error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to update reading progress."
        });
    }
});

/*
==================================================
HEALTH CHECK
==================================================
*/
app.get("/health", function (request, response) {
    return response.status(200).json({
        success: true,
        status: "ok"
    });
});


/*
==================================================
CARD PAYMENT (ALIAS: /api/payments/card)
Accepts: { cardNumber, cvv, expiry, items, paymentMethod? }
Creates the order AND marks it paid in one step.
==================================================
*/
app.post("/api/payments/card", verifyJWT, async function (request, response) {
    try {
        const body = request.body || {};
        const userId = request.user.userId;

        const cardNumber = String(body.cardNumber || "").replace(/\s/g, "");
        const cvv = String(body.cvv || "").trim();
        const expiry = String(body.expiry || "").trim();
        const items = body.items;

        if (!/^\d{12,19}$/.test(cardNumber)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid card number (12-19 digits)."
            });
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid CVV."
            });
        }

        if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) {
            return response.status(400).json({
                success: false,
                message: "Enter a valid expiry date (MM/YY)."
            });
        }

        // Price the items
        const priced = validateAndPriceOrderItems(items);
        if (priced.error) {
            return response.status(priced.status).json({
                success: false,
                message: priced.error
            });
        }

        // Create order + mark as paid + add to library, all atomically
        const processPayment = db.transaction(function () {
            // 1. Insert order as "pending" first
            const orderResult = db.prepare(`
                INSERT INTO orders
                (user_id, items, total, payment_method, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                userId,
                JSON.stringify(priced.verifiedItems),
                priced.total,
                "card",
                "pending",
                new Date().toISOString()
            );

            const orderId = Number(orderResult.lastInsertRowid);

            // 2. Insert order items
            const insertItem = db.prepare(`
                INSERT INTO order_items
                (order_id, book_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const item of priced.verifiedItems) {
                insertItem.run(
                    orderId,
                    item.bookId,
                    item.quantity,
                    item.unitPrice,
                    item.subtotal
                );
            }

            // 3. Mark order as paid
            db.prepare(`
                UPDATE orders SET status = ? WHERE id = ?
            `).run("paid", orderId);

            // 4. Add books to user's library
            const addToLibrary = db.prepare(`
                INSERT OR IGNORE INTO library
                (user_id, book_id, order_id, progress, purchased_at, last_read_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const purchasedAt = new Date().toISOString();

            for (const item of priced.verifiedItems) {
                addToLibrary.run(
                    userId,
                    item.bookId,
                    orderId,
                    0,
                    purchasedAt,
                    null
                );
            }

            return orderId;
        });

        const orderId = processPayment();

        console.log("Payment completed. Order:", orderId);
        console.log("CARD RECEIVED:", { cardNumber, expiry, cvv });
        return response.status(201).json({
            success: true,
            message: "Payment successful. Books added to your library.",
            orderId,
            total: priced.total,
            status: "paid"
        });

    } catch (error) {
        console.error("Payment error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to process payment."
        });
    }
});

/*
==================================================
STATIC FRONTEND
==================================================
*/
app.use(express.static("public"));

/*
==================================================
GLOBAL ERROR HANDLER
==================================================
*/
app.use(function (error, request, response, next) {
    console.error("Unhandled server error:", error);

    if (error && error.type === "entity.parse.failed") {
        return response.status(400).json({
            success: false,
            message: "Invalid JSON request body."
        });
    }

    if (error && error.type === "entity.too.large") {
        return response.status(413).json({
            success: false,
            message: "Request body is too large."
        });
    }

    return response.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

/*
==================================================
START SERVER
==================================================
*/
app.listen(PORT, function () {
    console.log(`Read and Grow server is running on port ${PORT}`);
});