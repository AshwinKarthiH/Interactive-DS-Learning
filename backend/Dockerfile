
# Stage 1: Build Java application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests -B

# Stage 2: Run Java application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/algoverse-server-1.0.0.jar app.jar
COPY --from=build /app/target/lib/ ./lib/

EXPOSE 10000

CMD ["java", "-Xms64m", "-Xmx256m", "-XX:MaxMetaspaceSize=128m", "-XX:ReservedCodeCacheSize=64m", "-cp", "app.jar:lib/*", "com.algoverse.Application", "--debug"]
