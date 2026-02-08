const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://task-manager-backend-ksiy.onrender.com";

const msg = document.getElementById("msg");

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    msg.innerText = "Enter email & password";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch (err) {
    msg.innerText = "Server error";
  }
}

async function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    msg.innerText = "Enter email & password";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message || "Registration failed";
      return;
    }

    msg.innerText = "✅ Registered! Now login.";
  } catch (err) {
    msg.innerText = "Server error";
  }
}
