# Solution Overview

This document describes the approach and trade-offs taken to complete the take-home assessment.

## Backend

### 1. Non-blocking I/O

**Approach:** Extracted file access into `src/data/itemsStore.js` using `fs.promises.readFile` and `fs.promises.writeFile`. All route handlers in `items.js` are now `async` and await these operations instead of using `readFileSync` / `writeFileSync`.

**Trade-off:** Each request still reads from disk. For this JSON file store, that is acceptable. A production system might keep an in-memory copy with explicit invalidation on writes.

### 2. Stats caching

**Approach:** Added `src/services/statsCache.js` that:

- Computes stats once via `computeStats()` in `src/utils/stats.js` (reusing the existing `mean` helper).
- Serves cached results on subsequent `GET /api/stats` requests.
- Invalidates the cache when `data/items.json` changes (`fs.watch`) or when a new item is posted.

**Trade-off:** `fs.watch` can fire multiple times on some platforms and does not detect edits made by all editors. For a small local JSON file this is sufficient; production would use a database or event-driven invalidation.

Also fixed the incorrect `DATA_PATH` in the original stats route (it pointed to `backend/data/` instead of the project root `data/` folder).

### 3. Pagination and search

**Approach:** `GET /api/items` accepts `q`, `page`, and `limit` query params and returns:

```json
{ "items": [...], "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
```

Search is a case-insensitive substring match on `name`. `limit` is capped at 100.

**Trade-off:** Linear scan over the full dataset per request. Fine for demo scale; at large scale you'd index names (database full-text search, Elasticsearch, etc.).

### 4. Testing

**Approach:** Extracted the Express app into `src/app.js` so tests can import it without starting a server. Jest + Supertest cover happy paths and error cases for list, detail, and create routes. The data layer is mocked to keep tests fast and isolated.

---

## Frontend

### 1. Memory leak fix

**Approach:** `DataContext.fetchItems` uses an `AbortController`. Each new fetch aborts the previous one, and state is only updated when the signal is not aborted. `ItemDetail` uses the same pattern.

**Trade-off:** Aborted requests still hit the network briefly. An alternative is ignoring stale responses via a request ID counter; `AbortController` is the standard browser API and integrates cleanly with `fetch`.

### 2. Pagination and search

**Approach:** The items page debounces search input (300 ms), resets to page 1 on new queries, and calls `/api/items?q=&page=&limit=`. Pagination controls disable while loading.

**Trade-off:** Debounce adds a small delay before searching. This reduces API churn while typing.

### 3. Virtualization

**Approach:** Integrated `react-window`'s `FixedSizeList` so only visible rows render, keeping the DOM small even when a page returns many items.

**Trade-off:** Fixed row height (48 px) simplifies virtualization but assumes uniform row layout. Variable-height lists would need `VariableSizeList` and measured heights.

### 4. UI/UX

**Approach:** Added a simple stylesheet with loading skeletons, error banner, accessible labels, pagination status, and a cleaner item detail layout. Configured the CRA `proxy` so all API calls use relative `/api` paths.

---

## Running tests

```bash
cd backend && npm install && npm test
cd frontend && npm install && npm test
```

Both suites run non-interactively in CI mode.
