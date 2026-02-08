const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://task-manager-backend-ksiy.onrender.com";

const API = `${API_BASE}/api/tasks`;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const taskList = document.getElementById("taskList");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusSelect = document.getElementById("status");
const addBtn = document.getElementById("addBtn");

let editId = null;
let chart;

/* ---------------- FETCH TASKS ---------------- */
async function fetchTasks() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert("Session expired. Login again.");
    logout();
    return;
  }

  const tasks = await res.json();
  renderTasks(tasks);
  updateAnalytics(tasks);
}

/* ---------------- RENDER TASKS ---------------- */
function renderTasks(tasks) {
  taskList.innerHTML = "";

  tasks.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${t.title}</strong>
      <p>${t.description || ""}</p>
      <span class="status ${t.status.replace(" ", "-")}">${t.status}</span>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask('${t._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${t._id}')">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

/* ---------------- ADD / UPDATE ---------------- */
async function addOrUpdateTask() {
  const data = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusSelect.value
  };

  if (!data.title) {
    alert("Title required");
    return;
  }

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
  addBtn.innerText = "Add Task";
  clearForm();
  fetchTasks();
}

/* ---------------- DELETE ---------------- */
async function deleteTask(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  fetchTasks();
}

/* ---------------- EDIT ---------------- */
function editTask(id) {
  editId = id;
  addBtn.innerText = "Update Task";
}

/* ---------------- ANALYTICS + CHART ---------------- */
function updateAnalytics(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;

  document.getElementById("totalTasks").innerText = total;
  document.getElementById("completedTasks").innerText = completed;
  document.getElementById("pendingTasks").innerText = pending;

  renderChart(completed, pending);
}

function renderChart(completed, pending) {
  const ctx = document.getElementById("taskChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ["#10b981", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ---------------- UTILS ---------------- */
function clearForm() {
  titleInput.value = "";
  descriptionInput.value = "";
  statusSelect.value = "Pending";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

addBtn.onclick = addOrUpdateTask;
fetchTasks();
