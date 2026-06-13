package com.robolearn.auth.service;

import com.robolearn.core.service.EmailService;
import com.robolearn.auth.dto.request.GoogleAuthRequest;
import com.robolearn.auth.dto.request.LoginRequest;
import com.robolearn.auth.dto.request.RegisterRequest;
import com.robolearn.auth.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void sendOtp(String email);

    boolean checkUsernameAvailability(String username);

    boolean verifyOtp(String email, String otp);

    void sendOtpForAuthenticatedUser(String email);

    void sendResetPasswordOtp(String email);

    void resetPassword(String email, String otp, String newPassword);

    AuthResponse loginWithGoogle(GoogleAuthRequest request);
}
