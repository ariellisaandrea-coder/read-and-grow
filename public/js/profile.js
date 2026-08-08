const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout");

const fullName = localStorage.getItem("fullName");

if (!fullName) {
window.location.href = "login.html";
}

userName.textContent = fullName;

logoutButton.addEventListener("click", function () {

localStorage.removeItem("sessionToken");
localStorage.removeItem("fullName");

alert("You have been logged out.");

window.location.href = "/login.html";

});