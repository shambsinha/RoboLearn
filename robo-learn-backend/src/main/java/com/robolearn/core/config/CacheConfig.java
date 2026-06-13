package com.robolearn.core.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

@Configuration
@Slf4j
public class CacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            log.info("[Performance] Probing Redis connection for caching...");
            // Attempt a lightweight ping to verify Redis is actually reachable
            connectionFactory.getConnection().ping();
            
            log.info("[Performance] Redis detected. Initializing Production Caching Layer.");

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(), 
                ObjectMapper.DefaultTyping.NON_FINAL, 
                JsonTypeInfo.As.PROPERTY
            );

            GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofHours(1))
                    .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                    .disableCachingNullValues();

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .withCacheConfiguration("courses", config.entryTtl(Duration.ofHours(2)))
                    .withCacheConfiguration("courseDetails", config.entryTtl(Duration.ofHours(1)))
                    .withCacheConfiguration("problems", config.entryTtl(Duration.ofHours(2)))
                    .withCacheConfiguration("problemDetails", config.entryTtl(Duration.ofHours(1)))
                    .withCacheConfiguration("studentDashboard", config.entryTtl(Duration.ofMinutes(15)))
                    .withCacheConfiguration("adminDashboard", config.entryTtl(Duration.ofMinutes(30)))
                    .build();
        } catch (Exception e) {
            log.warn("[Performance] Redis unreachable ({}). Falling back to In-Memory Local Cache.", e.getMessage());
            return new ConcurrentMapCacheManager(
                "courses", "courseDetails", "problems", "problemDetails", 
                "studentDashboard", "adminDashboard", "enrolledCourses", 
                "courseProgress", "submissionHistory", "aiPaths"
            );
        }
    }
}
