# Online Quiz and Examination Management System (OQEMS)

A complete, full-stack **Online Quiz and Examination Management System** built for educational institutions (universities, colleges, and polytechnics). It supports **Administrators**, **Lecturers**, and **Students** with role-based access control, a reusable question bank, real-time timed examinations with auto-save/recovery, hybrid grading (automatic objective marking + manual lecturer essay evaluation), and Chart.js analytics.

---

## 1. System Architecture

OQEMS follows a layered **Model-View-Controller (MVC) + RESTful API** architecture:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (Frontend)                       │
│  HTML5 + CSS3 (Navy Blue, White, Light Grey Responsive UI) + Vanilla JS    │
│  • index.html (Login & Student Self-Registration)                          │
│  • admin.html (Institutional Management, Monitoring, Reports, Settings)    │
│  • lecturer.html (Courses, Question Bank, Exam Authoring, Essay Grading)   │
│  • student.html (Courses, Available/Upcoming Exams, Results, Analytics)    │
│  • exam.html (Live Server-Synced Timer, Question Nav, Auto-Save Engine)    │
│  • Chart.js 4.x (Interactive Performance & Distribution Visualizations)    │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ HTTP / JSON REST API (Session Cookie)
┌───────────────────────────────────────▼────────────────────────────────────┐
│                        APPLICATION LAYER (Backend)                         │
│  Node.js + Express.js                                                      │
│  • Security & Auth Middleware: bcryptjs password hashing, express-session, │
│    strict Role-Based Access Control (requireAuth, requireRole), Protected  │
│    HTML & API routes, Parameterized SQL Queries (SQL Injection Protection) │
│  • File Upload Middleware: Multer for question diagram/image attachments   │
│  • Hybrid Grading Engine (utils/grading.js): Instant auto-marking for      │
│    MCQ, True/False & Short-Answer + manual lecturer essay marking          │
│  • Audit & Notification Engine (utils/logger.js): Activity logs & alerts   │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ mysql2/promise Connection Pool
┌───────────────────────────────────────▼────────────────────────────────────┐
│                           DATA LAYER (Database)                            │
│  MySQL 8.0+ Relational Database (oqems_db) — 16 Normalized InnoDB Tables   │
│  users, departments, students, lecturers, courses, course_registrations,   │
│  examinations, questions, answer_options, exam_questions,                  │
│  student_examination_attempts, student_answers, results, notifications,    │
│  activity_logs, system_settings                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Folder Structure

```
software assign/
├── config/
│   └── db.js                        # MySQL connection pool configuration (mysql2/promise)
├── controllers/
│   ├── authController.js            # Login, Student Registration, Session, Password Update
│   ├── adminController.js           # Departments, Courses, Users, Monitoring, Reports, Settings
│   ├── lecturerController.js        # Question Bank, Exam CRUD, Essay Grading, Result Publishing
│   ├── studentController.js         # Course Enrollment, Live Exam Engine, Auto-Save, Results
│   └── notificationController.js    # Role/Course Notifications & Announcements
├── database/
│   ├── schema.sql                   # Complete 16-table MySQL DDL script with constraints
│   └── init.js                      # Auto-initializer, sample data seeder & test-data cleaner
├── middleware/
│   ├── auth.js                      # Session authentication & RBAC middleware
│   └── upload.js                    # Multer image upload middleware for questions
├── public/
│   ├── css/
│   │   └── style.css                # Responsive Navy Blue, White & Light Grey stylesheet
│   ├── js/
│   │   ├── common.js                # Shared API client, toast alerts, modals & CSV exporter
│   │   ├── auth.js                  # Login & Student Registration frontend logic
│   │   ├── admin.js                 # Administrator dashboard, CRUD & Chart.js logic
│   │   ├── lecturer.js              # Lecturer dashboard, Question Bank, Exam & Grading logic
│   │   ├── student.js               # Student dashboard, Course registration & Results logic
│   │   └── exam.js                  # Live examination timer, navigation & auto-save engine
│   ├── uploads/
│   │   └── questions/               # Uploaded question diagrams & images
│   ├── index.html                   # Portal Login & Student Registration page
│   ├── admin.html                   # Administrator Portal
│   ├── lecturer.html                # Lecturer Portal
│   ├── student.html                 # Student Portal
│   └── exam.html                    # Student Live Examination Interface
├── routes/
│   ├── authRoutes.js                # /api/auth/*
│   ├── adminRoutes.js               # /api/admin/*
│   ├── lecturerRoutes.js            # /api/lecturer/*
│   ├── studentRoutes.js             # /api/student/*
│   └── notificationRoutes.js        # /api/notifications/*
├── utils/
│   ├── grading.js                   # Automatic & hybrid grading calculator
│   └── logger.js                    # Activity audit logger & notification helper
├── .env                             # Environment variables
├── .env.example                     # Sample environment template
├── package.json                     # Dependencies and npm scripts
├── server.js                        # Express application entry point
└── README.md                        # System documentation & setup guide
```

