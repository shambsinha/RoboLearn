package com.robolearn.core.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.listener.auto-startup", havingValue = "true")
public class KafkaConfig {

    public static final String SUBMISSIONS_TOPIC = "code-submissions";

    @Bean
    public NewTopic submissionsTopic() {
        return TopicBuilder.name(SUBMISSIONS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}