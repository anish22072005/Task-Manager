const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://task-manager-backend-ksiy.onrender.com";

const API = `${API_BASE}/api/tasks`;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

/* DOM */
const taskList = document.getElementById("taskList");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusSelect = document.getElementById("status");
const addBtn = document.getElementById("addBtn");

let tasks = [];
let editId = null;
let chart;

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  addBtn.onclick = addOrUpdateTask;
  fetchTasks();
});

/* FETCH TASKS */
async function fetchTasks() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });
  tasks = await res.json();
  renderTasks();
  renderChart();
}

/* RENDER TASKS */
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.title}</strong>
      <p>${t.description || ""}</p>
      <small>${t.status}</small>
      <button onclick="editTask('${t._id}')">Edit</button>
      <button onclick="deleteTask('${t._id}')">Delete</button>
    `;
    taskList.appendChild(li);
  });
}

/* 🔴 RENDER CHART */
function renderChart() {
  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const pending = tasks.filter(t => t.status === "Pending").length;

  const ctx = document.getElementById("taskChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "In Progress", "Pending"],
      datasets: [{
        data: [completed, inProgress, pending],
        backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ADD / UPDATE */
async function addOrUpdateTask() {
  const data = {
    title: titleInput.value,
    description: descriptionInput.value,
    status: statusSelect.value
  };

  const url = editId ? `${API}/${editId}` : API;
  const method = editId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  editId = null;
  fetchTasks();
}

/* DELETE */
async function deleteTask(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  fetchTasks();
}

/* EDIT */
function editTask(id) {
  const t = tasks.find(x => x._id === id);
  titleInput.value = t.title;
  descriptionInput.value = t.description;
  statusSelect.value = t.status;
  editId = id;
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
