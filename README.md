# ✨ Celebration Event Planner (Full-Stack Web App)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/tests-100%25%20passing-brightgreen.svg)]()

A complete, modern, responsive full-stack celebration and event planning web application. Crafted with a luxury **obsidian black background**, **geometric block grid pattern**, and vibrant **purple (`#a855f7`) & soft pink (`#ec4899`) glowing accents**, built on a beginner-friendly technology stack with zero complicated build dependencies.

---

## 🌟 Features Overview

### 1. 🎂 Milestone Event Categories
- **🎂 Birthday:** Galas, surprise parties, cocktail tastings, dessert bars, and milestones.
- **💍 Wedding:** Twilight ceremonies, black-tie receptions, conservatory dinners, and floral installations.
- **🥂 Anniversary:** Golden, silver, and vow renewal dinners with archival memory presentations.
- **🎉 Party & Soiree:** Masquerades, rooftop dance parties, club DJ sets, and night mixers.
- Full **Add, Edit, and Delete** functionality with validation for dates, titles, and budget limits.

### 2. 📊 Executive Dashboard
- **Real-Time KPIs:** Total celebrations, committed budget vs. target budget, confirmed guests, and overall checklist progress percentage.
- **Category Filter Pills:** Instantly filter events by category with real-time count badges.
- **Celebration Cards:** Detailed cards featuring date, countdown badges, venue details, spending bars, guest counts, and quick management links.

### 3. 💵 Budget Planner & Expense Tracking
- **Target Budget Caps:** Track planned vs. actual committed expenditure.
- **Multi-Track Progress Bar:** Visual gradients that dynamically warn when approaching budget limits or turn rose-red if exceeded.
- **Categorized Invoices:** *Venue, Catering, Cake, Photography, Entertainment, Decor, Attire, Transportation, Other*.
- **Payment Status Filter:** Easily filter and toggle between **Paid in Full** and **Pending Invoices**.
- Add, edit, and delete expense items with full currency formatting.

### 4. 👥 Guest Management & RSVP Tracker
- **Roster & Attendance:**
  - 🟢 **Attending** (Tracks guest count plus additional plus-ones automatically)
  - 🟡 **Pending** (Awaiting RSVP confirmation)
  - 🔴 **Declined** (Politely declined)
- **Guest Profiles:** Name, email, phone number, dietary restrictions (*Vegan, Gluten-Free, Halal, etc.*), and special notes.
- **Table & Seating Assignment:** Assign guests to specific tables or lounge groups (*e.g., VIP Table Alpha, Family VIP*).
- **Invitation Status:** Toggle and track sent invitations.

### 5. ✅ Event Planning Checklist
- Categorized milestone tasks (*Venue, Food & Drink, Decor, Invitations, Entertainment, Attire, Logistics, General*).
- Priority indicators: **🔴 High Priority (Urgent)**, **🟡 Medium Priority**, and **⚪ Low Priority**.
- Target due dates with automatic **Overdue** alerts if dates pass.
- Assigned team member / coordinator tracking.
- Interactive completion toggle with celebratory particle animations (`canvas-confetti`).

### 6. 📅 Interactive Monthly Calendar View
- Full monthly calendar grid with month navigation (Previous, Next, Today).
- Celebrations displayed on their exact dates with color-coded category chips and scheduled times.
- Click any calendar date to inspect scheduled events in the **Day Agenda Drawer** or quickly schedule a celebration on that date.

