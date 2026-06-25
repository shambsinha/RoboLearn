package com.robolearn.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSessionService {

    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user:sessions:";
    private static final int MAX_ACTIVE_SESSIONS = 5;
    private static final long SESSION_TTL_DAYS = 30;

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Creates a new session for the user, enforcing the concurrent session limit.
     *
     * @param userId        The ID of the user
     * @param ipAddress     The IP address from which the login attempt was made
     * @param deviceDetails The device details (e.g., User-Agent)
     * @return The generated session token
     */
    public String createSession(String userId, String ipAddress, String deviceDetails) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        String token = UUID.randomUUID().toString();
        String sessionKey = SESSION_KEY_PREFIX + token;
        String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId;
        long currentTimestamp = Instant.now().toEpochMilli();

        try {
            // 1. Create Session Metadata (Redis Hash)
            Map<String, String> sessionMetadata = new HashMap<>();
            sessionMetadata.put("userId", userId);
            sessionMetadata.put("ipAddress", ipAddress != null ? ipAddress : "UNKNOWN");
            sessionMetadata.put("device", deviceDetails != null ? deviceDetails : "UNKNOWN");
            sessionMetadata.put("createdAt", String.valueOf(currentTimestamp));

            redisTemplate.opsForHash().putAll(sessionKey, sessionMetadata);
            redisTemplate.expire(sessionKey, SESSION_TTL_DAYS, TimeUnit.DAYS);

            // 2. Add to User Session Index (Redis ZSET)
            redisTemplate.opsForZSet().add(userSessionsKey, token, currentTimestamp);

            // 3. Enforce the 5-session limit
            enforceSessionLimit(userSessionsKey, userId);

            log.info("Successfully created session {} for user {}", token, userId);
            return token;
        } catch (Exception e) {
            log.error("Failed to create Redis session for user: {}", userId, e);
            throw new RuntimeException("Could not create session", e);
        }
    }

    /**
     * Invalidates a specific session.
     *
     * @param userId The ID of the user
     * @param token  The session token to invalidate
     */
    public void invalidateSession(String userId, String token) {
        if (userId == null || token == null) {
            log.warn("Attempted to invalidate session with null userId or token");
            return;
        }

        String sessionKey = SESSION_KEY_PREFIX + token;
        String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId;

        try {
            redisTemplate.delete(sessionKey);
            redisTemplate.opsForZSet().remove(userSessionsKey, token);
            log.info("Invalidated session {} for user {}", token, userId);
        } catch (Exception e) {
            log.error("Failed to invalidate session {} for user {}", token, userId, e);
            throw new RuntimeException("Could not invalidate session", e);
        }
    }

    /**
     * Checks the size of the user's ZSET and removes the oldest sessions if the limit is exceeded.
     *
     * @param userSessionsKey The key for the user's ZSET
     * @param userId          The ID of the user
     */
    private void enforceSessionLimit(String userSessionsKey, String userId) {
        Long sessionCount = redisTemplate.opsForZSet().zCard(userSessionsKey);

        if (sessionCount != null && sessionCount > MAX_ACTIVE_SESSIONS) {
            long excessSessions = sessionCount - MAX_ACTIVE_SESSIONS;

            // Fetch the oldest tokens (lowest rank/score)
            Set<String> oldestTokens = redisTemplate.opsForZSet().range(userSessionsKey, 0, excessSessions - 1);

            if (oldestTokens != null && !oldestTokens.isEmpty()) {
                for (String oldToken : oldestTokens) {
                    // Delete the corresponding Hash key
                    redisTemplate.delete(SESSION_KEY_PREFIX + oldToken);
                    
                    // Remove from the ZSET
                    redisTemplate.opsForZSet().remove(userSessionsKey, oldToken);
                    
                    log.info("Evicted old session {} for user {} due to concurrent session limits", oldToken, userId);
                }
            }
        }
    }
}
