/* ============================================================
   STUDYTRACK — SCRIPT.JS
   Main application logic: data, rendering, interactions.
   ============================================================ */

/* ---------- Guard: must be logged in ---------- */
const currentUser = requireAuth();

/* ---------- Data store ---------- */
const DK = { // storage key builders
  tasks: () => `st_tasks_${currentUser.username}`,
  homework: () => `st_homework_${currentUser.username}`,
  exams: () => `st_exams_${currentUser.username}`,
  projects: () => `st_projects_${currentUser.username}`,
  study: () => `st_study_${currentUser.username}`,
  schedule: () => `st_schedule_${currentUser.username}`,
  notifications: () => `st_notifications_${currentUser.username}`,
  settings: () => `st_settings_${currentUser.username}`
};

function load(type) {
  try { return JSON.parse(localStorage.getItem(DK[type]())) || []; }
  catch (e) { return []; }
}
function save(type, data) {
  localStorage.setItem(DK[type](), JSON.stringify(data));
}
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(DK.settings())) || { theme: 'light', notifEnabled: true, reminderMinutes: 30, defaultPriority: 'Medium' }; }
  catch (e) { return { theme: 'light', notifEnabled: true, reminderMinutes: 30, defaultPriority: 'Medium' }; }
}
function saveSettings(s) { localStorage.setItem(DK.settings(), JSON.stringify(s)); }

let state = {
  tasks: load('tasks'),
  homework: load('homework'),
  exams: load('exams'),
  projects: load('projects'),
  study: load('study'),
  schedule: load('schedule'),
  notifications: load('notifications'),
  settings: loadSettings(),
  taskFilter: 'all',
  taskSort: 'newest',
  hwFilter: 'all',
  scheduleView: 'week',
  weekStart: getMonday(new Date())
};

function persist(type) { save(type, state[type]); }

function newId() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

/* ---------- Date helpers ---------- */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function isoOf(d) { return d.toISOString().slice(0, 10); }
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDaysToDate(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}
function niceDueLabel(dateStr) {
  const n = daysUntil(dateStr);
  if (n === 0) return 'Due Today';
  if (n === 1) return 'Due Tomorrow';
  if (n === -1) return 'Overdue by 1 day';
  if (n < -1) return `Overdue by ${Math.abs(n)} days`;
  if (n > 1 && n <= 7) return `Due in ${n} days`;
  return formatDatePretty(dateStr);
}
function formatDatePretty(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatTimePretty(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ---------- Icons refresh helper ---------- */
function refreshIcons() { if (window.lucide) lucide.createIcons(); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.settings.theme, false);
  setupSidebarUser();
  setupNav();
  setupMobileMenu();
  setupModals();
  setupTaskModal();
  setupHomeworkModal();
  setupStudyModal();
  setupExamModal();
  setupProjectModal();
  setupEventModal();
  setupSettingsPage();
  setupSearch();
  setupTopbarActions();
  populateAllSubjectSelects();

  renderDashboard();
  renderTasksPage();
  renderSchedulePage();
  renderStudyPage();
  renderHomeworkPage();
  renderExamsPage();
  renderProjectsPage();
  renderProgressPage();
  renderNotificationsPage();
  renderProfilePage();
  generateLiveNotifications();
  updateNotifBadges();

  refreshIcons();
});

/* ============================================================
   SIDEBAR / NAV
   ============================================================ */
function setupSidebarUser() {
  const initials = currentUser.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarUserName').textContent = currentUser.fullName;
  document.getElementById('sidebarUserHandle').textContent = '@' + currentUser.username;
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => gotoPage(item.dataset.page));
  });
  document.getElementById('sidebarUserBtn').addEventListener('click', () => gotoPage('profile'));
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => gotoPage(el.dataset.goto));
  });
}

function gotoPage(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.getElementById('pageContainer').scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeSidebarMobile();
  if (page === 'progress') renderProgressPage();
  if (page === 'profile') renderProfilePage();
}

function setupMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  document.getElementById('menuBtn').addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
  });
  backdrop.addEventListener('click', closeSidebarMobile);
}
function closeSidebarMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
}

/* ============================================================
   TOASTS
   ============================================================ */
const TOAST_ICONS = {
  success: { icon: 'check-circle-2', tone: 'tone-success' },
  info: { icon: 'info', tone: 'tone-info' },
  warning: { icon: 'alert-triangle', tone: 'tone-amber' },
  danger: { icon: 'x-circle', tone: 'tone-danger' }
};
function showToast(title, msg, type = 'success') {
  const stack = document.getElementById('toastStack');
  const cfg = TOAST_ICONS[type] || TOAST_ICONS.success;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-icon ${cfg.tone}"><i data-lucide="${cfg.icon}" class="icon" style="width:16px;height:16px;"></i></div>
    <div class="toast-body"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(msg || '')}</span></div>
    <div class="toast-close"><i data-lucide="x" class="icon" style="width:14px;height:14px;"></i></div>`;
  stack.appendChild(el);
  refreshIcons();
  const remove = () => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 280);
  };
  el.querySelector('.toast-close').addEventListener('click', remove);
  setTimeout(remove, 3800);
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ============================================================
   GENERIC MODAL PLUMBING
   ============================================================ */
function setupModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
    overlay.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(overlay.id)));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.show').forEach(m => closeModal(m.id));
  });
}
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

let confirmCallback = null;
function openConfirm(text, onConfirm) {
  document.getElementById('confirmModalText').textContent = text;
  confirmCallback = onConfirm;
  openModal('confirmModal');
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeModal('confirmModal');
  });
});

/* ============================================================
   SUBJECT SELECTS
   ============================================================ */
function populateAllSubjectSelects() {
  const subjects = currentUser.subjects || ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  ['taskSubject', 'hwSubject', 'studySubject', 'examSubject', 'projectSubject'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  });
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme, showFx) {
  document.documentElement.setAttribute('data-theme', theme);
  state.settings.theme = theme;
  saveSettings(state.settings);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '<i data-lucide="sun" class="icon"></i>' : '<i data-lucide="moon" class="icon"></i>';
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.toggle('active', o.dataset.theme === theme));
  refreshIcons();
}

function setupTopbarActions() {
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    applyTheme(state.settings.theme === 'dark' ? 'light' : 'dark', true);
  });
  document.getElementById('quickAddBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('dashAddTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('tasksAddBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('dashAddStudyBtn').addEventListener('click', () => openStudyModal());
  document.getElementById('notifBtn').addEventListener('click', () => gotoPage('notifications'));
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard() {
  const dateEl = document.querySelector('#dashDate span');
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = currentUser.fullName.split(' ')[0];
  document.getElementById('dashGreeting').textContent = `${greeting}, ${firstName} 👋`;

  renderStatCards();
  renderTodayTasks();
  renderActivityChart('activityChart');
  renderDashRing();
  renderDashExamList();
  renderDashDueSoon();
}

function computeStats() {
  const tasks = state.tasks;
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const dueSoon = tasks.filter(t => !t.completed && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 2).length;
  const overdue = tasks.filter(t => !t.completed && daysUntil(t.dueDate) < 0).length;

  const weekStart = getMonday(new Date());
  const weekEnd = addDaysToDate(weekStart, 6);
  const studyMinutes = state.study.filter(s => {
    const d = new Date(s.date + 'T00:00:00');
    return d >= weekStart && d <= weekEnd;
  }).reduce((sum, s) => sum + minutesBetween(s.start, s.end), 0);
  const studyHours = (studyMinutes / 60).toFixed(1);

  const upcomingExams = state.exams.filter(e => daysUntil(e.examDate) >= 0).sort((a, b) => daysUntil(a.examDate) - daysUntil(b.examDate));
  const nearestExam = upcomingExams[0];

  return { total, completed, pending, dueSoon, overdue, studyHours, nearestExam };
}

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function renderStatCards() {
  const s = computeStats();
  const cards = [
    { icon: 'list-checks', tone: 'tone-primary', value: s.total, label: 'Total Tasks', trend: `${currentUser.subjects.length} subjects`, trendTone: 'flat' },
    { icon: 'check-circle-2', tone: 'tone-success', value: s.completed, label: 'Completed', trend: s.total ? `${Math.round(s.completed / s.total * 100)}% of total` : '0%', trendTone: 'up' },
    { icon: 'clock', tone: 'tone-amber', value: s.pending, label: 'Pending', trend: `${s.pending} to go`, trendTone: 'flat' },
    { icon: 'alert-triangle', tone: 'tone-danger', value: s.dueSoon, label: 'Due Soon', trend: s.overdue > 0 ? `${s.overdue} overdue` : 'On track', trendTone: s.overdue > 0 ? 'down' : 'up' },
    { icon: 'book-open', tone: 'tone-info', value: s.studyHours + 'h', label: 'Study Hours', trend: 'This week', trendTone: 'flat' },
    { icon: 'target', tone: 'tone-primary', value: s.nearestExam ? daysUntil(s.nearestExam.examDate) : '—', label: 'Exam Countdown', trend: s.nearestExam ? s.nearestExam.subject : 'No exams', trendTone: 'flat' }
  ];
  document.getElementById('statGrid').innerHTML = cards.map(c => `
    <div class="card stat-card">
      <div class="stat-top">
        <div class="stat-icon ${c.tone}"><i data-lucide="${c.icon}" class="icon" style="width:19px;height:19px;"></i></div>
        <span class="stat-trend ${c.trendTone}">${escapeHtml(String(c.trend))}</span>
      </div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join('');
  refreshIcons();
}