### 7. 💾 Persistent Storage & Backup
- All data is saved persistently on the server in [`data/events.json`](data/events.json).
- **Atomic File Writes:** Guarantees data integrity during concurrent updates.
- **One-Click Export:** Download a complete JSON backup of your database directly from the navigation bar.
- **Demo Data Reset:** Easily reset or reload realistic sample celebrations with full guest, expense, and task rosters at any time.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | Node.js + Express 5 | Lightweight, beginner-friendly REST API |
| **Database** | Persistent JSON Store (`data/events.json`) | Zero-configuration database with atomic writes |
| **Frontend** | HTML5, Modern ES6+, Tailwind CSS | Responsive, zero-build client served by Express |
| **Animation & UX** | Canvas Confetti, Google Fonts | Celebratory feedback and luxury typography |
| **Testing** | Node.js Assert Test Suite | End-to-end integration and CRUD verification |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (included with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/celebration-event-planner.git
cd celebration-event-planner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
*(Or during development: `npm run dev`)*

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🧪 Automated Testing

The project includes an automated integration test suite that tests database persistence, cascading deletions, validation rules, budget math, and RSVP calculations:

```bash
npm test
```

Expected output:
```
🧪 Starting Celebration Event Planner Test Suite...
1. Testing Database Seeding & Stats...
   ✅ Seed data and aggregated stats verified successfully.
2. Testing Events CRUD...
   ✅ Event creation, read, and update verified.
3. Testing Expenses & Budget Tracking...
   ✅ Expense tracking and budget calculations verified.
4. Testing Guest Management & RSVPs...
   ✅ Guest roster, RSVPs, plus-ones and deletions verified.
5. Testing Planning Checklist Milestones...
   ✅ Checklist tasks, toggle completion, and progress calculation verified.
6. Testing Event Deletion & Cascade Clean-up...
   ✅ Event deletion and cascade verified.

🎉 ALL UNIT & INTEGRATION TESTS PASSED WITH 100% SUCCESS!
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Server health check |
| **GET** | `/api/events` | List all events (supports `?category=...&search=...`) |
| **GET** | `/api/events/:id` | Get single event with expenses, guests, tasks & calculations |
| **POST** | `/api/events` | Create new celebration (validated) |
| **PUT** | `/api/events/:id` | Update existing celebration |
| **DELETE** | `/api/events/:id` | Delete celebration (cascades to expenses, guests, tasks) |
| **POST** | `/api/expenses` | Add expense to an event |
| **PUT** | `/api/expenses/:id` | Update expense record |
| **DELETE** | `/api/expenses/:id` | Remove expense record |
| **POST** | `/api/guests` | Add guest to roster |
| **PUT** | `/api/guests/:id` | Update guest details |
| **PATCH** | `/api/guests/:id/rsvp` | Quick RSVP status toggle |
| **DELETE** | `/api/guests/:id` | Remove guest from roster |
| **POST** | `/api/tasks` | Add planning checklist task |
| **PUT** | `/api/tasks/:id` | Update checklist task |
| **PATCH** | `/api/tasks/:id/toggle` | Toggle task completion |
| **DELETE** | `/api/tasks/:id` | Delete checklist task |
| **GET** | `/api/stats` | Aggregated dashboard KPI metrics |
| **POST** | `/api/stats/seed` | Reset demo celebration dataset |
| **GET** | `/api/stats/export` | Download JSON database backup file |

---

## 📁 Project Structure

```
celebration-event-planner/
├── .env.example             # Template for environment configuration
├── .gitignore               # Excludes node_modules, secrets, and temp files
├── data/
│   └── events.json          # Persistent database file (auto-generated)
├── public/                  # Responsive frontend application
│   ├── index.html           # Main SPA HTML structure
│   ├── css/
│   │   └── style.css        # Obsidian theme, block background, and animations
│   └── js/
│       └── app.js           # Client application engine and state management
├── server/
│   ├── database.js          # Persistent database engine with atomic writes
│   ├── index.js             # Express server & static asset host
│   ├── seedData.js          # Realistic pre-populated celebration templates
│   ├── package.json         # Server module configuration
│   ├── middleware/
│   │   └── validation.js    # Request body validators
│   └── routes/
│       ├── events.js        # Event endpoints & sub-resource helpers
│       ├── expenses.js      # Budget & expense management routes
│       ├── guests.js        # Guest roster & RSVP routes
│       ├── tasks.js         # Milestone checklist routes
│       └── stats.js         # Dashboard metrics & backup export
├── src/                     # React components source (for modular development)
├── test/
│   └── server.test.js       # End-to-end integration test suite
├── package.json             # Root scripts and dependencies
└── README.md                # Project documentation
```

---

## 🔒 Security & Best Practices

- `node_modules/` and all environment files (`.env`, `*.env`) are strictly excluded via `.gitignore`.
- Database write operations are atomic to prevent race conditions or file corruption.
- Request payloads are validated with strict error feedback before persistence.
- Cascading deletes ensure no orphaned expenses, guests, or tasks remain in storage.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
