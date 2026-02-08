// API Configuration
const API_BASE = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://task-manager-backend-ksiy.onrender.com";

const msg = document.getElementById("msg");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Allow Enter key to trigger login
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        login();
      }
    });
  });
});

// Login function
async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  if (!email || !password) {
    showMessage("Email and password are required", "error");
    return;
  }

  if (!email.includes('@')) {
    showMessage("Please enter a valid email address", "error");
    return;
  }

  // Disable button and show loading
  loginBtn.disabled = true;
  loginBtn.innerText = "Logging in...";

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Login failed", "error");
      loginBtn.disabled = false;
      loginBtn.innerText = "Login";
      return;
    }

    // Store token
    localStorage.setItem("token", data.token);
    
    showMessage("✅ Login successful! Redirecting...", "success");
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);

  } catch (error) {
    console.error('Login error:', error);
    showMessage("Cannot connect to server. Please try again.", "error");
    loginBtn.disabled = false;
    loginBtn.innerText = "Login";
  }
}

// Register function
async function register() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  if (!email || !password) {
    showMessage("Email and password are required", "error");
    return;
  }

  if (!email.includes('@')) {
    showMessage("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    return;
  }

  // Disable button and show loading
  registerBtn.disabled = true;
  registerBtn.innerText = "Registering...";

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Registration failed", "error");
      registerBtn.disabled = false;
      registerBtn.innerText = "Register";
      return;
    }

    showMessage("✅ Registered successfully! Please login.", "success");
    
    // Clear password field
    passwordInput.value = "";
    
    registerBtn.disabled = false;
    registerBtn.innerText = "Register";

  } catch (error) {
    console.error('Registration error:', error);
    showMessage("Cannot connect to server. Please try again.", "error");
    registerBtn.disabled = false;
    registerBtn.innerText = "Register";
  }
}

// Show message helper
function showMessage(text, type = 'info') {
  msg.innerText = text;
  msg.style.color = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6b7280';
  msg.style.fontWeight = type === 'error' || type === 'success' ? '500' : '400';
}

// Event listeners
loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);