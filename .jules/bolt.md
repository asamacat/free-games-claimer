## 2024-05-18 - Optimizing Playwright scraping loops
**Learning:** Sequential `.count()` followed by `.innerText()` in Playwright loops is a performance anti-pattern. Because Playwright has a client/server architecture, each `locator.count()` and `locator.innerText()` call adds round-trip IPC overhead. In large loops (e.g., hundreds of games on a single page like `steam-games.js`), this causes significant slowdowns.
**Action:** When scraping elements from a long list, batch Playwright requests concurrently using `Promise.all` alongside `.allInnerTexts()`. This extracts all matching text in a single round-trip, significantly reducing overhead.

## 2024-05-19 - Optimizing sequential element attribute extraction in Playwright
**Learning:** Even when `allInnerTexts()` isn't applicable because you need a mix of attributes, classes, and inner text from different sub-elements (like in `unrealengine.js` and `prime-gaming.js`), using sequential `await` for each locator action inside a `.map()` or loop still incurs significant IPC overhead.
**Action:** To minimize Playwright IPC overhead when processing lists of elements, use `Promise.all` with `.map()` to batch sequential locator actions (like `.innerText()` and `.getAttribute()`) concurrently instead of awaiting them one by one inside a loop.

## 2026-03-25 - Non-blocking configuration I/O
**Learning:** Performing synchronous file operations (`fs.writeFileSync`, `fs.readFileSync`) within an `async` function blocks the Node.js event loop, preventing it from handling other concurrent tasks even if the operation itself is relatively fast.
**Action:** Always prefer `fs.promises` (or `fs/promises`) for I/O operations inside `async` functions to ensure the event loop remains unblocked and the application stays responsive.

## 2026-04-06 - Reducing IPC latency for Playwright arrays
**Learning:** Using `Promise.all` alongside `locator.elementHandles().map()` or `locator.all().map()` inside Playwright scripts still requires crossing the Inter-Process Communication (IPC) boundary for *each* element in the array to evaluate methods like `getAttribute` or `innerText`. This makes the latency O(N).
**Action:** To reduce Playwright IPC latency to O(1) when scraping properties from lists of elements, use native batch methods like `locator.evaluateAll()` or `locator.allInnerTexts()` to execute directly in the browser context rather than fetching handles sequentially.