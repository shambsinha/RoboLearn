package com.robolearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.cache.annotation.EnableCaching
public class RoboLearnApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoboLearnApplication.class, args);
    }
}

