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

let currentUserData = null;

// -----------------------------
// UI FUNCTIES
// -----------------------------
function showApp() {
    authContainer.classList.add("hidden");
    app.classList.remove("hidden");
}

function showLogin() {
    authContainer.classList.remove("hidden");
    app.classList.add("hidden");
}

// -----------------------------
// REGISTREREN
// -----------------------------
registerBtn.onclick = async () => {
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const isAdmin = document.getElementById("register-is-admin").checked;

    if (!username || !password) {
        registerError.textContent = "Vul alle velden in.";
        return;
    }

    try {
        const email = `${username}@app.com`;

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        await db.collection("users").doc(uid).set({
            username,
            isAdmin,
            createdAt: Date.now()
        });

        registerError.textContent = "Account aangemaakt!";
    } catch (err) {
        registerError.textContent = err.message;
    }
};

// -----------------------------
// INLOGGEN
// -----------------------------
loginBtn.onclick = async () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        const email = `${username}@app.com`;
        await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
        loginError.textContent = "Onjuiste gegevens.";
    }
};

// -----------------------------
// UITLOGGEN
// -----------------------------
logoutBtn.onclick = () => auth.signOut();

// -----------------------------
// TODO-LIJST
// -----------------------------
function loadTodos(uid) {
    db.collection("todos")
        .where("user", "==", uid)
        .orderBy("created")
        .onSnapshot(snapshot => {
            todoList.innerHTML = "";
            snapshot.forEach(doc => {
                const li = document.createElement("li");
                li.textContent = doc.data().text;

                li.onclick = () => doc.ref.delete();

                todoList.appendChild(li);
            });
        });
}

addTodoBtn.onclick = () => {
    const task = todoInput.value.trim();
    if (!task || !auth.currentUser) return;

    db.collection("todos").add({
        user: auth.currentUser.uid,
        text: task,
        created: Date.now()
    });

    todoInput.value = "";
};

// -----------------------------
// CHAT
// -----------------------------
function loadChat() {
    db.collection("chat")
        .orderBy("created")
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = "";
            snapshot.forEach(doc => {
                const div = document.createElement("div");
                div.classList.add("chat-message");
                div.textContent = doc.data().user + ": " + doc.data().text;
                chatMessages.appendChild(div);
            });
        });
}

sendChatBtn.onclick = () => {
    const msg = chatInput.value.trim();
    if (!msg || !auth.currentUser) return;

    db.collection("chat").add({
        user: currentUserData.username,
        text: msg,
        created: Date.now()
    });

    chatInput.value = "";
};

// -----------------------------
// ADMIN PANEL
// -----------------------------
function loadAdminPanel() {
    db.collection("users").onSnapshot(snapshot => {
        adminUsers.innerHTML = "";

        snapshot.forEach(doc => {
            const u = doc.data();

            const box = document.createElement("div");
            box.classList.add("admin-box");

            box.innerHTML = `
                <strong>${u.username}</strong> (${u.isAdmin ? "Admin" : "User"})
            `;

            adminUsers.appendChild(box);
        });
    });
}

// -----------------------------
// AUTH STATE LISTENER
// -----------------------------
auth.onAuthStateChanged(async user => {
    if (user) {
        showApp();

        const doc = await db.collection("users").doc(user.uid).get();
        currentUserData = doc.data();

        currentUserName.textContent = currentUserData.username;

        loadTodos(user.uid);
        loadChat();

        if (currentUserData.isAdmin) {
            adminSection.classList.remove("hidden");
            loadAdminPanel();
        } else {
            adminSection.classList.add("hidden");
        }
    } else {
        showLogin();
    }
});