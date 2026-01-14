console.log("ADMIN.JS CARGADO");

// ===============================
// CARGAR ENTRENAMIENTOS
// ===============================
function loadCheckins() {
    console.log("loadCheckins() ejecutado");

    document.getElementById("section-title").innerText = "Entrenamientos";
    document.getElementById("content").innerHTML = "<p>Cargando entrenamientos...</p>";

    fetch("https://control-acceso-backend.fly.dev/admin/checkins", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("RESPUESTA CHECKINS:", data);
        renderCheckins(data);
    })
    .catch(err => {
        console.error("ERROR FETCH CHECKINS:", err);
        document.getElementById("content").innerHTML = "<p>Error cargando datos.</p>";
    });
}


// ===============================
// RENDER ENTRENAMIENTOS ORDENADOS POR DÍA + BORRAR
// ===============================
function renderCheckins(checkins) {
    console.log("renderCheckins() ejecutado con:", checkins);

    const content = document.getElementById("content");

    if (!Array.isArray(checkins) || checkins.length === 0) {
        content.innerHTML = "<p>No hay entrenamientos registrados.</p>";
        return;
    }

    // ORDENAR POR FECHA (más recientes primero)
    checkins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // AGRUPAR POR DÍA
    const grupos = {};
    checkins.forEach(c => {
        const fecha = new Date(c.timestamp).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(c);
    });

    let html = "";

    // RECORRER CADA DÍA
    for (const dia in grupos) {
        html += `<h3 style="margin-top:20px;">— ${dia} —</h3>`;
        html += `
            <table border="1" cellpadding="8">
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Válido</th>
                    <th>Razón</th>
                    <th>Acciones</th>
                </tr>
        `;

        grupos[dia].forEach(c => {
            const hora = new Date(c.timestamp).toLocaleTimeString("es-ES");

            html += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.user_name}</td>
                    <td>${c.user_email}</td>
                    <td>${hora}</td>
                    <td>${c.type}</td>
                    <td>${c.valid}</td>
                    <td>${c.reason || ""}</td>
                    <td>
                        <button onclick="deleteCheckin(${c.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        html += "</table>";
    }

    content.innerHTML = html;
}


// ===============================
// ELIMINAR ENTRENAMIENTO
// ===============================
function deleteCheckin(id) {
    if (!confirm("¿Seguro que quieres eliminar este entrenamiento?")) return;

    fetch(`https://control-acceso-backend.fly.dev/admin/checkins/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(() => loadCheckins());
}



// ===============================
// CARGAR ALERTAS
// ===============================
function loadAlerts() {
    console.log("loadAlerts() ejecutado");

    document.getElementById("section-title").innerText = "Alertas";
    document.getElementById("content").innerHTML = "<p>Cargando alertas...</p>";

    fetch("https://control-acceso-backend.fly.dev/admin/checkins/invalid", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("RESPUESTA ALERTAS:", data);
        renderAlerts(data);
    })
    .catch(err => {
        console.error("ERROR FETCH ALERTAS:", err);
        document.getElementById("content").innerHTML = "<p>Error cargando alertas.</p>";
    });
}


// ===============================
// RENDER ALERTAS ORDENADAS POR DÍA
// ===============================
function renderAlerts(alerts) {
    console.log("renderAlerts() ejecutado con:", alerts);

    const content = document.getElementById("content");

    if (!Array.isArray(alerts) || alerts.length === 0) {
        content.innerHTML = "<p>No hay alertas registradas.</p>";
        return;
    }

    // ORDENAR POR FECHA
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // AGRUPAR POR DÍA
    const grupos = {};
    alerts.forEach(a => {
        const fecha = new Date(a.timestamp).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(a);
    });

    let html = "";

    for (const dia in grupos) {
        html += `<h3 style="margin-top:20px;">— ${dia} —</h3>`;
        html += `
            <table border="1" cellpadding="8">
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Hora</th>
                    <th>Razón</th>
                </tr>
        `;

        grupos[dia].forEach(a => {
            const hora = new Date(a.timestamp).toLocaleTimeString("es-ES");

            html += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.user_name}</td>
                    <td>${a.user_email}</td>
                    <td>${hora}</td>
                    <td>${a.reason}</td>
                </tr>
            `;
        });

        html += "</table>";
    }

    content.innerHTML = html;
}
// ===============================
// CARGAR USUARIOS
// ===============================
function loadUsers() {
    console.log("loadUsers() ejecutado");

    document.getElementById("section-title").innerText = "Gestionar usuarios";
    document.getElementById("content").innerHTML = "<p>Cargando usuarios...</p>";

    fetch("https://control-acceso-backend.fly.dev/admin/users", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("RESPUESTA USERS:", data);
        renderUsers(data);
    })
    .catch(err => {
        console.error("ERROR FETCH USERS:", err);
        document.getElementById("content").innerHTML = "<p>Error cargando usuarios.</p>";
    });
}



// ===============================
// RENDER USUARIOS + FORMULARIO CREAR
// ===============================
function renderUsers(users) {
    console.log("renderUsers() ejecutado con:", users);

    const content = document.getElementById("content");

    let html = `
        <h3>Crear nuevo usuario</h3>
        <div style="margin-bottom: 20px;">
            <input id="newName" placeholder="Nombre" />
            <input id="newEmail" placeholder="Email" />
            <select id="newRole">
                <option value="trainer">Entrenador</option>
                <option value="admin">Administrador</option>
            </select>
            <button onclick="createUser()">Crear</button>
        </div>
    `;

    if (!Array.isArray(users) || users.length === 0) {
        html += "<p>No hay usuarios registrados.</p>";
        content.innerHTML = html;
        return;
    }

    html += `
        <table border="1" cellpadding="8">
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
            </tr>
    `;

    users.forEach(u => {
        html += `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                    <button onclick="changeRole(${u.id}, '${u.role}')">Cambiar rol</button>
                    <button onclick="deleteUser(${u.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += "</table>";

    content.innerHTML = html;
}



// ===============================
// CREAR USUARIO
// ===============================
function createUser() {
    console.log("createUser() ejecutado");

    const name = document.getElementById("newName").value;
    const email = document.getElementById("newEmail").value;
    const role = document.getElementById("newRole").value;

    fetch("https://control-acceso-backend.fly.dev/admin/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ name, email, role })
    })
    .then(res => res.json())
    .then(() => loadUsers());
}



// ===============================
// ELIMINAR USUARIO
// ===============================
function deleteUser(id) {
    console.log("deleteUser() ejecutado", id);

    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    fetch(`https://control-acceso-backend.fly.dev/admin/users/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(() => loadUsers());
}



// ===============================
// CAMBIAR ROL
// ===============================
function changeRole(id, currentRole) {
    console.log("changeRole() ejecutado", id, currentRole);

    const newRole = currentRole === "trainer" ? "admin" : "trainer";

    fetch(`https://control-acceso-backend.fly.dev/admin/users/${id}/role?role=${newRole}`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(() => loadUsers());
}
