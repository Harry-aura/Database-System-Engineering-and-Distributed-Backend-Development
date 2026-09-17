# CivicNest — Apartment Society Management & Distributed Database ERP

An enterprise-grade, full-stack MERN (MongoDB, Express, React, Node.js) application engineered to manage high-concurrency residential society operations, featuring role-based access control (RBAC), atomic database indexing for amenity bookings, and digital maintenance ledgers.

---

## 🏛️ System Architecture

- **Frontend (Client Tier)**: React, Vite, TailwindCSS (`client/`)
- **Backend (Server Tier)**: Node.js, Express REST API controllers (`server/`)
- **Database (Data Tier)**: MongoDB (`society_db`) with compound unique indexes for zero-collision concurrency.

---

## 🚀 Local Execution

### 1. Start the Backend Server
```bash
cd server
npm install
npm start