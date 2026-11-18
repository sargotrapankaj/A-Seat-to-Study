/* ============================================================
   A Seat to Study — auth (login / register)
   Uses localStorage. Prototype only — do NOT store real passwords
   like this in a production app.
   ============================================================ */

const USERS_KEY = "asts_users";
const SESSION_KEY = "asts_session";

/* ---------- Tabs ---------- */
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMsg = document.getElementById("authMsg");
const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

function showLogin() {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.hidden = false;
  registerForm.hidden = true;
  authMsg.hidden = true;
}

function showRegister() {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.hidden = false;
  loginForm.hidden = true;
  authMsg.hidden = true;
}

tabLogin.addEventListener("click", showLogin);
tabRegister.addEventListener("click", showRegister);
goRegister.addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
goLogin.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

/* ---------- Helpers ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function showMsg(text, isError = true) {
  authMsg.textContent = text;
  authMsg.hidden = false;
  authMsg.style.color = isError ? "#dc2626" : "#16a34a";
}

/* ---------- Register ---------- */
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const roll = document.getElementById("regRoll").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const spacePref = document.getElementById("regSpace").value;

  if (!name || !roll || !email || !password || !spacePref) {
    showMsg("Please fill all fields.");
    return;
  }
  if (password.length < 6) {
    showMsg("Password must be at least 6 characters.");
    return;
  }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    showMsg("This email is already registered. Try logging in.");
    return;
  }

  users.push({ name, roll, email, password, spacePref });
  saveUsers(users);

  showMsg("Account created! Redirecting to login…", false);
  registerForm.reset();

  setTimeout(() => {
    showLogin();
    document.getElementById("loginEmail").value = email;
  }, 1200);
});

/* ---------- Login ---------- */
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    showMsg("No account found with this email. Please register first.");
    return;
  }
  if (user.password !== password) {
    showMsg("Incorrect password. Try again.");
    return;
  }

  // Save session (name + preference only — no password)
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    spacePref: user.spacePref
  }));

  showMsg("Login successful! Loading your dashboard…", false);

  setTimeout(() => {
    window.location.href = "home.html";
  }, 800);
});