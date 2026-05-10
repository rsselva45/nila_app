# Nila – Adaptive Learning Path Builder (API)

A Spring Boot 3 REST microservice that persists adaptive learning paths and their available content components. The API stores the full node/edge graph of a learning path — including section nodes, group containers, and conditional routing rules — in a local SQLite database.

---

## Tech Stack

| Layer | Library / Tool | Version |
|-------|---------------|---------|
| Framework | Spring Boot | 3.3.5 |
| Language | Java | 21 |
| Build tool | Maven | 3.9+ |
| Persistence | Spring Data JPA + Hibernate | (Boot-managed) |
| Database | SQLite (file-based) | — |
| JDBC driver | Xerial `sqlite-jdbc` | 3.46.1.3 |
| Hibernate dialect | `hibernate-community-dialects` | (Boot-managed) |
| Validation | Jakarta Bean Validation | (Boot-managed) |
| Error responses | RFC 9457 `ProblemDetail` | — |
| Testing | JUnit 5, Mockito, MockMvc | (Boot-managed) |

---

## Project Structure

```
API/
├── src/
│   ├── main/
│   │   ├── java/com/nila/learningpath/
│   │   │   ├── NilaApplication.java
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java          # CorsFilter bean for /api/**
│   │   │   ├── controller/
│   │   │   │   ├── ComponentController.java  # GET /api/components
│   │   │   │   └── LearningPathController.java # POST + GET /api/learning-paths
│   │   │   ├── dto/
│   │   │   │   ├── AvailableContentResponse.java
│   │   │   │   ├── ComponentDto.java
│   │   │   │   ├── EdgeDto.java              # Holds ConditionsDto + RuleDto
│   │   │   │   ├── LearningPathDto.java
│   │   │   │   └── NodeDto.java
│   │   │   ├── entity/
│   │   │   │   ├── ComponentEntity.java
│   │   │   │   ├── LearningPathEntity.java   # @OneToMany nodes + edges
│   │   │   │   ├── LpEdgeEntity.java
│   │   │   │   └── LpNodeEntity.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   ├── ComponentRepository.java
│   │   │   │   ├── LearningPathRepository.java
│   │   │   │   ├── LpEdgeRepository.java
│   │   │   │   └── LpNodeRepository.java
│   │   │   └── service/
│   │   │       ├── ComponentService.java
│   │   │       └── LearningPathService.java  # Upsert + JSON blob handling
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql                      # 9 seed components (idempotent)
│   └── test/
│       └── java/com/nila/learningpath/
│           ├── NilaApplicationTests.java     # Context load (in-memory SQLite)
│           ├── controller/
│           │   ├── ComponentControllerTest.java
│           │   └── LearningPathControllerTest.java
│           └── service/
│               ├── ComponentServiceTest.java
│               └── LearningPathServiceTest.java
├── data/
│   └── nila.db                               # SQLite file (git-ignored)
└── pom.xml
```

---

## REST Endpoints

### Components

#### `GET /api/components`

Returns all available content components (units and assessments) that can be placed on a learning path canvas.

**Response `200 OK`:**
```json
{
  "totalCount": 9,
  "items": [
    {
      "id": "cmp-assess-math-1",
      "title": "Math Module 1 Assessment",
      "shortDescription": "Baseline math diagnostic used to route learners.",
      "type": "assessment",
      "approximateDurationMinutes": 35,
      "metadata": {
        "assessment": { "maxScore": 100, "passingScore": 50 }
      }
    }
  ]
}
```

---

### Learning Paths

#### `POST /api/learning-paths`

Save (upsert) a learning path. If `id` is omitted a new `lp-<uuid>` is generated. If `id` is supplied and exists in the database, the record is overwritten.

**Request body:**
```json
{
  "name": "SAT Adaptive Path",
  "status": "draft",
  "nodes": [
    {
      "id": "start",
      "componentId": "system:start",
      "type": "start",
      "label": "Start Assessment",
      "position": { "x": 290, "y": 0 }
    },
    {
      "id": "group-math-2",
      "type": "group",
      "label": "Math Module 2",
      "position": { "x": 65, "y": 285 }
    },
    {
      "id": "math-1",
      "componentId": "cmp-assess-math-1",
      "type": "assessment",
      "label": "Math Module 1",
      "position": { "x": 258, "y": 145 },
      "config": { "approximateDurationMinutes": 35 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "sourceNodeId": "start",
      "targetNodeId": "math-1",
      "conditions": { "operator": "AND", "rules": [] }
    },
    {
      "id": "e2",
      "sourceNodeId": "group-math-2",
      "targetNodeId": "math-2-easy",
      "priority": 1,
      "isDefault": false,
      "conditions": {
        "operator": "AND",
        "rules": [
          {
            "id": "r1",
            "sourceType": "assessment",
            "sourceNodeId": "math-1",
            "metric": "score",
            "operator": "lte",
            "value": 50
          }
        ]
      }
    }
  ]
}
```