function renderTodayTasks() {
  const today = todayISO();
  const list = state.tasks.filter(t => t.dueDate === today).sort((a, b) => (a.completed - b.completed) || priorityWeight(b.priority) - priorityWeight(a.priority));
  const container = document.getElementById('todayTasksList');
  if (!list.length) {
    container.innerHTML = emptyState('calendar-check', "Nothing due today", "Enjoy the breathing room, or add a task to get ahead.");
    return;
  }
  container.innerHTML = list.map(taskItemHtml).join('');
  bindTaskItemEvents(container);
}

function priorityWeight(p) { return p === 'High' ? 3 : p === 'Medium' ? 2 : 1; }

function emptyState(icon, title, sub) {
  return `<div class="empty-state"><div class="icon-wrap"><i data-lucide="${icon}" class="icon"></i></div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(sub)}</p></div>`;
}

function taskItemHtml(t) {
  return `
  <div class="task-item ${t.completed ? 'done' : ''}" data-id="${t.id}">
    <div class="checkbox ${t.completed ? 'checked' : ''}" data-action="toggle-task"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div class="task-main">
      <div class="task-title">${escapeHtml(t.title)}</div>
      <div class="task-meta">
        <span>${escapeHtml(t.subject)}</span><span class="dot-sep"></span><span class="badge badge-cat">${escapeHtml(t.category)}</span>
        <span class="dot-sep"></span><span class="badge badge-${t.priority.toLowerCase()}">${t.priority} Priority</span>
        ${t.dueTime ? `<span class="dot-sep"></span><span>${niceDueLabel(t.dueDate)} · ${formatTimePretty(t.dueTime)}</span>` : `<span class="dot-sep"></span><span>${niceDueLabel(t.dueDate)}</span>`}
      </div>
    </div>
    <div class="task-actions">
      <div class="mini-btn" data-action="edit-task"><i data-lucide="pencil" class="icon" style="width:15px;height:15px;"></i></div>
      <div class="mini-btn del" data-action="delete-task"><i data-lucide="trash-2" class="icon" style="width:15px;height:15px;"></i></div>
    </div>
  </div>`;
}

function bindTaskItemEvents(container) {
  refreshIcons();
  container.querySelectorAll('.task-item').forEach(item => {
    const id = item.dataset.id;
    item.querySelector('[data-action="toggle-task"]').addEventListener('click', () => toggleTask(id, item));
    const editBtn = item.querySelector('[data-action="edit-task"]');
    const delBtn = item.querySelector('[data-action="delete-task"]');
    if (editBtn) editBtn.addEventListener('click', () => openTaskModal(id));
    if (delBtn) delBtn.addEventListener('click', () => {
      openConfirm('This task will be permanently removed.', () => deleteTask(id));
    });
  });
}

function toggleTask(id, itemEl) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.status = task.completed ? 'Completed' : 'Pending';
  task.completedAt = task.completed ? Date.now() : null;
  persist('tasks');
  if (itemEl) {
    itemEl.classList.add('completing');
    setTimeout(() => { itemEl.classList.toggle('done', task.completed); itemEl.classList.remove('completing'); refreshAllTaskViews(); }, 320);
    itemEl.querySelector('.checkbox').classList.toggle('checked', task.completed);
  } else {
    refreshAllTaskViews();
  }
  if (task.completed) {
    showToast('Task completed', task.title, 'success');
    pushNotification(`You completed a task: ${task.title}`, 'Nice work staying on track!', 'success');
  }
  renderStatCards();
  renderDashRing();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  persist('tasks');
  showToast('Task deleted', '', 'danger');
  refreshAllTaskViews();
}

function refreshAllTaskViews() {
  renderTodayTasks();
  renderTasksPage();
  renderStatCards();
  renderDashRing();
  renderDashDueSoon();
}

function renderDashRing() {
  const items = [...state.tasks, ...state.homework];
  const total = items.length;
  const completed = state.tasks.filter(t => t.completed).length + state.homework.filter(h => h.status === 'Completed').length;
  const pct = total ? Math.round(completed / total * 100) : 0;
  setRing('dashRingFill', 'dashRingNum', pct);
}

function setRing(circleId, numId, pct) {
  const circle = document.getElementById(circleId);
  if (!circle) return;
  const r = parseFloat(circle.getAttribute('r'));
  const c = 2 * Math.PI * r;
  circle.style.strokeDasharray = `${c}`;
  circle.style.strokeDashoffset = `${c}`;
  requestAnimationFrame(() => { circle.style.strokeDashoffset = `${c - (pct / 100) * c}`; });
  document.getElementById(numId).textContent = pct + '%';
}

function renderDashExamList() {
  const list = state.exams.filter(e => daysUntil(e.examDate) >= 0).sort((a, b) => daysUntil(a.examDate) - daysUntil(b.examDate)).slice(0, 3);
  const container = document.getElementById('dashExamList');
  if (!list.length) { container.innerHTML = emptyState('target', 'No upcoming exams', 'Add an exam to start a prep plan.'); return; }
  container.innerHTML = list.map(e => examMiniRow(e)).join('');
}
function examMiniRow(e) {
  const days = daysUntil(e.examDate);
  const pct = examPrepPct(e);
  return `<div style="display:flex;align-items:center;gap:12px;padding:10px 8px;">
    <div class="countdown-badge ${days <= 3 ? 'urgent' : ''}" style="width:44px;height:44px;"><div class="n" style="font-size:15px;">${days}</div><div class="u">days</div></div>
    <div style="flex:1;min-width:0;">
      <div style="font-size:13.5px;font-weight:700;">${escapeHtml(e.title)}</div>
      <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(e.subject)} · ${pct}% prepared</div>
    </div>
  </div>`;
}
function examPrepPct(e) {
  if (!e.checklist || !e.checklist.length) return 0;
  return Math.round(e.checklist.filter(c => c.done).length / e.checklist.length * 100);
}

