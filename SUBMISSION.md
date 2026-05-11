# Submission – Adaptive Learning Path Builder

---

## 1. Repository Link

**https://github.com/rsselva45/nila_app**

- `UI/` — React 19 + Vite + TypeScript frontend
- `API/` — Spring Boot 3.3 + Java 21 + SQLite backend

---

## 2. Time Spent

**~6 hours** (including test execution and writing this document)
- `Start Time` - 2026-05-10 10:00 IST
- `End Time` - 2026-05-10 16:00 IST

| Phase | Time |
|-------|------|
| Project scaffolding (Vite + Spring Boot setup, folder structure) | 1 h |
| Backend API — entities, DTOs, service layer, repositories | 1.5 h |
| Canvas UI — React Flow node types, drag-and-drop, group containers | 2 h |
| Properties panel — node editor, condition builder, edge inspector | 1 h |
| Save / load wiring — canvas↔API mapper, localStorage persistence | 1 h |
| Tests (18 unit + MockMvc tests) | 1 h |
| Deployment (Railway, CORS config, SQLite path fix) | 0.5 h |

---

## 3. Assumptions and Tradeoffs

### Assumptions

- **Single learning path per session.** The app manages one canvas at a time. The active learning path ID is stored in `localStorage` so the canvas is restored on reload; there is no multi-path listing UI.
- **Conditions are entry conditions on the destination node.** The UI attaches routing rules to the target section ("show this section when..."), which are mapped to the incoming edge's `conditions.rules` on save. This matches the spec's conditional logic model and keeps the properties panel intuitive.
- **`questions` count is UI-only.** The backend schema has no field for question count; it is a display hint entered by the user and is not persisted. All other node properties (label, duration, type, position, group membership, conditions) are fully round-tripped.
- **One save endpoint, upsert semantics.** `POST /api/learning-paths` acts as both create and update. If `id` is present in the payload and exists in the database, the record is overwritten. This removes the need for a separate `PUT` endpoint and lets the frontend call the same function on every save.
- **Component library is read-only.** There is no admin UI for creating or editing components. The 9 seed components are inserted at startup via `data.sql` (`INSERT OR IGNORE`). Adding new components means inserting rows into the `components` table directly or via a future CRUD endpoint.

### Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **SQLite** for persistence | Zero infrastructure, single file, perfect for local dev. Not suitable for concurrent multi-user production deployments (SQLite serialises writes). |
| **JSON blobs for edge conditions** (`conditions_json`) | Avoids three extra normalised tables for rules and value variants. The schema mirrors the JSON contract exactly. Querying individual rule fields from SQL is not possible without JSON functions, but the spec has no such requirement. |
| **JSON blobs for node config / style** (`config_json`, `style_json`) | Same rationale: the config shape differs by node type and adding columns per type would create many nullable columns. |
| **`parentId` stored per node** | Group membership (which nodes sit inside which group) requires a `parent_id` column on `lp_nodes`. Without it, restoring a saved canvas would place all nodes at the top level. A small schema addition that pays for itself on every reload. |
| **`crypto.randomUUID()` for dropped-node IDs** | Initial implementation used a module-level counter (`nodeIdCounter = 100`) that reset on every page reload. After a canvas restore, the counter would regenerate IDs already in use, causing Hibernate duplicate-entity errors. UUID-based IDs are collision-free regardless of session history. |
| **No React Router** | The app is a single-canvas editor. Adding routing (`/editor/:id`) would improve bookmarkability but adds complexity. The current approach persists the ID in `localStorage` and fetches on mount, which covers the reload requirement from the spec. |
| **Conditions on nodes, not edges (in the store)** | React Flow's selection model makes it more natural to show a node's properties when it is clicked. The mapper layer converts them to `edge.conditions.rules` on save, matching the backend schema. |

---

## 4. Setup Instructions

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Java | 21 |
| Maven | 3.9 |
| Node.js | 18 |

---

### Step 1 — Start the API

```bash
cd API
mvn spring-boot:run
```

- Server starts on **http://localhost:8080**
- SQLite database is created at `API/data/nila.db` on first boot (directory created automatically)
- Schema is applied by Hibernate (`ddl-auto=update`)
- 9 seed content components are inserted by `src/main/resources/data.sql` (`INSERT OR IGNORE` — safe to re-run)

**Verify the API is running:**

```bash
curl http://localhost:8080/api/components
```

Expected: JSON with `totalCount: 9` and an `items` array.

---

### Step 2 — Start the UI

```bash
cd UI
npm install
npm run dev
```

