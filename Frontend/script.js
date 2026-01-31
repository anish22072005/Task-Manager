const API = "http://localhost:5000/api/tasks";
let editTaskId = null;

async function fetchTasks() {
  const res = await fetch(API);
  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || ""}</p>

      <div class="status ${task.status.replace(" ", "-")}">
        ${task.status === "Pending" ? "⏳" : task.status === "In Progress" ? "🚧" : "✅"}
        ${task.status}
      </div>

      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    li.querySelector(".edit-btn").addEventListener("click", () => {
      editTask(task);
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task._id);
    });

    list.appendChild(li);
  });
}
async function addTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const status = document.getElementById("status").value;

  if (!title) {
    alert("Title is required");
    return;
  }

  const data = { title, description, status };

  if (editTaskId) {
    await fetch(`${API}/${editTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    editTaskId = null;
    document.getElementById("addBtn").innerText = "Add Task";
  } else {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  clearForm();
  fetchTasks();
}

function editTask(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description || "";
  document.getElementById("status").value = task.status;

  editTaskId = task._id;
  document.getElementById("addBtn").innerText = "Update Task";
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchTasks();
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "Pending";
}

fetchTasks();