**Validation:**
- `name` — required, not blank
- `status` — `draft` or `published`
- `nodes[*].type` — one of `start | unit | assessment | end | group`
- `nodes[*].position` — required, `x` and `y` must be non-null
- `edges[*].conditions` — required; `operator` must be `AND` or `OR`
- `edges[*].conditions.rules[*].metric` — one of `completion | passed | score | score_range | time_spent_minutes | percentage_completion`
- `edges[*].conditions.rules[*].operator` — one of `eq | ne | gt | gte | lt | lte | between`

**Response `201 Created`** — full saved object with `Location` header pointing to the resource URL.

**Response `400 Bad Request`** — RFC 9457 `ProblemDetail` with per-field violations.

---

#### `GET /api/learning-paths/{id}`

Load a previously saved learning path.

**Response `200 OK`** — same shape as the POST body, with `id` populated.

**Response `404 Not Found`** — RFC 9457 `ProblemDetail` if the id does not exist.

---

## Data Model

### `components` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | e.g. `cmp-assess-math-1` |
| `title` | TEXT | Display name |
| `short_description` | TEXT | |
| `type` | TEXT | `unit` or `assessment` |
| `approximate_duration_minutes` | INTEGER | |
| `metadata_json` | TEXT | JSON blob: `{"assessment":{"maxScore":100,"passingScore":50}}` |

### `learning_paths` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `lp-<uuid>` or caller-supplied |
| `name` | TEXT | |
| `description` | TEXT | nullable |
| `status` | TEXT | `draft` or `published` |
| `version` | INTEGER | |
| `canvas_zoom` | REAL | nullable |
| `canvas_offset_x` | REAL | nullable |
| `canvas_offset_y` | REAL | nullable |
| `created_at` | TEXT | ISO-8601, set on `@PrePersist` |
| `updated_at` | TEXT | ISO-8601, updated on `@PreUpdate` |

### `lp_nodes` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Node id from the canvas |
| `learning_path_id` | TEXT FK | → `learning_paths.id` |
| `component_id` | TEXT | nullable; `system:start`, `system:end`, or a `cmp-*` id |
| `type` | TEXT | `start \| unit \| assessment \| end \| group` |
| `label` | TEXT | |
| `description` | TEXT | nullable |
| `position_x` | REAL | Canvas position |
| `position_y` | REAL | Canvas position |
| `config_json` | TEXT | JSON blob: `{"approximateDurationMinutes":35}` |

### `lp_edges` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Edge id from the canvas |
| `learning_path_id` | TEXT FK | → `learning_paths.id` |
| `source_node_id` | TEXT | |
| `target_node_id` | TEXT | |
| `label` | TEXT | nullable |
| `priority` | INTEGER | nullable |
| `is_default` | INTEGER | nullable; SQLite boolean (0/1) |
| `conditions_json` | TEXT | Full `ConditionsDto` as JSON |

Conditions — including their polymorphic `value` field (number, boolean, or string) and `range` objects — are stored as a single JSON blob per edge. Jackson deserializes them back to typed `ConditionsDto` / `RuleDto` records on read.

---

## Seed Data

`src/main/resources/data.sql` inserts 9 sample components using `INSERT OR IGNORE` so re-running the app never duplicates records:

| id | title | type | Duration |
|----|-------|------|----------|
| `cmp-assess-math-1` | Math Module 1 Assessment | assessment | 35 min |
| `cmp-unit-math-2-easy` | Math Module 2 – Easy | unit | 35 min |
| `cmp-assess-math-2-adv` | Math Module 2 – Advanced | assessment | 35 min |
| `cmp-assess-rc-1` | Reading & Comp Module 1 | assessment | 32 min |
| `cmp-unit-rc-2-easy` | R&C Module 2 – Easy | unit | 32 min |
| `cmp-assess-rc-2-adv` | R&C Module 2 – Advanced | assessment | 32 min |
| `cmp-unit-algebra` | Algebra Fundamentals | unit | 45 min |
| `cmp-assess-geometry` | Geometry Assessment | assessment | 40 min |
| `cmp-unit-writing` | Essay Writing Unit | unit | 50 min |

