
# BrightSmile Dental Clinic Appointment System

A full-stack, production-level application for managing dental clinic appointments.

## 🚀 Features

- **📱 Fully Responsive Design**: Optimized for Mobile, Tablet, and Desktop.
    - **Mobile-First**: Touch-friendly interfaces with hamburger menus.
    - **Adaptive Layouts**: Dashboards and forms that reshape based on screen size.
- **RBAC**: Separate dashboards for Patients, Dentists, and Administrators.
- **Smart Booking**: Conflict detection for appointments.
- **Schedule Management**: Admins can manage dentist availability.
- **Modern UI**: Built with Tailwind CSS for a premium look and feel.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Headless UI.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL with Prisma ORM.
- **Security**: JWT Authentication, Bcrypt password hashing, Helmet security headers.

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your DATABASE_URL, JWT_SECRET, and SMTP credentials
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📸 Screenshots

### Mobile View
![Mobile Home](/screenshots/mobile-home.png)
*Responsive landing page with hamburger menu.*

![Mobile Dashboard](/screenshots/mobile-dashboard.png)
*Patient dashboard optimized for small screens.*

### Desktop View
![Desktop Login](/screenshots/desktop-login.png)
*Split-screen login page for large displays.*

![Desktop Dashboard](/screenshots/desktop-dashboard.png)
*Full admin dashboard with comprehensive management tools.*

## 📖 API Documentation

### Authentication
- `POST /api/auth/register`: Register a new patient account.
- `POST /api/auth/login`: Authenticate user and receive JWT.

### Dentists
- `GET /api/dentists`: List all dentists and their specializations.
- `POST /api/dentists`: [Admin] Add a new dentist to the staff.
- `DELETE /api/dentists/:id`: [Admin] Remove a dentist.

### Schedules
- `GET /api/dentists/schedules`: View availability for dentists.
- `POST /api/dentists/schedules`: [Admin] Set weekly hours for a dentist.

### Appointments
- `GET /api/appointments`: List appointments (filtered by user role).
- `POST /api/appointments`: [Patient] Book a new appointment.
- `PATCH /api/appointments/:id/status`: Update appointment status (Cancel/Confirm/Complete).

## 🔒 Production Deployment

### Backend
- Set `NODE_ENV=production`
- Set `ALLOWED_ORIGINS` to comma-separated frontend URLs (e.g. `https://yourdomain.com`)
- Use a strong `JWT_SECRET` (e.g. `openssl rand -base64 32`)
- Rate limiting: 100 requests/15min (general), 10 attempts/15min (auth endpoints)
- Health check: `GET /api/health`

### Frontend
- Set `VITE_API_URL` to your production API URL (e.g. `https://api.yourdomain.com/api`)
- Build: `npm run build`

## 🧪 Sample Admin Credentials
- **Email**: `admin@dental.com`
- **Password**: `admin`


## 📂 Project Structure
```text
├── backend/
│   ├── src/
│   │   ├── config/       # Environment & Database config
│   │   ├── controllers/  # Business logic
│   │   ├── jobs/         # Scheduled tasks (Cron)
│   │   ├── middleware/   # Auth & Error handling
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business services
│   │   ├── utils/        # Helper functions
│   │   ├── validations/  # Joi schemas
│   │   ├── app.js        # App setup
│   │   └── server.js     # Entry point
├── frontend/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page views
│   ├── services/         # API integration
│   ├── App.tsx           # Main component
│   ├── index.tsx         # Entry point
│   ├── types.ts          # TypeScript interfaces
│   └── tailwind.config.js
```