function renderDashDueSoon() {
  const items = state.homework.filter(h => h.status !== 'Completed').sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)).slice(0, 4);
  const container = document.getElementById('dashDueSoonList');
  if (!items.length) { container.innerHTML = emptyState('inbox', 'All caught up', 'No pending homework right now.'); return; }
  container.innerHTML = items.map(h => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 8px;">
      <div class="stat-icon ${daysUntil(h.dueDate) < 0 ? 'tone-danger' : 'tone-amber'}" style="width:34px;height:34px;"><i data-lucide="notebook-pen" class="icon" style="width:16px;height:16px;"></i></div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13.5px;font-weight:700;">${escapeHtml(h.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(h.subject)} · ${niceDueLabel(h.dueDate)}</div>
      </div>
    </div>`).join('');
  refreshIcons();
}

function renderActivityChart(elId) {
  const monday = getMonday(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));
  const counts = days.map(d => {
    const iso = isoOf(d);
    return state.tasks.filter(t => t.completed && t.completedAt && isoOf(new Date(t.completedAt)) === iso).length
      + state.homework.filter(h => h.status === 'Completed' && h.dueDate === iso).length;
  });
  const max = Math.max(1, ...counts);
  const container = document.getElementById(elId);
  if (!container) return;
  const todayIso = todayISO();
  container.innerHTML = days.map((d, i) => {
    const heightPct = Math.max(6, Math.round(counts[i] / max * 100));
    const isToday = isoOf(d) === todayIso;
    return `<div class="activity-bar-col">
      <div class="activity-bar" style="height:0%;background:${isToday ? 'linear-gradient(180deg,#F0A63C,var(--amber))' : ''}" data-target="${heightPct}"></div>
      <span>${WEEKDAY_NAMES[d.getDay()].slice(0, 3)}</span>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    container.querySelectorAll('.activity-bar').forEach(bar => { bar.style.height = bar.dataset.target + '%'; });
  });
}

/* ============================================================
   TASK MODAL (Add/Edit)
   ============================================================ */
function setupTaskModal() {
  document.querySelectorAll('#taskPriorityPicker .priority-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#taskPriorityPicker .priority-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });
  document.getElementById('taskSaveBtn').addEventListener('click', saveTaskFromModal);
}

function openTaskModal(id) {
  const editing = !!id;
  document.getElementById('taskModalTitle').textContent = editing ? 'Edit Task' : 'Add Task';
  document.getElementById('taskSaveBtn').textContent = editing ? 'Save Changes' : 'Add Task';
  const task = editing ? state.tasks.find(t => t.id === id) : null;

  document.getElementById('taskId').value = editing ? id : '';
  document.getElementById('taskTitle').value = task ? task.title : '';
  document.getElementById('taskDescription').value = task ? task.description : '';
  document.getElementById('taskCategory').value = task ? task.category : 'Assignment';
  document.getElementById('taskSubject').value = task ? task.subject : currentUser.subjects[0];
  document.getElementById('taskDueDate').value = task ? task.dueDate : todayISO();
  document.getElementById('taskDueTime').value = task ? task.dueTime : '18:00';
  document.getElementById('taskDuration').value = task ? task.duration : 30;
  document.getElementById('taskStatus').value = task ? task.status : 'Pending';

  const priority = task ? task.priority : state.settings.defaultPriority;
  document.querySelectorAll('#taskPriorityPicker .priority-opt').forEach(o => o.classList.toggle('active', o.dataset.val === priority));

  openModal('taskModal');
  setTimeout(() => document.getElementById('taskTitle').focus(), 150);
}

function saveTaskFromModal() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { showToast('Title required', 'Please enter a task title.', 'warning'); return; }
  const id = document.getElementById('taskId').value;
  const priority = document.querySelector('#taskPriorityPicker .priority-opt.active').dataset.val;
  const status = document.getElementById('taskStatus').value;

  const data = {
    title,
    description: document.getElementById('taskDescription').value.trim(),
    category: document.getElementById('taskCategory').value,
    subject: document.getElementById('taskSubject').value,
    priority,
    dueDate: document.getElementById('taskDueDate').value || todayISO(),
    dueTime: document.getElementById('taskDueTime').value,
    duration: Number(document.getElementById('taskDuration').value) || 30,
    status
  };

  if (id) {
    const task = state.tasks.find(t => t.id === id);
    Object.assign(task, data);
    task.completed = status === 'Completed';
    showToast('Task updated', title, 'success');
  } else {
    state.tasks.unshift({ id: newId(), ...data, completed: status === 'Completed', createdAt: Date.now(), completedAt: status === 'Completed' ? Date.now() : null });
    showToast('Task added', title, 'success');
    pushNotification(`New task added: ${title}`, `${data.subject} · Due ${niceDueLabel(data.dueDate)}`, 'info');
  }
  persist('tasks');
  closeModal('taskModal');
  refreshAllTaskViews();
}

/* ============================================================
   TASKS PAGE
   ============================================================ */
function renderTasksPage() {
  document.querySelectorAll('#taskStatusChips .chip').forEach(c => {
    c.onclick = () => {
      document.querySelectorAll('#taskStatusChips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      state.taskFilter = c.dataset.filter;
      renderAllTasksList();
    };
  });
  const sortSel = document.getElementById('taskSortSelect');
  sortSel.value = state.taskSort;
  sortSel.onchange = () => { state.taskSort = sortSel.value; renderAllTasksList(); };
  renderAllTasksList();
}

function renderAllTasksList() {
  let list = [...state.tasks];
  switch (state.taskFilter) {
    case 'pending': list = list.filter(t => !t.completed); break;
    case 'completed': list = list.filter(t => t.completed); break;
    case 'high': list = list.filter(t => t.priority === 'High'); break;
    case 'today': list = list.filter(t => t.dueDate === todayISO()); break;
  }
  switch (state.taskSort) {
    case 'newest': list.sort((a, b) => b.createdAt - a.createdAt); break;
    case 'oldest': list.sort((a, b) => a.createdAt - b.createdAt); break;
    case 'duesoon': list.sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)); break;
    case 'priority': list.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)); break;
  }
  const container = document.getElementById('allTasksList');
  if (!list.length) { container.innerHTML = emptyState('list-checks', 'No tasks found', 'Try a different filter or add a new task.'); return; }
  container.innerHTML = list.map(taskItemHtml).join('');
  bindTaskItemEvents(container);
}

/* ============================================================
   HOMEWORK MODAL + PAGE
   ============================================================ */
function setupHomeworkModal() {
  document.getElementById('hwSaveBtn').addEventListener('click', saveHomeworkFromModal);
  document.getElementById('homeworkAddBtn').addEventListener('click', () => openHomeworkModal());
}

function openHomeworkModal(id) {
  const editing = !!id;
  const hw = editing ? state.homework.find(h => h.id === id) : null;
  document.getElementById('hwModalTitle').textContent = editing ? 'Edit Homework' : 'Add Homework';
  document.getElementById('hwSaveBtn').textContent = editing ? 'Save Changes' : 'Add Homework';
  document.getElementById('hwId').value = editing ? id : '';
  document.getElementById('hwSubject').value = hw ? hw.subject : currentUser.subjects[0];
  document.getElementById('hwPriority').value = hw ? hw.priority : 'Medium';
  document.getElementById('hwTitle').value = hw ? hw.title : '';
  document.getElementById('hwDescription').value = hw ? hw.description : '';
  document.getElementById('hwAssignedDate').value = hw ? hw.assignedDate : todayISO();
  document.getElementById('hwDueDate').value = hw ? hw.dueDate : todayISO();
  document.getElementById('hwStatus').value = hw ? (hw.status === 'Overdue' ? 'Pending' : hw.status) : 'Pending';
  openModal('homeworkModal');
}

function saveHomeworkFromModal() {
  const title = document.getElementById('hwTitle').value.trim();
  if (!title) { showToast('Title required', 'Please enter a homework title.', 'warning'); return; }
  const id = document.getElementById('hwId').value;
  const dueDate = document.getElementById('hwDueDate').value || todayISO();
  let status = document.getElementById('hwStatus').value;
  if (status !== 'Completed' && daysUntil(dueDate) < 0) status = 'Overdue';

  const data = {
    title,
    description: document.getElementById('hwDescription').value.trim(),
    subject: document.getElementById('hwSubject').value,
    priority: document.getElementById('hwPriority').value,
    assignedDate: document.getElementById('hwAssignedDate').value || todayISO(),
    dueDate,
    status
  };
  if (id) {
    Object.assign(state.homework.find(h => h.id === id), data);
    showToast('Homework updated', title, 'success');
  } else {
    state.homework.unshift({ id: newId(), ...data });
    showToast('Homework added', title, 'success');
    pushNotification(`New homework: ${title}`, `${data.subject} · Due ${niceDueLabel(dueDate)}`, 'info');
  }
  persist('homework');
  closeModal('homeworkModal');
  renderHomeworkPage();
  renderDashDueSoon();
}

