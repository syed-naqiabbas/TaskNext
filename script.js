/* ================================================================
   TASKNEXT — SCRIPT.JS
   Single file: authentication + full application logic.
   Data persists in localStorage. No backend, no frameworks.
   ================================================================ */

/* ================================================================
   SECTION 1 — AUTH (registration, login, session)
   ================================================================ */
const STORAGE_USERS = 'tasknext_users';
const STORAGE_SESSION = 'tasknext_session';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36) + str.length;
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; }
  catch (e) { return []; }
}
function saveUsers(users) { localStorage.setItem(STORAGE_USERS, JSON.stringify(users)); }

function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SESSION)); }
  catch (e) { return null; }
}
function setSession(username) { localStorage.setItem(STORAGE_SESSION, JSON.stringify({ username, loginAt: Date.now() })); }
function clearSession() { localStorage.removeItem(STORAGE_SESSION); }

function getCurrentUserRecord() {
  const session = getSession();
  if (!session) return null;
  return getUsers().find(u => u.username === session.username) || null;
}

function newId() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

/* ---------- Field error helpers ---------- */
function setFieldError(fieldEl, msg) { fieldEl.classList.add('invalid'); const err = fieldEl.querySelector('.error-msg'); if (err) err.textContent = msg; }
function clearFieldError(fieldEl) { fieldEl.classList.remove('invalid'); }
function showFormMsg(el, msg, type) { el.textContent = msg; el.className = 'form-msg show ' + type; }

/* ---------- Auth tab switching ---------- */
function setupAuthTabs() {
  const indicator = document.querySelector('.auth-tab-indicator');
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAuthTab(btn.dataset.authTab));
  });
  document.querySelectorAll('[data-auth-tab-goto]').forEach(el => {
    el.addEventListener('click', () => switchAuthTab(el.dataset.authTabGoto));
  });
}
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.authTab === tab));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(tab === 'login' ? 'loginPanel' : 'registerPanel').classList.add('active');
  const indicator = document.querySelector('.auth-tab-indicator');
  indicator.style.left = tab === 'login' ? '4px' : 'calc(50%)';
}

/* ---------- Seed data for a brand-new account ---------- */
function seedUserData(username) {
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

  const projects = [
    { id: newId(), name: 'Website Relaunch', description: 'Rebuild the marketing site with a new design system.', color: '#0F9C8E', priority: 'High', deadline: addDays(21), createdAt: Date.now() },
    { id: newId(), name: 'Mobile App v2', description: 'Ship offline mode and push notifications.', color: '#3B7DD8', priority: 'Urgent', deadline: addDays(10), createdAt: Date.now() },
    { id: newId(), name: 'Internal Tools', description: 'Improve the admin dashboard and reporting.', color: '#6C5CE7', priority: 'Medium', deadline: addDays(35), createdAt: Date.now() }
  ];

  let taskCounter = 1;
  const code = () => 'TN-' + String(taskCounter++).padStart(3, '0');

  const tasks = [
    { id: newId(), code: code(), title: 'Fix invoice export bug', description: 'PDF export drops the tax line on large invoices.', project: projects[1].id, priority: 'Urgent', status: 'In Progress', dueDate: addDays(0), dueTime: '17:00', subtasks: [{ id: newId(), label: 'Reproduce bug', done: true }, { id: newId(), label: 'Write patch', done: false }, { id: newId(), label: 'Test on staging', done: false }], completed: false, createdAt: Date.now(), completedAt: null },
    { id: newId(), code: code(), title: 'Redesign onboarding flow', description: 'New 3-step onboarding with progress indicator.', project: projects[0].id, priority: 'High', status: 'In Progress', dueDate: addDays(2), dueTime: '18:00', subtasks: [{ id: newId(), label: 'Wireframes', done: true }, { id: newId(), label: 'Hi-fi mockups', done: false }], completed: false, createdAt: Date.now(), completedAt: null },
    { id: newId(), code: code(), title: 'Write Q3 roadmap doc', description: 'Summarize priorities for next quarter.', project: projects[2].id, priority: 'Medium', status: 'Todo', dueDate: addDays(5), dueTime: '12:00', subtasks: [], completed: false, createdAt: Date.now(), completedAt: null },
    { id: newId(), code: code(), title: 'Ship dark mode', description: 'Roll out dark theme to all users.', project: projects[0].id, priority: 'Low', status: 'Done', dueDate: addDays(-2), dueTime: '09:00', subtasks: [{ id: newId(), label: 'QA pass', done: true }], completed: true, createdAt: Date.now() - 90000000, completedAt: Date.now() - 3600000 },
    { id: newId(), code: code(), title: 'Set up push notifications', description: 'Integrate FCM for Android and APNs for iOS.', project: projects[1].id, priority: 'High', status: 'Todo', dueDate: addDays(7), dueTime: '15:00', subtasks: [], completed: false, createdAt: Date.now(), completedAt: null },
    { id: newId(), code: code(), title: 'Review PR #482', description: 'Check the new caching layer for regressions.', project: projects[2].id, priority: 'Medium', status: 'Review', dueDate: addDays(1), dueTime: '11:00', subtasks: [], completed: false, createdAt: Date.now(), completedAt: null },
    { id: newId(), code: code(), title: 'Update API documentation', description: 'Document the new webhook endpoints.', project: projects[2].id, priority: 'Low', status: 'Todo', dueDate: addDays(-1), dueTime: '16:00', subtasks: [], completed: false, createdAt: Date.now(), completedAt: null }
  ];

  const notes = [
    { id: newId(), title: 'Standup notes — Mon', body: 'Backend team blocked on staging env. Frontend on track for Friday demo.', pinned: true, createdAt: Date.now() - 200000 },
    { id: newId(), title: 'Client call takeaways', body: 'They want the export feature prioritized. Follow up with a timeline by Thursday.', pinned: false, createdAt: Date.now() - 500000 },
    { id: newId(), title: 'Ideas for v2', body: 'Keyboard shortcuts, bulk task actions, saved filters.', pinned: false, createdAt: Date.now() - 900000 }
  ];

  const notifications = [
    { id: newId(), title: 'Fix invoice export bug is due today.', body: 'TN-001 · Urgent priority', time: Date.now() - 1800000, read: false, type: 'urgent' },
    { id: newId(), title: 'Update API documentation is overdue.', body: 'TN-007 was due yesterday.', time: Date.now() - 10800000, read: false, type: 'warning' },
    { id: newId(), title: 'You shipped dark mode 🎉', body: 'Great work closing out that task.', time: Date.now() - 18000000, read: true, type: 'success' }
  ];

  const settings = { theme: 'light', notifEnabled: true, reminderMinutes: 30, defaultPriority: 'Medium' };

  localStorage.setItem(`tn_tasks_${username}`, JSON.stringify(tasks));
  localStorage.setItem(`tn_projects_${username}`, JSON.stringify(projects));
  localStorage.setItem(`tn_notes_${username}`, JSON.stringify(notes));
  localStorage.setItem(`tn_notifications_${username}`, JSON.stringify(notifications));
  localStorage.setItem(`tn_settings_${username}`, JSON.stringify(settings));
  localStorage.setItem(`tn_taskcounter_${username}`, JSON.stringify(taskCounter));
}

