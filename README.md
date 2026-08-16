📚 StudyTrack

🎓 Student Task Manager

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/LocalStorage-Browser-blue?style=for-the-badge" alt="LocalStorage">
</p><p align="center">
  <b>Plan smarter • Track better • Stay ahead 🚀</b>
</p>---

✨ About The Project

StudyTrack is a browser-based student productivity application designed to make academic task management simple, organized, and visual.

It brings assignments, deadlines, priorities, progress, search, filters, and user accounts together inside one dashboard.

The project is built from the ground up using:

- 🧱 HTML5
- 🎨 CSS3
- ⚡ Vanilla JavaScript
- 💾 Browser "localStorage"

«🎯 Project Type: Web Development Midterm Project
🧩 Architecture: Frontend-only
💾 Data Layer: Browser localStorage
📱 Responsive: Yes»

---

🎯 Why StudyTrack?

Students often have assignments spread across notebooks, chats, notes, and different subjects.

StudyTrack provides one organized workspace to:

📌 Create and manage academic tasks
⏰ Track upcoming and overdue deadlines
🎯 Set task priorities
📊 Monitor completion progress
🔎 Search and filter tasks instantly
👤 Maintain separate task data for different users

---

🚀 Feature Showcase

🔐 Authentication

Feature| Status
👤 User Registration| ✅
🔑 Username & Password Login| ✅
👁️ Password Visibility Toggle| ✅
💾 Remember Me| ✅
🚪 Logout & Sessions| ✅
🚫 Duplicate Username Prevention| ✅
🛡️ Protected Dashboard| ✅

---

📊 Smart Dashboard

- 📈 Live task statistics
- ✅ Pending vs completed tracking
- ⏰ Due-soon counter
- 📊 Dynamic progress bar
- 📝 Recent task preview
- 👋 Personalized greeting

---

✅ Task Management

- ➕ Add tasks
- ✏️ Edit tasks
- 🗑️ Delete tasks
- 🔄 Complete / pending toggle
- 🔴 High priority
- 🟡 Medium priority
- 🟢 Low priority
- 📚 Subject selection
- 📝 Task description
- 📅 Due dates

---

🔎 Search & Organization

StudyTrack provides real-time task organization through:

- 🔍 Live task search
- 📌 Status filters
- 🎯 Priority filters
- 🆕 Newest / oldest sorting
- 📅 Due-date sorting
- ⭐ Priority sorting
- 🧹 Clear filters

---

🧠 How It Works

                    ┌──────────────────┐
                    │      LOGIN       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  AUTH VALIDATION │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      DASHBOARD       │
                  └──────────┬───────────┘
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Add Task │    │  Filter  │    │ Profile  │
       └────┬─────┘    └────┬─────┘    └──────────┘
            │               │
            └───────┬───────┘
                    ▼
             ┌───────────────┐
             │  localStorage │
             └───────────────┘

---

🏗️ Project Structure

StudyTrack/
│
├── 📄 index.html
├── 📄 login.html
├── 📄 register.html
│
├── 🎨 style.css
│
├── ⚙️ auth.js
├── ⚙️ script.js
│
└── 📚 README.md

📂 File Responsibilities

File| Responsibility
"index.html"| Protected dashboard
"login.html"| User login
"register.html"| New account registration
"style.css"| Complete UI & responsive styling
"auth.js"| Registration, login, logout & sessions
"script.js"| Tasks, filters, statistics & dashboard
"README.md"| Project documentation

---

⚙️ Technology Stack

<p align="center">Technology| Role
🧱 HTML5| Structure & semantic markup
🎨 CSS3| UI, layout & responsive design
⚡ Vanilla JavaScript| Application logic & DOM manipulation
💾 localStorage| Browser-side persistence

</p>«🚫 No React
🚫 No Bootstrap
🚫 No Tailwind
🚫 No backend

Just the fundamentals.»

---

🔐 Authentication System

StudyTrack uses a frontend-only authentication flow based on browser "localStorage".

📝 Registration Flow

User Registration
       ↓
Full Name + Username + Password
       ↓
studytrack_users
       ↓
Demo Tasks Created

🔑 Login Flow

Username + Password
       ↓
Credential Validation
       ↓
studytrack_session
       ↓
Protected Dashboard

---

💾 Storage Architecture

