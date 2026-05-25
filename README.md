# Student Task Manager

A clean and responsive student productivity web application built to help students manage tasks, assignments, study schedules, deadlines, and daily goals efficiently.

## Features

- Add, edit, delete, and organize tasks
- Task priority and status management
- Deadline tracking with overdue detection
- Timetable and study session management
- Recurring tasks support
- Checklist subtasks
- Color-coded subjects/categories
- Achievement badges and progress tracking
- Responsive and modern UI
- Toast notifications and reminders
- Kanban board for workflow management
- Notes and bookmarks section
- Calendar and exam countdown support

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Nodemailer

## Purpose

This project is designed to improve student productivity by providing an all-in-one workspace for academic planning and task management with browser and email reminders.

## Future Enhancements

- Authentication system
- Cloud sync/database integration
- Dark mode
- File attachment support
- AI-based study recommendations
- Collaborative study groups

## Installation

```bash
git clone <repository-url>
cd student-task-manager
```

## Local development

1. Change into the backend folder:

```bash
cd backend
```

2. Copy the example environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your SMTP provider settings.

4. Install backend dependencies and start the email service:

```bash
npm install
npm start
```

5. Open `index.html` in your browser or serve the frontend folder with a static server.

## Testing reminders

1. Create sample tasks with deadlines a few minutes or hours in the future.
2. Enable browser notifications in the settings panel.
3. If using email reminders, enable the email toggle and provide a valid email address.
4. Make sure the backend is running on `http://localhost:5000`.
5. Verify browser notifications appear at the reminder time.
6. Verify email reminders arrive for tasks that include an email address.
7. Test behavior when browser permission is denied and when email reminders are disabled.

## Notes

- Browser reminders use the Notification API and require user permission.
- Email reminders are sent through the backend endpoint at `http://localhost:5000/sendReminder`.
- The backend validates email format and returns clear errors when the request is invalid.
- Use a real SMTP provider or a testing account to verify delivery.

## Future enhancements

- Add per-task reminder customization beyond the global default interval.
- Add recurring reminders for weekly study sessions, monthly deadlines, and task repetition.
- Integrate with a cloud database such as Firebase or Supabase so reminders sync across devices.
- Add user authentication and secure cloud storage for task data.
