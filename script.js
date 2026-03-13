// -----------------------------
// DATA OPSLAG
// -----------------------------
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// -----------------------------
// ELEMENTEN
// -----------------------------
const authContainer = document.getElementById("auth-container");
const app = document.getElementById("app");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");

const currentUserName = document.getElementById("current-user-name");

const todoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo-btn");
const todoList = document.getElementById("todo-list");

const chatInput = document.getElementById("chat-input");
const sendChatBtn = document.getElementById("send-chat-btn");
const chatMessages = document.getElementById("chat-messages");

const adminSection = document.getElementById("admin-section");
const adminUsers = document.getElementById("admin-users");

// -----------------------------
// HELPER FUNCTIES
// -----------------------------
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser() {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function showApp() {
    authContainer.classList.add("hidden");
    app.classList.remove("hidden");
    currentUserName.textContent = currentUser.username;

    if (currentUser.isAdmin) {
        adminSection.classList.remove("hidden");
        updateAdminPanel();
    } else {
        adminSection.classList.add("hidden");
    }

    loadTodos();
    loadChat();
}

function showLogin() {
    currentUser = null;
    saveCurrentUser();
    authContainer.classList.remove("hidden");
    app.classList.add("hidden");
}

// -----------------------------
// REGISTREREN
// -----------------------------
registerBtn.onclick = () => {
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const isAdmin = document.getElementById("register-is-admin").checked;

    if (!username || !password) {
        registerError.textContent = "Vul alle velden in.";
        return;
    }

    if (users.some(u => u.username === username)) {
        registerError.textContent = "Gebruikersnaam bestaat al.";
        return;
    }

    users.push({
        username,
        password,
        isAdmin,
        todos: [],
        messages: []
    });

    saveUsers();
    registerError.textContent = "Account aangemaakt!";
};

// -----------------------------
// INLOGGEN
// -----------------------------
loginBtn.onclick = () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        loginError.textContent = "Onjuiste gegevens.";
        return;
    }

    currentUser = user;
    saveCurrentUser();
    showApp();
};

// -----------------------------
// UITLOGGEN
// -----------------------------
logoutBtn.onclick = () => {
    showLogin();
};

// -----------------------------
// TODO-LIJST
// -----------------------------
function loadTodos() {
    todoList.innerHTML = "";
    currentUser.todos.forEach((task, index) => {
        const li = document.createElement("li");
        li.textContent = task;
        li.onclick = () => {
            currentUser.todos.splice(index, 1);
            saveUsers();
            loadTodos();
        };
        todoList.appendChild(li);
    });
}

addTodoBtn.onclick = () => {
    const task = todoInput.value.trim();
    if (!task) return;

    currentUser.todos.push(task);
    saveUsers();
    loadTodos();
    todoInput.value = "";
};

// -----------------------------
// CHAT
// -----------------------------
function loadChat() {
    chatMessages.innerHTML = "";
    currentUser.messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("chat-message");
        div.textContent = msg;
        chatMessages.appendChild(div);
    });
}

sendChatBtn.onclick = () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    currentUser.messages.push(msg);
    saveUsers();
    loadChat();
    chatInput.value = "";
};

// -----------------------------
// ADMIN PANEL
// -----------------------------
function updateAdminPanel() {
    adminUsers.innerHTML = "";

    users.forEach(u => {
        const box = document.createElement("div");
        box.classList.add("admin-box");

        box.innerHTML = `
            <strong>${u.username}</strong> (${u.isAdmin ? "Admin" : "User"})<br>
            Taken: ${u.todos.length}<br>
            Berichten: ${u.messages.length}
        `;

        adminUsers.appendChild(box);
    });
}

// -----------------------------
// AUTO LOGIN
// -----------------------------
if (currentUser) {
    showApp();
}