Storage Key| Data
"studytrack_users"| All registered accounts
"studytrack_session"| Current logged-in username
"studytrack_remember"| Remember Me username
"tasks_{username}"| Tasks belonging to each user

---

👥 User-Specific Data

Every account receives its own task collection.

tasks_ali123
tasks_ahmed456
tasks_student01

Example

Ali Login
    ↓
Ali's Tasks

Ahmed Login
    ↓
Ahmed's Tasks

Users do not load another user's task list through the application's normal interface.

---

📱 Responsive Experience

StudyTrack is designed for:

┌─────────────────────────────┐
│          🖥️ Desktop         │
├─────────────────────────────┤
│          📱 Tablet          │
├─────────────────────────────┤
│          📲 Mobile          │
└─────────────────────────────┘

The interface includes:

- 📱 Responsive sidebar
- ☰ Mobile navigation drawer
- 🔄 Flexible layouts
- 📭 Empty states
- 🔔 Toast notifications
- ✅ Form validation
- 📐 Responsive dashboard components

---

🛠️ Run Locally

1️⃣ Clone the repository

git clone https://github.com/your-username/studytrack.git
cd studytrack

2️⃣ Open the application

Start with:

login.html

You can open it directly in your browser or use VS Code Live Server.

3️⃣ Register

Create a new account.

4️⃣ Login

Enter your credentials.

5️⃣ Manage Tasks

Create, edit, filter, sort, complete, and delete tasks.

---

🌐 Deployment

Because StudyTrack is a static frontend application, it can be deployed using platforms such as GitHub Pages or Vercel.

GitHub

git init
git add .
git commit -m "Initial commit - StudyTrack"
git branch -M main
git remote add origin https://github.com/your-username/studytrack.git
git push -u origin main

After pushing, connect the repository to your preferred static hosting platform.

---

⚠️ Security Notice

«Important: StudyTrack is an academic frontend demonstration.»

Passwords are stored in plain text inside browser "localStorage".

There is currently:

- ❌ No real backend authentication
- ❌ No server-side authorization
- ❌ No password hashing
- ❌ No email recovery
- ❌ No cloud synchronization

For production software, the authentication layer should be replaced with:

Secure Backend
      ↓
Password Hashing
      ↓
Session Management
      ↓
Authorization
      ↓
Database

---

📊 Project Scope

StudyTrack demonstrates practical understanding of:

- Semantic HTML
- CSS Grid
- Responsive design
- JavaScript DOM manipulation
- CRUD-style operations
- Form validation
- Frontend authentication concepts
- Browser storage
- Search & filtering
- UI state management
- Responsive navigation

---

🔮 Future Roadmap

✅ Completed

- [x] Frontend Dashboard
- [x] Authentication Demo
- [x] Task CRUD
- [x] Search & Filters
- [x] User-Specific Storage
- [x] Responsive UI

🚧 Planned

- [ ] Secure Backend Authentication
- [ ] Database Integration
- [ ] Cloud Synchronization
- [ ] Email Verification
- [ ] Password Recovery
- [ ] Push Notifications
- [ ] Analytics Dashboard
- [ ] Dark Mode
- [ ] PDF / CSV Export
- [ ] PWA Support
- [ ] Collaborative Tasks

---

🧪 Development Philosophy

«Build the fundamentals first. Then scale the system.»

StudyTrack intentionally uses vanilla web technologies so the underlying logic remains visible, understandable, and easy to modify.

The project focuses on understanding the fundamentals rather than depending on large frameworks.

---

📌 Project Status

<p align="center">🚀 Active Academic Project

<br>🟢 Frontend Complete
🟢 Authentication Demo Complete
🟢 Task Management Complete
🟢 Responsive UI Complete

</p>---

👨‍💻 Team

Role| Responsibility
👨‍💻 Member 1| HTML structure & pages
🎨 Member 2| CSS, UI & responsiveness
⚡ Member 3| JavaScript, authentication & task logic

«Replace the member names with your actual team members before submission.»

---

⭐ StudyTrack

<p align="center">📚 Plan smarter. Track better. Stay ahead.

Built with ❤️ using

"HTML5" • "CSS3" • "Vanilla JavaScript"

<br>⭐ If you like the project, consider giving it a star! ⭐

</p>---

<p align="center">
  <sub>© 2026 StudyTrack • Academic Web Development Project</sub>
</p>