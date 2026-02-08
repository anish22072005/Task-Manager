/* =======================
   AUTH & THEME
======================= */

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  checkAuth();
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function checkAuth() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const taskContainer = document.getElementById("taskContainer");
  const loginContainer = document.getElementById("loginContainer");

  if (taskContainer && loginContainer) {
    taskContainer.style.display = loggedIn ? "block" : "none";
    loginContainer.style.display = loggedIn ? "none" : "block";
  }
}

/* =======================
   DARK MODE
======================= */

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );
}

function applyDarkModePreference() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

/* =======================
   API CONFIG
======================= */

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/tasks"
    : "https://task-manager-backend-ksiy.onrender.com/api/tasks";

/* =======================
   STATE
======================= */

let allTasks = [];
let editTaskId = null;
let progressChart = null;

/* =======================
   FETCH TASKS
======================= */

async function fetchTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to fetch tasks");

    allTasks = await res.json();
    renderTasks(allTasks);
    updateAnalytics();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

/* =======================
   ANALYTICS + CHART
======================= */

function updateAnalytics() {
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === "Completed").length;
  const pending = allTasks.filter(t => t.status === "Pending").length;
  const inProgress = allTasks.filter(t => t.status === "In Progress").length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = pending;

  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("completionRate").innerText = rate + "%";

  updateProgressChart(completed, pending, inProgress);
}

function updateProgressChart(completed, pending, inProgress) {
  const canvas = document.getElementById("progressChart");
  if (!canvas) return;

  // IMPORTANT: destroy old chart (Netlify fix)
  if (progressChart) {
    progressChart.destroy();
  }

  progressChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending", "In Progress"],
      datasets: [{
        data: [completed, pending, inProgress],
        backgroundColor: ["#10b981", "#fbbf24", "#3b82f6"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* =======================
   RENDER TASKS
======================= */

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-card";

    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || ""}</p>
      <span class="status ${task.status.replace(" ", "-")}">${task.status}</span>
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

/* =======================
   ADD / UPDATE
======================= */

async function addOrUpdateTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const status = document.getElementById("status").value;

  if (!title) {
    alert("Title is required");
    return;
  }

  const payload = { title, description, status };

  try {
    if (editTaskId) {
      await fetch(`${API}/${editTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      editTaskId = null;
      document.getElementById("addBtn").innerText = "Add Task";
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    clearForm();
    fetchTasks();
  } catch (err) {
    console.error("Save error:", err);
  }
}

function startEdit(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description || "";
  document.getElementById("status").value = task.status;

  editTaskId = task._id;
  document.getElementById("addBtn").innerText = "Update Task";
}

/* =======================
   DELETE
======================= */

async function deleteTask(id) {
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchTasks();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

/* =======================
   FILTER
======================= */

function setFilter(status, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (status === "All") renderTasks(allTasks);
  else renderTasks(allTasks.filter(t => t.status === status));
}

/* =======================
   UTIL
======================= */

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "Pending";
}

/* =======================
   INIT (CRITICAL)
======================= */

window.addEventListener("DOMContentLoaded", async () => {
  applyDarkModePreference();
  checkAuth();

  if (localStorage.getItem("loggedIn") === "true") {
    await fetchTasks(); // chart renders AFTER data + auth
  }
});
