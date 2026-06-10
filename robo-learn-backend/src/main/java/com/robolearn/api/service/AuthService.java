package com.robolearn.api.service;

import com.robolearn.api.dto.request.GoogleAuthRequest;
import com.robolearn.api.dto.request.LoginRequest;
import com.robolearn.api.dto.request.RegisterRequest;
import com.robolearn.api.dto.response.AuthResponse;
import com.robolearn.api.entity.AuthProvider;
import com.robolearn.api.entity.User;
import com.robolearn.api.entity.UserRole;
import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.security.CustomUserDetails;
import com.robolearn.api.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${google.client-id:}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        // Check for Email Verification
        if (!emailService.isEmailVerified(request.getEmail())) {
            throw new IllegalArgumentException("Email address not verified. Please verify via OTP first.");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : UserRole.STUDENT)
                .authProvider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("[Auth] Initializing login protocol for: {}", request.getIdentifier());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier(),
                            request.getPassword()
                    )
            );
            log.info("[Auth] Credentials verified for: {}", request.getIdentifier());
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("[Auth] Authentication failed for {}: {}", request.getIdentifier(), e.getMessage());
            throw e;
        }

        User user = userRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new UsernameNotFoundException("Identity not found: " + request.getIdentifier()));

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        log.info("[Auth] Session generated for user: {}", user.getUsername());
        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }

    public void sendOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        emailService.sendOtp(email);
    }

    public boolean checkUsernameAvailability(String username) {
        return !userRepository.existsByUsername(username);
    }

    public boolean verifyOtp(String email, String otp) {
        return emailService.verifyOtp(email, otp);
    }

    public void sendOtpForAuthenticatedUser(String email) {
        emailService.sendOtp(email);
    }

    public void sendResetPasswordOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("No account found with this email.");
        }
        emailService.sendOtp(email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (!emailService.verifyOtp(email, otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating new user via Google Sign-In: {}", email);
                User newUser = User.builder()
                        .email(email)
                        .username(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4))
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                        .role(UserRole.STUDENT)
                        .authProvider(AuthProvider.GOOGLE)
                        .profilePictureUrl(picture)
                        .build();
                return userRepository.save(newUser);
            });

            var userDetails = new CustomUserDetails(user);
            String jwtToken = jwtService.generateToken(userDetails);

            return AuthResponse.builder()
                    .token(jwtToken)
                    .id(user.getId())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .role(user.getRole())
                    .authProvider(user.getAuthProvider())
                    .xp(user.getXp())
                    .solvedProblemIds(user.getSolvedProblemIds())
                    .build();

        } catch (Exception e) {
            log.error("Google Auth Error", e);
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage());
        }
    }
}