function deleteHomework(id) {
  state.homework = state.homework.filter(h => h.id !== id);
  persist('homework');
  showToast('Homework deleted', '', 'danger');
  renderHomeworkPage();
  renderDashDueSoon();
}

function toggleHomeworkStatus(id) {
  const hw = state.homework.find(h => h.id === id);
  hw.status = hw.status === 'Completed' ? 'Pending' : 'Completed';
  if (hw.status === 'Pending' && daysUntil(hw.dueDate) < 0) hw.status = 'Overdue';
  persist('homework');
  if (hw.status === 'Completed') { showToast('Homework completed', hw.title, 'success'); pushNotification(`Homework completed: ${hw.title}`, 'Great job keeping up!', 'success'); }
  renderHomeworkPage();
  renderDashDueSoon();
}

function renderHomeworkPage() {
  // refresh overdue statuses live
  state.homework.forEach(h => { if (h.status !== 'Completed' && daysUntil(h.dueDate) < 0) h.status = 'Overdue'; });
  persist('homework');

  document.querySelectorAll('#hwFilterChips .chip').forEach(c => {
    c.onclick = () => {
      document.querySelectorAll('#hwFilterChips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      state.hwFilter = c.dataset.filter;
      renderHomeworkGrid();
    };
  });
  renderHomeworkGrid();
}

function renderHomeworkGrid() {
  let list = [...state.homework];
  if (state.hwFilter === 'pending') list = list.filter(h => h.status === 'Pending');
  if (state.hwFilter === 'completed') list = list.filter(h => h.status === 'Completed');
  if (state.hwFilter === 'overdue') list = list.filter(h => h.status === 'Overdue');
  list.sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

  const container = document.getElementById('homeworkGrid');
  if (!list.length) { container.innerHTML = `<div class="card" style="grid-column:1/-1;">${emptyState('notebook-pen', 'No homework here', 'Add homework or switch filters to see more.')}</div>`; return; }

  container.innerHTML = list.map(h => `
    <div class="card hw-card">
      <div class="card-top-row">
        <div><div class="card-title">${escapeHtml(h.title)}</div><div class="card-subject">${escapeHtml(h.subject)}</div></div>
        <span class="badge badge-${h.status.toLowerCase()}">${h.status}</span>
      </div>
      ${h.description ? `<div class="card-desc">${escapeHtml(h.description)}</div>` : ''}
      <div class="card-dates">
        <div><span>Assigned</span><strong>${formatDatePretty(h.assignedDate)}</strong></div>
        <div><span>Due</span><strong>${formatDatePretty(h.dueDate)}</strong></div>
        <div><span>Priority</span><strong>${h.priority}</strong></div>
      </div>
      <div class="card-footer-row">
        <button class="btn btn-sm ${h.status === 'Completed' ? 'btn-secondary' : 'btn-primary'}" data-action="toggle-hw" data-id="${h.id}">
          ${h.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
        </button>
        <div style="display:flex;gap:4px;">
          <div class="mini-btn" data-action="edit-hw" data-id="${h.id}"><i data-lucide="pencil" class="icon" style="width:15px;height:15px;"></i></div>
          <div class="mini-btn del" data-action="delete-hw" data-id="${h.id}"><i data-lucide="trash-2" class="icon" style="width:15px;height:15px;"></i></div>
        </div>
      </div>
    </div>`).join('');

  refreshIcons();
  container.querySelectorAll('[data-action="toggle-hw"]').forEach(b => b.addEventListener('click', () => toggleHomeworkStatus(b.dataset.id)));
  container.querySelectorAll('[data-action="edit-hw"]').forEach(b => b.addEventListener('click', () => openHomeworkModal(b.dataset.id)));
  container.querySelectorAll('[data-action="delete-hw"]').forEach(b => b.addEventListener('click', () => openConfirm('This homework item will be permanently removed.', () => deleteHomework(b.dataset.id))));
}

/* ============================================================
   STUDY PLANNER MODAL + PAGE
   ============================================================ */
function setupStudyModal() {
  document.getElementById('studySaveBtn').addEventListener('click', saveStudyFromModal);
  document.getElementById('studyAddBtn').addEventListener('click', () => openStudyModal());
}

function openStudyModal(id) {
  const editing = !!id;
  const s = editing ? state.study.find(x => x.id === id) : null;
  document.getElementById('studyModalTitle').textContent = editing ? 'Edit Study Session' : 'Add Study Session';
  document.getElementById('studySaveBtn').textContent = editing ? 'Save Changes' : 'Add Session';
  document.getElementById('studyId').value = editing ? id : '';
  document.getElementById('studySubject').value = s ? s.subject : currentUser.subjects[0];
  document.getElementById('studyDate').value = s ? s.date : todayISO();
  document.getElementById('studyTopic').value = s ? s.topic : '';
  document.getElementById('studyStart').value = s ? s.start : '09:00';
  document.getElementById('studyEnd').value = s ? s.end : '10:00';
  document.getElementById('studyNotes').value = s ? s.notes : '';
  openModal('studyModal');
}

function saveStudyFromModal() {
  const topic = document.getElementById('studyTopic').value.trim();
  if (!topic) { showToast('Topic required', 'Please enter a study topic.', 'warning'); return; }
  const id = document.getElementById('studyId').value;
  const data = {
    subject: document.getElementById('studySubject').value,
    date: document.getElementById('studyDate').value || todayISO(),
    topic,
    start: document.getElementById('studyStart').value || '09:00',
    end: document.getElementById('studyEnd').value || '10:00',
    notes: document.getElementById('studyNotes').value.trim()
  };
  if (id) {
    Object.assign(state.study.find(x => x.id === id), data);
    showToast('Study session updated', topic, 'success');
  } else {
    state.study.push({ id: newId(), ...data, completed: false });
    showToast('Study session added', topic, 'success');
  }
  persist('study');
  closeModal('studyModal');
  renderStudyPage();
  renderSchedulePage();
}

function deleteStudySession(id) {
  state.study = state.study.filter(x => x.id !== id);
  persist('study');
  showToast('Study session deleted', '', 'danger');
  renderStudyPage();
  renderSchedulePage();
}

function toggleStudySession(id) {
  const s = state.study.find(x => x.id === id);
  s.completed = !s.completed;
  persist('study');
  renderStudyPage();
  renderActivityChart('activityChart');
  renderActivityChart('activityChart2');
}

function renderStudyPage() {
  const grouped = {};
  [...state.study].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  const dates = Object.keys(grouped).sort();
  const container = document.getElementById('studyPlannerList');
  if (!dates.length) { container.innerHTML = emptyState('book-open', 'No study sessions planned', 'Add a session to start organizing your study time.'); return; }

  container.innerHTML = dates.map(date => {
    const d = new Date(date + 'T00:00:00');
    const label = `${WEEKDAY_NAMES[d.getDay()]} · ${formatDatePretty(date)}${date === todayISO() ? ' (Today)' : ''}`;
    const rows = grouped[date].map(s => `
      <div class="session-row ${s.completed ? 'completed' : ''}">
        <div class="session-time">${formatTimePretty(s.start)} – ${formatTimePretty(s.end)}</div>
        <div class="session-body">
          <strong>${escapeHtml(s.subject)}</strong>
          <span>${escapeHtml(s.topic)}${s.notes ? ' · ' + escapeHtml(s.notes) : ''}</span>
        </div>
        <div class="task-actions" style="opacity:1;">
          <div class="checkbox ${s.completed ? 'checked' : ''}" data-action="toggle-study" data-id="${s.id}" style="margin-top:0;"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="mini-btn" data-action="edit-study" data-id="${s.id}"><i data-lucide="pencil" class="icon" style="width:15px;height:15px;"></i></div>
          <div class="mini-btn del" data-action="delete-study" data-id="${s.id}"><i data-lucide="trash-2" class="icon" style="width:15px;height:15px;"></i></div>
        </div>
      </div>`).join('');
    return `<div class="study-day-block"><div class="study-day-title"><i data-lucide="calendar" class="icon" style="width:16px;height:16px;color:var(--primary);"></i>${label}</div>${rows}</div>`;
  }).join('');

  refreshIcons();
  container.querySelectorAll('[data-action="toggle-study"]').forEach(b => b.addEventListener('click', () => toggleStudySession(b.dataset.id)));
  container.querySelectorAll('[data-action="edit-study"]').forEach(b => b.addEventListener('click', () => openStudyModal(b.dataset.id)));
  container.querySelectorAll('[data-action="delete-study"]').forEach(b => b.addEventListener('click', () => openConfirm('This study session will be permanently removed.', () => deleteStudySession(b.dataset.id))));
}

/* ============================================================
   EXAM MODAL + PAGE
   ============================================================ */
function setupExamModal() {
  document.getElementById('examSaveBtn').addEventListener('click', saveExamFromModal);
  document.getElementById('examAddBtn').addEventListener('click', () => openExamModal());
}

function openExamModal(id) {
  const editing = !!id;
  const e = editing ? state.exams.find(x => x.id === id) : null;
  document.getElementById('examModalTitle').textContent = editing ? 'Edit Exam' : 'Add Exam';
  document.getElementById('examSaveBtn').textContent = editing ? 'Save Changes' : 'Add Exam';
  document.getElementById('examId').value = editing ? id : '';
  document.getElementById('examSubject').value = e ? e.subject : currentUser.subjects[0];
  document.getElementById('examDate').value = e ? e.examDate : todayISO();
  document.getElementById('examTitle').value = e ? e.title : '';
  document.getElementById('examTopics').value = e ? e.topics.join(', ') : '';
  document.getElementById('examNotes').value = e ? e.notes : '';
  openModal('examModal');
}

function saveExamFromModal() {
  const title = document.getElementById('examTitle').value.trim();
  if (!title) { showToast('Title required', 'Please enter an exam title.', 'warning'); return; }
  const id = document.getElementById('examId').value;
  const topics = document.getElementById('examTopics').value.split(',').map(t => t.trim()).filter(Boolean);

  if (id) {
    const exam = state.exams.find(x => x.id === id);
    exam.title = title;
    exam.subject = document.getElementById('examSubject').value;
    exam.examDate = document.getElementById('examDate').value || todayISO();
    exam.notes = document.getElementById('examNotes').value.trim();
    const oldTopicLabels = exam.checklist.filter(c => !['Practice Questions', 'Mock Test'].includes(c.label)).map(c => c.label);
    const addedTopics = topics.filter(t => !oldTopicLabels.includes(t));
    exam.checklist = exam.checklist.filter(c => topics.includes(c.label) || ['Practice Questions', 'Mock Test'].includes(c.label));
    addedTopics.forEach(t => exam.checklist.unshift({ id: newId(), label: t, done: false }));
    exam.topics = topics;
    showToast('Exam updated', title, 'success');
  } else {
    const checklist = topics.map(t => ({ id: newId(), label: t, done: false }));
    checklist.push({ id: newId(), label: 'Practice Questions', done: false });
    checklist.push({ id: newId(), label: 'Mock Test', done: false });
    state.exams.push({
      id: newId(), title, subject: document.getElementById('examSubject').value,
      examDate: document.getElementById('examDate').value || todayISO(),
      topics, checklist, notes: document.getElementById('examNotes').value.trim()
    });
    showToast('Exam added', title, 'success');
    pushNotification(`New exam scheduled: ${title}`, `${document.getElementById('examSubject').value} · ${niceDueLabel(document.getElementById('examDate').value)}`, 'warning');
  }
  persist('exams');
  closeModal('examModal');
  renderExamsPage();
  renderDashExamList();
}

function deleteExam(id) {
  state.exams = state.exams.filter(x => x.id !== id);
  persist('exams');
  showToast('Exam deleted', '', 'danger');
  renderExamsPage();
  renderDashExamList();
}

function toggleExamChecklistItem(examId, itemId) {
  const exam = state.exams.find(x => x.id === examId);
  const item = exam.checklist.find(c => c.id === itemId);
  item.done = !item.done;
  persist('exams');
  renderExamsPage();
  renderDashExamList();
  renderStatCards();
}

function renderExamsPage() {
  const list = [...state.exams].sort((a, b) => daysUntil(a.examDate) - daysUntil(b.examDate));
  const container = document.getElementById('examsGrid');
  if (!list.length) { container.innerHTML = `<div class="card" style="grid-column:1/-1;">${emptyState('target', 'No exams yet', 'Add an exam to build your preparation checklist.')}</div>`; return; }

  container.innerHTML = list.map(e => {
    const days = daysUntil(e.examDate);
    const pct = examPrepPct(e);
    return `
    <div class="card exam-card">
      <div class="exam-countdown">
        <div class="countdown-badge ${days <= 3 ? 'urgent' : ''}"><div class="n">${days < 0 ? 0 : days}</div><div class="u">${days < 0 ? 'passed' : 'days left'}</div></div>
        <div style="flex:1;">
          <div class="card-title">${escapeHtml(e.title)}</div>
          <div class="card-subject">${escapeHtml(e.subject)} · ${formatDatePretty(e.examDate)}</div>
        </div>
      </div>
      <div>
        <div class="bar-row-top" style="margin-bottom:6px;"><span class="name">Preparation</span><span class="pct">${pct}%</span></div>
        <div class="progress-line"><div class="progress-line-fill" style="width:0%;" data-target="${pct}"></div></div>
      </div>
      ${e.notes ? `<div class="card-desc">${escapeHtml(e.notes)}</div>` : ''}
      <div class="checklist">
        ${e.checklist.map(c => `
          <div class="checklist-item ${c.done ? 'done' : ''}">
            <div class="checkbox ${c.done ? 'checked' : ''}" style="width:18px;height:18px;" data-action="toggle-exam-item" data-exam="${e.id}" data-item="${c.id}"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <span>${escapeHtml(c.label)}</span>
          </div>`).join('')}
      </div>
      <div class="card-footer-row">
        <span style="font-size:12px;color:var(--text-faint);">${e.checklist.filter(c=>c.done).length}/${e.checklist.length} complete</span>
        <div style="display:flex;gap:4px;">
          <div class="mini-btn" data-action="edit-exam" data-id="${e.id}"><i data-lucide="pencil" class="icon" style="width:15px;height:15px;"></i></div>
          <div class="mini-btn del" data-action="delete-exam" data-id="${e.id}"><i data-lucide="trash-2" class="icon" style="width:15px;height:15px;"></i></div>
        </div>
      </div>
    </div>`;
  }).join('');

  refreshIcons();
  container.querySelectorAll('.progress-line-fill').forEach(el => requestAnimationFrame(() => { el.style.width = el.dataset.target + '%'; }));
  container.querySelectorAll('[data-action="toggle-exam-item"]').forEach(b => b.addEventListener('click', () => toggleExamChecklistItem(b.dataset.exam, b.dataset.item)));
  container.querySelectorAll('[data-action="edit-exam"]').forEach(b => b.addEventListener('click', () => openExamModal(b.dataset.id)));
  container.querySelectorAll('[data-action="delete-exam"]').forEach(b => b.addEventListener('click', () => openConfirm('This exam and its checklist will be permanently removed.', () => deleteExam(b.dataset.id))));
}

/* ============================================================
   PROJECT MODAL + PAGE
   ============================================================ */
function setupProjectModal() {
  document.getElementById('projectSaveBtn').addEventListener('click', saveProjectFromModal);
  document.getElementById('projectAddBtn').addEventListener('click', () => openProjectModal());
}

function openProjectModal(id) {
  const editing = !!id;
  const p = editing ? state.projects.find(x => x.id === id) : null;
  document.getElementById('projectModalTitle').textContent = editing ? 'Edit Project' : 'Add Project';
  document.getElementById('projectSaveBtn').textContent = editing ? 'Save Changes' : 'Add Project';
  document.getElementById('projectId').value = editing ? id : '';
  document.getElementById('projectName').value = p ? p.name : '';
  document.getElementById('projectDescription').value = p ? p.description : '';
  document.getElementById('projectSubject').value = p ? p.subject : currentUser.subjects[0];
  document.getElementById('projectPriority').value = p ? p.priority : 'Medium';
  document.getElementById('projectStartDate').value = p ? p.startDate : todayISO();
  document.getElementById('projectDeadline').value = p ? p.deadline : todayISO();
  document.getElementById('projectTasks').value = p ? p.tasks.map(t => t.label).join(', ') : '';
  openModal('projectModal');
}

function saveProjectFromModal() {
  const name = document.getElementById('projectName').value.trim();
  if (!name) { showToast('Name required', 'Please enter a project name.', 'warning'); return; }
  const id = document.getElementById('projectId').value;
  const taskLabels = document.getElementById('projectTasks').value.split(',').map(t => t.trim()).filter(Boolean);

  if (id) {
    const proj = state.projects.find(x => x.id === id);
    proj.name = name;
    proj.description = document.getElementById('projectDescription').value.trim();
    proj.subject = document.getElementById('projectSubject').value;
    proj.priority = document.getElementById('projectPriority').value;
    proj.startDate = document.getElementById('projectStartDate').value || todayISO();
    proj.deadline = document.getElementById('projectDeadline').value || todayISO();
    const oldLabels = proj.tasks.map(t => t.label);
    const added = taskLabels.filter(l => !oldLabels.includes(l));
    proj.tasks = proj.tasks.filter(t => taskLabels.includes(t.label));
    added.forEach(l => proj.tasks.push({ id: newId(), label: l, done: false }));
    showToast('Project updated', name, 'success');
  } else {
    state.projects.push({
      id: newId(), name, description: document.getElementById('projectDescription').value.trim(),
      subject: document.getElementById('projectSubject').value, priority: document.getElementById('projectPriority').value,
      startDate: document.getElementById('projectStartDate').value || todayISO(),
      deadline: document.getElementById('projectDeadline').value || todayISO(),
      tasks: taskLabels.map(l => ({ id: newId(), label: l, done: false }))
    });
    showToast('Project added', name, 'success');
    pushNotification(`New project created: ${name}`, `Deadline ${niceDueLabel(document.getElementById('projectDeadline').value)}`, 'info');
  }
  persist('projects');
  closeModal('projectModal');
  renderProjectsPage();
}

function deleteProject(id) {
  state.projects = state.projects.filter(x => x.id !== id);
  persist('projects');
  showToast('Project deleted', '', 'danger');
  renderProjectsPage();
}

function toggleProjectTask(projId, taskId) {
  const proj = state.projects.find(x => x.id === projId);
  const t = proj.tasks.find(x => x.id === taskId);
  t.done = !t.done;
  persist('projects');
  renderProjectsPage();
}

function projectProgressPct(p) {
  if (!p.tasks.length) return 0;
  return Math.round(p.tasks.filter(t => t.done).length / p.tasks.length * 100);
}

function renderProjectsPage() {
  const list = [...state.projects].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
  const container = document.getElementById('projectsGrid');
  if (!list.length) { container.innerHTML = `<div class="card" style="grid-column:1/-1;">${emptyState('folder-kanban', 'No projects yet', 'Create a project to start tracking milestones.')}</div>`; return; }

  container.innerHTML = list.map(p => {
    const pct = projectProgressPct(p);
    return `
    <div class="card proj-card">
      <div class="card-top-row">
        <div><div class="card-title">${escapeHtml(p.name)}</div><div class="card-subject">${escapeHtml(p.subject)}</div></div>
        <span class="badge badge-${p.priority.toLowerCase()}">${p.priority}</span>
      </div>
      ${p.description ? `<div class="card-desc">${escapeHtml(p.description)}</div>` : ''}
      <div>
        <div class="bar-row-top" style="margin-bottom:6px;"><span class="name">Progress: ${pct}%</span><span class="pct">${niceDueLabel(p.deadline)}</span></div>
        <div class="progress-line"><div class="progress-line-fill" style="width:0%;" data-target="${pct}"></div></div>
      </div>
      <div class="checklist">
        ${p.tasks.map(t => `
          <div class="checklist-item ${t.done ? 'done' : ''}">
            <div class="checkbox ${t.done ? 'checked' : ''}" style="width:18px;height:18px;" data-action="toggle-proj-item" data-proj="${p.id}" data-item="${t.id}"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <span>${escapeHtml(t.label)}</span>
          </div>`).join('')}
        ${!p.tasks.length ? `<span style="font-size:12.5px;color:var(--text-faint);">No sub-tasks added.</span>` : ''}
      </div>
      <div class="card-footer-row">
        <span style="font-size:12px;color:var(--text-faint);">Started ${formatDatePretty(p.startDate)}</span>
        <div style="display:flex;gap:4px;">
          <div class="mini-btn" data-action="edit-proj" data-id="${p.id}"><i data-lucide="pencil" class="icon" style="width:15px;height:15px;"></i></div>
          <div class="mini-btn del" data-action="delete-proj" data-id="${p.id}"><i data-lucide="trash-2" class="icon" style="width:15px;height:15px;"></i></div>
        </div>
      </div>
    </div>`;
  }).join('');

  refreshIcons();
  container.querySelectorAll('.progress-line-fill').forEach(el => requestAnimationFrame(() => { el.style.width = el.dataset.target + '%'; }));
  container.querySelectorAll('[data-action="toggle-proj-item"]').forEach(b => b.addEventListener('click', () => toggleProjectTask(b.dataset.proj, b.dataset.item)));
  container.querySelectorAll('[data-action="edit-proj"]').forEach(b => b.addEventListener('click', () => openProjectModal(b.dataset.id)));
  container.querySelectorAll('[data-action="delete-proj"]').forEach(b => b.addEventListener('click', () => openConfirm('This project and its tasks will be permanently removed.', () => deleteProject(b.dataset.id))));
}

/* ============================================================
   SCHEDULE PAGE + EVENT MODAL
   ============================================================ */
function setupEventModal() {
  document.getElementById('eventSaveBtn').addEventListener('click', saveEventFromModal);
  document.getElementById('scheduleAddBtn').addEventListener('click', () => openEventModal());

  document.getElementById('scheduleViewTabs').querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#scheduleViewTabs .tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.scheduleView = tab.dataset.view;
      moveTabIndicator();
      renderSchedulePage();
    });
  });
  document.getElementById('weekPrevBtn').addEventListener('click', () => shiftSchedule(-1));
  document.getElementById('weekNextBtn').addEventListener('click', () => shiftSchedule(1));
  setTimeout(moveTabIndicator, 50);
}

