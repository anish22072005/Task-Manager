let allTasks = [];
let editTaskId = null;

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
  document.getElementById("totalCount").innerText=allTasks.length;
  document.getElementById("completedCount").innerText=allTasks.filter(t=>t.status !== "Completed").length;
  document.getElementById("pendingCount").innerText=allTasks.filter(t=>t.status !== "Completed").length;
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