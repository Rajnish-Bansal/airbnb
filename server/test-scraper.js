const { scrapeAirbnb } = require('./services/scraper');

const testUrl = 'https://www.airbnb.co.in/rooms/1179561449466069929?check_in=2026-04-17&check_out=2026-04-18&search_mode=regular_search&source_impression_id=p3_1775986237_P3r-JLA25nlmix71&previous_page_section_name=1000&federated_search_id=b97670a9-a0b6-4172-867e-5a339f573411';

async function testScraper() {
  try {
    console.log('--- Starting Scraper Test ---');
    console.log(`URL: ${testUrl}\n`);
    
    const startTime = Date.now();
    const data = await scrapeAirbnb(testUrl);
    const duration = (Date.now() - startTime) / 1000;

    console.log(`\n--- Scrape Success (${duration}s) ---`);
    console.log(`Title: ${data.title}`);
    console.log(`Location: ${data.location}`);
    console.log(`Price: ${data.price}`);
    console.log(`Photos: ${data.photos.length} found`);
    console.log(`Amenities: ${data.amenities.join(', ')}`);
    console.log(`Guests: ${data.guests}, Bedrooms: ${data.bedrooms}, Beds: ${data.beds}, Baths: ${data.bathrooms}`);
    console.log('----------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('\n--- Scrape Failed ---');
    console.error(err.message);
    console.error(err.stack);
    console.log('----------------------------');
    process.exit(1);
  }
}

testScraper();