function moveTabIndicator() {
  const active = document.querySelector('#scheduleViewTabs .tab-btn.active');
  const indicator = document.querySelector('#scheduleViewTabs .tabs-indicator');
  if (!active || !indicator) return;
  indicator.style.left = active.offsetLeft + 'px';
  indicator.style.width = active.offsetWidth + 'px';
}

function shiftSchedule(dir) {
  if (state.scheduleView === 'week') state.weekStart = addDaysToDate(state.weekStart, dir * 7);
  else if (state.scheduleView === 'day') state.weekStart = addDaysToDate(state.weekStart, dir * 1);
  else state.weekStart = new Date(state.weekStart.getFullYear(), state.weekStart.getMonth() + dir, 1);
  renderSchedulePage();
}

function openEventModal() {
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventCategory').value = 'class';
  document.getElementById('eventDate').value = todayISO();
  document.getElementById('eventStart').value = '09:00';
  document.getElementById('eventEnd').value = '10:00';
  openModal('eventModal');
}

function saveEventFromModal() {
  const title = document.getElementById('eventTitle').value.trim();
  if (!title) { showToast('Title required', 'Please enter an event title.', 'warning'); return; }
  state.schedule.push({
    id: newId(), title, category: document.getElementById('eventCategory').value,
    date: document.getElementById('eventDate').value || todayISO(),
    start: document.getElementById('eventStart').value || '09:00',
    end: document.getElementById('eventEnd').value || '10:00'
  });
  persist('schedule');
  showToast('Event added', title, 'success');
  closeModal('eventModal');
  renderSchedulePage();
}

