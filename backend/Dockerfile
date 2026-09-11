# Étape de compilation (Build)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compile le projet en ignorant les tests pour aller plus vite
RUN mvn clean package -DskipTests

# Étape d'exécution (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss256k", "-Xms128m", "-Xmx384m", "-jar", "app.jar"]
