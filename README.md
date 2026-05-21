<div align="center">

# 📡 IdeaVault API Server

### *Core Backend Engine for Startup Idea‑Sharing Ecosystem*

[![Live API](https://img.shields.io/badge/🚀_Live_API-Deployed-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://assignment-9-server-side.vercel.app)
[![Frontend Repo](https://img.shields.io/badge/💻_Frontend_Repo-View_on_GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Galib-272/Assignment-9-client-side.git)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

---

### ⚙️ Secure RESTful API Layer

> *Data persistence · Database operations · Cryptographic session verification · Social identity handshakes*

</div>

---

## ⚡ Backend Architecture Highlights

| Feature | Description |
|---------|-------------|
| 🔐 **Custom Stateful JWT Middleware** | Restricts private operations (adding ideas, mutating comments) using high‑security JSON Web Token extraction routines. |
| 🌐 **CORS Security** | Strict domain whitelisting — only approved frontend production domains can connect. Blocks unauthorized API hits. |
| ⚡ **Regex Query Aggregations** | Advanced indexing + case‑insensitive `$regex` matching for lightning‑fast title searches and optimized pipeline queries. |
| 🔄 **Safe Mutation Operations** | Ownership verification before any update or delete — protecting community data from malicious requests. |

---

## 🏗️ Core Technology Toolkit

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (native aggregation + structured drivers) |
| **Auth Protocol** | JSON Web Tokens (jsonwebtoken) |
| **Social Auth** | Better Auth + Google OAuth (Google Cloud Console) |

---

## 📋 Comprehensive API Endpoint Mapping

> All endpoints expect `application/json` request bodies and return consistent diagnostic responses.

### 🔓 Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — API status heartbeat |
| `GET` | `/ideas` | Full platform directory (supports title search + category filters) |
| `GET` | `/ideas/trending` | Top 6 shared cards (optimized `$limit` sorting) |
| `GET` | `/ideas/details/:id` | Complete deep document logs for a specific idea |

### 🔒 Secured Endpoints (Requires Valid JWT Bearer Header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ideas/add` | Create a new startup record (title, problem, solution, budget, category) |
| `GET` | `/my-ideas/:email` | Pull all ideas belonging to authenticated email |
| `PUT` | `/ideas/update/:id` | Modify existing idea fields via modal |
| `DELETE` | `/ideas/delete/:id` | Permanently delete an idea (with security verification) |
| `GET` | `/my-interactions/:email` | Aggregate user's historical comment activity |

### 💬 Comment Engine Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/comments/add` | Append structured review (text, timestamp, user object) to an idea |
| `PUT` | `/comments/edit/:id` | Rewrite user's own comment |
| `DELETE` | `/comments/delete/:id` | Safely remove specific comment from database |

---

## 📂 Source Code Control

| Metric | Status |
|--------|--------|
| **Production Commits** | ✅ 8+ notable backend-specific commits (endpoints, DB handlers, auth filters) |
| **Reliability** | ✅ Zero console errors on startup — handles live environment requests cleanly across all routes |

---

## 📄 Licensing & Permissions

Copyright © 2026 **IdeaVault API**.  
Developed by *Syed Ahmad Galib*

All project schemas and architecture configurations remain protected properties under educational distribution guidelines.

---

<div align="center">

**⚡ Built with Node.js, Express & MongoDB — secure by design.**

⭐ *Star this repo if you trust the backend!*

</div>