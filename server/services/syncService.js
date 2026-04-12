const ical = require('node-ical');
const cron = require('node-cron');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

/**
 * Synchronizes external calendars for all listings that have an iCal URL.
 */
async function syncAllCalendars() {
  console.log('[Sync] Starting iCal synchronization...');
  try {
    const listings = await Listing.find({ icalUrl: { $exists: true, $ne: '' } });
    
    for (const listing of listings) {
      await syncListingCalendar(listing);
    }
    console.log('[Sync] Synchronization complete.');
  } catch (err) {
    console.error('[Sync Error]:', err);
  }
}

/**
 * Syncs a single listing's calendar from its icalUrl.
 */
async function syncListingCalendar(listing) {
  try {
    const events = await ical.async.fromURL(listing.icalUrl);
    
    for (const k in events) {
      const event = events[k];
      if (event.type !== 'VEVENT') continue;

      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      const uid = event.uid || `ical-${k}`;

      // Check if we already have this external block
      const existing = await Booking.findOne({ code: uid });
      if (existing) continue;

      // Create a "Blocked" booking to represent external reservations
      const blockedBooking = new Booking({
        user: listing.host?._id || null, // Blocked by host's external calendar
        listing: listing._id,
        dates: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        startDate,
        endDate,
        guests: { adults: 1, children: 0 },
        totalPrice: 0,
        status: 'Confirmed', // Treat as confirmed to block the dates
        code: uid
      });

      await blockedBooking.save();
      console.log(`[Sync] Blocked dates for ${listing.location}: ${startDate.toDateString()} - ${endDate.toDateString()}`);
    }
  } catch (err) {
    console.error(`[Sync Error] Failed for listing ${listing._id}:`, err.message);
  }
}

// Schedule sync every hour
cron.schedule('0 * * * *', syncAllCalendars);

module.exports = {
  syncAllCalendars
};
