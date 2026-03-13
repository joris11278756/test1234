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

const ADMIN_UID = "JOUW_ADMIN_UID_HIER";

// -----------------------------
// DOM
// -----------------------------
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

const adminSection = document.getElementById("admin-section");
const logoutBtn = document.getElementById("logoutBtn");

const adminTodosDiv = document.getElementById("adminTodos");
const logListDiv = document.getElementById("logList");

// -----------------------------
// Login
// -----------------------------
loginBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const email = `${username}@app.com`;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    authMessage.textContent = err.message;
  }
};

logoutBtn.onclick = () => auth.signOut();

// -----------------------------
// Admin data
// -----------------------------
function loadAdminData() {
  db.collection("todos")
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {
      adminTodosDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const t = doc.data();
        const div = document.createElement("div");
        div.textContent = `[${t.user}] ${t.text}`;
        adminTodosDiv.appendChild(div);
      });
    });

  db.collection("logs")
    .orderBy("created", "desc")
    .limit(50)
    .onSnapshot(snapshot => {
      logListDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const l = doc.data();
        const div = document.createElement("div");
        div.textContent = `${new Date(l.created).toLocaleString()} - ${l.type} - ${l.email}`;
        logListDiv.appendChild(div);
      });
    });
}

// -----------------------------
// Auth listener
// -----------------------------
auth.onAuthStateChanged(user => {
  if (user && user.uid === ADMIN_UID) {
    document.getElementById("auth-section").classList.add("hidden");
    adminSection.classList.remove("hidden");
    loadAdminData();
  } else {
    adminSection.classList.add("hidden");
  }
});