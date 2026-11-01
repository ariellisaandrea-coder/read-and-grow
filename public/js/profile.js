const userName =
document.querySelector("#user-name");

const logoutButton =
document.querySelector("#logout");


const jwtToken =
localStorage.getItem("jwtToken");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!jwtToken) {

window.location.href =
"login.html";

} else {

// ==========================================
// LOAD USER PROFILE
// ==========================================

fetch(
"/api/profile",
{
headers: {
"Authorization":
"Bearer " + jwtToken
}
}
)

.then(function(response) {

if (!response.ok) {

throw new Error(
"Not authenticated"
);

}

return response.json();

})

.then(function(data) {

console.log(
"Profile response:",
data
);

userName.textContent =
data.fullName;

})

.catch(function(error) {

console.error(
"Profile error:",
error
);

localStorage.removeItem(
"jwtToken"
);

localStorage.removeItem(
"fullName"
);

localStorage.removeItem(
"role"
);

window.location.href =
"login.html";

});

}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
"click",
function() {

localStorage.removeItem(
"jwtToken"
);

localStorage.removeItem(
"sessionToken"
);

localStorage.removeItem(
"fullName"
);

localStorage.removeItem(
"role"
);

window.location.href =
"login.html";

}
);