# RoboLearn API Documentation

This document lists all available API endpoints, their methods, request bodies, and expected responses.

---

## 1. Authentication (`/api/auth`)

### Register User
*   **URL:** `/api/auth/register`
*   **Method:** `POST`
*   **Body:** 
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "password123",
      "role": "STUDENT" // Optional, defaults to STUDENT
    }
    ```
*   **Response:** `AuthResponse` object containing JWT token and user details.
*   **Notes:** Requires email verification via OTP first.

### Login User
*   **URL:** `/api/auth/login`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "identifierType": "EMAIL", // or "USERNAME"
      "identifier": "john@example.com", // username or email
      "password": "password123"
    }
    ```
*   **Response:** `AuthResponse` object containing JWT token and Redis `sessionToken`.

### Google Login
*   **URL:** `/api/auth/google`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "idToken": "google-id-token"
    }
    ```
*   **Response:** `AuthResponse` object.

### Send OTP
*   **URL:** `/api/auth/send-otp`
*   **Method:** `POST`
*   **Query Params:** `email=user@example.com`
*   **Response:** `"OTP sent successfully to user@example.com"`

### Verify OTP
*   **URL:** `/api/auth/verify-otp`
*   **Method:** `POST`
*   **Query Params:** `email=user@example.com`, `otp=123456`
*   **Response:** `true` (boolean)

### Check Username Availability
*   **URL:** `/api/auth/check-username`
*   **Method:** `GET`
*   **Query Params:** `username=johndoe`
*   **Response:** `true` (if available)

### Forgot Password (Send OTP)
*   **URL:** `/api/auth/forgot-password`
*   **Method:** `POST`
*   **Query Params:** `email=user@example.com`
*   **Response:** `"Reset OTP sent to user@example.com"`

### Reset Password
*   **URL:** `/api/auth/reset-password`
*   **Method:** `POST`
*   **Query Params:** `email=user@example.com`, `otp=123456`, `newPassword=newpassword123`
*   **Response:** `"Password reset successfully"`

---

## 2. Student AI (`/api/student/ai`)
*Required Authority: `ROLE_STUDENT`*

### Generate Learning Path
*   **URL:** `/api/student/ai/path`
*   **Method:** `POST`
*   **Body:** `AiPathRequest` (e.g., `{"topic": "Java Streams"}`)
*   **Response:** `AiToDoList` object.

### Get My Learning Paths
*   **URL:** `/api/student/ai/paths`
*   **Method:** `GET`
*   **Response:** List of `AiToDoList` objects.

### AI Chat / Tutor
*   **URL:** `/api/student/ai/chat`
*   **Method:** `POST`
*   **Body:** `{"message": "Explain recursion"}`
*   **Response:** `{"response": "Recursion is..."}`

---

## 3. Student Courses (`/api/student/courses`)
*Required Authority: `COURSE_READ`*

### Get All Available Courses
*   **URL:** `/api/student/courses`
*   **Method:** `GET`
*   **Response:** List of `CourseResponse` objects.

### Get Enrolled Courses
*   **URL:** `/api/student/courses/enrolled`
*   **Method:** `GET`
*   **Response:** List of `CourseResponse` objects.

### Get Course Details
*   **URL:** `/api/student/courses/{courseId}`
*   **Method:** `GET`
*   **Response:** `CourseResponse` object.

### Get Course Problems
*   **URL:** `/api/student/courses/{courseId}/problems`
*   **Method:** `GET`
*   **Response:** List of `CodingProblem` objects.

### Enroll in Course
*   **URL:** `/api/student/courses/{courseId}/enroll`
*   **Method:** `POST`
*   **Response:** `200 OK`

### Get Course Progress
*   **URL:** `/api/student/courses/{courseId}/progress`
*   **Method:** `GET`
*   **Response:** Set of completed item IDs.

### Mark Curriculum Item Complete
*   **URL:** `/api/student/courses/{courseId}/modules/{moduleId}/items/{itemOrder}/complete`
*   **Method:** `POST`
*   **Query Params:** `type=VIDEO` (or `THEORY`, `PROBLEM`)
*   **Response:** `200 OK`

---

## 4. Student Arena (`/api/student/arena`)
*Required Authority: `PROBLEM_READ`*

### List Problems
*   **URL:** `/api/student/arena/problems`
*   **Method:** `GET`
*   **Response:** List of `ProblemResponse` (Test cases excluded).

### Get Problem Details
*   **URL:** `/api/student/arena/problems/{id}`
*   **Method:** `GET`
*   **Response:** `ProblemResponse` (Includes public test cases).

### Submit Code
*   **URL:** `/api/student/arena/submit`
*   **Method:** `POST`
*   **Body:** `CodeSubmissionRequest`
*   **Response:** `submissionId` (String)

### Get Submission Status
*   **URL:** `/api/student/arena/submissions/{submissionId}`
*   **Method:** `GET`
*   **Response:** `SubmissionResponse` object.

### Get My Submissions for Problem
*   **URL:** `/api/student/arena/problems/{problemId}/submissions`
*   **Method:** `GET`
*   **Response:** List of `SubmissionResponse` objects.

---

## 5. User Profile (`/api/users`)

### Get Current Profile
*   **URL:** `/api/users/profile`
*   **Method:** `GET`
*   **Response:** `UserProfileResponse` object.

### Update Profile
*   **URL:** `/api/users/profile`
*   **Method:** `PUT`
*   **Body:** `UpdateProfileRequest` (username, bio, githubUrl, etc.)
*   **Response:** `UserProfileResponse` object.

### Change Password
*   **URL:** `/api/users/profile/change-password`
*   **Method:** `POST`
*   **Body:** `{"currentPassword": "...", "newPassword": "..."}`
*   **Response:** `200 OK`

### Request Set Password OTP (for Google users)
*   **URL:** `/api/users/profile/request-set-password-otp`
*   **Method:** `POST`
*   **Response:** `200 OK`

### Set Initial Password
*   **URL:** `/api/users/profile/set-password`
*   **Method:** `POST`
*   **Body:** `SetPasswordRequest` (otp, newPassword)
*   **Response:** `200 OK`

### Upload Profile Image
*   **URL:** `/api/users/profile/image`
*   **Method:** `PUT`
*   **Multipart Param:** `image` (file)
*   **Response:** `UserProfileResponse` object.

### Delete Profile Image
*   **URL:** `/api/users/profile/image`
*   **Method:** `DELETE`
*   **Response:** `UserProfileResponse` object.

---

## 6. Admin Dashboard (`/api/admin/dashboard`)
*Required Authority: `ROLE_ADMIN`*

### Get Admin Metrics
*   **URL:** `/api/admin/dashboard/metrics`
*   **Method:** `GET`
*   **Response:** `AdminDashboardResponse` (Total students, active courses, etc.)

---

## 7. Student Dashboard (`/api/student/dashboard`)
*Required Authority: `ROLE_STUDENT`*

### Get Student Metrics
*   **URL:** `/api/student/dashboard/metrics`
*   **Method:** `GET`
*   **Response:** `StudentDashboardResponse` (XP, daily streak, recent activity)

---

## 8. Admin Courses (`/api/admin/courses`)
*Required Authority: `COURSE_CREATE` or `COURSE_UPDATE`*

### Create Course
*   **URL:** `/api/admin/courses`
*   **Method:** `POST`
*   **Body:** `CourseRequest`
*   **Response:** `CourseResponse`

### Update Course
*   **URL:** `/api/admin/courses/{courseId}`
*   **Method:** `PUT`
*   **Body:** `CourseRequest`
*   **Response:** `CourseResponse`

### Add Module to Course
*   **URL:** `/api/admin/courses/{courseId}/modules`
*   **Method:** `POST`
*   **Body:** `ModuleRequest`
*   **Response:** `ModuleResponse`

### Delete Module
*   **URL:** `/api/admin/courses/modules/{moduleId}`
*   **Method:** `DELETE`
*   **Response:** `204 No Content`

### Update Module Items
*   **URL:** `/api/admin/courses/modules/{moduleId}/items`
*   **Method:** `PUT`
*   **Body:** List of `CurriculumItemRequest`
*   **Response:** `ModuleResponse`

### Add Problem to Course
*   **URL:** `/api/admin/courses/{courseId}/problems/{problemId}`
*   **Method:** `POST`
*   **Response:** `200 OK`

### Remove Problem from Course
*   **URL:** `/api/admin/courses/{courseId}/problems/{problemId}`
*   **Method:** `DELETE`
*   **Response:** `200 OK`

### Delete Course
*   **URL:** `/api/admin/courses/{courseId}`
*   **Method:** `DELETE`
*   **Response:** `204 No Content`

### Upload Content Image
*   **URL:** `/api/admin/courses/upload-image`
*   **Method:** `POST`
*   **Multipart Param:** `file`
*   **Response:** `{"url": "..."}`

---

## 9. Admin Problems (`/api/admin/problems`)
*Required Authority: `PROBLEM_CREATE` or `PROBLEM_UPDATE`*

### Create Problem
*   **URL:** `/api/admin/problems`
*   **Method:** `POST`
*   **Body:** `ProblemRequest`
*   **Response:** `ProblemResponse`

### Add Test Case
*   **URL:** `/api/admin/problems/{problemId}/testcases`
*   **Method:** `POST`
*   **Body:** `TestCaseRequest`
*   **Response:** `TestCaseResponse`

### Update Problem
*   **URL:** `/api/admin/problems/{problemId}`
*   **Method:** `PUT`
*   **Body:** `ProblemRequest`
*   **Response:** `ProblemResponse`

### Delete Problem
*   **URL:** `/api/admin/problems/{problemId}`
*   **Method:** `DELETE`
*   **Response:** `204 No Content`

---

## 10. Admin Users (`/api/admin/users`)
*No explicit authority check found in controller, but usually tied to `USER_MANAGE` via SecurityConfig*

### List All Users
*   **URL:** `/api/admin/users`
*   **Method:** `GET`
*   **Response:** List of `AdminUserResponse` objects.

### Get User Profile
*   **URL:** `/api/admin/users/{userId}`
*   **Method:** `GET`
*   **Response:** `UserProfileResponse` object.

### Toggle User Suspension
*   **URL:** `/api/admin/users/{userId}/suspend`
*   **Method:** `PUT`
*   **Response:** `AdminUserResponse` object.

---

## 11. Public Health Check (`/api/public/health`)

### Check System Status
*   **URL:** `/api/public/health`
*   **Method:** `GET`
*   **Response:** `{"status": "UP", "database": "CONNECTED", ...}`
