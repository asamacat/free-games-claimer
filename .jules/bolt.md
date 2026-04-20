## 2024-05-18 - Optimizing Playwright scraping loops
**Learning:** Sequential `.count()` followed by `.innerText()` in Playwright loops is a performance anti-pattern. Because Playwright has a client/server architecture, each `locator.count()` and `locator.innerText()` call adds round-trip IPC overhead. In large loops (e.g., hundreds of games on a single page like `steam-games.js`), this causes significant slowdowns.
**Action:** When scraping elements from a long list, batch Playwright requests concurrently using `Promise.all` alongside `.allInnerTexts()`. This extracts all matching text in a single round-trip, significantly reducing overhead.

## 2024-05-19 - Optimizing sequential element attribute extraction in Playwright
**Learning:** Even when `allInnerTexts()` isn't applicable because you need a mix of attributes, classes, and inner text from different sub-elements (like in `unrealengine.js` and `prime-gaming.js`), using sequential `await` for each locator action inside a `.map()` or loop still incurs significant IPC overhead.
**Action:** To minimize Playwright IPC overhead when processing lists of elements, use `Promise.all` with `.map()` to batch sequential locator actions (like `.innerText()` and `.getAttribute()`) concurrently instead of awaiting them one by one inside a loop.

## 2026-03-25 - Non-blocking configuration I/O
**Learning:** Performing synchronous file operations (`fs.writeFileSync`, `fs.readFileSync`) within an `async` function blocks the Node.js event loop, preventing it from handling other concurrent tasks even if the operation itself is relatively fast.
**Action:** Always prefer `fs.promises` (or `fs/promises`) for I/O operations inside `async` functions to ensure the event loop remains unblocked and the application stays responsive.
## 2025-02-17 - Minimize Playwright IPC boundary crossing
**Learning:** In Playwright, iterating over elements using `.elementHandles().map(...)` or `.all().map(...)` combined with `Promise.all()` is surprisingly slow because it incurs O(N) IPC calls across the Node/Browser boundary for properties or text reads.
**Action:** Always prefer native Playwright bulk APIs like `locator.allInnerTexts()` or `locator.evaluateAll()` which perform the evaluation completely within the browser process, returning everything in a single O(1) IPC call.
