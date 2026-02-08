const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://task-manager-backend-ksiy.onrender.com";

const msg = document.getElementById("msg");

document.getElementById("loginBtn").onclick = login;
document.getElementById("registerBtn").onclick = register;

async function login() {
  const email = email.value.trim();
  const password = password.value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return msg.innerText = data.message;

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch {
    msg.innerText = "Server error";
  }
}

async function register() {
  const email = email.value.trim();
  const password = password.value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    msg.innerText = data.message;
  } catch {
    msg.innerText = "Server error";
  }
}
