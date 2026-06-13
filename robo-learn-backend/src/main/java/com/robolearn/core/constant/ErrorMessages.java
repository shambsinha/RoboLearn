package com.robolearn.core.constant;

public final class ErrorMessages {
    private ErrorMessages() {} // Prevent instantiation

    // Auth & Identity
    public static final String INVALID_CREDENTIALS = "Invalid email or password";
    public static final String IDENTITY_NOT_FOUND = "Identity not found: ";
    public static final String USER_NOT_FOUND_EMAIL = "User not found with email: ";
    public static final String EMAIL_NOT_VERIFIED = "Email address not verified. Please verify via OTP first.";
    public static final String EMAIL_ALREADY_EXISTS = "Email already registered";
    public static final String USERNAME_ALREADY_TAKEN = "Username already taken";
    public static final String ACCOUNT_EXISTS = "An account with this email already exists.";
    public static final String NO_ACCOUNT_FOUND = "No account found with this email.";
    
    // Password
    public static final String INVALID_OTP = "Invalid or expired OTP";
    public static final String PASSWORD_RESET_SUCCESS = "Password reset successfully";
    
    // Generic
    public static final String UNEXPECTED_ERROR = "An unexpected error occurred";
    public static final String RESOURCE_NOT_FOUND = "Resource not found";
    public static final String DB_CONSTRAINT_VIOLATION = "Database constraint violation";
    public static final String MALFORMED_JSON = "Malformed JSON request or invalid field values";
    
    // Security Bodies
    public static final String UNAUTHORIZED_BODY = "Authentication token is missing or invalid";
    public static final String FORBIDDEN_BODY = "You are not authorized to access this resource";
    
    // Google Auth
    public static final String GOOGLE_AUTH_FAILED = "Failed to authenticate with Google: ";
    public static final String INVALID_GOOGLE_TOKEN = "Invalid Google ID Token";
}
