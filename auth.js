/* ============================================================
   STUDYTRACK — AUTH.JS
   Handles registration, login, session, and page protection.
   Data is stored in localStorage. Passwords are lightly hashed
   (not cryptographically secure — this is a client-only demo).
   ============================================================ */

const STORAGE_USERS = 'studytrack_users';
const STORAGE_SESSION = 'studytrack_session';

/* ---------- Utilities ---------- */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36) + str.length;
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION));
  } catch (e) {
    return null;
  }
}

function setSession(username, remember) {
  const session = { username, remember, loginAt: Date.now() };
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.username === session.username) || null;
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  const user = getCurrentUser();
  if (!user) {
    clearSession();
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function redirectIfLoggedIn() {
  const session = getSession();
  if (session && getCurrentUser()) {
    window.location.href = 'index.html';
  }
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

/* ---------- Seed data for a brand-new account ---------- */
function seedUserData(username) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

  const tasks = [
    { id: cryptoId(), title: 'Complete Mathematics Assignment', description: 'Finish exercises 4-9 from chapter 3.', category: 'Assignment', subject: 'Mathematics', priority: 'High', dueDate: addDays(0), dueTime: '18:00', duration: 60, status: 'Pending', completed: false, createdAt: Date.now() },
    { id: cryptoId(), title: 'Read Physics Chapter 4', description: 'Focus on thermodynamics section.', category: 'Study', subject: 'Physics', priority: 'Medium', dueDate: addDays(0), dueTime: '20:00', duration: 45, status: 'Pending', completed: false, createdAt: Date.now() },
    { id: cryptoId(), title: 'Submit Lab Report', description: 'Chemistry titration experiment report.', category: 'Homework', subject: 'Chemistry', priority: 'High', dueDate: addDays(1), dueTime: '09:00', duration: 30, status: 'Pending', completed: false, createdAt: Date.now() },
    { id: cryptoId(), title: 'Review lecture notes', description: 'Recap this week\'s CS lecture on data structures.', category: 'Personal', subject: 'Computer Science', priority: 'Low', dueDate: addDays(0), dueTime: '21:00', duration: 20, status: 'Pending', completed: true, createdAt: Date.now() }
  ];

  const homework = [
    { id: cryptoId(), title: 'Algebra Problem Set 5', description: 'Solve quadratic equations, questions 1-20.', subject: 'Mathematics', assignedDate: addDays(-3), dueDate: addDays(1), priority: 'High', status: 'Pending' },
    { id: cryptoId(), title: 'Essay: Industrial Revolution', description: 'Write a 500-word essay on its economic impact.', subject: 'History', assignedDate: addDays(-5), dueDate: addDays(-1), priority: 'Medium', status: 'Overdue' },
    { id: cryptoId(), title: 'Vocabulary Worksheet', description: 'Unit 6 vocabulary and sentence usage.', subject: 'English', assignedDate: addDays(-2), dueDate: addDays(3), priority: 'Low', status: 'Pending' },
    { id: cryptoId(), title: 'Circuit Diagram Practice', description: 'Draw and label 3 series-parallel circuits.', subject: 'Physics', assignedDate: addDays(-6), dueDate: addDays(-4), priority: 'Medium', status: 'Completed' }
  ];

  const exams = [
    { id: cryptoId(), title: 'Mathematics Midterm', subject: 'Mathematics', examDate: addDays(12), topics: ['Algebra', 'Trigonometry', 'Calculus Basics'], checklist: [
      { id: cryptoId(), label: 'Chapter 1: Algebra', done: true },
      { id: cryptoId(), label: 'Chapter 2: Trigonometry', done: true },
      { id: cryptoId(), label: 'Chapter 3: Calculus Basics', done: false },
      { id: cryptoId(), label: 'Practice Questions', done: false },
      { id: cryptoId(), label: 'Mock Test', done: false }
    ], notes: 'Focus more on integration problems.' },
    { id: cryptoId(), title: 'Physics Unit Test', subject: 'Physics', examDate: addDays(5), topics: ['Thermodynamics', 'Optics'], checklist: [
      { id: cryptoId(), label: 'Chapter 4: Thermodynamics', done: true },
      { id: cryptoId(), label: 'Chapter 5: Optics', done: false },
      { id: cryptoId(), label: 'Practice Questions', done: false }
    ], notes: '' }
  ];

  const projects = [
    { id: cryptoId(), name: 'Website Development Project', description: 'Build a portfolio website using HTML, CSS and JS.', subject: 'Computer Science', startDate: addDays(-14), deadline: addDays(10), priority: 'High', tasks: [
      { id: cryptoId(), label: 'Research', done: true },
      { id: cryptoId(), label: 'UI Design', done: true },
      { id: cryptoId(), label: 'HTML Structure', done: true },
      { id: cryptoId(), label: 'CSS Styling', done: false },
      { id: cryptoId(), label: 'JavaScript', done: false },
      { id: cryptoId(), label: 'Testing', done: false }
    ] }
  ];

  const studySessions = [
    { id: cryptoId(), subject: 'Mathematics', topic: 'Algebra Practice', date: addDays(0), start: '09:00', end: '10:00', notes: 'Focus on factoring.', completed: true },
    { id: cryptoId(), subject: 'Physics', topic: 'Chapter 4 Revision', date: addDays(0), start: '11:00', end: '12:00', notes: '', completed: false },
    { id: cryptoId(), subject: 'Computer Science', topic: 'JavaScript Practice', date: addDays(0), start: '16:00', end: '17:00', notes: 'Build small DOM exercises.', completed: false },
    { id: cryptoId(), subject: 'Chemistry', topic: 'Periodic Table Review', date: addDays(1), start: '10:00', end: '11:00', notes: '', completed: false }
  ];

  const schedule = [
    { id: cryptoId(), title: 'Mathematics Class', category: 'class', date: addDays(0), start: '08:00', end: '09:00' },
    { id: cryptoId(), title: 'Algebra Practice', category: 'study', date: addDays(0), start: '09:00', end: '10:00' },
    { id: cryptoId(), title: 'Physics Lab', category: 'class', date: addDays(1), start: '10:00', end: '11:30' },
    { id: cryptoId(), title: 'History Essay Due', category: 'assignment', date: addDays(-1), start: '09:00', end: '09:30' },
    { id: cryptoId(), title: 'Physics Unit Test', category: 'exam', date: addDays(5), start: '09:00', end: '10:30' },
    { id: cryptoId(), title: 'Website Project Sync', category: 'project', date: addDays(2), start: '17:00', end: '18:00' },
    { id: cryptoId(), title: 'Gym Session', category: 'personal', date: addDays(0), start: '19:00', end: '20:00' }
  ];

  const notifications = [
    { id: cryptoId(), title: 'Mathematics Assignment is due today.', body: 'Complete Mathematics Assignment — High priority.', time: Date.now() - 1000 * 60 * 30, read: false, type: 'warning' },
    { id: cryptoId(), title: 'Physics exam is in 5 days.', body: 'Physics Unit Test — 42% prepared so far.', time: Date.now() - 1000 * 60 * 60 * 3, read: false, type: 'info' },
    { id: cryptoId(), title: 'You completed a task today.', body: 'Nice work staying on track — keep it up!', time: Date.now() - 1000 * 60 * 60 * 5, read: true, type: 'success' },
    { id: cryptoId(), title: 'History Essay is overdue.', body: 'Essay: Industrial Revolution was due yesterday.', time: Date.now() - 1000 * 60 * 60 * 20, read: true, type: 'danger' }
  ];

  const settings = {
    theme: 'light',
    notifEnabled: true,
    reminderMinutes: 30,
    defaultPriority: 'Medium'
  };

  localStorage.setItem(`st_tasks_${username}`, JSON.stringify(tasks));
  localStorage.setItem(`st_homework_${username}`, JSON.stringify(homework));
  localStorage.setItem(`st_exams_${username}`, JSON.stringify(exams));
  localStorage.setItem(`st_projects_${username}`, JSON.stringify(projects));
  localStorage.setItem(`st_study_${username}`, JSON.stringify(studySessions));
  localStorage.setItem(`st_schedule_${username}`, JSON.stringify(schedule));
  localStorage.setItem(`st_notifications_${username}`, JSON.stringify(notifications));
  localStorage.setItem(`st_settings_${username}`, JSON.stringify(settings));
}

function cryptoId() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------- Field error helpers ---------- */
function setFieldError(fieldEl, msg) {
  fieldEl.classList.add('invalid');
  const err = fieldEl.querySelector('.error-msg');
  if (err) err.textContent = msg;
}
function clearFieldError(fieldEl) {
  fieldEl.classList.remove('invalid');
}
function showFormMsg(el, msg, type) {
  el.textContent = msg;
  el.className = 'form-msg show ' + type;
}

/* ---------- Login page logic ---------- */
function initLoginPage() {
  redirectIfLoggedIn();
  const form = document.getElementById('loginForm');
  if (!form) return;
  const msgEl = document.getElementById('loginMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameField = document.getElementById('loginUsernameField');
    const passwordField = document.getElementById('loginPasswordField');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    clearFieldError(usernameField);
    clearFieldError(passwordField);
    msgEl.classList.remove('show');

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

    setSession(user.username, remember);
    showFormMsg(msgEl, 'Welcome back! Redirecting to your dashboard…', 'success');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    setTimeout(() => { window.location.href = 'index.html'; }, 550);
  });
}

/* ---------- Register page logic ---------- */
function initRegisterPage() {
  redirectIfLoggedIn();
  const form = document.getElementById('registerForm');
  if (!form) return;
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

    const newUser = {
      fullName,
      username,
      password: simpleHash(password),
      studentId: 'STU' + Math.floor(100000 + Math.random() * 899999),
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
      createdAt: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
    seedUserData(username);
    setSession(username, true);

    showFormMsg(msgEl, 'Account created! Taking you to your dashboard…', 'success');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    setTimeout(() => { window.location.href = 'index.html'; }, 650);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();
});
