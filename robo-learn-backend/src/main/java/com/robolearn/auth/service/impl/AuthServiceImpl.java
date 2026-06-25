package com.robolearn.auth.service.impl;

import com.robolearn.core.service.EmailService;
import com.robolearn.core.constant.AppConstants;
import com.robolearn.core.constant.ErrorMessages;

import com.robolearn.auth.dto.request.GoogleAuthRequest;
import com.robolearn.auth.dto.request.LoginRequest;
import com.robolearn.auth.dto.request.RegisterRequest;
import com.robolearn.auth.dto.response.AuthResponse;
import com.robolearn.auth.entity.AuthProvider;
import com.robolearn.user.entity.User;
import com.robolearn.user.entity.Role;
import com.robolearn.user.repository.UserRepository;
import com.robolearn.user.repository.RoleRepository;
import com.robolearn.auth.security.CustomUserDetails;
import com.robolearn.auth.security.JwtService;
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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import com.robolearn.auth.service.RedisSessionService;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements com.robolearn.auth.service.AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RedisSessionService redisSessionService;

    @Value("${google.client-id:}")
    private String googleClientId;

    private String getPrimaryRole(User user) {
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            return user.getRoles().iterator().next().getName();
        }
        return AppConstants.DEFAULT_ROLE;
    }

    public AuthResponse register(RegisterRequest request) {
        // Check for Email Verification
        if (!emailService.isEmailVerified(request.getEmail())) {
            throw new IllegalArgumentException(ErrorMessages.EMAIL_NOT_VERIFIED);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(ErrorMessages.EMAIL_ALREADY_EXISTS);
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException(ErrorMessages.USERNAME_ALREADY_TAKEN);
        }

        String roleName = request.getRole() != null ? request.getRole() : AppConstants.DEFAULT_ROLE;
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .authProvider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        String sessionToken = generateRedisSession(user.getId().toString());

        return AuthResponse.builder()
                .token(jwtToken)
                .sessionToken(sessionToken)
                .id(user.getId())
                .username(user.getUsername())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(getPrimaryRole(user))
                .authProvider(user.getAuthProvider())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }

    private String generateRedisSession(String userId) {
        String ipAddress = "UNKNOWN";
        String device = "UNKNOWN";
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = request.getRemoteAddr();
                device = request.getHeader("User-Agent");
            }
        } catch (Exception e) {
            log.warn("Could not extract request attributes for session: {}", e.getMessage());
        }
        return redisSessionService.createSession(userId, ipAddress, device);
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
                .orElseThrow(() -> new UsernameNotFoundException(ErrorMessages.IDENTITY_NOT_FOUND + request.getIdentifier()));

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);
        
        String sessionToken = generateRedisSession(user.getId().toString());

        log.info("[Auth] Session generated for user: {}", user.getUsername());
        return AuthResponse.builder()
                .token(jwtToken)
                .sessionToken(sessionToken)
                .id(user.getId())
                .username(user.getUsername())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(getPrimaryRole(user))
                .authProvider(user.getAuthProvider())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }

    public void sendOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(ErrorMessages.ACCOUNT_EXISTS);
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
            throw new IllegalArgumentException(ErrorMessages.NO_ACCOUNT_FOUND);
        }
        emailService.sendOtp(email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (!emailService.verifyOtp(email, otp)) {
            throw new IllegalArgumentException(ErrorMessages.INVALID_OTP);
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
                throw new IllegalArgumentException(ErrorMessages.INVALID_GOOGLE_TOKEN);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating new user via Google Sign-In: {}", email);
                
                Role role = roleRepository.findByName(AppConstants.ROLE_STUDENT)
                        .orElseThrow(() -> new RuntimeException("Error: Role STUDENT is not found."));
                Set<Role> roles = new HashSet<>();
                roles.add(role);

                User newUser = User.builder()
                        .email(email)
                        .username(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4))
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                        .roles(roles)
                        .authProvider(AuthProvider.GOOGLE)
                        .profilePictureUrl(picture)
                        .build();
                return userRepository.save(newUser);
            });

            var userDetails = new CustomUserDetails(user);
            String jwtToken = jwtService.generateToken(userDetails);

            String sessionToken = generateRedisSession(user.getId().toString());

            return AuthResponse.builder()
                    .token(jwtToken)
                    .sessionToken(sessionToken)
                    .id(user.getId())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .role(getPrimaryRole(user))
                    .authProvider(user.getAuthProvider())
                    .xp(user.getXp())
                    .solvedProblemIds(user.getSolvedProblemIds())
                    .build();

        } catch (Exception e) {
            log.error("Google Auth Error", e);
            throw new RuntimeException(ErrorMessages.GOOGLE_AUTH_FAILED + e.getMessage());
        }
    }
}
