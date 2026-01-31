let allTasks = [];
let editTaskId = null;

async function fetchTasks() {
  const res = await fetch("http://localhost:5000/api/tasks");
  allTasks = await res.json();
  renderTasks(allTasks);
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description}</p>
      <span class="status ${task.status.replace(" ", "")}">
        ${task.status}
      </span>

      <div class="task-actions">
        <button class="edit-btn" onclick='editTask(${JSON.stringify(task)})'>Edit</button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function setFilter(status, btn) {
  document.querySelectorAll(".filter-btn")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");

  if (status === "All") {
    renderTasks(allTasks);
  } else {
    renderTasks(allTasks.filter(task => task.status === status));
  }
}

async function deleteTask(id) {
  await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

function editTask(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("status").value = task.status;

  editTaskId = task._id;
  document.getElementById("addBtn").innerText = "Update Task";
}

fetchTasks();
