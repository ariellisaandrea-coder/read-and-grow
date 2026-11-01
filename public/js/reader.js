const readerMessage =
 document.querySelector("#reader-message");

const bookReader =
 document.querySelector("#book-reader");

const chapterList =
 document.querySelector("#chapter-list");
 const readingProgressText =
document.querySelector("#reading-progress-text");

const readingProgressBar =
document.querySelector("#reading-progress-bar");



const backToLibraryButton =
 document.querySelector("#back-to-library");

const previousChapterButton =
 document.querySelector("#previous-chapter");

const nextChapterButton =
 document.querySelector("#next-chapter");


backToLibraryButton.addEventListener(
 "click",
 function() {

 window.location.href =
 "library.html";

 }
);


const jwtToken =
 localStorage.getItem("jwtToken");


const urlParams =
 new URLSearchParams(
 window.location.search
 );


const bookId =
 Number(
 urlParams.get("bookId")
 );


let chapterNumber =
 Number(
 urlParams.get("chapter")
 );


let totalChapters = 0;


if (
 !Number.isInteger(bookId) ||
 bookId <= 0
) {

 readerMessage.textContent =
 "Invalid book.";

} else if (
 !Number.isInteger(chapterNumber) ||
 chapterNumber <= 0
) {

 readerMessage.textContent =
 "Invalid chapter.";

} else if (!jwtToken) {

 readerMessage.textContent =
 "Please log in to read this book.";

 setTimeout(function() {

 window.location.href =
 "login.html";

 }, 1500);

} else {

 loadChapterList();

 loadChapter();

}


/*
========================================
LOAD TABLE OF CONTENTS
========================================
*/

function loadChapterList() {

 chapterList.textContent =
 "Loading chapters...";


 fetch(
 `/api/library/${bookId}/chapters`,
 {
 headers: {
 "Authorization":
 "Bearer " + jwtToken
 }
 }
 )

 .then(function(response) {

 return response.json().then(function(data) {

 if (!response.ok) {

 throw new Error(
 data.message ||
 "Unable to load chapter list."
 );

 }

 return data;

 });

 })

 .then(function(data) {

 console.log(
 "Chapter list response:",
 data
 );


 if (
 !data.success ||
 !Array.isArray(data.chapters)
 ) {

 throw new Error(
 "Invalid chapter list response."
 );

 }


 chapterList.innerHTML = "";


 if (data.chapters.length === 0) {

 chapterList.textContent =
 "No chapters are available.";

 return;

 }


 data.chapters.forEach(
 function(chapter) {

 const chapterButton =
 document.createElement("button");


 chapterButton.className =
 "chapter-list-button";


 chapterButton.textContent =
 `${chapter.chapter_number}. ${chapter.title}`;


 chapterButton.dataset.chapter =
 chapter.chapter_number;


 if (
 Number(chapter.chapter_number) ===
 chapterNumber
 ) {

 chapterButton.disabled =
 true;

 }


 chapterList.appendChild(
 chapterButton
 );

 }
 );

 })

 .catch(function(error) {

 console.error(
 "Chapter list error:",
 error
 );


 chapterList.textContent =
 "Unable to load chapters.";

 });

}


/*
========================================
TABLE OF CONTENTS CLICK HANDLER
========================================
*/

chapterList.addEventListener(
 "click",
 function(event) {

 if (
 !event.target.classList.contains(
 "chapter-list-button"
 )
 ) {

 return;

 }


 const selectedChapter =
 Number(
 event.target.dataset.chapter
 );


 if (
 !Number.isInteger(selectedChapter) ||
 selectedChapter <= 0
 ) {

 console.error(
 "Invalid chapter number."
 );

 return;

 }


 chapterNumber =
 selectedChapter;


 window.history.pushState(
 {},
 "",
 `reader.html?bookId=${bookId}&chapter=${chapterNumber}`
 );


 loadChapterList();

 loadChapter();

 }
);


/*
========================================
LOAD CHAPTER CONTENT
========================================
*/

