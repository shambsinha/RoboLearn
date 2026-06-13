package com.robolearn.core.constant;

public final class SecurityMessages {
    private SecurityMessages() {} // Prevent instantiation

    public static final String UNAUTHORIZED_TITLE = "Unauthorized";
    public static final String UNAUTHORIZED_BODY = "Authentication token is missing or invalid";
    public static final String UNAUTHORIZED_JSON = "{\"error\": \"Unauthorized\", \"message\": \"Authentication token is missing or invalid\"}";

    public static final String FORBIDDEN_TITLE = "Forbidden";
    public static final String FORBIDDEN_BODY = "You are not authorized to access this resource";
    public static final String FORBIDDEN_JSON = "{\"error\": \"Forbidden\", \"message\": \"You are not authorized to access this resource\"}";
}