function deleteEvent(id) {
  state.schedule = state.schedule.filter(e => e.id !== id);
  persist('schedule');
  showToast('Event removed', '', 'danger');
  renderSchedulePage();
}

function renderSchedulePage() {
  if (state.scheduleView === 'week') renderWeekView();
  else if (state.scheduleView === 'day') renderDayView();
  else renderMonthView();
}

function renderWeekView() {
  const monday = getMonday(state.weekStart);
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));
  document.getElementById('weekRangeLabel').textContent = `${formatDatePretty(isoOf(days[0]))} – ${formatDatePretty(isoOf(days[6]))}`;

  const grid = document.getElementById('weekGrid');
  grid.style.display = 'grid';
  grid.innerHTML = days.map(d => dayColumnHtml(d)).join('');
  bindDayColumnEvents(grid);
}

function renderDayView() {
  const d = state.weekStart;
  document.getElementById('weekRangeLabel').textContent = formatDatePretty(isoOf(d));
  const grid = document.getElementById('weekGrid');
  grid.style.display = 'block';
  grid.innerHTML = `<div style="max-width:420px;margin:0 auto;">${dayColumnHtml(d, true)}</div>`;
  bindDayColumnEvents(grid);
}

function dayColumnHtml(d, wide) {
  const iso = isoOf(d);
  const isToday = iso === todayISO();
  const events = state.schedule.filter(e => e.date === iso).sort((a, b) => a.start.localeCompare(b.start));
  return `
  <div class="day-col card ${isToday ? 'is-today' : ''}" style="${wide ? '' : ''}">
    <div class="day-col-head"><div class="dname">${WEEKDAY_NAMES[d.getDay()].slice(0, 3)}</div><div class="dnum">${d.getDate()}</div></div>
    <div class="day-col-body">
      ${events.map(e => `
        <div class="event-chip cat-${e.category}" data-action="delete-event" data-id="${e.id}" title="Click to remove">
          <strong>${escapeHtml(e.title)}</strong><span>${formatTimePretty(e.start)} – ${formatTimePretty(e.end)}</span>
        </div>`).join('')}
      <div class="day-empty-hint" data-action="add-event-day" data-date="${iso}">+ Add event</div>
    </div>
  </div>`;
}

