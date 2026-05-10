// Petals by Dar uses Square Appointments for scheduling + deposits.
// Once the client sends her Square Online Booking URL, paste it into
// SQUARE_BOOKING_URL below (or set NEXT_PUBLIC_SQUARE_BOOKING_URL in
// .env.local for environment-specific values).
//
// Looks like one of:
//   https://book.squareup.com/appointments/<id>/location/<id>/services
//   https://<her-business>.square.site/s/appointments
const FALLBACK_BOOKING_URL = "https://book.squareup.com/"; // placeholder

export function squareBookingUrl(): string {
  return process.env.NEXT_PUBLIC_SQUARE_BOOKING_URL || FALLBACK_BOOKING_URL;
}

export const SQUARE_BOOKING_URL_IS_PLACEHOLDER =
  !process.env.NEXT_PUBLIC_SQUARE_BOOKING_URL;
