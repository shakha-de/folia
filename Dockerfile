# ---- Build Stage ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY server/.mvn .mvn
COPY server/mvnw .
COPY server/pom.xml .
# Download dependencies first (cached layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY server/src ./src
RUN ./mvnw clean package -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

RUN useradd -ms /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

ENV PORT=8080
EXPOSE 8080

# Cloud Run sets PORT env var; activate prod profile by default
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]