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
    devices: ["desktop"],
    operatingSystems: ["windows"],
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
    const [title, url, img, time_raw, last_raw, achievements_raw, size_raw] = await Promise.all([
      game.locator('span a').innerText(),
      game.locator('a').first().getAttribute('href'),
      game.locator('img').first().getAttribute('src'),
      game.locator('span:has-text("total played")').allInnerTexts(),
      game.locator('span:has-text("last played")').allInnerTexts(),
      game.locator('a:has-text("achievements") + span').allInnerTexts(),
      game.locator('span:has(+ button)').allInnerTexts(),
    ]);
    const time = time_raw.length ? time_raw[0].split('\n')[1] : undefined;
    const last = last_raw.length ? last_raw[0].split('\n')[1] : undefined;
    const achievements = achievements_raw.length ? achievements_raw[0].split('\n') : undefined;
    const size = size_raw.length ? size_raw[0] : undefined;

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
