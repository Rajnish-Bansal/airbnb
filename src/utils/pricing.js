import { differenceInDays } from 'date-fns';

/**
 * Calculates the detailed pricing breakdown for a booking
 * @param {Object} listing - The listing object containing pricing rules
 * @param {Date|string} startDate - Check-in date
 * @param {Date|string} endDate - Checkout date
 * @returns {Object} Price breakdown statistics
 */
export const calculateDetailedPrice = (listing, startDate, endDate) => {
  if (!listing || !startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.max(differenceInDays(end, start), 1);

  let subtotal = 0;
  let weekendNights = 0;
  let weekdayNights = 0;

  for (let i = 0; i < nights; i++) {
    const currentDay = new Date(start);
    currentDay.setDate(currentDay.getDate() + i);
    const dayOfWeek = currentDay.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

    if ((dayOfWeek === 5 || dayOfWeek === 6) && listing.weekendPrice) {
      subtotal += listing.weekendPrice;
      weekendNights++;
    } else {
      subtotal += listing.price;
      weekdayNights++;
    }
  }

  // Apply Weekly/Monthly Discounts
  let discountAmount = 0;
  let discountBadge = null;

  if (nights >= 28 && listing.discounts?.monthly > 0) {
    discountAmount = Math.round(subtotal * (listing.discounts.monthly / 100));
    discountBadge = `Monthly discount (${listing.discounts.monthly}%)`;
  } else if (nights >= 7 && listing.discounts?.weekly > 0) {
    discountAmount = Math.round(subtotal * (listing.discounts.weekly / 100));
    discountBadge = `Weekly discount (${listing.discounts.weekly}%)`;
  }

  const totalBasePrice = subtotal - discountAmount;
  
  // GST Logic: 5% if below 7500, 18% otherwise
  const gstRate = listing.price < 7500 ? 0.05 : 0.18;
  const gstAmount = Math.round(totalBasePrice * gstRate);
  
  const totalPrice = totalBasePrice + gstAmount;

  return { 
    nights,
    subtotal, 
    discountAmount, 
    discountBadge, 
    totalBasePrice, 
    gstAmount, 
    gstPercentage: gstRate * 100,
    totalPrice,
    weekendNights,
    weekdayNights
  };
};
