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

    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const data = await page.evaluate(() => {
      const script = document.querySelector('script#data-deferred-state-0');
      if (!script) return 'NOT FOUND';
      const parsed = JSON.parse(script.textContent);
      const niobe = parsed.niobeClientData || [];
      
      // Find the PdpSections data
      const pdp = niobe.find(item => item[0].includes('StaysPdpSections'));
      if (!pdp) return 'PDP NOT FOUND';
      
      const payload = pdp[1]?.data?.presentation?.stayProductDetailPage;
      if (!payload) return 'PAYLOAD NOT FOUND';
      
      const metadata = payload.sections?.metadata?.sharingConfig || {};
      const sections = payload.sections?.sections || [];
      
      return {
        title: metadata.title,
        location: metadata.location,
        priceSection: sections.find(s => s.sectionId === 'BOOK_IT_FLOATING_FOOTER')?.section?.structuredDisplayPrice?.primaryLine?.price,
        photosCount: sections.find(s => s.sectionId === 'PHOTO_TOUR_DEFAULT')?.section?.mediaItems?.length
      };
    });

    console.log('--- Parsed Data ---');
    console.log(JSON.stringify(data, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

debugScraper();
