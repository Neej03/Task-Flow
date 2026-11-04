// TaskFlow frontend — uses the existing Express + MongoDB API.
// Keep only this one script include in index.html.
const API_URL = "/api/tasks";

const state = {
  tasks: [],
  filter: "all",
  schedule: "today",
  editingId: null,
  chart: null,
  toastTimer: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const taskModal = $("#taskModal");
const taskForm = $("#taskForm");
const taskTitle = $("#taskTitle");
const taskDescription = $("#taskDescription");
const taskTableBody = $("#taskTableBody");

const toast = $("#toast");

// Small count-up effect for dashboard metrics.
function animateNumber(element, target) {
  if (!element) return;
  const end = Number(target) || 0;
  const start = Number(element.dataset.currentValue || 0);
  element.dataset.currentValue = String(end);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = end;
    return;
  }
  const duration = 520;
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

async function apiRequest(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }

  const text = await response.text();
  let result = {};
  try { result = text ? JSON.parse(text) : {}; }
  catch { throw new Error("The server returned an invalid response."); }

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function openModal(task = null) {
  state.editingId = task?._id || null;
  $("#modalTitle").textContent = task ? "Edit task" : "Create a task";
  $("#saveTaskButton").innerHTML = task ? "Save changes <span>→</span>" : "Create task <span>→</span>";
  taskTitle.value = task?.title || "";
  taskDescription.value = task?.description || "";
  taskModal.classList.add("open");
  taskModal.setAttribute("aria-hidden", "false");
  setTimeout(() => taskTitle.focus(), 50);
}

function closeModal() {
  taskModal.classList.remove("open");
  taskModal.setAttribute("aria-hidden", "true");
  taskForm.reset();
  state.editingId = null;
}

function getFilteredTasks() {
  const search = $("#searchInput").value.trim().toLowerCase();
  return state.tasks.filter(task => {
    const matchesFilter = state.filter === "all" ||
      (state.filter === "completed" ? task.completed : !task.completed);
    const matchesSearch = !search ||
      `${task.title || ""} ${task.description || ""}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
}

function renderFavourites() {
  const host = $("#favourites");
  const recent = [...state.tasks].slice(0, 4);
  if (!recent.length) {
    host.innerHTML = '<p class="muted small">Your task shortcuts will appear here.</p>';
    return;
  }
  host.innerHTML = recent.map((task, index) => `
    <button class="favourite-item" type="button" data-edit="${escapeHTML(task._id)}" title="${escapeHTML(task.title)}">
      <i class="fav-dot"></i><span>${escapeHTML(task.title)}</span>
    </button>
  `).join("");
}

function renderTable() {
  const filtered = getFilteredTasks();
  if (!filtered.length) {
    taskTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">${state.tasks.length ? "No tasks match this filter." : "No tasks yet. Create your first task to get started."}</td></tr>`;
  } else {
    taskTableBody.innerHTML = filtered.map(task => {
      const percent = task.completed ? 100 : 0;
      return `
        <tr>
          <td><div class="task-name-cell">
            <input class="row-check" type="checkbox" data-toggle="${escapeHTML(task._id)}" ${task.completed ? "checked" : ""} aria-label="Mark ${escapeHTML(task.title)} complete">
            <span class="task-name-text ${task.completed ? "done" : ""}">${escapeHTML(task.title)}</span>
          </div></td>
          <td>${formatDate(task.createdAt)}</td>
          <td>—</td>
          <td><div class="assignee-stack" title="Personal task"><span class="assignee-avatar">N</span></div></td>
          <td><div class="progress-cell"><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><span class="progress-value">${percent}%</span></div></td>
          <td><div class="row-actions">
            <button class="row-action" type="button" data-edit="${escapeHTML(task._id)}">Edit</button>
            <button class="row-action delete" type="button" data-delete="${escapeHTML(task._id)}">Delete</button>
          </div></td>
        </tr>`;
    }).join("");
  }
  $("#tableSummary").textContent = `Showing ${filtered.length} of ${state.tasks.length} tasks`;
}

function renderSchedule() {
  const host = $("#scheduleList");
  let items = state.tasks;
  if (state.schedule === "today") {
    const today = new Date().toDateString();
    items = items.filter(task => task.createdAt && new Date(task.createdAt).toDateString() === today);
  } else if (state.schedule === "pending") {
    items = items.filter(task => !task.completed);
  } else {
    // The current Task model has no dueDate field, so overdue cannot be calculated yet.
    items = [];
  }
  items = [...items].slice(0, 5);
  if (!items.length) {
    const message = state.schedule === "overdue"
      ? "No overdue tasks. (Due dates can be added as a future feature.)"
      : state.schedule === "today" ? "No tasks created today." : "No pending tasks. Nice work!";
    host.innerHTML = `<div class="empty-inline">${message}</div>`;
  } else {
    host.innerHTML = items.map(task => `
      <div class="schedule-item">
        <i class="schedule-bullet"></i>
        <div><strong>${escapeHTML(task.title)}</strong><small>${formatDate(task.createdAt)} · ${task.completed ? "Completed" : "Pending"}</small></div>
      </div>`).join("");
  }
  $("#todayBadge").textContent = state.tasks.filter(task =>
    task.createdAt && new Date(task.createdAt).toDateString() === new Date().toDateString()
  ).length;
}

function renderChart(completed, pending) {
  const canvas = $("#taskChart");
  if (!canvas || !window.Chart) return;
  if (state.chart) state.chart.destroy();
  state.chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ["#8b5cf6", "#17233d"],
        borderColor: ["#111526", "#111526"],
        borderWidth: 3,
        hoverOffset: 9
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "76%",
      plugins: { legend: { display: false }, tooltip: { enabled: true } }
    }
  });
}

function renderStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(task => task.completed).length;
  const pending = total - completed;
  // The current database model stores completed as a boolean, not an in-progress status.
  const inProgress = 0;

  animateNumber($("#completedCount"), completed);
  animateNumber($("#progressCount"), inProgress);
  animateNumber($("#pendingCount"), pending);
  animateNumber($("#totalCount"), total);
  animateNumber($("#chartTotal"), total);
  $("#legendProgress").textContent = inProgress;
  $("#legendCompleted").textContent = completed;
  $("#legendPending").textContent = pending;
  renderChart(completed, pending);
}

function render() {
  renderStats();
  renderTable();
  renderSchedule();
  renderFavourites();
}

async function loadTasks() {
  taskTableBody.innerHTML = '<tr><td colspan="6" class="table-empty">Loading your tasks...</td></tr>';
  try {
    const result = await apiRequest(API_URL);
    state.tasks = Array.isArray(result.data) ? result.data : [];
    render();
  } catch (error) {
    taskTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">${escapeHTML(error.message)} <button class="row-action" id="retryLoad" type="button">Retry</button></td></tr>`;
    $("#retryLoad")?.addEventListener("click", loadTasks);
    showToast(error.message);
  }
}

async function saveTask(event) {
  event.preventDefault();
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();

  if (!title) {
    showToast("Please enter a task name.");
    taskTitle.focus();
    return;
  }
  if (title.length > 150 || description.length > 1000) {
    showToast("Please check the title or description length.");
    return;
  }

  const button = $("#saveTaskButton");
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = state.editingId ? "Saving..." : "Creating...";

  try {
    const isEditing = Boolean(state.editingId);
    const url = isEditing ? `${API_URL}/${encodeURIComponent(state.editingId)}` : API_URL;
    await apiRequest(url, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify({ title, description })
    });
    closeModal();
    await loadTasks();
    showToast(isEditing ? "Task updated successfully." : "Task created successfully.");
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

async function toggleTask(id) {
  const task = state.tasks.find(item => item._id === id);
  if (!task) return;
  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !task.completed })
    });
    await loadTasks();
    showToast(task.completed ? "Task marked as pending." : "Task completed!");
  } catch (error) {
    showToast(error.message);
    renderTable();
  }
}

async function deleteTask(id) {
  const task = state.tasks.find(item => item._id === id);
  if (!task) return;
  if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadTasks();
    showToast("Task deleted.");
  } catch (error) {
    showToast(error.message);
  }
}

// One delegated click handler for task row actions.
document.addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const toggleInput = event.target.closest("[data-toggle]");

  if (editButton) {
    const task = state.tasks.find(item => item._id === editButton.dataset.edit);
    if (task) openModal(task);
  } else if (deleteButton) {
    deleteTask(deleteButton.dataset.delete);
  } else if (toggleInput) {
    toggleTask(toggleInput.dataset.toggle);
  }
});

taskForm.addEventListener("submit", saveTask);
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
taskModal.addEventListener("click", event => {
  if (event.target === taskModal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && taskModal.classList.contains("open")) closeModal();
});

$$(".create-task-trigger").forEach(button => button.addEventListener("click", () => openModal()));

$$(".filter-pill").forEach(button => button.addEventListener("click", () => {
  state.filter = button.dataset.filter;
  $$(".filter-pill").forEach(item => item.classList.toggle("active", item === button));
  renderTable();
}));

$$(".schedule-tab").forEach(button => button.addEventListener("click", () => {
  state.schedule = button.dataset.schedule;
  $$(".schedule-tab").forEach(item => item.classList.toggle("active", item === button));
  renderSchedule();
}));

$("#searchInput").addEventListener("input", renderTable);

$("#lightTheme").addEventListener("click", () => {
  document.body.classList.add("light-theme");
  $("#lightTheme").classList.add("selected");
  $("#darkTheme").classList.remove("selected");
  localStorage.setItem("taskflow-theme", "light");
  renderStats();
});
$("#darkTheme").addEventListener("click", () => {
  document.body.classList.remove("light-theme");
  $("#darkTheme").classList.add("selected");
  $("#lightTheme").classList.remove("selected");
  localStorage.setItem("taskflow-theme", "dark");
  renderStats();
});

$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$$(".nav-link").forEach(button => button.addEventListener("click", () => {
  $$(".nav-link").forEach(item => item.classList.toggle("active", item === button));
  const view = button.dataset.view;
  if (view === "all" || view === "dashboard") {
    state.filter = "all";
    $$(".filter-pill").forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
    renderTable();
    document.querySelector(".recent-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    showToast(view === "members" ? "Team members can be added in a future version." : "Your inbox is clear.");
  }
  $("#sidebar").classList.remove("open");
}));

$("#notificationButton").addEventListener("click", () => showToast("You're all caught up."));
$("#profileButton").addEventListener("click", () => showToast("Welcome to your TaskFlow workspace."));
$("#welcomeName").textContent = localStorage.getItem("taskflow-name") || "there";
$("#year").textContent = new Date().getFullYear();

if (localStorage.getItem("taskflow-theme") === "light") {
  document.body.classList.add("light-theme");
  $("#lightTheme").classList.add("selected");
  $("#darkTheme").classList.remove("selected");
}

loadTasks();


/* Premium dashboard interactions */
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#searchInput")?.focus();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("ui-ready");
});
