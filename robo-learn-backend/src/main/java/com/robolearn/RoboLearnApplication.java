package com.robolearn;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@org.springframework.cache.annotation.EnableCaching
public class RoboLearnApplication {

    public static void main(String[] args) {
        String envPath = findEnvFile();
        
        if (envPath != null) {
            System.out.println("[Dotenv] Found .env file in directory: " + envPath);
            Dotenv dotenv = Dotenv.configure()
                    .directory(envPath)
                    .load();
            
            Map<String, Object> props = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
                props.put(entry.getKey(), entry.getValue());
            });

            new SpringApplicationBuilder(RoboLearnApplication.class)
                    .properties(props)
                    .run(args);
        } else {
            System.err.println("[Dotenv] CRITICAL WARNING: .env file not found anywhere! Using default application.yml placeholders.");
            SpringApplication.run(RoboLearnApplication.class, args);
        }
    }

    private static String findEnvFile() {
        // Start from current directory
        Path current = Paths.get("").toAbsolutePath();
        
        // Check current and up to 3 parent directories
        for (int i = 0; i < 4; i++) {
            File envFile = new File(current.toFile(), ".env");
            if (envFile.exists() && !envFile.isDirectory()) {
                return current.toString();
            }
            
            // Also check if we are in root but backend is a subfolder
            File backendEnvFile = new File(current.toFile(), "robo-learn-backend/.env");
            if (backendEnvFile.exists() && !backendEnvFile.isDirectory()) {
                return backendEnvFile.getParentFile().getAbsolutePath();
            }

            current = current.getParent();
            if (current == null) break;
        }
        return null;
    }
}

