console.log("Hello");
console.log("AccessOS");

document.getElementById("p1").textContent = "Please Login To Your Inception";

// Ternary Operator
//age >= 18 ? "Youre an adult" : "Youre a minor";
// Constant
//const pi = 3.14;

let hello = "hello";
let ICPSerial;
let Username;
let Password;

function onLoginSuccess() {
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
}

document.getElementById("ICPLoginSubmit").onclick = async function () {
    const ICPSerial = document.getElementById("ICPSerial").value;
    const APIUsername = document.getElementById("APIUsername").value;
    const APIPassword = document.getElementById("APIPassword").value;

    let url = "http://localhost:5000/login"


    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ICPSerial: ICPSerial,
            Username: APIUsername,
            Password: APIPassword
        })

    });
    const data = await response.json();

    if (data.success) {
        // Store session
        sessionStorage.setItem("sessionId", data.UserID);
        sessionStorage.setItem("ICPSerial", ICPSerial)
        sessionStorage.setItem("Username", APIUsername)
        window.location.href = "dashboard.html";
    } else {
        showError(data.error);
    }
};

