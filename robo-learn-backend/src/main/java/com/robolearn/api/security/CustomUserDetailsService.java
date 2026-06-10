package com.robolearn.api.security;

import com.robolearn.api.entity.User;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        try {
            log.info("[Security] Attempting to load user: {}", identifier);
            
            // Search by both username and email to be ultra-flexible
            User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                    .orElseThrow(() -> {
                        log.warn("[Security] User not found: {}", identifier);
                        return new UsernameNotFoundException("User not found with identifier: " + identifier);
                    });

            log.info("[Security] Found user: {} with role: {}", user.getUsername(), user.getRole());
            
            // Ensure role is not null before returning
            if (user.getRole() == null) {
                log.warn("[Security] User {} has NULL role. Mismatch detected.", user.getUsername());
            }

            return new CustomUserDetails(user);
        } catch (Exception e) {
            log.error("[Security] CRITICAL internal error during user lookup for {}: {}", identifier, e.getMessage(), e);
            throw e;
        }
    }
}
