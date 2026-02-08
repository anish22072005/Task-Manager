// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const mainContent = document.getElementById("taskContainer");
  const loginContent = document.getElementById("loginContainer");
  
  if (!isLoggedIn) {
    if (mainContent) mainContent.style.display = "none";
    if (loginContent) loginContent.style.display = "block";
  } else {
    if (mainContent) mainContent.style.display = "block";
    if (loginContent) loginContent.style.display = "none";
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  const body = document.body;
  const container = document.querySelector(".container");
  
  body.classList.toggle("dark-mode");
  if (container) container.classList.toggle("dark-mode");
  
  // Save preference
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "true");
    updateThemeToggleButton();
  } else {
    localStorage.setItem("darkMode", "false");
    updateThemeToggleButton();
  }
}

function updateThemeToggleButton() {
  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  }
}

// Apply saved dark mode preference on load
function applyDarkModePreference() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.querySelectorAll(".container").forEach(c => c.classList.add("dark-mode"));
    updateThemeToggleButton();
  }
}

let allTasks = [];
let editTaskId = null;
let progressChart = null;
const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api/tasks"
  : "https://task-manager-backend-ksiy.onrender.com/api/tasks";

// Use deployed backend URL or localhost for development
const API_URL = "https://task-manager-backend-ksiy.onrender.com/api/tasks";

console.log("API Endpoint:", API);

// Test backend connection
async function testBackend() {
  try {
    const healthUrl = API.replace("/api/tasks", "/health");
    const res = await fetch(healthUrl);
    const data = await res.json();
    console.log("Backend Status:", data);
  } catch (err) {
    console.error("Backend connection failed:", err);
  }
}

// Call on page load
testBackend(); 

async function fetchTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    allTasks = await res.json();
    updateAnalytics();
    renderTasks(allTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
}

function updateAnalytics(){
  const total = allTasks.length;
  const completed = allTasks.filter(t=>t.status === "Completed").length;
  const pending = allTasks.filter(t=>t.status === "Pending").length;
  const inProgress = allTasks.filter(t=>t.status === "In Progress").length;
  
  document.getElementById("totalCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = pending;
  
  // Calculate and update completion rate
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("completionRate").innerText = completionRate + "%";
  
  // Update chart
  updateProgressChart(completed, pending, inProgress);
}

function updateProgressChart(completed, pending, inProgress) {
  const ctx = document.getElementById("progressChart");
  console.log("Chart function called - ctx:", ctx, "completed:", completed, "pending:", pending, "inProgress:", inProgress);
  
  if (!ctx) {
    console.warn("progressChart canvas element not found");
    return;
  }
  
  const chartData = {
    labels: ['Completed', 'Pending', 'In Progress'],
    datasets: [{
      data: [completed, pending, inProgress],
      backgroundColor: ['#10b981', '#fbbf24', '#3b82f6'],
      borderColor: ['#059669', '#d97706', '#1d4ed8'],
      borderWidth: 2,
      borderRadius: 8
    }]
  };
  
  if (progressChart) {
    progressChart.data = chartData;
    progressChart.update();
    console.log("Chart updated");
  } else {
    progressChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13, weight: '600' },
              usePointStyle: true
            }
          }
        }
      }
    });
    console.log("Chart created");
  }
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("task-card");

    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || ""}</p>
      <span class="status ${task.status.replace(" ", "-")}">
        ${task.status}
      </span>

      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    li.querySelector(".edit-btn").onclick = () => startEdit(task);
    li.querySelector(".delete-btn").onclick = () => deleteTask(task._id);

    list.appendChild(li);
  });
}

async function addOrUpdateTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const status = document.getElementById("status").value;

  if (!title) {
    alert("Title is required");
    return;
  }

  const taskData = { title, description, status };
  console.log("Sending task data:", taskData);

  try {
    // UPDATE
    if (editTaskId) {
      console.log("Updating task:", editTaskId);
      const res = await fetch(`${API}/${editTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      const responseData = await res.json();
      console.log("Update response:", responseData);
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);

      editTaskId = null;
      document.getElementById("addBtn").innerText = "Add Task";
    }
    // ADD
    else {
      console.log("Adding new task");
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      const responseData = await res.json();
      console.log("Add response:", responseData);
      if (!res.ok) throw new Error(`Failed to add: ${res.status}`);
    }

    clearForm();
    await fetchTasks();
  } catch (err) {
    console.error("Error:", err);
    alert("Error saving task: " + err.message);
  }
}

function startEdit(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description || "";
  document.getElementById("status").value = task.status;

  editTaskId = task._id;
  document.getElementById("addBtn").innerText = "Update Task";
}

async function deleteTask(id) {
  try {
    console.log("Deleting task:", id);
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
    console.log("Task deleted successfully");
    fetchTasks();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting task: " + err.message);
  }
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "Pending";
}

function setFilter(status, btn) {
  document.querySelectorAll(".filter-btn")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");

  if (status === "All") {
    renderTasks(allTasks);
  } else {
    renderTasks(allTasks.filter(t => t.status === status));
  }
}

// Load tasks when page loads
window.addEventListener("DOMContentLoaded", fetchTasks);

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "Pending";
}

document.getElementById("addBtn").onclick = addOrUpdateTask;
fetchTasks();

function logout() {
  localStorage.removeItem("loggedIn");
  checkAuth();
}