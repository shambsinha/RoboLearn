package com.robolearn.auth.security;

import com.robolearn.user.entity.User;
import com.robolearn.user.repository.UserRepository;
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

            log.info("[Security] Found user: {} with roles: {}", user.getUsername(), user.getRoles());
            
            // Ensure role is not null before returning
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                log.warn("[Security] User {} has NULL or EMPTY roles. Mismatch detected.", user.getUsername());
            }

            return new CustomUserDetails(user);
        } catch (Exception e) {
            log.error("[Security] CRITICAL internal error during user lookup for {}: {}", identifier, e.getMessage(), e);
            throw e;
        }
    }
}
