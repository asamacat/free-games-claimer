## 2024-05-24 - Batching Playwright CDP locator properties
**Learning:** Sequential `.innerText()` and `.getAttribute()` Playwright calls over elements of an array (e.g. from `.all()`) cause severe CDP round-trip IPC overhead. In large loops, this results in significant delays.
**Action:** When scraping properties from Playwright locators mapped over lists, batch the queries concurrently via `Promise.all` with destructured array assignments `const [prop1, prop2] = await Promise.all([loc1, loc2])`.