/* ---------- Login handler ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const msgEl = document.getElementById('loginMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameField = document.getElementById('loginUsernameField');
    const passwordField = document.getElementById('loginPasswordField');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    clearFieldError(usernameField); clearFieldError(passwordField); msgEl.classList.remove('show');
    let valid = true;
    if (!username) { setFieldError(usernameField, 'Enter your username.'); valid = false; }
    if (!password) { setFieldError(passwordField, 'Enter your password.'); valid = false; }
    if (!valid) return;

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.password !== simpleHash(password)) {
      showFormMsg(msgEl, 'Incorrect username or password. Please try again.', 'error');
      return;
    }
    setSession(user.username);
    showFormMsg(msgEl, 'Welcome back! Loading your workspace…', 'success');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Signing in…';
    setTimeout(() => bootApp(), 500);
  });
}

/* ---------- Register handler ---------- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  const msgEl = document.getElementById('registerMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullNameField = document.getElementById('regFullNameField');
    const usernameField = document.getElementById('regUsernameField');
    const passwordField = document.getElementById('regPasswordField');
    const confirmField = document.getElementById('regConfirmField');
    [fullNameField, usernameField, passwordField, confirmField].forEach(clearFieldError);
    msgEl.classList.remove('show');

    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    let valid = true;
    if (fullName.length < 2) { setFieldError(fullNameField, 'Enter your full name.'); valid = false; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setFieldError(usernameField, '3-20 characters: letters, numbers, underscore only.'); valid = false; }
    if (password.length < 6) { setFieldError(passwordField, 'Password must be at least 6 characters.'); valid = false; }
    if (confirm !== password || !confirm) { setFieldError(confirmField, 'Passwords do not match.'); valid = false; }
    if (!valid) return;

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setFieldError(usernameField, 'This username is already taken.');
      showFormMsg(msgEl, 'That username is already in use. Please choose another.', 'error');
      return;
    }

    const newUser = { fullName, username, password: simpleHash(password), createdAt: Date.now() };
    users.push(newUser);
    saveUsers(users);
    seedUserData(username);
    setSession(username);

    showFormMsg(msgEl, 'Workspace created! Loading your dashboard…', 'success');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Creating workspace…';
    setTimeout(() => bootApp(), 600);
  });
}

function logout() {
  clearSession();
  window.location.reload();
}

/* ================================================================
   ENTRY POINT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setupAuthTabs();
  initLoginForm();
  initRegisterForm();
  refreshIcons();

  const session = getSession();
  if (session && getCurrentUserRecord()) {
    bootApp();
  }
});

function refreshIcons() { if (window.lucide) lucide.createIcons(); }
