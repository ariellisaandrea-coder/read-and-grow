const libraryMessage =
document.querySelector("#library-message");

const libraryContainer =
document.querySelector("#library-container");

const backToStoreButton =
document.querySelector("#back-to-store");

const jwtToken =
localStorage.getItem("jwtToken");

backToStoreButton.addEventListener(
"click",
function() {

window.location.href = "index.html";

}
);

if (!jwtToken) {

libraryMessage.textContent =
"Please log in to view your library.";

setTimeout(function() {

window.location.href = "login.html";

}, 1500);

} else {

fetch("/api/library", {

headers: {

"Authorization":
"Bearer " + jwtToken

}

})

.then(function(response) {

return response.json().then(
function(data) {

if (!response.ok) {

throw new Error(
data.message ||
"Unable to load your library."
);

}

return data;

});

})

.then(function(data) {

console.log(
"Library response:",
data
);

if (!Array.isArray(data.library)) {

throw new Error(
"Invalid library response."
);

}

if (data.library.length === 0) {

libraryMessage.textContent =
"Your library is currently empty.";

return;

}

libraryMessage.textContent =
"Here are the books in your library.";

data.library.forEach(function(book) {

let buttonText =
"Start Reading";

if (
book.progress > 0 &&
book.progress < 100
) {

buttonText =
"Continue Reading";

}

if (book.progress >= 100) {

buttonText =
"Read Again";

}

const bookElement =
document.createElement("div");

bookElement.className =
"library-book";


/* ==============================
   BOOK IMAGE
============================== */

const image =
document.createElement("img");

const imageSource =
String(book.image || "");

if (
imageSource.startsWith("/") ||
imageSource.startsWith("./") ||
imageSource.startsWith("../") ||
imageSource.startsWith("https://")
) {

image.src = imageSource;

}

image.alt =
String(book.title || "");


/* ==============================
   BOOK TITLE
============================== */

const title =
document.createElement("h3");

title.textContent =
String(book.title || "");


/* ==============================
   AUTHOR
============================== */

const authorParagraph =
document.createElement("p");

const authorLabel =
document.createElement("strong");

authorLabel.textContent =
"Author: ";

authorParagraph.appendChild(
authorLabel
);

authorParagraph.appendChild(
document.createTextNode(
String(book.author || "")
)
);


/* ==============================
   CATEGORY
============================== */

const categoryParagraph =
document.createElement("p");

const categoryLabel =
document.createElement("strong");

categoryLabel.textContent =
"Category: ";

categoryParagraph.appendChild(
categoryLabel
);

categoryParagraph.appendChild(
document.createTextNode(
String(book.category || "")
)
);


/* ==============================
   PROGRESS
============================== */

const progressParagraph =
document.createElement("p");

const progressLabel =
document.createElement("strong");

progressLabel.textContent =
"Progress: ";

progressParagraph.appendChild(
progressLabel
);

progressParagraph.appendChild(
document.createTextNode(
String(book.progress) + "%"
)
);


/* ==============================
   CURRENT CHAPTER
============================== */

const chapterParagraph =
document.createElement("p");

const chapterLabel =
document.createElement("strong");

chapterLabel.textContent =
"Current Chapter: ";

chapterParagraph.appendChild(
chapterLabel
);

chapterParagraph.appendChild(
document.createTextNode(
String(book.current_chapter)
)
);


/* ==============================
   READ BUTTON
============================== */

const readButton =
document.createElement("button");

readButton.className =
"read-book-button";

readButton.dataset.bookId =
String(book.book_id);

readButton.dataset.currentChapter =
String(book.current_chapter);

readButton.textContent =
buttonText;


/* ==============================
   BUILD BOOK CARD
============================== */

bookElement.appendChild(image);

bookElement.appendChild(title);

bookElement.appendChild(
authorParagraph
);

bookElement.appendChild(
categoryParagraph
);

bookElement.appendChild(
progressParagraph
);

bookElement.appendChild(
chapterParagraph
);

bookElement.appendChild(
readButton
);

libraryContainer.appendChild(
bookElement
);

});


/* ==============================
   READ BUTTON HANDLER
============================== */

libraryContainer.addEventListener(
"click",
function(event) {

if (
!event.target.classList.contains(
"read-book-button"
)
) {

return;

}

const bookId =
Number(
event.target.dataset.bookId
);

const currentChapter =
Number(
event.target.dataset.currentChapter
);


if (
!Number.isInteger(bookId) ||
bookId <= 0
) {

console.error(
"Invalid book ID."
);

return;

}


if (
!Number.isInteger(currentChapter) ||
currentChapter <= 0
) {

console.error(
"Invalid current chapter."
);

return;

}


window.location.href =
`reader.html?bookId=${bookId}&chapter=${currentChapter}`;

}
);

})

.catch(function(error) {

console.error(
"Library error:",
error
);

libraryMessage.textContent =
"Unable to load your library.";

});

}