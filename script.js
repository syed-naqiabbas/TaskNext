/* ============================================================
   TaskNext — script.js
   Dashboard application: task CRUD, views, search, filters,
   sorting, statistics. All state lives in localStorage under
   the current user, loaded fresh on every page visit.
   ============================================================ */

requireAuth();

const currentUser = getCurrentUser();

/* ---------- app state ---------- */
let tasks = [];
let currentView = 'dashboard';
let activeFilter = 'all';
let searchQuery = '';
let sortBy = 'newest';
let editingTaskId = null;
let pendingDeleteId = null;

const ICON_CHECK_PATH = '<path d="M3 8.5L6.2 11.8L13 4.2"/>';

/* ---------- persistence ---------- */
function tasksKey(){ return STORAGE_KEYS.TASKS_PREFIX + currentUser.username; }
function loadTasks(){ tasks = readJSON(tasksKey(), []); }
function saveTasks(){ writeJSON(tasksKey(), tasks); }

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  hydrateUserChrome();
  bindNav();
  bindSidebarToggle();
  bindHeaderSearch();
  bindModal();
  bindConfirmModal();
  bindLogout();
  bindToolbars();

  const initialView = (window.location.hash || '#dashboard').replace('#', '');
  goToView(initialView, { skipPush: true });

  window.addEventListener('hashchange', () => {
    goToView((window.location.hash || '#dashboard').replace('#', ''), { skipPush: true });
  });

  renderAll();
});

function hydrateUserChrome(){
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = currentUser.fullName);
  document.querySelectorAll('[data-user-first]').forEach(el => el.textContent = currentUser.fullName.split(' ')[0]);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = getInitials(currentUser.fullName));
}

function bindLogout(){
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Signing out…', 'info', 900);
      setTimeout(logout, 350);
    });
  });
}

/* ============================================================
   Navigation / view routing
   ============================================================ */
const VALID_VIEWS = ['dashboard', 'tasks', 'today', 'upcoming', 'completed'];

function bindNav(){
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', () => {
      window.location.hash = link.dataset.view;
      closeSidebarMobile();
    });
  });
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => { window.location.hash = el.dataset.goto; });
  });
}

