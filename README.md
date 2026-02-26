# Folia

A community-driven urban tree care platform. Citizens can discover, register, and care for trees in their neighbourhood — earning XP and badges as they go.

---

## What is Folia?

Urban trees are often forgotten. Folia makes it easy for anyone to:

- **Map trees** — pin a tree's location with its species, health status, and soil moisture level
- **Care for trees** — log waterings, track care history, and get notified when a tree needs attention
- **Earn rewards** — gain XP and unlock badges through real guardian actions
- **Explore the map** — browse all registered trees near you on an interactive map

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | React framework (App Router) |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first styling |
| [Leaflet](https://leafletjs.com/) / React-Leaflet | 1.9 / 5 | Interactive maps |
| [Radix UI](https://www.radix-ui.com/) | — | Accessible UI primitives |
| [Axios](https://axios-http.com/) | 1.x | HTTP client |
| [Vitest](https://vitest.dev/) + Testing Library | 4 | Unit & component testing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 25 | Language |
| [Spring Boot](https://spring.io/projects/spring-boot) | 4.0 | Application framework |
| Spring Security + JWT (JJWT) | — | Authentication & authorisation |
| Spring Data JPA + Hibernate Spatial | — | ORM + geospatial support |
| [PostgreSQL](https://www.postgresql.org/) + [PostGIS](https://postgis.net/) | 18 / 3.6 | Relational DB with spatial queries |
| [Flyway](https://flywaydb.org/) | — | Database migrations |
| [SpringDoc OpenAPI](https://springdoc.org/) | 2.6 | Swagger UI & API docs |
| [Testcontainers](https://testcontainers.com/) | 1.21 | Integration tests with real DB |
| [Lombok](https://projectlombok.org/) | — | Boilerplate reduction |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local dev & production deployment |
| PostGIS Docker image (`postgis/postgis`) | Geospatial-enabled database |

---

## Architecture Overview

```
┌─────────────────────┐        REST / JSON         ┌───────────────────────────┐
│   Next.js Frontend  │  ◄──────────────────────►  │  Spring Boot Backend API  │
│   (React 19, TS)    │                            │  (Java 25, Spring Boot 4) │
└─────────────────────┘                            └───────────┬───────────────┘
                                                               │
                                                    ┌──────────▼──────────────┐
                                                    │  PostgreSQL + PostGIS   │
                                                    │  (geospatial queries)   │
                                                    └─────────────────────────┘
```

The backend exposes a unified `ApiResponse<T>` envelope for every endpoint:

```json
{
  "success": true,
  "message": "Tree registered successfully",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-02-25T12:00:00"
}
```

---

## Key Features

### Tree Management
- Register a tree with species, common name, GPS coordinates, soil moisture level, and health status
- Update tree info or log a watering event
- Query trees by proximity (`/api/trees/nearby?lat=&lng=&radiusMeters=`)
- Filter trees that need watering right now

### Gamification
Users earn XP for guardian actions and climb through rank tiers:

| Rank | Name | XP Required |
|---|---|---|
| 1 | Seed Keeper | 0 |
| 2 | Seedling Saver | 200 |
| 3 | Sapling Steward | 500 |
| 4 | Branch Guardian | 1 000 |
| 5 | Canopy Keeper | 2 500 |
| 6 | Forest Warden | 5 000 |
| 7 | Ancient Grove Master | 10 000 |

Badges are unlocked for milestones such as registering a first tree, completing a 7-day watering streak, or watering 5 dying trees.

### Security
- JWT-based authentication with refresh token rotation
- OWASP-compliant error handling (no internal details leaked to clients)
- Field-level validation errors returned in a structured `errors` map

### Internationalisation
API messages are available in English and German (`messages.properties` / `messages_de.properties`).

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 25
- Node.js 20+

### 1. Start the database

```bash
docker compose up -d
```

### 2. Run the backend

```bash
cd server
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Running tests

```bash
# Backend unit tests
cd server && ./mvnw test

# Backend integration tests (requires Docker)
cd server && ./mvnw test -P integration-tests

# Frontend tests
cd frontend && npm test
```

---

## Project Structure

```
folia/
├── frontend/          # Next.js application
│   ├── app/           # App Router pages
│   ├── components/    # Reusable UI components
│   ├── context/       # React context (auth, etc.)
│   └── lib/           # API client, utilities
├── server/            # Spring Boot application
│   └── src/main/java/com/folia/server/
│       ├── auth/      # Authentication & JWT
│       ├── tree/      # Tree domain (entities, services, controllers)
│       ├── user/      # User domain
│       ├── security/  # Spring Security config
│       └── common/    # Shared utilities, response wrappers
├── tests/             # Bruno API test collections
└── docker-compose.yml # Local dev infrastructure
```

