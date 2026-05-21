package com.robolearn.api.service;

import com.robolearn.api.dto.request.LoginRequest;
import com.robolearn.api.dto.request.RegisterRequest;
import com.robolearn.api.dto.response.AuthResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.entity.UserRole;
import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.security.CustomUserDetails;
import com.robolearn.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
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
                .onboardingStatus(request.getOnboardingStatus() != null ? request.getOnboardingStatus() : "1st Year")
                .build();

        userRepository.save(user);

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .onboardingStatus(user.getOnboardingStatus())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + request.getIdentifier()));

        var userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .onboardingStatus(user.getOnboardingStatus())
                .xp(user.getXp())
                .solvedProblemIds(user.getSolvedProblemIds())
                .build();
    }
}
