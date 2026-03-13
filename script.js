
// -----------------------------
// Firebase config
// -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAw4F7DJj1oDZyxL4yh-db4wm_JujyUvwI",
  authDomain: "test1234-11278756.firebaseapp.com",
  projectId: "test1234-11278756",
  storageBucket: "test1234-11278756.appspot.com",
  messagingSenderId: "824253794115",
  appId: "1:824253794115:web:bf6d024f90bce98d4711f6"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// DOM
// -----------------------------
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

const userSection = document.getElementById("user-section");
const userEmailSpan = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const todoSection = document.getElementById("todo-section");
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const adminBtn = document.getElementById("adminBtn");

// -----------------------------
// Logging
// -----------------------------
function logAction(type, details = {}) {
  const user = auth.currentUser;
  db.collection("logs").add({
    type,
    details,
    uid: user ? user.uid : null,
    email: user ? user.email : null,
    created: Date.now()
  });
}

// -----------------------------
// Auth
// -----------------------------
registerBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const email = `${username}@app.com`;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    logAction("register", { username });
  } catch (err) {
    authMessage.textContent = err.message;
  }
};

loginBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const email = `${username}@app.com`;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    logAction("login", { username });
  } catch (err) {
    authMessage.textContent = err.message;
  }
};

logoutBtn.onclick = () => {
  auth.signOut();
  logAction("logout");
};

adminBtn.onclick = () => {
    window.location.href = "admin.html";
};

// -----------------------------
// Todo functionaliteit
// -----------------------------
function loadTodos(uid) {
  return db.collection("todos")
    .where("user", "==", uid)
    .orderBy("created")
    .onSnapshot(snapshot => {
      todoList.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();

        const li = document.createElement("li");
        li.textContent = data.text;

        li.onclick = () => {
          doc.ref.delete();
          logAction("todo_delete", { text: data.text });
        };

        todoList.appendChild(li);
      });
    });
}

addTodoBtn.onclick = () => {
  const task = todoInput.value.trim();
  const user = auth.currentUser;

  if (!task || !user) return;

  db.collection("todos").add({
    user: user.uid,
    text: task,
    created: Date.now()
  });

  logAction("todo_add", { text: task });
  todoInput.value = "";
};

// -----------------------------
// Auth listener
// -----------------------------
let unsubTodos = null;

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-section").classList.add("hidden");
    userSection.classList.remove("hidden");
    todoSection.classList.remove("hidden");

    userEmailSpan.textContent = user.email;

    if ("a"=== "a") {//user.uid === ADMIN_UID
      adminBtn.classList.remove("hidden");
    } else {
      adminBtn.classList.add("hidden");
    }

    if (unsubTodos) unsubTodos();
    unsubTodos = loadTodos(user.uid);
  } else {
    document.getElementById("auth-section").classList.remove("hidden");
    userSection.classList.add("hidden");
    todoSection.classList.add("hidden");
    todoList.innerHTML = "";
  }
});