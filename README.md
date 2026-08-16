<div align="center">

# 📚 StudyTrack

### The all-in-one student productivity & study management platform

Plan tasks, track homework, prep for exams, manage projects, and study smarter — all from one clean dashboard.

[![Made with HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![Made with CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![Made with JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![No Frameworks](https://img.shields.io/badge/Frameworks-None-4F46E5?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#-license)

<br>

<img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="status">
<img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="version">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome">

</div>

---

## ✨ Overview

**StudyTrack** is a fully functional, front-end-only student productivity platform built with nothing but **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools, no backend. It's designed to feel like a real SaaS product: polished UI, smooth micro-interactions, and every button actually does something.

Open the dashboard and instantly answer:

> *What do I have to do today? What's due soon? What should I study? Which exams are coming? How much progress have I made?*

---

## 🖼️ Preview

<div align="center">
<img src="https://img.shields.io/badge/🏠_Dashboard-Stat_cards_%7C_Today's_tasks_%7C_Productivity_ring-4F46E5?style=for-the-badge" alt="dashboard">
<br><br>
<img src="https://img.shields.io/badge/📅_Schedule-Week_%7C_Day_%7C_Month_views-DA7B11?style=for-the-badge" alt="schedule">
<br><br>
<img src="https://img.shields.io/badge/🎯_Exams-Countdown_%7C_Prep_checklist-D6395A?style=for-the-badge" alt="exams">
</div>

> Add real screenshots or a GIF walkthrough here once deployed — drop them in a `/screenshots` folder and reference them, e.g. `![Dashboard](screenshots/dashboard.png)`

---

## 🚀 Features

| Module | What it does |
|---|---|
| 🏠 **Dashboard** | Greeting, live date, 6 stat cards, today's tasks, productivity ring, weekly activity chart, exam countdowns |
| ✅ **Task Manager** | Add/edit/delete tasks with category, subject, priority, due date & time, duration, and status |
| 📅 **Schedule** | Weekly, daily, and monthly calendar views with color-coded event categories |
| 📖 **Study Planner** | Timeline-style planner grouped by day, with subject, topic, time block, and notes |
| 📝 **Homework Tracker** | Filter by all / pending / completed / overdue, with automatic overdue detection |
| 🎯 **Exam Prep** | Live countdown, auto-calculated preparation %, and a per-exam study checklist |
| 💻 **Project Manager** | Multi-task projects with progress bars and completion tracking |
| 📊 **Progress Dashboard** | Circular productivity ring, subject-by-subject bars, and a weekly activity chart |
| 🔔 **Notifications** | Real-time alerts for due dates, overdue items, and completed tasks |
| 🔎 **Global Search** | Search across tasks, homework, exams, projects, and study sessions instantly |
| 👤 **Profile & Settings** | Editable profile, light/dark theme, reminder preferences, password change |
| 🔐 **Authentication** | Register/login with per-user data isolation — no two accounts share data |

Every list, filter, sort, checkbox, and modal is wired to real state — nothing is a static mockup.

---

## 🎨 Design

- **Display font:** [Sora](https://fonts.google.com/specimen/Sora) — distinctive, geometric headings
- **Body font:** [Inter](https://fonts.google.com/specimen/Inter) — clean, highly readable
- **Palette:** Indigo primary, warm amber accent, soft neutrals — light & dark mode included
- **Motion:** Subtle, purposeful transitions — checkbox completion, modal fade/scale, toast slide-in, progress-bar fill, sidebar drawer

Built following a real design system (tokenized colors, spacing, radii, and shadows in `style.css`) rather than default framework styling.

---

## 🧱 Tech Stack

```
HTML5    →  Semantic structure across 3 pages
CSS3     →  Custom design system, responsive grid/flexbox, animations
JavaScript (Vanilla) → All app logic, state, and rendering
localStorage → Client-side persistence, no backend required
```

No React. No Bootstrap. No Tailwind. No build step. Just open it in a browser.

---

## 📂 Project Structure

```
studytrack/
├── index.html      # Main dashboard (SPA — all feature sections)
├── login.html       # Login page
├── register.html     # Account creation page
├── style.css        # Full design system & component styles
├── auth.js         # Registration, login, session handling, data seeding
├── script.js        # Dashboard logic, CRUD, rendering, interactions
└── README.md
```

---

## ⚡ Getting Started

### Option 1 — Just open it
No installation needed. Clone the repo and open `register.html` (or `login.html`) directly in your browser.

```bash
git clone https://github.com/<your-username>/studytrack.git
cd studytrack
open register.html      # macOS
start register.html     # Windows
xdg-open register.html  # Linux
```

### Option 2 — Local server (recommended)
Some browsers restrict certain features on `file://` URLs, so a lightweight local server is nicer:

```bash
# Python
python3 -m http.server 5500

# Node
npx serve .
```

Then visit `http://localhost:5500/register.html`.

### Option 3 — GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to your default branch, root folder
4. Your app will be live at `https://<your-username>.github.io/studytrack/register.html`

---

## 🔐 How auth & data work

- Passwords are hashed client-side before storage (not cryptographically secure — this is a front-end demo, **not** meant for sensitive production data)
- Every account gets its own isolated data under keys like `st_tasks_<username>`, `st_homework_<username>`, etc.
- New accounts are seeded with example tasks, homework, exams, and a study plan so the dashboard isn't empty on first login
- All data lives in the browser's `localStorage` — clearing browser storage will reset the app

---

## 🗺️ Roadmap

- [ ] Optional cloud sync (Firebase / Supabase backend)
- [ ] Drag-and-drop task reordering
- [ ] Recurring tasks & study sessions
- [ ] Export progress reports (PDF/CSV)
- [ ] Push notifications (Web Notifications API)
- [ ] Multi-language support

Have an idea? Open an issue!

---

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with ☕ and vanilla JavaScript, for students who want less chaos and more progress.

**⭐ Star this repo if StudyTrack helped you stay organized!**

</div>
