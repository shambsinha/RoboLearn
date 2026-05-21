# 🎓 RoboLearn: AI-Powered Adaptive Learning Platform

RoboLearn is a modern, full-stack educational platform designed to provide developers with a personalized learning experience. By leveraging **Spring AI** and a **Polyglot Persistence** architecture, RoboLearn crafts custom learning paths based on career goals and provides a high-performance environment for mastering code.

---

## 🚀 Tech Stack

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)

---

## 🏗️ Architectural Overview

### 💎 Polyglot Persistence
To demonstrate real-world engineering standards, the system utilizes two distinct database technologies:
*   **PostgreSQL (Neon):** Handles core relational data requiring high integrity, such as User accounts and authentication metadata.
*   **MongoDB (Atlas):** Manages semi-structured content including Courses, Modules, Chapters, and Coding Problems. This allows for flexible schema evolution as curriculum needs grow.

### ⚡ Asynchronous Execution Engine
The **Coding Arena** uses a non-blocking execution model. When a student submits code:
1.  The request is received and a unique `submissionId` is returned immediately.
2.  An asynchronous task is triggered in the backend to compile and run the code against a suite of test cases.
3.  The frontend uses a robust **polling mechanism** to fetch real-time status updates until execution is finalized.

### 🤖 Spring AI Integration
The **AI Tutor** feature integrates with OpenAI via the **Spring AI** framework. It parses natural language learning goals (e.g., "I want to become a Senior DevOps Engineer") and generates a structured, actionable `AiToDoList` JSON object, which is then rendered as an interactive timeline for the student.

---

## ✨ Features

### 👨‍🎓 Student Portal
*   **AI Tutor:** Generate personalized learning paths from natural language input.
*   **Interactive Arena:** Professional-grade coding environment using the **Monaco Editor** (same engine that powers VS Code).
*   **Course Catalog:** Browse and enroll in structured, expert-led curriculums.
*   **Progress Tracking:** Visual dashboard showing active paths and learning stats.

### 🔐 Admin Portal
*   **Content Management:** Full CRUD operations for Courses, Modules, and Chapters.
*   **Problem Forge:** Create coding challenges with custom descriptions, difficulties, and hidden/public test cases.
*   **User Oversight:** Monitor system usage and content distribution.

---

## 🛠️ Local Setup

### Prerequisites
*   JDK 17+
*   Node.js 18+
*   OpenAI API Key

### 1. Backend Setup
1.  Navigate to `robo-learn-backend`.
2.  Create/Update `src/main/resources/application.yml` with your credentials:
    ```yaml
    spring:
      datasource:
        url: jdbc:postgresql://your-neon-db-url
      data:
        mongodb:
          uri: mongodb+srv://your-atlas-url
      ai:
        openai:
          api-key: ${OPENAI_API_KEY}
    ```
3.  Run the application:
    ```bash
    ./gradlew bootRun
    ```

### 2. Frontend Setup
1.  Navigate to `robo-learn-frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 👤 Author
**Aayush Sinha**
*   Full-Stack Engineer specialized in Spring Boot & React.
*   [GitHub](https://github.com/yourusername) | [Portfolio](https://yourportfolio.com)
