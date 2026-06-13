package com.robolearn.core.constant;

public final class AppConstants {
    private AppConstants() {} // Prevent instantiation

    // Roles & Authorities
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_INSTRUCTOR = "INSTRUCTOR";
    public static final String ROLE_STUDENT = "STUDENT";
    
    public static final String AUTH_PREFIX = "ROLE_";
    public static final String DEFAULT_ROLE = ROLE_STUDENT;

    // Security & JWT
    public static final String AUTH_HEADER = "Authorization";
    public static final String AUTH_BEARER = "Bearer ";
    
    // Auth Providers
    public static final String PROVIDER_LOCAL = "LOCAL";
    public static final String PROVIDER_GOOGLE = "GOOGLE";

    // Seeder Defaults
    public static final String ADMIN_DEFAULT_EMAIL = "admin@robolearn.com";
    public static final String ADMIN_DEFAULT_USERNAME = "admin";
    public static final String ADMIN_DEFAULT_PASSWORD = "admin123";
}
