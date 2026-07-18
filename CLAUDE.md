# Project Guidelines

**Always commit changes** after completing work unless explicitly told not to.

This service is part of the `emails` project. It is an API Gateway backed by Lambda functions that accepts email
requests, stores the content in S3, and adds messages to the `emails-to-send`/`emails-to-bounce` SQS FIFO queues
for `emails-queue-service` to process. It provides endpoints for both regular emails and bounce notifications.
Infrastructure shared across the `emails` project lives in a separate `emails-infrastructure` repo; most
infrastructure here is domain-specific to this service (the API Gateway, Lambda functions, and their S3/SQS IAM
policies).

Use functional programming style where practical, including dependency injection, avoiding mutating objects or
values, etc.

## Code Layout

- **src/handlers** — entry points into the lambdas, like controllers. Handle API Gateway events and return proper
  HTTP responses. Always catch exceptions and log with `logError`; never let exceptions bubble up from handlers.
- **src/services** — services that interact with outside resources (the AWS SDK). Have side effects; only catch
  expected exceptions.
- **src/utils** — shared helper functions that are idempotent and have no side effects. Pure functions should not
  catch exceptions.
- **src/config.ts** — shared repository configuration. Environment variables should ALWAYS be read through config.
  `jest.setup-test-env.js` also needs to be updated when adding/changing environment variables.
- **src/types.ts** — all exported types or interfaces.
- **template.yaml** — infrastructure unique to this repository: the API Gateway, the `PostEmailFunction`/
  `PostBounceFunction` Lambdas, and their S3/SQS IAM policies.
- **.github/workflows/pipeline.yaml** — the GitHub Actions deployment pipeline for this repository.
- **endpoints.rest** — documented list of routes and expected request/response shapes.
- **events/\*.json** — example event payloads for each handler, used by tests.
- **\_\_tests\_\_/unit/\_\_mocks\_\_.ts** — mock data that is shared or too large to reasonably live in a test file
  (> 25 lines). Use typing where possible.
- **\_\_tests\_\_/unit/\*\*/\*** — test files for everything executable in src/ (excluding config and types).
- **\_\_tests\_\_/tsconfig.json** — update `paths` here when adding a new directory within src/.

## Rules for Development

- Always analyze existing patterns in the file and repository and follow them exactly.
- Use arrow functions.
- All exported functions must specify explicit types for all inputs and return values.
- Imports from within the repository are relative (e.g. `../config`); the `@config`/`@events`/`@handlers`/
  `@services`/`@types`/`@utils` aliases only resolve under `__tests__/` (see `__tests__/tsconfig.json`).
- Never log request bodies or PII — use sanitized identifiers (`log('Email queued successfully', { uuid })`, not
  the raw recipient address).

## Testing Standards

**Jest clears all mocks automatically** (`clearMocks: true` in jest.config.ts). Never manually clear mocks.

**Mock state:** Set shared defaults in `beforeAll`. Override per-test with `mockReturnValueOnce` /
`mockResolvedValueOnce` / `mockRejectedValueOnce`. Never use `beforeEach`/`afterEach` — write a named `setup()`
function if repeated arrangement is needed and call it explicitly.

**Non-determinism:** Any function that uses `Date.now()`, `Math.random()`, or `crypto.randomUUID()` to produce a
value that affects test outcomes MUST accept it as an injectable parameter with a default:

```ts
// source
export const createThing = (input: Input, now = Date.now): Thing => ({ ...input, createdAt: now() })

// test
it('sets createdAt', () => {
  expect(createThing(input, () => 1_000_000).createdAt).toBe(1_000_000)
})
```

**Fake timers:** Use `jest.useFakeTimers()` in `beforeAll` (and `jest.useRealTimers()` in `afterAll`) when the code
under test calls `setTimeout`, `setInterval`, or `Date` internally without injection.

**No `if` statements in tests.** No live `Date.now()` or `Math.random()` calls in test bodies. No date arithmetic
that depends on the current wall-clock time. Never use `jest.spyOn` — use `jest.mocked` for type-safe mocking of
already-mocked modules instead. Every exported function is tested on its own with its own `describe` block. Every
API Gateway event should have a matching JSON fixture in `events/` (create one if missing).

**Deterministic above all.** A test that passes today and fails tomorrow is broken.

## Security

**API keys are the sole access control** on this API — `Auth.ApiKeyRequired: true` on the API Gateway resource.
There is currently no throttle/quota on the usage plan; a leaked key can send unlimited email.

**Validate all external inputs.** Request bodies come from API Gateway events and are untrusted; validate shape
before writing to S3 or queuing.

**OWASP Top 10.** Primary exposure for this Lambda API: A01 Broken Access Control (API-key-as-sole-auth, no
throttling), A05 Security Misconfiguration (IAM — avoid `Resource: "*"`; the S3/SQS policies already scope to
specific resource names via the environment mapping).
