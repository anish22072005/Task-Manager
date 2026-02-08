const API =
  location.hostname === "localhost"
    ? "http://localhost:5000/api/tasks"
    : "https://task-manager-backend-ksiy.onrender.com/api/tasks";

const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const taskList = document.getElementById("taskList");
const title = document.getElementById("title");
const description = document.getElementById("description");
const status = document.getElementById("status");
const addBtn = document.getElementById("addBtn");

let editId = null;

addBtn.onclick = addOrUpdateTask;
fetchTasks();

async function fetchTasks() {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
    title: title.value,
    description: description.value,
    status: status.value
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
  clearForm();
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

function clearForm() {
  title.value = "";
  description.value = "";
  status.value = "Pending";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