- Dev server starts on **http://localhost:5173**
- Open that URL in a browser

---

### Using the builder

1. **Left panel → Available Content** lists the 9 seeded components. Drag any item directly onto a section node on the canvas to attach it.
2. **Left panel → Add to Canvas** — drag *Section* to add a new section node, drag *Group* to add a group container.
3. **Connect nodes** by hovering a node's edge handle and dragging to another node.
4. **Select a node** → Properties panel on the right shows label, duration, difficulty, and entry conditions.
5. **Select an edge** → Properties panel shows the source → target connection.
6. Click **Save Draft** or **Publish** in the header to persist. The canvas is restored automatically on next page load.

---

### Environment variables (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `SQLITE_URL` | `jdbc:sqlite:./data/nila.db` | Override the SQLite file path |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |

```bash
# Example — point to a different DB file
SQLITE_URL=jdbc:sqlite:/data/prod/nila.db mvn spring-boot:run
```

---

### Build a production JAR

```bash
cd API
mvn package -DskipTests
java -jar target/learning-path-api-0.0.1-SNAPSHOT.jar
```

### Build the UI for production

```bash
cd UI
npm run build      # output → UI/dist/
npm run preview    # serve the built output locally
```

---

## 5. Test Execution Evidence

### Running the tests

```bash
cd API
mvn test
```

Tests use an **in-memory SQLite database** (`jdbc:sqlite::memory:`) configured in `src/test/resources/application.yml`. No file is written or modified during the test run.

---

### Test suites — 18 tests, all green

| Suite | Type | Tests |
|-------|------|------:|
| `NilaApplicationTests` | `@SpringBootTest` (context load) | 1 |
| `ComponentServiceTest` | Unit — Mockito | 5 |
| `LearningPathServiceTest` | Unit — Mockito | 6 |
| `ComponentControllerTest` | `@WebMvcTest` — MockMvc | 2 |
| `LearningPathControllerTest` | `@WebMvcTest` — MockMvc | 4 |
| **Total** | | **18** |

---

### What each suite covers

**`ComponentServiceTest`** (5 tests)
- `getAllComponents_returnsAllItems` — repository returns 2 entities → response has `totalCount: 2`
- `getAllComponents_parsesAssessmentMetadata` — `metadata.assessment.maxScore` and `passingScore` parsed from JSON blob
- `getAllComponents_parsesUnitMetadata` — `metadata.unit.recommendedMinutes` parsed from JSON blob
- `getAllComponents_handlesNullMetadataGracefully` — null `metadata_json` column → `dto.metadata()` is null, no exception
- `getAllComponents_emptyRepositoryReturnsZeroCount` — empty repository → `totalCount: 0`, empty list

**`LearningPathServiceTest`** (6 tests)
- `save_generatesIdWhenNotProvided` — null `id` in DTO → returned `id` starts with `lp-`
- `save_usesProvidedId` — supplied `id` is preserved through the upsert
- `save_persistsNameAndStatus` — captured entity has correct `name` and `status`
- `save_persistsNodesAndEdges` — node `label` and edge `sourceNodeId` are persisted correctly
- `getById_throwsWhenNotFound` — missing ID → `ResourceNotFoundException`
- `getById_returnsMappedDto` — entity found → `id`, `name`, empty `nodes`/`edges` mapped correctly

**`ComponentControllerTest`** (2 tests)
- `getAll_returns200WithItems` — `200 OK`, correct `totalCount`, `id`, `type`, and nested `metadata` in JSON response
- `getAll_returnsEmptyListWhenNoComponents` — `200 OK`, `totalCount: 0`, empty `items` array

**`LearningPathControllerTest`** (4 tests)
- `create_returns201WithLocation` — `POST` returns `201 Created` with `Location` header containing the new resource URL
- `create_returns400WhenNameMissing` — missing `name` field → `400 Bad Request`
- `getById_returns200WhenFound` — `GET /{id}` returns `200 OK` with `nodes` and `edges` arrays
- `getById_returns404WhenNotFound` — unknown `id` → `404 Not Found`

---

### Maven output

