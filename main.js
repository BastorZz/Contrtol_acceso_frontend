let userToken = null;
let userName = null;
let userRole = null;

window.onload = function () {
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

    // Si Google devuelve un token vacío → reintentar sin molestar al usuario
    if (!response.credential || response.credential.length < 20) {
        console.warn("Google devolvió un token vacío, reintentando...");
        setTimeout(() => google.accounts.id.prompt(), 500);
        return;
    }

    fetch("https://control-acceso-backend.fly.dev/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {

        // Si el backend pide reintentar → reintentar automáticamente
        if (data.retry === true) {
            console.warn("Backend pidió reintentar login, reintentando...");
            setTimeout(() => google.accounts.id.prompt(), 500);
            return;
        }

        // Si el backend devuelve error real
        if (data.detail) {
            alert("Acceso no autorizado");
            return;
        }

        // Guardar SOLO el JWT interno del backend
        userToken = data.token;
        userName = data.name;
        userRole = data.role;

        // Guardar token para admin
        localStorage.setItem("token", userToken);

        // Eliminar token de Google
        response.credential = null;

        // Mostrar pantalla principal
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

        fetch("https://control-acceso-backend.fly.dev/checkin/in", {
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

        fetch("https://control-acceso-backend.fly.dev/checkin/out", {
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

