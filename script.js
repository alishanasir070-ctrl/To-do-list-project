document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const appScreen = document.getElementById("appScreen");
  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");

  const taskInput = document.getElementById("taskInput");
  const taskTime = document.getElementById("taskTime");
  const addBtn = document.getElementById("addBtn");
  const taskList = document.getElementById("taskList");

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const welcomeThemeToggleBtn = document.getElementById("welcomeThemeToggleBtn");

  const totalCount = document.getElementById("totalCount");
  const completedCount = document.getElementById("completedCount");
  const remainingCount = document.getElementById("remainingCount");

  // Theme Logic
  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    const btnText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    if (themeToggleBtn) themeToggleBtn.innerText = btnText;
    if (welcomeThemeToggleBtn) welcomeThemeToggleBtn.innerText = btnText;
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggleBtn) themeToggleBtn.innerText = "☀️ Light Mode";
    if (welcomeThemeToggleBtn) welcomeThemeToggleBtn.innerText = "☀️ Light Mode";
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
  if (welcomeThemeToggleBtn) welcomeThemeToggleBtn.addEventListener("click", toggleTheme);

  // Screen Switching
  startBtn.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  });

  backBtn.addEventListener("click", () => {
    appScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
  });

  // App Core
  loadTasks();
  addBtn.addEventListener("click", addTask);

  function addTask() {
    const text = taskInput.value.trim();
    const time = taskTime.value;

    if (text === "") {
      alert("Please enter a task name!");
      return;
    }

    const taskObj = { 
      id: Date.now(), 
      text: text, 
      time: time, 
      completed: false, 
      pinned: false, 
      triggered: false 
    };

    saveTaskToStorage(taskObj);
    loadTasks();

    taskInput.value = "";
    taskTime.value = "";
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);
    if (task.completed) li.classList.add("completed");
    if (task.pinned) li.classList.add("pinned");

    li.innerHTML = `
      <div class="task-info">
        <span class="task-text">${task.pinned ? '📌 ' : ''}${task.text}</span>
        ${task.time ? `<span class="task-time-tag">⏰ ${task.time}</span>` : ''}
      </div>
      <div class="actions">
        <button class="pin-btn ${task.pinned ? 'active' : ''}">📌</button>
        <button class="check-btn">✓</button>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    li.querySelector(".pin-btn").onclick = () => togglePin(task.id);
    li.querySelector(".check-btn").onclick = () => toggleComplete(task.id);
    li.querySelector(".edit-btn").onclick = () => editTask(task.id);
    li.querySelector(".delete-btn").onclick = () => deleteTask(task.id);

    taskList.appendChild(li);
  }

  function togglePin(id) {
    let tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === id);
    task.pinned = !task.pinned;
    localStorage.setItem("routineTasks", JSON.stringify(tasks));
    loadTasks();
  }

  function toggleComplete(id) {
    let tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    localStorage.setItem("routineTasks", JSON.stringify(tasks));
    loadTasks();
  }

  function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem("routineTasks", JSON.stringify(tasks));
  }

  function getTasksFromStorage() {
    return localStorage.getItem("routineTasks") ? JSON.parse(localStorage.getItem("routineTasks")) : [];
  }

  function loadTasks() {
    taskList.innerHTML = "";
    let tasks = getTasksFromStorage();

    // Sort: Pinned tasks first, unpinned tasks after
    tasks.sort((a, b) => Number(b.pinned) - Number(a.pinned));

    tasks.forEach(task => createTaskElement(task));
    updateStats();
  }

  function deleteTask(id) {
    let tasks = getTasksFromStorage().filter(t => t.id !== id);
    localStorage.setItem("routineTasks", JSON.stringify(tasks));
    loadTasks();
  }

  function editTask(id) {
    let tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit Task Name:", task.text);
    if (newText) {
      task.text = newText.trim();
      localStorage.setItem("routineTasks", JSON.stringify(tasks));
      loadTasks();
    }
  }

  function updateStats() {
    const tasks = getTasksFromStorage();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    
    totalCount.innerText = total;
    completedCount.innerText = completed;
    remainingCount.innerText = total - completed;
  }

  // Alarm Check
  setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let tasks = getTasksFromStorage();
    let updated = false;

    tasks.forEach(task => {
      if (task.time === currentTime && !task.triggered && !task.completed) {
        triggerAlarm(task.text);
        task.triggered = true;
        updated = true;
      }
    });

    if (updated) localStorage.setItem("routineTasks", JSON.stringify(tasks));
  }, 1000);

  function triggerAlarm(taskText) {
    if (Notification.permission === "granted") {
      new Notification("Task Reminder!", { body: taskText });
    } else {
      alert(`⏰ Reminder: ${taskText}`);
    }
  }
});