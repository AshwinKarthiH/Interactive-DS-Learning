# Five-language practice, hints and roadmap

The Spring Boot API now supports JavaScript, Python, C11, C++17 and Java 21.
JavaScript continues to work with the existing restricted Java process.
The other four languages require Docker Desktop running Linux containers.
Docker is not installed on the development computer, so live container builds
and execution could not be verified here. The app reports this prerequisite
instead of running submitted code directly on the host.

After installing and starting Docker Desktop, run from the app directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\judge\setup.ps1
powershell -ExecutionPolicy Bypass -File .\backend\run.ps1 -LocalMongo
```

The image contains Python, Node.js, GCC, G++, Java and JSON transport libraries.
Each submission gets a fresh non-root container with no network, no added
capabilities, no host mounts, a read-only root, private temporary storage,
512 MB memory, one CPU and 64 processes. Compilation and execution have time
and output limits. Containers are removed after completion or timeout.
Expected answers stay in the Java server; only argument arrays go into the
container. The server compares returned JSON values with its private tests.

Select a language in the practice editor. Each language has its own saved draft
and Reset template. Follow the template's function signature:

| Language | Function |
| --- | --- |
| JavaScript | The named function in the problem's original starter |
| Python | `solve(args)` returning a JSON-compatible value |
| C++ | `json solve(const json& args)` using nlohmann JSON |
| C | `cJSON *solve(const cJSON *args)` returning a newly allocated cJSON value |
| Java | `public static Object solve(List<Object> args)` inside `Solution` |

`args[0]` is the first problem argument, `args[1]` the second if present.
For linked-list exercises, the practice transport uses arrays, as the original
demo does. Return the requested value; avoid debug printing to stdout.
The C and C++ JSON libraries and their MIT licenses are in `backend/judge/vendor`.

Hints are revealed one at a time, from a small conceptual clue to a concrete
algorithm suggestion. Revealed hints are stored per user and problem in MongoDB
and restored on reload. Visible-test feedback explains the next debugging step;
private input and expected-answer details are not returned.

The dashboard roadmap covers all 35 published lessons in a beginner-friendly
order. It shows completed, ready and upcoming lessons, prerequisites and a
suggested next lesson. Recent unsuccessful practice attempts can recommend a
relevant review lesson; accepted problems stop triggering review suggestions.
Progress uses the existing MongoDB lesson and submission records. The roadmap
updates after studying or submitting, and each item opens its visualizer.
The 15-minute estimate is a suggested session length, not measured practice time.

APIs: `GET /api/runtimes`, `GET /api/roadmap`, and
`GET/POST /api/problems/{id}/hints`. The existing execute endpoint now accepts
all five language names. Docker availability is checked with a short cache;
missing Docker produces an actionable 503 without saving a failed submission.

`DockerJudgeTest` checks the container configuration. Enable `DOCKER_JUDGE_TEST=1`
when running Maven tests to exercise actual containers in all five languages
after building the image. MongoDB integration tests cover hint privacy,
roadmap coverage and runtime discovery, in addition to existing account tests.

The launcher also validates the initial admin email and password before starting
Java. Enter a complete address such as `admin@example.com`, not just `admin`.
