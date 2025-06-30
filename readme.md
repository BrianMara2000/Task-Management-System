# 📝 Task Management App

A full-featured task management system inspired by Asana, built with **Laravel 12** (backend) and **React** (frontend), supporting team collaboration, drag-and-drop task boards, comments, file attachments, and more.

## 🚀 Features

* ✅ Authentication with Laravel Sanctum
* 🧑‍🤝‍🧑 User & Team Management
* 📁 Project and Task Handling
* 🧫 Drag-and-Drop Task Boards (DndKit)
* 💬 Comments and File Attachments
* 🔔 Real-Time Notifications (Coming Soon)
* 📊 Reports & Statistics (Planned)
* ⚙️ User Roles and Permissions
* 🌐 Responsive UI (ShadCN + TailwindCSS)

---

## 💪 Tech Stack

| Frontend      | Backend            | UI / Tools             |
| ------------- | ------------------ | ---------------------- |
| React         | Laravel 12         | ShadCN UI, TailwindCSS |
| Vite          | Laravel Sanctum    | Figma (Design)         |
| Axios         | MySQL / PostgreSQL | GitHub                 |
| Redux Toolkit | Laravel Eloquent   | VSCode                 |

---

## 🏗 Project Structure

```
task-manager/
├── backend/           # Laravel 12 API
│   ├── app/
│   ├── routes/
│   └── ...
├── frontend/          # React App
│   ├── src/
│   ├── components/
│   └── ...
```

---

## 📦 Installation

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Usage

* Register/login to create or join a team
* Create a project and invite teammates
* Create tasks and drag them between columns
* Comment and attach files on each task

---

## 🗕 Project Timeline

| Phase | Feature                        | Status         |
| ----- | ------------------------------ | -------------- |
| 1     | Auth System (Laravel Sanctum)  | ✅ Done         |
| 2     | User & Role Management         | ✅ Done         |
| 3     | Projects & Teams               | ✅ Done         |
| 4     | Tasks + Drag and Drop (DndKit) | ✅ Done         |
| 5     | Comments & Attachments         | ✅ Done         |
| 6     | Notifications                  | 🔄 In Progress |
| 7     | Reports                        | 🔜 Planned     |

---

## 🙌 Acknowledgements

* [Laravel](https://laravel.com)
* [React](https://reactjs.org)
* [ShadCN UI](https://ui.shadcn.dev/)
* [DndKit](https://dndkit.com/)
