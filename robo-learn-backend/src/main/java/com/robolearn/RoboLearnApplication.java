package com.robolearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.cache.annotation.EnableCaching
public class RoboLearnApplication {

    public static void main(String[] args) {
        // Automatically check the backend subdirectory if run from the workspace root
        System.setProperty("spring.config.additional-location", "optional:file:./config/,optional:file:./robo-learn-backend/config/");
        SpringApplication.run(RoboLearnApplication.class, args);
    }
}