---

## 3. Database Structure (16 Tables)

1. **`users`**: Core authentication & role-based access table (`admin`, `lecturer`, `student`) with `bcrypt` password hashes.
2. **`departments`**: Academic departments (`name`, `code`, `faculty`, `description`).
3. **`students`**: Student profile linked to `users` and `departments` (`matric_number`, `level`, `phone`, `gender`).
4. **`lecturers`**: Lecturer profile linked to `users` and `departments` (`staff_id`, `academic_rank`, `specialization`).
5. **`courses`**: Institutional courses linked to `departments` and assigned `lecturers` (`course_code`, `course_title`, `credit_units`, `semester`, `level`).
6. **`course_registrations`**: Enrolls students in courses (`student_id`, `course_id`, `academic_session`).
7. **`examinations`**: Quizzes and examinations (`title`, `course_id`, `lecturer_id`, `duration_minutes`, `start_time`, `end_time`, `passing_score`, `randomize_questions`, `randomize_options`, `results_published`, `status`).
8. **`questions`**: Reusable Question Bank supporting `mcq`, `true_false`, `short_answer`, and `essay` with optional `image_url`.
9. **`answer_options`**: Answer choices (`A`, `B`, `C`, `D` or `True`/`False`) linked to `questions`.
10. **`exam_questions`**: Many-to-many bridge table linking reusable Question Bank items to specific `examinations`.
11. **`student_examination_attempts`**: Tracks live student attempts (`started_at`, server-calculated `expires_at`, `submitted_at`, `question_order_json` preserving per-student randomized order across refreshes, `status`).
12. **`student_answers`**: Stores auto-saved and submitted student answers (`selected_option_id`, `answer_text`, `is_correct`, `marks_obtained`, `lecturer_feedback`).
13. **`results`**: Stores computed examination scores (`objective_score`, `essay_score`, `total_score`, `percentage`, `grade`, `pass_status`, `grading_status`, `is_published`).
14. **`notifications`**: System, role, and course notifications (`new_exam`, `upcoming_exam`, `schedule_change`, `result_published`, `announcement`).
15. **`activity_logs`**: Audit trail of logins, exam creations, submissions, grading, and administrative actions.
16. **`system_settings`**: Configurable institutional parameters (institution name, session, pass mark, grading scale, self-registration toggle).

---

## 4. Installation & Database Setup Instructions

### Prerequisites
* **Node.js** (v18+ or v20/v24)
* **MySQL Server** (v8.0+ or MariaDB)

### Step 1: Configure Environment Variables
Open the `.env` file in the project root and set your MySQL credentials:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=oqems_super_secure_session_secret_key_2026

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=oqems_db
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Database Schema & Sample Data
Run the automated setup script (creates `oqems_db`, executes `database/schema.sql`, and seeds initial configuration & sample development data):
```bash
npm run db:setup
```
*(Alternatively, you can import `database/schema.sql` directly via MySQL Workbench or CLI, and the server will seed initial records on first startup.)*

### Step 4: Start the Application
```bash
npm start
```
Open **http://localhost:3000** in your browser.

---

## 5. Default Accounts (Seeded in Database)

| Role | Email / Identifier | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@university.edu` | `Admin@123` | Permanent admin account (preserved when clearing test data) |
| **Lecturer 1** | `lecturer1@university.edu` or `STF/2026/001` | `Lecturer@123` | Dr. Adewale Mensah (Computer Science — `CSC301`, `CSC204`) |
| **Lecturer 2** | `lecturer2@university.edu` or `STF/2026/002` | `Lecturer@123` | Prof. Eleanor Vance (Software Engineering — `SEN302`, `INS201`) |
| **Student 1** | `student1@university.edu` or `CSC/2023/1001` | `Student@123` | Samuel Okafor (Has an active exam ready to start & a published result) |
| **Student 2** | `student2@university.edu` or `SEN/2023/1002` | `Student@123` | Grace Chen (Has a submitted exam with an essay ready for Lecturer 1 to grade) |
| **Student 3** | `student3@university.edu` or `CSC/2024/1003` | `Student@123` | Ibrahim Danjuma (200 Level Computer Science) |

> **Removing Test Data Before Deployment:** Log in as **Administrator** $\rightarrow$ go to **System Settings** $\rightarrow$ click **"Remove All Test / Sample Data"**. All sample records (`is_sample_data = TRUE`) will be cleanly removed while preserving your Administrator account and system settings.

