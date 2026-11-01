const loginForm =
document.querySelector("#login-form");

const loginMessage =
document.querySelector("#login-message");


loginForm.addEventListener(
"submit",
function(event) {

event.preventDefault();

fetch(
"/api/login",
{
method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({

email:
document.querySelector("#email").value,

password:
document.querySelector("#password").value

})
}
)

.then(function(response) {

return response.json();

})

.then(function(data){

console.log("LOGIN RESPONSE:", data);

loginMessage.textContent =
data.message;

if(data.success){
localStorage.setItem(
"jwtToken",
data.jwtToken
);
console.log(
"JWT SAVED:",
localStorage.getItem("jwtToken")
);


localStorage.setItem(
"fullName",
data.fullName
);

localStorage.setItem(
"role",
data.role
);

setTimeout(function(){

window.location.href="profile.html";

},1000);

}

})

.catch(function(error) {

console.error(error);

loginMessage.textContent =
"Unable to connect.";

});

}
);
