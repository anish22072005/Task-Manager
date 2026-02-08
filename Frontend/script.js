// API Configuration
// For development: always use localhost
const API_BASE = "http://localhost:5000";

// For production deployment, uncomment this:
// const API_BASE = location.hostname === "localhost" || location.hostname === "127.0.0.1"
//   ? "http://localhost:5000"
//   : "https://your-backend-url.onrender.com";

const API = `${API_BASE}/api/tasks`;

// Check authentication
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

// DOM Elements
const taskList = document.getElementById("taskList");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusSelect = document.getElementById("status");
const addBtn = document.getElementById("addBtn");

// State
let editId = null;
let tasks = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  addBtn.onclick = addOrUpdateTask;
  fetchTasks();
});

// Fetch all tasks
async function fetchTasks() {
  try {
    const response = await fetch(API, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => logout(), 1500);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    tasks = await response.json();
    renderTasks(tasks);
    
  } catch (error) {
    console.error('Fetch error:', error);
    showToast("Cannot load tasks. Please check your connection.", "error");
  }
}

// Render tasks to UI
function renderTasks(taskArray) {
  taskList.innerHTML = "";
  
  if (taskArray.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>📝 No tasks yet</p>
        <p>Create your first task above!</p>
      </div>
    `;
    return;
  }

  taskArray.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-card";
    
    const statusClass = task.status.replace(/\s+/g, '-');
    
    li.innerHTML = `
      <strong>${escapeHtml(task.title)}</strong>
      <p>${escapeHtml(task.description || 'No description')}</p>
      <span class="status ${statusClass}">${task.status}</span>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask('${task._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;
    
    taskList.appendChild(li);
  });
}

// Add or update task
async function addOrUpdateTask() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const status = statusSelect.value;

  // Validation
  if (!title) {
    showToast("Task title is required", "error");
    titleInput.focus();
    return;
  }

  const data = { title, description, status };

  // Disable button and show loading
  addBtn.disabled = true;
  addBtn.innerText = editId ? "Updating..." : "Adding...";

  try {
    const url = editId ? `${API}/${editId}` : API;
    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => logout(), 1500);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to save task');
    }

    showToast(editId ? "✅ Task updated!" : "✅ Task created!", "success");
    
    // Reset form
    editId = null;
    addBtn.innerText = "Add Task";
    clearForm();
    
    // Refresh tasks
    fetchTasks();

  } catch (error) {
    console.error('Save error:', error);
    showToast("Failed to save task. Please try again.", "error");
  } finally {
    addBtn.disabled = false;
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => logout(), 1500);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    showToast("✅ Task deleted!", "success");
    fetchTasks();
    
  } catch (error) {
    console.error('Delete error:', error);
    showToast("Failed to delete task. Please try again.", "error");
  }
}

// Edit task
function editTask(id) {
  const task = tasks.find(t => t._id === id);
  if (!task) return;

  // Populate form
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  statusSelect.value = task.status;
  
  // Update state
  editId = id;
  addBtn.innerText = "Update Task";
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  titleInput.focus();
}

// Clear form
function clearForm() {
  titleInput.value = "";
  descriptionInput.value = "";
  statusSelect.value = "Pending";
  editId = null;
  addBtn.innerText = "Add Task";
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Show toast notification
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.innerText = message;
  toast.className = `toast ${type}`;
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}