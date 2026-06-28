package com.robolearn.auth.controller;

import com.robolearn.auth.dto.request.GoogleAuthRequest;
import com.robolearn.auth.dto.request.LoginRequest;
import com.robolearn.auth.dto.request.RegisterRequest;
import com.robolearn.auth.dto.response.AuthResponse;
import com.robolearn.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Executing register");
        AuthResponse response = authService.register(request);
        return buildSecureResponse(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Executing login");
        AuthResponse response = authService.login(request);
        return buildSecureResponse(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        log.info("Executing googleLogin");
        AuthResponse response = authService.loginWithGoogle(request);
        return buildSecureResponse(response);
    }

    private ResponseEntity<AuthResponse> buildSecureResponse(AuthResponse response) {
        ResponseCookie jwtCookie = ResponseCookie.from("access_token", response.getToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(24 * 60 * 60) // 1 Day
                .sameSite("None")
                .build();

        ResponseCookie sessionCookie = ResponseCookie.from("session_token", response.getSessionToken() != null ? response.getSessionToken() : "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(30L * 24 * 60 * 60) // 30 Days
                .sameSite("None")
                .build();

        // Clear tokens from JSON body for full security
        response.setToken(null);
        response.setSessionToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, sessionCookie.toString())
                .body(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        log.info("Executing sendOtp with email={}", email);
        authService.sendOtp(email);
        return ResponseEntity.ok("OTP sent successfully to " + email);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Boolean> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        log.info("Executing verifyOtp with email={}, otp={}", email, otp);
        boolean isValid = authService.verifyOtp(email, otp);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        log.info("Executing checkUsername with username={}", username);
        return ResponseEntity.ok(authService.checkUsernameAvailability(username));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        log.info("Executing forgotPassword with email={}", email);
        try {
            authService.sendResetPasswordOtp(email);
            return ResponseEntity.ok("Reset OTP sent to " + email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {
        log.info("Executing resetPassword with email={}, otp={}, newPassword={}", email, otp, newPassword);
        try {
            authService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
