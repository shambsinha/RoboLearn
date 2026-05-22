# Build stage using a full Gradle image
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
# Memory optimization for Render's 512MB limit
# -Xmx384m: Limits heap size to 384MB
# -Xss256k: Reduces stack size per thread to save memory
ENTRYPOINT ["java", "-Xmx384m", "-Xss256k", "-jar", "app.jar"]