function bindDayColumnEvents(grid) {
  grid.querySelectorAll('[data-action="delete-event"]').forEach(el => {
    el.addEventListener('click', () => openConfirm('Remove this scheduled event?', () => deleteEvent(el.dataset.id)));
  });
  grid.querySelectorAll('[data-action="add-event-day"]').forEach(el => {
    el.addEventListener('click', () => { openEventModal(); document.getElementById('eventDate').value = el.dataset.date; });
  });
}

function renderMonthView() {
  const cursor = state.weekStart;
  const year = cursor.getFullYear(), month = cursor.getMonth();
  document.getElementById('weekRangeLabel').textContent = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstOfMonth = new Date(year, month, 1);
  const startGrid = getMonday(firstOfMonth);
  const cells = Array.from({ length: 42 }, (_, i) => addDaysToDate(startGrid, i));

  const grid = document.getElementById('weekGrid');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
  grid.innerHTML = cells.map(d => {
    const iso = isoOf(d);
    const inMonth = d.getMonth() === month;
    const isToday = iso === todayISO();
    const events = state.schedule.filter(e => e.date === iso).sort((a, b) => a.start.localeCompare(b.start));
    const shown = events.slice(0, 2);
    return `<div class="day-col card ${isToday ? 'is-today' : ''}" style="min-height:110px;opacity:${inMonth ? 1 : 0.42};">
      <div class="day-col-head" style="padding:8px 10px;"><div class="dnum" style="font-size:14px;">${d.getDate()}</div></div>
      <div class="day-col-body" style="padding:6px;gap:4px;min-height:auto;">
        ${shown.map(e => `<div class="event-chip cat-${e.category}" style="padding:4px 6px;" data-action="delete-event" data-id="${e.id}"><strong style="font-size:11px;">${escapeHtml(e.title)}</strong></div>`).join('')}
        ${events.length > 2 ? `<span style="font-size:10.5px;color:var(--text-faint);padding-left:4px;">+${events.length - 2} more</span>` : ''}
      </div>
    </div>`;
  }).join('');
  bindDayColumnEvents(grid);
}

/* ============================================================
   PROGRESS PAGE
   ============================================================ */
