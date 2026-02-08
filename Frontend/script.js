const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
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

async function fetchTasks() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "index.html";
    return;
  }

  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
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
  addBtn.innerText = "Add Task";
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  fetchTasks();
}

function editTask(id) {
  editId = id;
  addBtn.innerText = "Update Task";
}

addBtn.onclick = addOrUpdateTask;
fetchTasks();
