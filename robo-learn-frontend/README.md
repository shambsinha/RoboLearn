# 🎨 RoboLearn Frontend

The RoboLearn frontend is a modern, responsive single-page application (SPA) built with **React** and **Tailwind CSS**. It provides a sleek, dark-themed interface for students and a comprehensive dashboard for administrators.

---

## 🛠️ Tech Stack
*   **React 18**: Component-based UI logic.
*   **Vite**: Lightning-fast build tool.
*   **Zustand**: Lightweight state management for Auth and UI.
*   **Tailwind CSS**: Utility-first styling with a custom "Stark" design system.
*   **Monaco Editor**: High-performance code editor for the Arena.
*   **Three.js**: 3D background effects for an immersive experience.
*   **Axios**: Secure API communication with interceptors.

---

## 🚀 Development Setup

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the `robo-learn-frontend` folder:
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Execution
```bash
npm run dev
```

---

## ✨ Design System
The frontend uses a custom design system centered around "Glassmorphism" and "Stark" aesthetics:
*   **Colors**: Deep slates, neon accents, and high-contrast typography.
*   **Components**: Reusable cards, buttons, and layouts found in `src/components`.

---

## 📁 Key Directories
*   `src/api`: Centralized API service layer.
*   `src/components`: UI components (Layouts, Three.js backgrounds).
*   `src/pages`: Feature-specific screens (Admin, Student, Public).
*   `src/store`: Global state management.
*   `src/utils`: Helper functions and formatters.