function goToView(view, opts = {}){
  if(!VALID_VIEWS.includes(view)) view = 'dashboard';
  currentView = view;

  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${view}`);
  });

  // Reset filter chips to "all" whenever switching into My Tasks fresh
  if(view === 'tasks' && !opts.keepFilter){
    activeFilter = 'all';
    syncFilterChipsUI();
  }

  renderAll();
}

/* ============================================================
   Sidebar (mobile)
   ============================================================ */
function bindSidebarToggle(){
  const sidebar = document.querySelector('.app-sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  document.querySelectorAll('[data-menu-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      scrim.classList.toggle('open');
    });
  });
  if(scrim){
    scrim.addEventListener('click', closeSidebarMobile);
  }
}
function closeSidebarMobile(){
  document.querySelector('.app-sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-scrim')?.classList.remove('open');
}

/* ============================================================
   Header search
   ============================================================ */
function bindHeaderSearch(){
  const input = document.getElementById('global-search');
  if(!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    renderAll();
  });
}

/* ============================================================
   Toolbars (filter chips + sort) — shared across list views
   ============================================================ */
function bindToolbars(){
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      syncFilterChipsUI();
      renderAll();
    });
  });
  document.querySelectorAll('.sort-select').forEach(sel => {
    sel.addEventListener('change', () => {
      sortBy = sel.value;
      document.querySelectorAll('.sort-select').forEach(s => s.value = sortBy);
      renderAll();
    });
  });
}
function syncFilterChipsUI(){
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === activeFilter);
  });
}

/* ============================================================
   Derived task sets
   ============================================================ */
function matchesSearch(task){
  if(!searchQuery) return true;
  return task.title.toLowerCase().includes(searchQuery) ||
         (task.description || '').toLowerCase().includes(searchQuery);
}

function applyFilter(list, filter){
  switch(filter){
    case 'pending': return list.filter(t => t.status === 'pending');
    case 'completed': return list.filter(t => t.status === 'completed');
    case 'high': return list.filter(t => t.priority === 'high');
    case 'medium': return list.filter(t => t.priority === 'medium');
    case 'low': return list.filter(t => t.priority === 'low');
    case 'today': return list.filter(t => isToday(t.dueDate));
    default: return list;
  }
}

function sortTasks(list){
  const arr = [...list];
  switch(sortBy){
    case 'oldest':
      return arr.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'due':
      return arr.sort((a,b) => {
        if(!a.dueDate && !b.dueDate) return 0;
        if(!a.dueDate) return 1;
        if(!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    case 'priority': {
      const order = { high: 0, medium: 1, low: 2 };
      return arr.sort((a,b) => order[a.priority] - order[b.priority]);
    }
    case 'newest':
    default:
      return arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function getViewBaseList(view){
  switch(view){
    case 'today': return tasks.filter(t => isToday(t.dueDate));
    case 'upcoming': return tasks.filter(t => isUpcoming(t.dueDate) && t.status !== 'completed');
    case 'completed': return tasks.filter(t => t.status === 'completed');
    case 'tasks': return tasks;
    default: return tasks;
  }
}

/* ============================================================
   Rendering
   ============================================================ */
function renderAll(){
  renderStats();
  renderDashboardToday();
  renderListView('tasks', document.getElementById('tasks-list'));
  renderListView('today', document.getElementById('today-list'));
  renderListView('upcoming', document.getElementById('upcoming-list'));
  renderListView('completed', document.getElementById('completed-list'));
  updateNavCounts();
}

function renderStats(){
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const high = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  setText('stat-total', total);
  setText('stat-completed', completed);
  setText('stat-pending', pending);
  setText('stat-high', high);
}
function setText(id, val){
  const el = document.getElementById(id);
  if(el) el.textContent = val;
}

function updateNavCounts(){
  setText('count-tasks', tasks.length);
  setText('count-today', tasks.filter(t => isToday(t.dueDate)).length);
  setText('count-upcoming', tasks.filter(t => isUpcoming(t.dueDate) && t.status !== 'completed').length);
  setText('count-completed', tasks.filter(t => t.status === 'completed').length);
}

function renderDashboardToday(){
  const container = document.getElementById('dashboard-today-list');
  if(!container) return;
  const list = sortTasks(tasks.filter(t => isToday(t.dueDate)));
  renderInto(container, list, 'No tasks due today', 'Tasks with a due date of today will show up here.');
}

function renderListView(view, container){
  if(!container) return;
  let list = getViewBaseList(view);

  if(view === 'tasks'){
    list = applyFilter(list, activeFilter);
  }
  list = list.filter(matchesSearch);
  list = sortTasks(list);

  const emptyMessages = {
    tasks: ['No tasks match', 'Try a different filter or search term.'],
    today: ['No tasks due today', 'Create a task and set today as the due date.'],
    upcoming: ['Nothing coming up', 'Future tasks with a due date will appear here.'],
    completed: ['No completed tasks yet', 'Tasks you finish will be archived here.']
  };
  const [title, sub] = tasks.length === 0 && view !== 'tasks'
    ? ['No tasks yet', 'Create your first task and start getting things done.']
    : emptyMessages[view] || ['Nothing here', ''];

  renderInto(container, list, title, sub);
}

function renderInto(container, list, emptyTitle, emptySub){
  if(list.length === 0){
    container.innerHTML = emptyStateHTML(emptyTitle, emptySub);
    return;
  }
  container.innerHTML = list.map(taskCardHTML).join('');
  container.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => toggleComplete(el.dataset.id));
  });
  container.querySelectorAll('.edit-btn').forEach(el => {
    el.addEventListener('click', () => openEditModal(el.dataset.id));
  });
  container.querySelectorAll('.del-btn').forEach(el => {
    el.addEventListener('click', () => openConfirmModal(el.dataset.id));
  });
}

function emptyStateHTML(title, sub){
  return `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(sub || '')}</p>
    </div>`;
}

function taskCardHTML(task){
  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task.dueDate, isCompleted);
  const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : '';

  return `
  <div class="task-card ${isCompleted ? 'completed' : ''} ${overdue ? 'overdue' : ''}" data-id="${task.id}">
    <button type="button" class="task-check ${isCompleted ? 'checked' : ''}" data-id="${task.id}" aria-label="${isCompleted ? 'Mark as pending' : 'Mark as completed'}">
      <svg viewBox="0 0 16 16">${ICON_CHECK_PATH}</svg>
    </button>
    <div class="task-body">
      <div class="task-top-row">
        <div style="flex:1;min-width:0;">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="badge ${task.priority}">${task.priority}</span>
            ${dueLabel ? `<span class="task-due"><svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>${escapeHtml(dueLabel)}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="edit-btn" data-id="${task.id}" aria-label="Edit task">
            <svg viewBox="0 0 20 20" fill="none"><path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="del-btn" data-id="${task.id}" aria-label="Delete task">
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6 0v9a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0014 15V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   Task mutations
   ============================================================ */
function toggleComplete(id){
  const task = tasks.find(t => t.id === id);
  if(!task) return;
  task.status = task.status === 'completed' ? 'pending' : 'completed';
  saveTasks();
  renderAll();
  showToast(task.status === 'completed' ? 'Task marked complete.' : 'Task marked pending.', 'success', 1800);
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderAll();
  showToast('Task deleted.', 'success', 1800);
}

/* ============================================================
   Add / Edit modal
   ============================================================ */
function bindModal(){
  const overlay = document.getElementById('task-modal');
  const form = document.getElementById('task-form');
  if(!overlay || !form) return;

  document.querySelectorAll('[data-open-add-task]').forEach(btn => {
    btn.addEventListener('click', () => openAddModal());
  });
  overlay.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  document.querySelectorAll('.priority-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.priority-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      form.elements['priority'].value = opt.dataset.p;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const titleEl = form.elements['title'];
    const title = titleEl.value.trim();
    const description = form.elements['description'].value.trim();
    const dueDate = form.elements['dueDate'].value;
    const priority = form.elements['priority'].value || 'medium';

    if(!title){
      setFieldError(titleEl, 'Give the task a title.');
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    if(editingTaskId){
      const task = tasks.find(t => t.id === editingTaskId);
      if(task){
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
      }
      showToast('Task updated.', 'success', 1800);
    } else {
      tasks.unshift({
        id: uid(),
        title, description, dueDate, priority,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      showToast('Task added.', 'success', 1800);
    }
    saveTasks();
    closeModal();
    renderAll();
  });
}

function openAddModal(){
  editingTaskId = null;
  const form = document.getElementById('task-form');
  form.reset();
  clearAllErrors(form);
  form.elements['priority'].value = 'medium';
  setPriorityUI('medium');
  document.getElementById('task-modal-title').textContent = 'Add task';
  document.getElementById('task-save-btn').textContent = 'Save task';
  openModal();
}

function openEditModal(id){
  const task = tasks.find(t => t.id === id);
  if(!task) return;
  editingTaskId = id;
  const form = document.getElementById('task-form');
  clearAllErrors(form);
  form.elements['title'].value = task.title;
  form.elements['description'].value = task.description || '';
  form.elements['dueDate'].value = task.dueDate || '';
  form.elements['priority'].value = task.priority;
  setPriorityUI(task.priority);
  document.getElementById('task-modal-title').textContent = 'Edit task';
  document.getElementById('task-save-btn').textContent = 'Save changes';
  openModal();
}

function setPriorityUI(priority){
  document.querySelectorAll('.priority-opt').forEach(o => {
    o.classList.toggle('active', o.dataset.p === priority);
  });
}

function openModal(){
  document.getElementById('task-modal').classList.add('open');
  setTimeout(() => document.getElementById('task-title-input')?.focus(), 30);
}
function closeModal(){
  document.getElementById('task-modal').classList.remove('open');
  editingTaskId = null;
}

/* ============================================================
   Delete confirmation modal
   ============================================================ */
function bindConfirmModal(){
  const overlay = document.getElementById('confirm-modal');
  if(!overlay) return;
  overlay.querySelectorAll('[data-close-confirm]').forEach(btn => {
    btn.addEventListener('click', closeConfirmModal);
  });
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeConfirmModal(); });
  document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if(pendingDeleteId) deleteTask(pendingDeleteId);
    closeConfirmModal();
  });
}
function openConfirmModal(id){
  pendingDeleteId = id;
  const task = tasks.find(t => t.id === id);
  const nameEl = document.getElementById('confirm-task-name');
  if(nameEl && task) nameEl.textContent = `"${task.title}"`;
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirmModal(){
  document.getElementById('confirm-modal').classList.remove('open');
  pendingDeleteId = null;
}
