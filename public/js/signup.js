const signupForm =
document.querySelector("#signup-form");

const signupMessage =
document.querySelector("#signup-message");

signupForm.addEventListener(

"submit",

function (event) {

event.preventDefault();

const fullName =
document.querySelector("#full-name").value;

const email =
document.querySelector("#email").value;

const password =
document.querySelector("#password").value;

fetch(

"/api/signup",

{

method: "POST",

headers: {

"Content-Type":
"application/json"

},

body:

JSON.stringify({

fullName,

email,

password

})

}

)

.then(function(response){

return response.json();

})

.then(function(data){

signupMessage.textContent =
data.message;

if(data.success){

signupForm.reset();

}

})

.catch(function(){

signupMessage.textContent =
"Unable to connect to server.";

});

}
);
