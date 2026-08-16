�

📚 StudyTrack
🎓 Student Task Manager
�
￼ ￼ ￼ ￼ 

�
Plan smarter • Track better • Stay ahead 

�
￼
�


�
�

🚀 About The Project
StudyTrack is a browser-based student productivity application designed to make academic task management simple, organized, and visual.
It brings assignments, deadlines, priorities, progress, search, filters, and user accounts together inside one dashboard.
The project is built from the ground up using HTML5, CSS3, and Vanilla JavaScript — with no frameworks or external application libraries.
🎯 Project Type: Web Development Midterm Project
🧩 Architecture: Frontend-only
💾 Data Layer: Browser localStorage
📱 Responsive: Yes
✨ Why StudyTrack?
Students often have assignments spread across notebooks, chats, notes, and different subjects.
StudyTrack provides one organized place to:
📌 Create and manage academic tasks
⏰ Track upcoming and overdue deadlines
🎯 Set task priorities
📊 Monitor completion progress
🔎 Search and filter tasks instantly
👤 Maintain separate task data for different users
⚡ Feature Showcase
�

🔐 Authentication
User registration
Username/password login
Password visibility toggle
Remember Me
Logout & sessions
Duplicate username prevention
Protected dashboard
�

📊 Smart Dashboard
Live task statistics
Pending vs completed tracking
Due-soon counter
Progress bar
Recent task preview
Personalized greeting
�

�

✅ Task Management
Add tasks
Edit tasks
Delete tasks
Complete / pending toggle
High / Medium / Low priority
Subject & description
Due dates
�

🔎 Search & Organization
Live task search
Status filters
Priority filters
Newest / oldest sorting
Due-date sorting
Priority sorting
Clear filters
�

🧠 How It Works
┌──────────────────┐
                    │      LOGIN       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ AUTH VALIDATION  │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     DASHBOARD        │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Add Task │    │  Filter  │    │ Profile  │
       └────┬─────┘    └────┬─────┘    └──────────┘
            │               │
            └───────┬───────┘
                    ▼
             ┌───────────────┐
             │  localStorage │
             └───────────────┘
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
File Responsibilities
File
Responsibility
index.html
Protected dashboard
login.html
User login
register.html
New account registration
style.css
Complete UI & responsive styling
auth.js
Registration, login, logout & sessions
script.js
Tasks, filters, statistics & dashboard
README.md
Project documentation
⚙️ Technology Stack
�

Technology
Role
🧱 HTML5
Structure & semantic markup
🎨 CSS3
UI, layout & responsive design
⚡ Vanilla JavaScript
Application logic & DOM
💾 localStorage
Browser-side persistence
�

No React. No Bootstrap. No Tailwind. No backend. Just the fundamentals.
🔐 Authentication System
StudyTrack uses a frontend-only authentication flow based on browser localStorage.
Registration
User Registration
       ↓
Full Name + Username + Password
       ↓
studytrack_users
       ↓
Demo Tasks Created
Login
Username + Password
       ↓
Credential Validation
       ↓
studytrack_session
       ↓
Protected Dashboard
Storage Architecture
Key
Data
studytrack_users
All registered accounts
studytrack_session
Current logged-in username
studytrack_remember
Remember Me username
tasks_{username}
Tasks belonging to that user
👥 User-Specific Data
Every account gets its own task collection.
tasks_ali123
tasks_ahmed456
tasks_student01
This means:
Ali Login
   ↓
Ali's Tasks

Ahmed Login
   ↓
Ahmed's Tasks
Users do not load another user's task list through the application's normal interface.
📱 Responsive Experience
StudyTrack is designed to work across:
┌─────────────────────────────┐
│         Desktop             │
├─────────────────────────────┤
│          Tablet             │
├─────────────────────────────┤
│           Mobile            │
└─────────────────────────────┘
The interface includes a responsive sidebar, mobile navigation drawer, flexible layouts, empty states, toast notifications, and form validation.
🛠️ Run Locally
1. Clone
git clone https://github.com/your-username/studytrack.git
cd studytrack
2. Open
Start with:
login.html
You can open it directly in your browser or use VS Code Live Server.
3. Register
Create a new account.
4. Login
Enter your credentials.
5. Manage Tasks
Create, edit, filter, sort, complete, and delete tasks.
🌐 Deployment
Because StudyTrack is a static frontend application, it can be deployed to platforms such as Vercel or GitHub Pages.
GitHub
git init
git add .
git commit -m "Initial commit - StudyTrack"
git branch -M main
git remote add origin https://github.com/your-username/studytrack.git
git push -u origin main
After pushing, connect the repository to your preferred static hosting platform.
⚠️ Security Notice
Important: This is an academic frontend demonstration.
Passwords are stored in plain text in browser localStorage. There is no real backend authentication, server-side authorization, password hashing, email recovery, or cloud synchronization.
For production software, the authentication layer should be replaced with a secure backend, proper password hashing, session management, authorization, and a database.
📊 Project Scope
StudyTrack demonstrates practical understanding of:
Semantic HTML
CSS Grid & responsive design
JavaScript DOM manipulation
CRUD-style operations
Form validation
Frontend authentication concepts
Browser storage
Search & filtering
UI state management
Responsive navigation
🔮 Future Roadmap
[✓] Frontend Dashboard
[✓] Authentication Demo
[✓] Task CRUD
[✓] Search & Filters
[✓] User-Specific Storage
[✓] Responsive UI

[ ] Secure Backend Authentication
[ ] Database Integration
[ ] Cloud Synchronization
[ ] Email Verification
[ ] Password Recovery
[ ] Push Notifications
[ ] Analytics Dashboard
[ ] Dark Mode
[ ] PDF / CSV Export
[ ] PWA Support
[ ] Collaborative Tasks
🧪 Development Philosophy
Build the fundamentals first. Then scale the system.
StudyTrack intentionally uses vanilla web technologies so the underlying logic remains visible, understandable, and easy to modify.
📌 Project Status
�

� � � �
�

👨‍💻 Team
Role
Responsibility
Member 1
HTML structure & pages
Member 2
CSS, UI & responsiveness
Member 3
JavaScript, authentication & task logic
Replace the member names above with your actual team names before submission.
�

⭐ StudyTrack
Plan smarter. Track better. Stay ahead.
Built with ❤️ using
HTML5 • CSS3 • Vanilla JavaScript
�


�
￼
