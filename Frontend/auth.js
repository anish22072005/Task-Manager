const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000/api/auth"
    : "https://task-manager-backend-ksiy.onrender.com/api/auth";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const msg = document.getElementById("msg");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* ---------- LOGIN ---------- */
async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    msg.textContent = "❌ Email & password required";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = "❌ " + data.message;
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", email);

    msg.textContent = "✅ Login successful";
    setTimeout(() => {
      window.location.href = "tasks.html"; // or index.html (task page)
    }, 800);

  } catch (err) {
    msg.textContent = "❌ Server error";
  }
}

/* ---------- REGISTER ---------- */
async function register() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    msg.textContent = "❌ Email & password required";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = "❌ " + data.message;
      return;
    }

    msg.textContent = "✅ Registered! Now login.";

  } catch (err) {
    msg.textContent = "❌ Server error";
  }
}

/* ---------- BUTTON EVENTS ---------- */
loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
