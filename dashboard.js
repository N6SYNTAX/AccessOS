const sessionId = sessionStorage.getItem("sessionId");
const ICPSerial = sessionStorage.getItem("ICPSerial")

if (!sessionId) {
    // Not logged in, go back
    window.location.href = "index.html";
}

document.getElementById("getareasBtn").onclick = async function () {
    const response = await fetch("http://localhost:5000/getAreas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            session_id: sessionId,
            icpserial: ICPSerial
        })
    });

    const data = await response.json();
    console.log(data);
};