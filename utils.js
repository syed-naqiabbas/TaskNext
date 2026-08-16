/* ============================================================
   TaskNext — utils.js
   Shared helpers used by both auth.js and script.js.
   Storage is namespaced under "tasknext_" so this demo never
   collides with other localStorage data on the same origin.
   ============================================================ */

const STORAGE_KEYS = {
  USERS: 'tasknext_users',
  CURRENT_USER: 'tasknext_current_user',
  TASKS_PREFIX: 'tasknext_tasks_' // + username
};

/* ---------- generic storage helpers ---------- */
function readJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    console.error('TaskNext: failed to read', key, e);
    return fallback;
  }
}
function writeJSON(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }catch(e){
    console.error('TaskNext: failed to write', key, e);
    return false;
  }
}

/* Read a key that is expected to hold an array. Guards against
   corrupted/legacy localStorage data that isn't actually an array
   (e.g. an object, a string, or valid JSON of the wrong shape). */
function readArray(key){
  const value = readJSON(key, []);
  return Array.isArray(value) ? value : [];
}

/* ---------- misc helpers ---------- */
function uid(){
  return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function getInitials(fullName){
  if(!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/* Format an ISO date (yyyy-mm-dd) into a short human label */
function formatDueDate(isoDate){
  if(!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.round((date - today) / 86400000);

  const opts = { month: 'short', day: 'numeric' };
  if(diffDays === 0) return 'Today';
  if(diffDays === 1) return 'Tomorrow';
  if(diffDays === -1) return 'Yesterday';
  if(diffDays < 0) return date.toLocaleDateString(undefined, opts) + ' (overdue)';
  return date.toLocaleDateString(undefined, opts);
}

function isToday(isoDate){
  if(!isoDate) return false;
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
  return isoDate === todayStr;
}

function isOverdue(isoDate, completed){
  if(!isoDate || completed) return false;
  const [y,m,d] = isoDate.split('-').map(Number);
  const due = new Date(y, m-1, d);
  const today = new Date();
  today.setHours(0,0,0,0);
  return due < today;
}

function isUpcoming(isoDate){
  if(!isoDate) return false;
  const [y,m,d] = isoDate.split('-').map(Number);
  const due = new Date(y, m-1, d);
  const today = new Date();
  today.setHours(0,0,0,0);
  return due > today;
}

/* ---------- toast notifications ---------- */
function ensureToastStack(){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  return stack;
}

const TOAST_ICONS = {
  success: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="toast__icon"><path d="M4 10.5L8 14.5L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error: '<svg viewBox="0 0 20 20" fill="none" class="toast__icon"><path d="M10 6v5M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6"/></svg>',
  info: '<svg viewBox="0 0 20 20" fill="none" class="toast__icon"><path d="M10 9v5M10 6.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6"/></svg>'
};

function showToast(message, type = 'info', duration = 3200){
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.info}<span>${escapeHtml(message)}</span>`;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}
