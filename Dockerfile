FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY server/.mvn .mvn
COPY server/mvnw .
COPY server/pom.xml .
COPY server/src ./src
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN useradd -ms /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]