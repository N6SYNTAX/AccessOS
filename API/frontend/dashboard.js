const sessionId = sessionStorage.getItem("sessionId");
const Device = sessionStorage.getItem("ICPSerial");
const UserID = sessionStorage.getItem("Username")

if (!sessionId) {

    window.location.href = "index.html";
}


document.getElementById("loginmsg").textContent = `Welcome, ${UserID}, Device: ${Device}, Session: ${sessionId}`;

document.getElementById("getareasBtn").onclick = async function () {
    const response = await fetch("http://localhost:5000/getAreas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            session_id: sessionId,
            icpserial: Device
        })
    });

    const areas = await response.json();
    console.log(areas);
};