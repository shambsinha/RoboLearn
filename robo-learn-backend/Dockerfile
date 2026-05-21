# Build stage using a full Gradle image to avoid wrapper issues
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
# Copy only the files needed for the build
COPY . .
# Run gradle build directly
RUN gradle bootJar --no-daemon

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
