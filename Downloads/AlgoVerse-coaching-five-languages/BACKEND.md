# Java Spring Boot + MongoDB

The app now has a Java 21+ Spring Boot backend connected through Spring Data
MongoDB. MySQL is not needed. The frontend and API are served from the same
origin. Open the server URL for accounts and database storage; opening an HTML
file directly still runs the standalone teaching demo.

## Run on this Windows computer

MongoDB Community Server and JDK 22 were found on this computer. From the app
folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\run.ps1 -LocalMongo -SetupAdmin
```

Enter your chosen administrator email and password at the prompts. Open
**http://localhost:8080** after the server starts. Use **Create an account** for
students, or sign in with the administrator account to manage the platform.
There are no default passwords. Later starts can omit `-SetupAdmin`:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\run.ps1 -LocalMongo
```

Keep the terminal open. Ctrl+C stops the app and the MongoDB process started by
the script. Existing MongoDB services are reused and left running. Local data
created by the script is in `backend/.data/mongodb`; restarting retains it.
The ready-to-run ZIP includes the compiled server and its dependency JARs.
If these are absent, the launcher invokes `build.ps1`, which downloads a
checksum-verified Maven distribution into the project and builds the server.

## Use MongoDB Atlas or an existing database

Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` to your
private MongoDB connection string. Do not commit or share this file. With
Atlas, allow your server's network address and use a database user with access
to the app database. Launch without `-LocalMongo`:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\run.ps1 -SetupAdmin
```

The launcher loads `.env`. If you set initial admin credentials in that file,
remove `ADMIN_PASSWORD` after setup. Bootstrap creates an account only when
that email does not already exist; it does not change an existing account's
password or promote a student. Admins can reset student passwords in User
management; users can change their own password in Account.

For Linux/macOS, use JDK 21+, Maven 3.9+, and MongoDB:

```sh
cd backend
export MONGODB_URI='mongodb://127.0.0.1:27017/algoverse'
mvn package
java -jar target/algoverse-server-1.0.0.jar
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` privately for initial administration.
The PowerShell `.env` loader does not run when invoking Java directly; export
those environment variables in your shell or deployment service.

## What is connected

- Registration, login, logout, name changes, password changes and admin roles.
- MongoDB-backed expiring sessions with HttpOnly cookies, session-bound CSRF
  tokens, origin verification, BCrypt passwords and request throttling.
- Per-account code drafts, visualizer completion, submission history and
  transparent glass notes. A save indicator reports errors and offers retry.
- Server-side grading with visible and private tests; four additional runtimes use Docker. Only the
  backend's result can mark a practice problem solved.
- Multiple-choice quizzes, server-side scores and saved quiz attempts.
- Admin user creation/editing/disabling/deletion, practice problem and quiz
  creation/editing/archiving, lesson explanations/publishing, platform settings,
  real activity counts and an audit log.
- Idempotent seeding of 35 visualizer lessons, seven original problems, one
  debug challenge and a DSA basics quiz. Editing or archiving seeded content
  is retained across restarts.

The five programming-language visualizer views remain available. Practice submissions now support all five languages. Python, C, C++ and Java require the Docker judge described in [EXECUTION-AND-COACHING.md](EXECUTION-AND-COACHING.md); JavaScript also works without Docker. Social login, email delivery and
self-service email password recovery are not configured.

The judge starts a disposable JVM for each run, with a 256 MB Java heap,
statement limit, 10-second process timeout, bounded input/output and two
concurrent slots. GraalJS denies Java host access, filesystem/network I/O,
processes, threads, native access and environment access. Test arguments are
passed to the guest function; expected answers and credentials are not. Only visible test outputs
are returned to students. A JVM boundary is not an OS container; use a
dedicated sandbox/container service before exposing code execution broadly.

## API

Every modifying request uses JSON, the configured `Origin`, and
`X-Algoverse-Request: 1`. After authentication, send `X-CSRF-Token` returned by
`/api/auth/me` or the login/register response. Sessions stay in an HttpOnly
cookie; the frontend does not store passwords or auth tokens in localStorage.

| Routes | Purpose |
| --- | --- |
| `GET /api/health` | MongoDB ping and ready status |
| `POST /api/auth/register`, `/login`, `/logout` | Account authentication |
| `GET /api/auth/me` | Current profile and CSRF token |
| `PATCH /api/auth/profile`, `POST /api/auth/password` | Account changes |
| `GET /api/problems`, `/lessons`, `/quizzes` | Published catalogs |
| `POST /api/problems/{id}/execute` | Run or submit a server-graded solution |
| `GET /api/progress`, `/submissions`, `/quiz-attempts` | Current user's history |
| `PUT /api/progress/lessons/{id}` | Record lesson completion |
| `GET /api/drafts`, `PUT /api/drafts/{id}` | Current user's draft storage |
| `GET /api/notes`, `PUT /api/notes` | Transparent notes storage |
| `POST /api/quizzes/{id}/attempts` | Grade and save quiz answers |
| `GET /api/settings/public` | Public platform configuration |
| `/api/admin/users` | Paginated search, create, edit, delete |
| `/api/admin/problems`, `/quizzes` | Catalog management |
| `/api/admin/lessons` | Built-in visualizer lesson management |
| `/api/admin/settings`, `/analytics` | Settings, counts and audit log |

MongoDB collections: `users`, `sessions`, `problems`, `lessons`, `learning`,
`drafts`, `submissions`, `notes`, `quizzes`, `quiz_attempts`, `settings`, `audit`.
Email has a unique index; session expiration has a TTL index. Sessions are also
checked for expiration on every request, without waiting for TTL cleanup.

## Verification and deployment

`mvn test` runs judge tests. To run the MongoDB integration test too, export
`MONGODB_TEST_URI` pointing at a test-capable MongoDB server. The test creates a
unique `algoverse_test_…` database and drops only that database. Browser
integration checks cover registration/login, access controls, reload persistence,
server grading, lesson completion, quizzes, notes, mobile layout and admin edits.
`test-backend-browser.cjs` requires Playwright, Chrome, a server at
`http://localhost:8080`, and `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD`. Run it
against a disposable database: it creates test accounts and catalog entries.
Existing algorithm, language-view, studio and standalone notes functionality
is retained.

For an HTTPS deployment, configure `APP_ORIGIN` to the exact public origin and
`SECURE_COOKIE=true`. The app binds to loopback by default; configure
`SERVER_ADDRESS` only for your deployment. Keep MongoDB access private and
authenticated, and back up its data. Request throttles and last-admin checks
are scoped to one backend instance; a multi-instance deployment needs shared
rate limiting and an atomic admin-management policy.

Official references: [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb/),
[Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html),
[GraalVM embedding](https://www.graalvm.org/reference-manual/embed-languages/).
