# ⚙️ RoboLearn Backend

The RoboLearn backend is a high-performance, scalable API built with the latest Spring ecosystem. It handles complex RBAC, AI-powered content generation, and asynchronous code execution.

---

## 🛠️ Tech Details
*   **Java 25**: Leveraging the latest LTS features.
*   **Spring Boot 4.0.0**: Production-ready microservice foundation.
*   **Spring Security**: Advanced JWT-based authentication with granular permission checks.
*   **Spring Data JPA & MongoDB**: Polyglot persistence for structured and unstructured data.
*   **Spring AI 2.0**: Seamless integration with OpenAI for adaptive learning.
*   **Flyway**: Automated SQL migrations.
*   **Lombok**: Reducing boilerplate code.

---

## 📁 Project Structure
```text
com.robolearn
├── ai          # AI Agent & OpenAI Service
├── auth        # Security, JWT & RBAC Logic
├── core        # Config, Constants & Exception Handling
├── course      # Course & Module Management
├── dashboard   # Analytics & Metrics
├── problem     # Coding Problem Engine
├── submission  # Asynchronous Execution & Result Handling
└── user        # User Profile & Management
```

---

## 🚀 Development Setup

### 1. Environment Variables (`.env`)
The backend uses a `.env` file for secrets. Ensure the following keys are set:
```properties
DATABASE_URL=jdbc:postgresql://your-host/neondb
DATABASE_USERNAME=your-user
DATABASE_PASSWORD=your-pass
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

### 2. Running
```bash
./gradlew bootRun
```
*Note: To force-run the data seeder once, use `--args='--app.seeder.enabled=true'`*

---

## 🔐 RBAC System
The system uses three primary roles:
1.  **ADMIN**: Full system oversight, user management, and deletion rights.
2.  **INSTRUCTOR**: Can create/update courses and problems.
3.  **STUDENT**: Can view content and solve problems in the arena.

Permissions are mapped to these roles in the `V4__seed_default_rbac.sql` migration script.