function renderProgressPage() {
  renderActivityChart('activityChart2');

  const container = document.getElementById('subjectProgressList');
  const subjects = currentUser.subjects || [];
  container.innerHTML = subjects.map(subj => {
    const items = [...state.tasks.filter(t => t.subject === subj), ...state.homework.filter(h => h.subject === subj)];
    const done = state.tasks.filter(t => t.subject === subj && t.completed).length + state.homework.filter(h => h.subject === subj && h.status === 'Completed').length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-row-top"><span class="name">${escapeHtml(subj)}</span><span class="pct">${pct}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:0%;" data-target="${pct}"></div></div>
    </div>`;
  }).join('');
  container.querySelectorAll('.bar-fill').forEach(el => requestAnimationFrame(() => { el.style.width = el.dataset.target + '%'; }));

  const items = [...state.tasks, ...state.homework];
  const total = items.length;
  const completed = state.tasks.filter(t => t.completed).length + state.homework.filter(h => h.status === 'Completed').length;
  const pct = total ? Math.round(completed / total * 100) : 0;
  setRing('progressRingFill', 'progressRingNum', pct);

  const pendingPct = 100 - pct;
  document.getElementById('pctCompleted').textContent = pct + '%';
  document.getElementById('pctPending').textContent = pendingPct + '%';
  const barCompleted = document.getElementById('barCompleted');
  const barPending = document.getElementById('barPending');
  requestAnimationFrame(() => { barCompleted.style.width = pct + '%'; barPending.style.width = pendingPct + '%'; });
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function pushNotification(title, body, type) {
  if (!state.settings.notifEnabled) return;
  state.notifications.unshift({ id: newId(), title, body, time: Date.now(), read: false, type: type || 'info' });
  state.notifications = state.notifications.slice(0, 40);
  persist('notifications');
  updateNotifBadges();
}

function updateNotifBadges() {
  const unread = state.notifications.filter(n => !n.read).length;
  const navBadge = document.getElementById('navNotifBadge');
  const dot = document.getElementById('notifDot');
  navBadge.style.display = unread ? 'inline-block' : 'none';
  navBadge.textContent = unread > 9 ? '9+' : unread;
  dot.style.display = unread ? 'block' : 'none';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const NOTIF_TYPE_ICON = { info: ['bell', 'tone-info'], success: ['check-circle-2', 'tone-success'], warning: ['alert-triangle', 'tone-amber'], danger: ['x-circle', 'tone-danger'] };

function renderNotificationsPage() {
  const container = document.getElementById('notifList');
  const list = [...state.notifications].sort((a, b) => b.time - a.time);
  if (!list.length) { container.innerHTML = emptyState('bell-off', 'No notifications', "You're all caught up."); return; }
  container.innerHTML = list.map(n => {
    const [icon, tone] = NOTIF_TYPE_ICON[n.type] || NOTIF_TYPE_ICON.info;
    return `<div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
      <div class="toast-icon ${tone}"><i data-lucide="${icon}" class="icon" style="width:16px;height:16px;"></i></div>
      <div style="flex:1;"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body || '')}</p><time>${timeAgo(n.time)}</time></div>
    </div>`;
  }).join('');
  refreshIcons();
  container.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const n = state.notifications.find(x => x.id === el.dataset.id);
      n.read = true;
      persist('notifications');
      el.classList.remove('unread');
      updateNotifBadges();
    });
  });
  document.getElementById('markAllReadBtn').onclick = () => {
    state.notifications.forEach(n => n.read = true);
    persist('notifications');
    renderNotificationsPage();
    updateNotifBadges();
    showToast('All caught up', 'Notifications marked as read.', 'success');
  };
}

/* Seed a couple of live notifications based on real due-soon data on load */
function generateLiveNotifications() {
  const today = todayISO();
  state.tasks.filter(t => !t.completed && t.dueDate === today).forEach(t => {
    const exists = state.notifications.some(n => n.title.includes(t.title) && n.title.includes('due today'));
    if (!exists) pushNotification(`${t.title} is due today.`, `${t.subject} · ${t.priority} priority`, 'warning');
  });
}

/* ============================================================
   SETTINGS PAGE
   ============================================================ */
function setupSettingsPage() {
  document.querySelectorAll('.settings-nav-item').forEach(nav => {
    nav.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
      nav.classList.add('active');
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + nav.dataset.panel).classList.add('active');
    });
  });

  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.addEventListener('click', () => applyTheme(opt.dataset.theme, true));
  });

  const notifSwitch = document.getElementById('notifSwitch');
  notifSwitch.classList.toggle('on', state.settings.notifEnabled);
  notifSwitch.addEventListener('click', () => {
    state.settings.notifEnabled = !state.settings.notifEnabled;
    notifSwitch.classList.toggle('on', state.settings.notifEnabled);
    saveSettings(state.settings);
    showToast('Preference saved', state.settings.notifEnabled ? 'Notifications enabled.' : 'Notifications disabled.', 'success');
  });

  const reminderSel = document.getElementById('reminderSelect');
  reminderSel.value = state.settings.reminderMinutes;
  reminderSel.addEventListener('change', () => {
    state.settings.reminderMinutes = Number(reminderSel.value);
    saveSettings(state.settings);
    showToast('Preference saved', 'Reminder timing updated.', 'success');
  });

  const prioritySel = document.getElementById('defaultPrioritySelect');
  prioritySel.value = state.settings.defaultPriority;
  prioritySel.addEventListener('change', () => {
    state.settings.defaultPriority = prioritySel.value;
    saveSettings(state.settings);
    showToast('Preference saved', 'Default priority updated.', 'success');
  });

  document.getElementById('settingsFullName').value = currentUser.fullName;
  document.getElementById('settingsStudentId').value = currentUser.studentId;

  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const name = document.getElementById('settingsFullName').value.trim();
    if (!name) { showToast('Name required', 'Please enter your full name.', 'warning'); return; }
    const users = getUsers();
    const u = users.find(x => x.username === currentUser.username);
    u.fullName = name;
    saveUsers(users);
    currentUser.fullName = name;
    setupSidebarUser();
    renderProfilePage();
    refreshIcons();
    showToast('Profile updated', 'Your changes have been saved.', 'success');
  });

  document.getElementById('changePasswordBtn').addEventListener('click', () => {
    const current = document.getElementById('currentPassword').value;
    const next = document.getElementById('newPassword').value;
    if (!current || !next) { showToast('Missing fields', 'Enter current and new password.', 'warning'); return; }
    if (simpleHash(current) !== currentUser.password) { showToast('Incorrect password', 'Your current password is wrong.', 'danger'); return; }
    if (next.length < 6) { showToast('Password too short', 'Use at least 6 characters.', 'warning'); return; }
    const users = getUsers();
    const u = users.find(x => x.username === currentUser.username);
    u.password = simpleHash(next);
    currentUser.password = u.password;
    saveUsers(users);
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    showToast('Password updated', 'Use your new password next time you log in.', 'success');
  });

  document.getElementById('settingsLogoutBtn').addEventListener('click', logout);
}

/* ============================================================
   GLOBAL SEARCH
   ============================================================ */
function setupSearch() {
  const input = document.getElementById('globalSearch');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { closeModal('searchModal'); return; }
    timer = setTimeout(() => runSearch(q), 180);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim().length >= 2) runSearch(input.value.trim()); });
}

function runSearch(q) {
  const query = q.toLowerCase();
  const results = [];
  state.tasks.forEach(t => { if (t.title.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query)) results.push({ type: 'Task', icon: 'check-square', tone: 'tone-primary', title: t.title, sub: `${t.subject} · ${niceDueLabel(t.dueDate)}`, page: 'tasks' }); });
  state.homework.forEach(h => { if (h.title.toLowerCase().includes(query) || h.subject.toLowerCase().includes(query)) results.push({ type: 'Homework', icon: 'notebook-pen', tone: 'tone-amber', title: h.title, sub: `${h.subject} · ${h.status}`, page: 'homework' }); });
  state.exams.forEach(e => { if (e.title.toLowerCase().includes(query) || e.subject.toLowerCase().includes(query)) results.push({ type: 'Exam', icon: 'target', tone: 'tone-danger', title: e.title, sub: `${e.subject} · ${niceDueLabel(e.examDate)}`, page: 'exams' }); });
  state.projects.forEach(p => { if (p.name.toLowerCase().includes(query) || p.subject.toLowerCase().includes(query)) results.push({ type: 'Project', icon: 'folder-kanban', tone: 'tone-success', title: p.name, sub: `${p.subject} · ${projectProgressPct(p)}% done`, page: 'projects' }); });
  state.study.forEach(s => { if (s.topic.toLowerCase().includes(query) || s.subject.toLowerCase().includes(query)) results.push({ type: 'Study Session', icon: 'book-open', tone: 'tone-info', title: s.topic, sub: `${s.subject} · ${formatDatePretty(s.date)}`, page: 'study' }); });

  const container = document.getElementById('searchResultsList');
  if (!results.length) { container.innerHTML = emptyState('search-x', 'No matches found', `Nothing matches "${q}" yet.`); }
  else {
    container.innerHTML = results.slice(0, 20).map(r => `
      <div class="search-result-item" data-page="${r.page}">
        <div class="sr-icon ${r.tone}"><i data-lucide="${r.icon}" class="icon" style="width:16px;height:16px;"></i></div>
        <div><div class="sr-title">${escapeHtml(r.title)}</div><div class="sr-sub">${r.type} · ${escapeHtml(r.sub)}</div></div>
      </div>`).join('');
    container.querySelectorAll('.search-result-item').forEach(el => el.addEventListener('click', () => { closeModal('searchModal'); gotoPage(el.dataset.page); }));
  }
  refreshIcons();
  openModal('searchModal');
}

/* ============================================================
   PROFILE PAGE
   ============================================================ */
function renderProfilePage() {
  const initials = currentUser.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent = currentUser.fullName;
  document.getElementById('profileHandle').innerHTML = `@${escapeHtml(currentUser.username)} · <span>${escapeHtml(currentUser.studentId)}</span>`;
  document.getElementById('profileSubjects').innerHTML = (currentUser.subjects || []).map(s => `<span class="subject-tag">${escapeHtml(s)}</span>`).join('');

  const s = computeStats();
  const items = [...state.tasks, ...state.homework];
  const completedAll = state.tasks.filter(t => t.completed).length + state.homework.filter(h => h.status === 'Completed').length;
  const pct = items.length ? Math.round(completedAll / items.length * 100) : 0;

  const cards = [
    { icon: 'list-checks', tone: 'tone-primary', value: s.total, label: 'Total Tasks' },
    { icon: 'check-circle-2', tone: 'tone-success', value: s.completed, label: 'Completed' },
    { icon: 'book-open', tone: 'tone-info', value: s.studyHours + 'h', label: 'Study Hours (week)' },
    { icon: 'trending-up', tone: 'tone-amber', value: pct + '%', label: 'Overall Productivity' },
    { icon: 'folder-kanban', tone: 'tone-primary', value: state.projects.length, label: 'Active Projects' },
    { icon: 'target', tone: 'tone-danger', value: state.exams.filter(e => daysUntil(e.examDate) >= 0).length, label: 'Upcoming Exams' }
  ];
  document.getElementById('profileStats').innerHTML = cards.map(c => `
    <div class="card stat-card" style="cursor:default;">
      <div class="stat-top"><div class="stat-icon ${c.tone}"><i data-lucide="${c.icon}" class="icon" style="width:19px;height:19px;"></i></div></div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join('');
  refreshIcons();
}