[INFO] Scanning for projects...
[INFO] 
[INFO] [1m---------------------< [0;36mcom.nila:learning-path-api[0;1m >---------------------[m
[INFO] [1mBuilding learning-path-api 0.0.1-SNAPSHOT[m
[INFO]   from pom.xml
[INFO] [1m--------------------------------[ jar ]---------------------------------[m
[INFO] 
[INFO] [1m--- [0;32mresources:3.3.1:resources[m [1m(default-resources)[m @ [36mlearning-path-api[0;1m ---[m
[INFO] Copying 1 resource from src/main/resources to target/classes
[INFO] Copying 1 resource from src/main/resources to target/classes
[INFO] 
[INFO] [1m--- [0;32mcompiler:3.13.0:compile[m [1m(default-compile)[m @ [36mlearning-path-api[0;1m ---[m
[INFO] Recompiling the module because of [1madded or removed source files[m.
[INFO] Compiling 24 source files with javac [debug parameters release 21] to target/classes
[INFO] 
[INFO] [1m--- [0;32mresources:3.3.1:testResources[m [1m(default-testResources)[m @ [36mlearning-path-api[0;1m ---[m
[INFO] skip non existing resourceDirectory /Users/selvaraj/Learning/Nila_app/nila_app/API/src/test/resources
[INFO] 
[INFO] [1m--- [0;32mcompiler:3.13.0:testCompile[m [1m(default-testCompile)[m @ [36mlearning-path-api[0;1m ---[m
[INFO] Recompiling the module because of [1mchanged dependency[m.
[INFO] Compiling 5 source files with javac [debug parameters release 21] to target/test-classes
[INFO] 
[INFO] [1m--- [0;32msurefire:3.2.5:test[m [1m(default-test)[m @ [36mlearning-path-api[0;1m ---[m
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.nila.learningpath.[1mNilaApplicationTests[m
16:39:57.318 [main] INFO org.springframework.test.context.support.AnnotationConfigContextLoaderUtils -- Could not detect default configuration classes for test class [com.nila.learningpath.NilaApplicationTests]: NilaApplicationTests does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
16:39:57.344 [main] INFO org.springframework.boot.test.context.SpringBootTestContextBootstrapper -- Found @SpringBootConfiguration com.nila.learningpath.NilaApplication for test class com.nila.learningpath.NilaApplicationTests

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.3.5)

2026-05-10T16:39:57.446+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.learningpath.NilaApplicationTests    : Starting NilaApplicationTests using Java 21.0.10 with PID 26773 (started by selvaraj in /Users/selvaraj/Learning/Nila_app/nila_app/API)
2026-05-10T16:39:57.447+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.learningpath.NilaApplicationTests    : No active profile set, falling back to 1 default profile: "default"
2026-05-10T16:39:57.610+05:30  INFO 26773 --- [learning-path-api] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-05-10T16:39:57.629+05:30  INFO 26773 --- [learning-path-api] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 14 ms. Found 4 JPA repository interfaces.
2026-05-10T16:39:57.733+05:30  INFO 26773 --- [learning-path-api] [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2026-05-10T16:39:57.747+05:30  INFO 26773 --- [learning-path-api] [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.5.3.Final
2026-05-10T16:39:57.755+05:30  INFO 26773 --- [learning-path-api] [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2026-05-10T16:39:57.833+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2026-05-10T16:39:57.841+05:30  INFO 26773 --- [learning-path-api] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-05-10T16:39:58.294+05:30  INFO 26773 --- [learning-path-api] [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.sqlite.jdbc4.JDBC4Connection@141aba65
2026-05-10T16:39:58.296+05:30  INFO 26773 --- [learning-path-api] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-05-10T16:39:58.581+05:30  INFO 26773 --- [learning-path-api] [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-05-10T16:39:58.587+05:30  INFO 26773 --- [learning-path-api] [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-05-10T16:39:58.786+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.d.j.r.query.QueryEnhancerFactory     : Hibernate is in classpath; If applicable, HQL parser will be used.
2026-05-10T16:39:58.916+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.learningpath.NilaApplicationTests    : Started NilaApplicationTests in 1.539 seconds (process running for 1.795)
Java HotSpot(TM) 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
WARNING: A Java agent has been loaded dynamically (/Users/selvaraj/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.19/byte-buddy-agent-1.14.19.jar)
WARNING: If a serviceability tool is in use, please run with -XX:+EnableDynamicAgentLoading to hide this warning
WARNING: If a serviceability tool is not in use, please run with -Djdk.instrument.traceUsage for more information
WARNING: Dynamic loading of agents will be disallowed by default in a future release
[INFO] [1;32mTests run: [0;1;32m1[m, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.870 s -- in com.nila.learningpath.[1mNilaApplicationTests[m
[INFO] Running com.nila.learningpath.controller.[1mLearningPathControllerTest[m
2026-05-10T16:39:59.149+05:30  INFO 26773 --- [learning-path-api] [           main] t.c.s.AnnotationConfigContextLoaderUtils : Could not detect default configuration classes for test class [com.nila.learningpath.controller.LearningPathControllerTest]: LearningPathControllerTest does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
2026-05-10T16:39:59.155+05:30  INFO 26773 --- [learning-path-api] [           main] .b.t.c.SpringBootTestContextBootstrapper : Found @SpringBootConfiguration com.nila.learningpath.NilaApplication for test class com.nila.learningpath.controller.LearningPathControllerTest

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.3.5)

2026-05-10T16:39:59.169+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.LearningPathControllerTest       : Starting LearningPathControllerTest using Java 21.0.10 with PID 26773 (started by selvaraj in /Users/selvaraj/Learning/Nila_app/nila_app/API)
2026-05-10T16:39:59.169+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.LearningPathControllerTest       : No active profile set, falling back to 1 default profile: "default"
2026-05-10T16:39:59.296+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2026-05-10T16:39:59.296+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Initializing Servlet ''
2026-05-10T16:39:59.297+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Completed initialization in 0 ms
2026-05-10T16:39:59.301+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.LearningPathControllerTest       : Started LearningPathControllerTest in 0.139 seconds (process running for 2.18)
[INFO] [1;32mTests run: [0;1;32m4[m, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.292 s -- in com.nila.learningpath.controller.[1mLearningPathControllerTest[m
[INFO] Running com.nila.learningpath.controller.[1mComponentControllerTest[m
2026-05-10T16:39:59.444+05:30  INFO 26773 --- [learning-path-api] [           main] t.c.s.AnnotationConfigContextLoaderUtils : Could not detect default configuration classes for test class [com.nila.learningpath.controller.ComponentControllerTest]: ComponentControllerTest does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
2026-05-10T16:39:59.448+05:30  INFO 26773 --- [learning-path-api] [           main] .b.t.c.SpringBootTestContextBootstrapper : Found @SpringBootConfiguration com.nila.learningpath.NilaApplication for test class com.nila.learningpath.controller.ComponentControllerTest

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.3.5)

2026-05-10T16:39:59.460+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.ComponentControllerTest          : Starting ComponentControllerTest using Java 21.0.10 with PID 26773 (started by selvaraj in /Users/selvaraj/Learning/Nila_app/nila_app/API)
2026-05-10T16:39:59.461+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.ComponentControllerTest          : No active profile set, falling back to 1 default profile: "default"
2026-05-10T16:39:59.547+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2026-05-10T16:39:59.547+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Initializing Servlet ''
2026-05-10T16:39:59.547+05:30  INFO 26773 --- [learning-path-api] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Completed initialization in 0 ms
2026-05-10T16:39:59.549+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.c.ComponentControllerTest          : Started ComponentControllerTest in 0.1 seconds (process running for 2.428)
[INFO] [1;32mTests run: [0;1;32m2[m, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.115 s -- in com.nila.learningpath.controller.[1mComponentControllerTest[m
[INFO] Running com.nila.learningpath.service.[1mComponentServiceTest[m
[INFO] [1;32mTests run: [0;1;32m5[m, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.065 s -- in com.nila.learningpath.service.[1mComponentServiceTest[m
[INFO] Running com.nila.learningpath.service.[1mLearningPathServiceTest[m
2026-05-10T16:39:59.653+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.service.LearningPathServiceImpl    : Saved learning path: lp-1
2026-05-10T16:39:59.654+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.service.LearningPathServiceImpl    : Saved learning path: lp-f5a76fab-19d0-418e-96f1-f6f7a6fc5503
2026-05-10T16:39:59.656+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.service.LearningPathServiceImpl    : Saved learning path: lp-1
2026-05-10T16:39:59.660+05:30  INFO 26773 --- [learning-path-api] [           main] c.n.l.service.LearningPathServiceImpl    : Saved learning path: lp-fixed-id
[INFO] [1;32mTests run: [0;1;32m6[m, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.030 s -- in com.nila.learningpath.service.[1mLearningPathServiceTest[m
[INFO] 
[INFO] Results:
[INFO] 
[INFO] [1;32mTests run: 18, Failures: 0, Errors: 0, Skipped: 0[m
[INFO] 
[INFO] [1m------------------------------------------------------------------------[m
[INFO] [1;32mBUILD SUCCESS[m
[INFO] [1m------------------------------------------------------------------------[m
[INFO] Total time:  3.692 s
[INFO] Finished at: 2026-05-10T16:39:59+05:30
[INFO] [1m------------------------------------------------------------------------[m
