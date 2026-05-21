# 💰 SpendWise — MERN Expense Tracker

A full-stack expense tracker built with MongoDB, Express, React, and Node.js. Features a modern dark UI with real-time analytics, budget tracking, and multi-currency support.

---

## 🚀 Features

- **Authentication** — JWT-based register/login with secure bcrypt hashing
- **Transactions** — Add, edit, delete income & expense entries with categories
- **Dashboard** — Overview with stats, 6-month trend chart, category breakdown
- **Analytics** — Daily cash flow, monthly trends, category donut chart, savings rate
- **Budgets** — Set per-category monthly limits with visual progress tracking
- **Filters & Search** — Filter by type, category, date range; search by title
- **Multi-currency** — USD, EUR, GBP, INR, JPY, CAD, AUD
- **Responsive** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS with CSS variables (dark theme) |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone & Install

```bash
git clone <your-repo>
cd expense-tracker

# Install all dependencies
npm run install:all
# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run Development Servers

**Option A — Run both together (from root):**
```bash
npm install        # installs concurrently
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Expense.js         # Expense/Income schema
│   │   └── Budget.js          # Budget schema
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── expenses.js        # /api/expenses/*
│   │   └── budgets.js         # /api/budgets/*
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Sidebar.js     # Navigation sidebar
        │   └── ExpenseModal.js # Add/Edit modal
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── pages/
        │   ├── Dashboard.js   # Main overview
        │   ├── Transactions.js # Full transaction list
        │   ├── Analytics.js   # Charts & insights
        │   ├── Budgets.js     # Budget management
        │   ├── Settings.js    # Profile settings
        │   ├── Login.js
        │   └── Register.js
        ├── utils/
        │   ├── api.js         # Axios API client
        │   └── constants.js   # Categories, currencies
        ├── App.js
        ├── index.css          # Design system
        └── index.js
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List with filters & pagination |
| POST | `/api/expenses` | Create transaction |
| PUT | `/api/expenses/:id` | Update transaction |
| DELETE | `/api/expenses/:id` | Delete transaction |
| GET | `/api/expenses/stats/summary` | Monthly analytics |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets for month |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

---

## 🚢 Production Deployment

### Backend (e.g. Railway, Render, Heroku)
```bash
# Set environment variables on your platform:
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (e.g. Vercel, Netlify)
```bash
# In frontend/.env.production:
REACT_APP_API_URL=https://your-backend.railway.app/api

npm run build --prefix frontend
# Deploy the /frontend/build directory
```

---

## 🎨 Design System

The UI uses a custom dark theme built with CSS variables:
- **Font**: Syne (display) + DM Sans (body)
- **Colors**: Deep dark (`#0A0B0F`) + neon green accent (`#00E5A0`)
- **Cards**: Glassmorphism-inspired with subtle borders
- **Charts**: Recharts with custom dark tooltips

---

## 📝 License
MIT
