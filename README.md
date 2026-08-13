# Career OS

One AI career brain: discovery, matching, resume, applications, interview prep
and career planning feeding a single profile — not ten tools bolted together.

```
career-os/
├── web/          Next.js 15 · React 19 · TypeScript (strict) · Tailwind
│   └── src/
│       ├── app/          routes + the REST API both clients call
│       ├── components/   shared UI
│       ├── lib/          client-safe data helpers
│       ├── server/       repository, HTTP helpers, AI layer (server-only)
│       ├── services/     typed fetch client
│       ├── styles/       the design system
│       └── types/        THE API CONTRACT
└── mobile/       Flutter · Dart · Material 3 · Riverpod · GoRouter
    └── lib/
        ├── core/         theme, router, network
        ├── features/     one folder per feature
        └── shared/       models (Dart mirror of the contract), widgets
```

---

## Run it

**Web** — the backend and the website are the same process.

```bash
cd career-os/web && npm install && npm run dev
```

`http://localhost:3000`

**Mobile** — needs the web app running first, since it calls the same API.

```bash
cd career-os/mobile && flutter pub get && flutter run
```

The Android emulator reaches your machine on `10.0.2.2`, which is the default.
For a real device or iOS:

```bash
flutter run --dart-define=API_BASE_URL=http://<your-lan-ip>:3000
```

---

## Architecture

Both clients talk to one backend. Business logic lives there, never duplicated
into a client.

```
  Next.js web ─┐
               ├─→  REST API  ─→  repository  ─→  database
  Flutter app ─┘        │
                        └─→  AI layer (provider key never leaves the server)
```

`web/src/types/api.ts` is the contract. `mobile/lib/shared/models/models.dart`
mirrors it field for field. Change one, change the other in the same commit.

### Endpoints

```
GET    /api/jobs                 ?minMatch= &remote= &q= &page=
GET    /api/jobs/:id
GET    /api/jobs/matches
GET    /api/applications         ?stage=
POST   /api/applications         { jobId }
POST   /api/resume/analyze
POST   /api/resume/tailor        { jobId }
POST   /api/interview/start      { mode }
POST   /api/interview/answer     { sessionId, text, final? }
GET    /api/career/intelligence
GET    /api/companies/:id
GET    /api/profile
GET    /api/notifications
GET    /api/autopilot
PATCH  /api/autopilot
POST   /api/ai/chat              { message }
```

One envelope, always:

```jsonc
{ "ok": true,  "data": …, "meta": { "page": 1, "hasMore": false } }
{ "ok": false, "error": { "code": "rate_limited", "message": "…", "retryAfterSeconds": 60 } }
```

Error codes: `unauthorized` `forbidden` `not_found` `validation_failed`
`rate_limited` `upstream_unavailable` `internal`. Every `message` is written to
be shown to a person — no client ever renders a status code or a stack trace.

Both clients model the same six states: loading, success, empty, error,
unauthorized, rate limited.

---

## Design language

One accent (**Iris** `#5B47FF`) carries every interactive affordance. A second
colour (**Signal**, an acid lime) is reserved exclusively for *the agent is
live* — never decorative, so its presence always means the same thing. Neutrals
are warm rather than blue-grey, which is what keeps the surface from reading as
a corporate dashboard.

Tokens are defined twice and kept identical:

- `web/src/styles/globals.css` — CSS custom properties
- `mobile/lib/core/theme/tokens.dart` — the same values as Dart constants

Dark mode is deep charcoal (`#0D0D10`), never pure black.

The signature element is **Match DNA**: eight axes drawn as a radial polygon,
implemented as inline SVG on web (`components/Primitives.tsx`) and as a
`CustomPainter` on mobile (`features/jobs/match_dna.dart`). A single percentage
hides the one weak axis that decides the outcome, so no screen shows a match
number without the shape that produced it.

---

## Security

- The AI provider key is read only in `web/src/server/ai.ts`. It is never
  exported, never prefixed `NEXT_PUBLIC_`, and never shipped to either client.
  Mobile reaches the model through the REST API, same as web.
- Every repository read takes a `userId` — that is where per-user isolation is
  enforced, so no handler can serve another user's career data.
- Mobile stores its access token in the Keychain / EncryptedSharedPreferences
  via `flutter_secure_storage`, never in plain preferences.
- Input is validated server-side on every write. `dailyCap` and `minMatch` are
  clamped in the handler, so a client cannot raise its own submission ceiling.
- Rate limits are per identity per route, tighter on writes than reads.

---

## Accessibility

Keyboard navigation throughout, `aria-*` on every interactive control, visible
focus rings, WCAG-compliant contrast in both themes, and
`prefers-reduced-motion` honoured — the tally sweeps, the pulse and the Match
DNA reveal all stop. Flutter mirrors this with `Semantics` widgets, a clamped
`textScaler`, and `MediaQuery.disableAnimations` checks.

---

## What is real and what is not

The **UI, the API contract, the envelopes, validation, rate limiting, error
handling, routing, theming and both clients** are real code and run.

Standing in for production systems:

- **Data.** `web/src/lib/data.ts` is a hand-written sample set. Every number on
  every screen comes from it. Replace `web/src/server/repository.ts` with real
  queries — nothing above it changes.
- **The model.** `web/src/server/ai.ts` has all eight capabilities defined with
  typed inputs and outputs, and one `complete()` seam. It returns deterministic
  results so the product is fully demonstrable with no key and no spend. Wire a
  real call inside `complete()` and every caller keeps working.
- **Auth.** `identify()` in `web/src/server/http.ts` accepts a fixed identity so
  both clients run without a login server. Every handler already routes its
  data access through the returned `userId`, so replacing the body with real
  session verification is the whole change. Login, OTP and Google sign-in
  screens are not built.
- **The database.** No migrations or ORM. The models the contract implies are
  documented in `types/api.ts`.
