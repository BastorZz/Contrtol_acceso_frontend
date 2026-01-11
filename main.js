let userToken = null;
let userName = null;
let userRole = null;

const API_URL = "https://control-acceso-q2xb.onrender.com";

// 🔹 Mostrar mensaje mientras el backend despierta
function showLoading() {
    const status = document.getElementById("status");
    if (status) {
        status.innerText = "⏳ Conectando con el servidor...";
    }
}

// 🔹 Wake-up automático del backend al cargar la web
async function wakeBackend() {
    showLoading();
    try {
        await fetch(API_URL + "/ping", { method: "GET" });
        document.getElementById("status").innerText = "";
    } catch (e) {
        console.warn("Backend tardando en despertar...");
    }
}

window.onload = function () {

    // Despertar backend al abrir la web
    wakeBackend();

    google.accounts.id.initialize({
        client_id: "39491485064-qh43lnjj7thv7mpggc3bbnm539dt3keh.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large" }
    );
};

// Función robusta de login con reintentos
function handleCredentialResponse(response) {

    if (!response.credential || response.credential.length < 20) {
        console.warn("Google devolvió un token vacío, reintentando...");
        setTimeout(() => google.accounts.id.prompt(), 500);
        return;
    }

    fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {

        if (data.retry === true) {
            console.warn("Backend pidió reintentar login, reintentando...");
            setTimeout(() => google.accounts.id.prompt(), 500);
            return;
        }

        if (data.detail) {
            alert("Acceso no autorizado");
            return;
        }

        userToken = data.token;
        userName = data.name;
        userRole = data.role;

        localStorage.setItem("token", userToken);

        response.credential = null;

        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-screen").style.display = "block";

        document.getElementById("welcome").innerText = "Hola, " + userName;

        if (userRole === "admin") {
            document.getElementById("admin-btn").classList.remove("hidden");
        }
    });
}

function startTraining() {
    navigator.geolocation.getCurrentPosition(pos => {

        fetch(API_URL + "/checkin/in", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userToken
            },
            body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            })
        })
        .then(res => res.json())
        .then(data => {

            if (data.valid) {
                document.getElementById("status").innerText =
                    "✔️ Entrenamiento iniciado correctamente";
            } else {
                document.getElementById("status").innerText =
                    "✔️ Entrenamiento iniciado correctamente";
            }
        });

    }, () => {
        document.getElementById("status").innerText =
            "No se pudo obtener la ubicación";
    });
}

function stopTraining() {
    navigator.geolocation.getCurrentPosition(pos => {

        fetch(API_URL + "/checkin/out", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userToken
            },
            body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            })
        })
        .then(res => res.json())
        .then(() => {
            document.getElementById("status").innerText =
                "✔️ Entrenamiento finalizado";
        });

    }, () => {
        document.getElementById("status").innerText =
            "No se pudo obtener la ubicación";
    });
}

function goToAdmin() {
    window.location.href = "admin.html";
}

