const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export type PickupDate = {
  iso: string;
  label: string;
};

export function rollingPickupDates(from: Date = new Date(), days = 7): PickupDate[] {
  const out: PickupDate[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
    out.push({ iso, label });
  }
  return out;
}

export const PICKUP_TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"] as const;
export type PickupTime = (typeof PICKUP_TIMES)[number];
