/* ---------- AUTH ---------- */
function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  localStorage.setItem("loggedIn", "true"); // ✅ lowercase
  checkAuth();
}

function logout() {
  localStorage.removeItem("loggedIn");
  checkAuth();
}

function checkAuth() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  loginContainer.style.display = loggedIn ? "none" : "block";
  taskContainer.style.display = loggedIn ? "block" : "none";
}

/* ---------- API ---------- */
const API =
  location.hostname === "localhost"
    ? "http://localhost:5000/api/tasks"
    : "https://task-manager-backend-ksiy.onrender.com/api/tasks";

/* ---------- TASK LOGIC ---------- */
let allTasks = [];
let editTaskId = null;
let chart = null;

async function fetchTasks() {
  const res = await fetch(API);
  allTasks = await res.json();
  renderTasks(allTasks);
  updateChart();
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || ""}</p>
      <small>${task.status}</small>
      <button onclick="editTask('${task._id}')">Edit</button>
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;
    taskList.appendChild(li);
  });
}

async function addOrUpdateTask() {
  const data = {
    title: title.value.trim(),
    description: description.value.trim(),
    status: status.value
  };

  if (!data.title) return alert("Title required");

  const method = editTaskId ? "PUT" : "POST";
  const url = editTaskId ? `${API}/${editTaskId}` : API;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  editTaskId = null;
  addBtn.innerText = "Add Task";
  clearForm();
  fetchTasks();
}

function editTask(id) {
  const task = allTasks.find(t => t._id === id);
  title.value = task.title;
  description.value = task.description || "";
  status.value = task.status;
  editTaskId = id;
  addBtn.innerText = "Update Task";
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchTasks();
}

function clearForm() {
  title.value = "";
  description.value = "";
  status.value = "Pending";
}

function setFilter(type, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (type === "All") renderTasks(allTasks);
  else renderTasks(allTasks.filter(t => t.status === type));
}

/* ---------- CHART ---------- */
function updateChart() {
  const completed = allTasks.filter(t => t.status === "Completed").length;
  const pending = allTasks.filter(t => t.status === "Pending").length;
  const progress = allTasks.filter(t => t.status === "In Progress").length;

  if (chart) chart.destroy();

  chart = new Chart(progressChart, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending", "In Progress"],
      datasets: [{
        data: [completed, pending, progress],
        backgroundColor: ["#22c55e", "#facc15", "#3b82f6"]
      }]
    }
  });
}

/* ---------- INIT ---------- */
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginContainer = document.getElementById("loginContainer");
const taskContainer = document.getElementById("taskContainer");
const taskList = document.getElementById("taskList");
const title = document.getElementById("title");
const description = document.getElementById("description");
const status = document.getElementById("status");
const addBtn = document.getElementById("addBtn");

addBtn.onclick = addOrUpdateTask;
checkAuth();
fetchTasks();
