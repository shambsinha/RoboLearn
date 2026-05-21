package com.robolearn.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableJpaAuditing
@EnableMongoAuditing
@EnableJpaRepositories(
    basePackages = "com.robolearn.api.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JpaRepository.class)
)
@EnableMongoRepositories(
    basePackages = "com.robolearn.api.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = MongoRepository.class)
)
public class PersistenceConfig {
}
