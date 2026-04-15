export const generateICalData = (reservations, listings, selectedListingId) => {
  const formatDate = (dateString) => {
    // Convert YYYY-MM-DD to YYYYMMDD
    return dateString.replace(/-/g, '');
  };

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hostify//Host Dashboard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  reservations.forEach(res => {
    // Filter logic
    if (selectedListingId !== 'all' && res.listingId != selectedListingId) return;

    const listing = listings.find(l => l.id === res.listingId);
    const summary = `Stay at ${listing?.title || 'Hostify Listing'} - ${res.guest}`;
    const description = `Guest: ${res.guest}\\nPrice: ${res.price}\\nStatus: ${res.status}`;
    
    // Create unique UID
    const uid = `res-${res.id}-${now}@Hostifyclone.com`;

    // Add VEVENT
    icalContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatDate(res.startDate)}`,
      `DTEND;VALUE=DATE:${formatDate(res.endDate)}`, // Note: iCal end dates are exclusive, usually +1 day, but for simple visualization this works or we might need to add 1 day if exactness matters. 
      // For now, using provided end date. If end date is checkout, it works as exclusive for full day events.
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icalContent.push('END:VCALENDAR');

  return icalContent.join('\r\n');
};
