# 🎓 RoboLearn: AI-Powered Adaptive Learning Platform

RoboLearn is a modern, full-stack educational platform designed to provide developers with a personalized learning experience. By leveraging **Spring AI 2.0** and a **Polyglot Persistence** architecture, RoboLearn crafts custom learning paths based on career goals and provides a high-performance environment for mastering code.

---

## 🚀 Tech Stack

![Java](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.0-6DB33F?style=for-the-badge&logo=spring-boot)
![Spring AI](https://img.shields.io/badge/Spring_AI-2.0.0--RC1-6DB33F?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0000?style=for-the-badge&logo=flyway)

---

## 🏗️ Architectural Overview

### 💎 Advanced RBAC & Flyway
The platform implements a production-grade **Role-Based Access Control (RBAC)** system.
*   **Database Migrations:** Managed by **Flyway** for deterministic schema evolution.
*   **Dynamic Permissions:** Fine-grained access control using `Permission` entities and `@PreAuthorize` authority checks.
*   **Centralized Constants:** Centralized registry for all system messages and error codes to ensure consistency.

### 💎 Polyglot Persistence
*   **PostgreSQL (Neon):** Handles relational data (Users, Roles, Permissions).
*   **MongoDB (Atlas):** Manages semi-structured content (Courses, Modules, Problems).

### 🤖 Spring AI & Java 25
*   Uses **Java 25** features and **Spring Boot 4.0** for cutting-edge performance.
*   **AI Tutor:** Integrates with OpenAI via Spring AI 2.0 to generate dynamic learning paths.

---

## 📂 Documentation

*   [**Backend Documentation**](./robo-learn-backend/README.md) - Setup, Dependencies, and Architecture.
*   [**Frontend Documentation**](./robo-learn-frontend/README.md) - UI Components, State Management, and Styling.
*   [**API Guide**](./API_README.md) - Complete list of endpoints, request bodies, and responses.

---

## 🛠️ Quick Start

### Prerequisites
*   JDK 25
*   Node.js 18+
*   Docker (Optional for local DBs)

### Execution
1.  **Backend:**
    ```bash
    cd robo-learn-backend
    ./gradlew bootRun
    ```
2.  **Frontend:**
    ```bash
    cd robo-learn-frontend
    npm install
    npm run dev
    ```

---

## 👤 Author
**Shamb**
*   Full-Stack Engineer specialized in High-Performance Backend Systems.