function loadChapter() {

 readerMessage.textContent =
 "Loading chapter...";


 bookReader.innerHTML = "";


 previousChapterButton.disabled =
 chapterNumber <= 1;


 if (totalChapters > 0) {

 nextChapterButton.disabled =
 chapterNumber >= totalChapters;

 } else {

 nextChapterButton.disabled =
 false;

 }


 fetch(
 `/api/library/${bookId}/chapters/${chapterNumber}`,
 {
 headers: {
 "Authorization":
 "Bearer " + jwtToken
 }
 }
 )

 .then(function(response) {

 return response.json().then(function(data) {

 if (!response.ok) {

 throw new Error(
 data.message ||
 "Unable to load chapter."
 );

 }

 return data;

 });

 })

 .then(function(data) {

 console.log(
 "Reader chapter response:",
 data
 );


 if (
 !data.success ||
 !data.chapter
 ) {

 throw new Error(
 "Invalid chapter response."
 );

 }


 const chapter =
 data.chapter;


 totalChapters =
 Number(data.totalChapters);


 if (
 !Number.isInteger(totalChapters) ||
 totalChapters <= 0
 ) {

 throw new Error(
 "Invalid total chapter count."
 );

 }


 previousChapterButton.disabled =
 chapterNumber <= 1;


 nextChapterButton.disabled =
 chapterNumber >= totalChapters;


 if (
 chapterNumber >= totalChapters
 ) {

 readerMessage.textContent =
 "You have reached the end of this book.";

 } else {

 readerMessage.textContent =
 "Chapter loaded successfully.";

 }


 const title =
 document.createElement("h2");

 title.textContent =
 chapter.title;


 const content =
 document.createElement("p");

 content.textContent =
 chapter.content;


 bookReader.appendChild(
 title
 );


 bookReader.appendChild(
 content
 );


 updateReadingProgress();

 })

 .catch(function(error) {

 console.error(
 "Reader error:",
 error
 );


 readerMessage.textContent =
 error.message ||
 "Unable to load this chapter.";

 });

}


/*
========================================
PREVIOUS CHAPTER
========================================
*/

previousChapterButton.addEventListener(
 "click",
 function() {

 if (
 chapterNumber <= 1
 ) {

 return;

 }


 chapterNumber =
 chapterNumber - 1;


 window.history.pushState(
 {},
 "",
 `reader.html?bookId=${bookId}&chapter=${chapterNumber}`
 );


 loadChapterList();

 loadChapter();

 }
);


/*
========================================
NEXT CHAPTER
========================================
*/

nextChapterButton.addEventListener(
 "click",
 function() {

 if (
 nextChapterButton.disabled
 ) {

 return;

 }


 if (
 totalChapters <= 0
 ) {

 return;

 }


 if (
 chapterNumber >= totalChapters
 ) {

 readerMessage.textContent =
 "You have reached the end of this book.";

 nextChapterButton.disabled =
 true;

 return;

 }


 chapterNumber =
 chapterNumber + 1;


 window.history.pushState(
 {},
 "",
 `reader.html?bookId=${bookId}&chapter=${chapterNumber}`
 );


 loadChapterList();

 loadChapter();

 }
);


/*
========================================
UPDATE READING PROGRESS
========================================
*/

function updateReadingProgress() {

fetch(
`/api/library/${bookId}/progress`,
{
method: "PUT",

headers: {
"Content-Type": "application/json",
"Authorization":
"Bearer " + jwtToken
},

body: JSON.stringify({
chapterNumber: chapterNumber
})
}
)

.then(function(response) {

return response.json().then(function(data) {

if (!response.ok) {

throw new Error(
data.message ||
"Unable to update reading progress."
);

}

return data;

});

})

.then(function(data) {

console.log(
"Reading progress updated:",
data
);

const progress =
Number(data.progress);

if (
!Number.isFinite(progress) ||
progress < 0 ||
progress > 100
) {

throw new Error(
"Invalid progress value."
);

}

readingProgressText.textContent =
`Reading Progress: ${progress}%`;

readingProgressBar.style.width =
`${progress}%`;

})

.catch(function(error) {

console.error(
"Progress update error:",
error
);

});

}