---

## Configuration

`src/main/resources/application.properties`:

```properties
# SQLite file written relative to the working directory
spring.datasource.url=jdbc:sqlite:./data/nila.db
spring.datasource.driver-class-name=org.sqlite.JDBC

spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update

# Seed data runs after JPA schema creation
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

# Comma-separated origins allowed for CORS on /api/**
app.cors.allowed-origins=http://localhost:5173,http://localhost:5174,http://localhost:4200
```

Override CORS origins at runtime:

```bash
SPRING_APPLICATION_JSON='{"app":{"cors":{"allowed-origins":"https://myapp.example.com"}}}' \
  java -jar target/learning-path-api-0.0.1-SNAPSHOT.jar
```

---

## Getting Started

**Prerequisites:** Java 21, Maven 3.9+.

```bash
cd API

# Run with Maven wrapper (downloads Maven if not present)
./mvnw spring-boot:run

# Or with a globally installed Maven
mvn spring-boot:run
```

The server starts on **port 8080**. The SQLite file is created at `./data/nila.db` on first run.

### Quick smoke test

```bash
# List components
curl http://localhost:8080/api/components | python3 -m json.tool

# Save a minimal learning path
curl -X POST http://localhost:8080/api/learning-paths \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","status":"draft","nodes":[{"id":"s","componentId":"system:start","type":"start","label":"Start","position":{"x":0,"y":0}}],"edges":[]}'
```

### Build a runnable JAR

```bash
mvn package -DskipTests
java -jar target/learning-path-api-0.0.1-SNAPSHOT.jar
```

---

## Tests

18 tests across four suites, all green:

| Suite | Type | Tests | What it covers |
|-------|------|-------|---------------|
| `NilaApplicationTests` | `@SpringBootTest` (in-memory SQLite) | 1 | Application context loads cleanly |
| `ComponentServiceTest` | Unit (Mockito) | 5 | Repository mocking, metadata JSON parsing, null handling |
| `LearningPathServiceTest` | Unit (Mockito) | 6 | ID generation, upsert logic, node/edge persistence, `getById` not-found |
| `ComponentControllerTest` | `@WebMvcTest` (MockMvc) | 2 | 200 OK, empty list response |
| `LearningPathControllerTest` | `@WebMvcTest` (MockMvc) | 4 | 201 + Location header, 400 on missing name, 200 load, 404 not-found |

Run all tests:

```bash
mvn test
```

Tests use an in-memory SQLite database (`jdbc:sqlite::memory:`) so no file is created or modified during the test run.

---

## Error Responses (RFC 9457)

All error responses use the `ProblemDetail` format:

```json
{
  "type": "urn:nila:error:not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "LearningPath 'lp-xyz' not found.",
  "instance": "/api/learning-paths/lp-xyz",
  "timestamp": "2026-05-10T08:30:00Z"
}
```

| Scenario | Status | type suffix |
|----------|--------|-------------|
| Resource not found | 404 | `not-found` |
| Bean validation failure | 400 | `validation` |
| Unexpected server error | 500 | `internal` |

---

## Key Design Decisions

- **SQLite for storage.** Zero-infrastructure, file-based, suitable for a local dev tool. Hibernate's `ddl-auto=update` creates the schema on first boot.
- **JSON blobs for polymorphic data.** Edge conditions contain a `value` field that can be a number, boolean, or string, and an optional `range` object. Rather than fully normalizing this into separate tables, it is stored as a `TEXT` column and round-tripped via Jackson `JsonNode`. This keeps the schema simple and exactly mirrors the JSON schema contract.
- **Upsert pattern in `LearningPathService`.** `POST /api/learning-paths` does a `findById` first; if found it updates in place, if not it creates a new entity. This means the UI can call POST idempotently on every save.
- **`componentId` nullable on nodes.** Start, end, and group nodes are structural canvas elements that do not correspond to a content component. The `component_id` column allows null for these types; section nodes (unit/assessment) always carry a valid component id.
- **Java Records for DTOs.** Immutable, no-boilerplate, and Jackson serializes them correctly out of the box with Spring Boot 3.
