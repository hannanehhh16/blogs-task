# Placeholder Journal

A small Next.js App Router assignment: list JSONPlaceholder posts, load authors in the browser, and keep filters in the URL.

## What it does

- `/posts` is a Server Component. Posts are fetched on the server and rendered as HTML.
- Authors are loaded in the browser after that HTML is on the page. Posts stay readable while a byline is loading or has failed.
- Filters live in the query string: `?author=<id>&q=<query>`. Combined, case-insensitive search of title and body.
- Labeled search, native author `<select>`, result count, and clear-filters. Editorial layout, skip link, visible focus, and `prefers-reduced-motion`.

## Requirements

- **Node.js 20.9 or later** (Next.js 16). Developed with Node 25.6.0 and npm 11.8.0.
- npm (lockfile is committed).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /posts)
npm run build
npm start
npm run lint
npm run typecheck
npm test         # unit tests, then Playwright
npm run test:unit
npm run test:e2e
```

Playwright drives the **installed Google Chrome** (`channel: "chrome"`). Playwright’s own Chromium download is blocked in some regions. If Chrome is missing, install it or run `npx playwright install chromium`.

## Server vs client data flow

1. `getPosts()` runs on the server against `process.env.API_BASE_URL` or `https://jsonplaceholder.typicode.com`. The fetch uses `next: { revalidate: 300 }`.
2. `/posts` renders the header and a `Suspense` boundary around the URL-aware explorer. The fallback is the **full unfiltered post list** (see trade-off below).
3. After hydration, `PostsExplorer` reads `useSearchParams()`, applies `parseFilters` / `filterPosts`, and fetches authors with `useAuthors`.
4. Browser author requests always go to `https://jsonplaceholder.typicode.com/users/{id}`. `API_BASE_URL` is **not** `NEXT_PUBLIC_` and does not change those client calls.

### Authors: dependent fetch, dedupe, normalize

- Unique `userId`s are collected from the **full** post list, not the filtered subset, so changing filters does not refetch authors.
- Each id is requested at most once until a retry. Concurrent in-flight work is aborted on unmount (including React Strict Mode).
- Successful users are stored as `Record<number, User>`. Partial failure leaves other bylines in place; Retry refetches only that id.
- Failed or in-flight bylines never hide the post title or body.

## URL is the filter source of truth

There is no second “applied filters” store. The query string is parsed on each render.

| Param | Rules |
| --- | --- |
| `q` | Case-insensitive substring of title or body. Typed with `history.replaceState`. Empty/whitespace is removed. |
| `author` | Positive integer id. Combined with `q` using AND. Invalid values are ignored (all authors, with a note). Unknown ids keep the param and show an empty state. Duplicate params use the **first** value. Changing author uses `pushState`. |
| Other params and the hash | Preserved. |

Examples:

```
/posts
/posts?q=qui
/posts?author=1
/posts?author=1&q=qui
/posts?author=abc          # ignored; every post is listed
/posts?author=99           # valid id, no matching posts
/posts?utm=eval#main-content
```

Escape clears search. Clear filters removes `author` and `q` and returns focus to the search field.

## Caching: `revalidate: 300`

JSONPlaceholder posts are a read-only demo set. A five-minute ISR window serves cached HTML, limits traffic to the public API, and still picks up a change within minutes. A failed background revalidation keeps the last good page.

**A normal `npm run build` calls the live posts API.** If that host is unreachable, prerender fails. Point the **server** fetch at a fixture only when you intend to:

```bash
API_BASE_URL=http://127.0.0.1:4017 npm run build
```

Do not set this in a committed `.env` for the default app. Playwright sets `API_BASE_URL` and `NEXT_DIST_DIR=.next-test` only for its own server so `.next` stays the default production output.

## Tests

| Layer | Tool | What it covers |
| --- | --- | --- |
| `tests/unit` | Vitest | `parseFilters`, `filterPosts`, `applyFilterChanges` (case, AND, invalid/unknown/duplicate author, whitespace, hash / extra params). |
| `tests/e2e` | Playwright | Direct filtered links, refresh, Back/Forward, cursor while typing, Escape/Clear, author dedupe and retry, skip link, Tab/Shift+Tab, Space, Arrow keys on the native select, focus outline, reduced motion, no horizontal scroll. |

`tests/fixtures/posts.json` and `users.json` are the deterministic data. Playwright starts `tests/fixtures/start-test-app.mjs`, which:

1. Serves those fixtures over HTTP (so the **Next server** actually fetches posts from the fixture, not from a browser intercept).
2. Builds and starts the app on port 3177 with `API_BASE_URL` pointing at that server.

Client `/users/{id}` calls are stubbed in the browser because production code always uses the public JSONPlaceholder origin for authors.

## Suspense fallback (not filtered SSR)

`useSearchParams()` needs a `Suspense` boundary or a static production build fails. This route is prerendered **without** the request URL, so the fallback cannot know `?author=` or `?q=`.

The fallback therefore renders **every post**. Opening a filtered link (or a hard refresh) can briefly show the unfiltered list until the client explorer hydrates and applies the query string. That is a streaming/prerender trade-off, not server-rendered filtered HTML. `force-dynamic` would filter on the server and would opt the page out of static generation; this project does not do that.

## Known limits

- Author names in the `<select>` stay `Author #n` until those client fetches finish.
- `q` updates use `replaceState`, so Back does not step through each keystroke.
- Native `<select>` keyboard behavior is the browser’s (Arrow keys are covered in Playwright against installed Chrome).
- Playwright e2e expects Google Chrome on the machine running the tests.
- The live JSONPlaceholder API is required for a default production build and for client author requests outside e2e stubs.
