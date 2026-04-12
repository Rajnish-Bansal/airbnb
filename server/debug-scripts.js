const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const testUrl = 'https://www.airbnb.co.in/rooms/1179561449466069929';

async function debugScraper() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Visiting: ${testUrl}`);
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const scripts = await page.evaluate(() => {
      const allScripts = Array.from(document.querySelectorAll('script'));
      return allScripts.map(s => ({
        id: s.id,
        hasNiobe: s.textContent.includes('niobe'),
        hasInitialState: s.textContent.includes('__INITIAL_STATE__'),
        length: s.textContent.length,
        snippet: s.textContent.slice(0, 100)
      })).filter(s => s.hasNiobe || s.hasInitialState || s.id);
    });

    console.log('--- Script Tags Found ---');
    console.log(JSON.stringify(scripts, null, 2));
    
    // Check if we can see the title in the DOM
    const title = await page.$eval('h1', el => el.textContent).catch(() => 'Title NOT found');
    console.log(`DOM Title: ${title}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

debugScraper();
