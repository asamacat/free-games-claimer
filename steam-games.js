import { firefox } from 'playwright-firefox'; // stealth plugin needs no outdated playwright-extra
import { jsonDb, prompt } from './src/util.js';
import { cfg } from './src/config.js';

const db = await jsonDb('steam-games.json', {});

const user = cfg.steam_id || await prompt({ message: 'Enter Steam community id ("View my profile", then copy from URL)' });

// using https://github.com/apify/fingerprint-suite worked, but has no launchPersistentContext...
// from https://github.com/apify/fingerprint-suite/issues/162
import { FingerprintInjector } from 'fingerprint-injector';
import { FingerprintGenerator } from 'fingerprint-generator';

const { fingerprint, headers } = new FingerprintGenerator().getFingerprint({
  devices: ['desktop'],
  operatingSystems: ['windows'],
});

const context = await firefox.launchPersistentContext(cfg.dir.browser, {
  headless: cfg.headless,
  // viewport: { width: cfg.width, height: cfg.height },
  locale: 'en-US', // ignore OS locale to be sure to have english text for locators -> done via /en in URL
  userAgent: fingerprint.navigator.userAgent,
  viewport: {
    width: fingerprint.screen.width,
    height: fingerprint.screen.height,
  },
  extraHTTPHeaders: {
    'accept-language': headers['accept-language'],
  },
});
// await stealth(context);
await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });

context.setDefaultTimeout(cfg.debug ? 0 : cfg.timeout);

const page = context.pages().length ? context.pages()[0] : await context.newPage(); // should always exist

try {
  await page.goto(`https://steamcommunity.com/id/${user}/games?tab=all`);
  const games = page.locator('div[data-featuretarget="gameslist-root"] > div.Panel > div.Panel > div');
  await games.last().waitFor();
  await page.keyboard.press('End');
  await page.waitForLoadState('networkidle');
  console.log('All Games:', await games.count());
  for (const game of await games.all()) {
    let time, last, achievements, size;
    // Bolt: Optimized sequential Playwright locator lookups with Promise.all and allInnerTexts
    // By requesting elements concurrently, we save significant overhead avoiding repeated IPC boundary crossing
    const [titleTexts, timeTexts, lastTexts, achievementTexts, sizeTexts, url, img] = await Promise.all([
      game.locator('span a').innerText(),
      game.locator('span:has-text("total played")').allInnerTexts(),
      game.locator('span:has-text("last played")').allInnerTexts(),
      game.locator('a:has-text("achievements") + span').allInnerTexts(),
      game.locator('span:has(+ button)').allInnerTexts(),
      game.locator('a').first().getAttribute('href'),
      game.locator('img').first().getAttribute('src'),
    ]);

    const title = titleTexts;
    if (timeTexts.length) time = timeTexts[0].split('\n')[1];
    if (lastTexts.length) last = lastTexts[0].split('\n')[1];
    if (achievementTexts.length) achievements = achievementTexts[0].split('\n');
    if (sizeTexts.length) size = sizeTexts[0];

    const stat = { title, time, last, achievements, size, url, img };
    console.log(stat);
    db.data[title] = stat;
  }

  // await page.pause();
} catch (error) {
  process.exitCode ||= 1;
  console.error('--- Exception:');
  console.error(error); // .toString()?
} finally {
  await db.write(); // write out json db
}
if (page.video()) console.log('Recorded video:', await page.video().path());
await context.close();
