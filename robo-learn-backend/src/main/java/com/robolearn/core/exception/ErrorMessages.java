package com.robolearn.core.exception;

public final class ErrorMessages {

    private ErrorMessages() {
        // Prevent instantiation
    }

    // --- GENERIC ERRORS ---
    public static final String INTERNAL_SERVER_ERROR = "An unexpected error occurred. Please try again later.";
    public static final String RESOURCE_NOT_FOUND = "The requested resource could not be found.";
    public static final String UNAUTHORIZED_ACCESS = "You are not authorized to perform this action.";

    // --- AUTHENTICATION & AUTHORIZATION ERRORS ---
    public static final String AUTH_BAD_CREDENTIALS = "Invalid username or password.";
    public static final String AUTH_USER_NOT_FOUND = "User not found with the provided credentials.";
    public static final String AUTH_EMAIL_EXISTS = "An account with this email already exists.";
    public static final String AUTH_USERNAME_EXISTS = "An account with this username already exists.";
    
    // --- COURSE ERRORS ---
    public static final String COURSE_NOT_FOUND = "Course not found.";
    public static final String COURSE_NOT_FOUND_WITH_ID = "Course not found with ID: %s";
    public static final String COURSE_ALREADY_EXISTS = "A course with this title already exists.";
    public static final String COURSE_MODIFICATION_DENIED = "You do not have permission to modify this course.";
    public static final String MODULE_NOT_FOUND = "Module not found.";
    public static final String CURRICULUM_ITEM_NOT_FOUND = "Curriculum item not found.";

    // --- PROBLEM & CONTEST ERRORS ---
    public static final String PROBLEM_NOT_FOUND = "Coding problem not found.";
    public static final String PROBLEM_MODIFICATION_DENIED_COURSE = "You do not have permission to modify this problem tied to course: %s";
    public static final String PROBLEM_MODIFICATION_DENIED_STANDALONE = "You do not have permission to modify this standalone problem.";
    public static final String PROBLEM_ADD_DENIED = "You do not have permission to add a problem to this course.";
    public static final String CONTEST_NOT_FOUND = "Contest not found.";

    // --- USER & DASHBOARD ERRORS ---
    public static final String USER_NOT_FOUND = "User not found.";
    public static final String USER_NOT_FOUND_WITH_EMAIL = "User not found with email: %s";
}
