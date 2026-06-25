# Build stage using standard JDK and Gradle Wrapper
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY . .
# Ensure gradlew has execution permissions before running
RUN chmod +x gradlew
# Restrict Gradle JVM memory to 256MB to prevent Docker OOM on Render Free Tier
RUN ./gradlew bootJar --no-daemon -Dorg.gradle.jvmargs="-Xmx256m"

# Run stage - Using JDK instead of JRE to have 'javac' available for coding problems
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Install Python and G++ for code execution sandbox
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080

# Memory optimization for Render's 512MB limit
# -Xmx384m: Limits heap size to 384MB
# -Xss256k: Reduces stack size per thread to save memory
ENTRYPOINT ["java", "-Xmx384m", "-Xss256k", "-jar", "app.jar"]
