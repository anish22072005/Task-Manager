const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://task-manager-backend-ksiy.onrender.com";

const API = `${API_BASE}/api/tasks`;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

// DOM
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusSelect = document.getElementById("status");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

let chartInstance = null;
let editId = null;
let tasks = [];

addBtn.onclick = saveTask;
fetchTasks();

/* ---------------- TASKS ---------------- */

async function fetchTasks() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return logout();

  tasks = await res.json();
  renderTasks(tasks);
  renderChart(tasks);
}

function renderTasks(list) {
  taskList.innerHTML = "";

  list.forEach(task => {
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

    li.querySelector(".edit-btn").onclick = () => editTask(task);
    li.querySelector(".delete-btn").onclick = () => deleteTask(task._id);

    taskList.appendChild(li);
  });
}

async function saveTask() {
  const data = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusSelect.value
  };

  if (!data.title) return;

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
  titleInput.value = "";
  descriptionInput.value = "";
  statusSelect.value = "Pending";

  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  fetchTasks();
}

function editTask(task) {
  titleInput.value = task.title;
  descriptionInput.value = task.description || "";
  statusSelect.value = task.status;
  editId = task._id;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* ---------------- CHART ---------------- */

function renderChart(tasks) {
  const counts = { Pending: 0, "In Progress": 0, Completed: 0 };

  tasks.forEach(t => counts[t.status]++);

  const total = tasks.length || 1;
  const ctx = document.getElementById("taskChart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        datalabels: {
          color: "#fff",
          font: { weight: "bold" },
          formatter: (value) => {
            const percent = ((value / total) * 100).toFixed(0);
            return percent + "%";
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}