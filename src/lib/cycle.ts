import { db } from "@/lib/db";
import { userSettings, paydayOverrides } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_PAYDAY = 25;

async function getDefaultPayday(userId: string) {
  const rows = await db
    .select({ defaultPayday: userSettings.defaultPayday })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  return rows[0]?.defaultPayday ?? DEFAULT_PAYDAY;
}

// The payday that occurred during calendar month/year, clamped to that month's length.
async function getPaydayDate(userId: string, year: number, month: number) {
  const overrideRows = await db
    .select({ payday: paydayOverrides.payday })
    .from(paydayOverrides)
    .where(
      and(
        eq(paydayOverrides.userId, userId),
        eq(paydayOverrides.year, year),
        eq(paydayOverrides.month, month),
      ),
    );

  const day = overrideRows[0]?.payday ?? (await getDefaultPayday(userId));
  const lastDay = new Date(year, month, 0).getDate();
  return new Date(year, month - 1, Math.min(day, lastDay));
}

// The cycle labeled `month`/`year` runs from the payday in the previous calendar
// month through the day before the payday in `month`/`year`.
export async function getCycleRange(userId: string, year: number, month: number) {
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const from = await getPaydayDate(userId, prevYear, prevMonth);
  from.setHours(0, 0, 0, 0);

  const to = await getPaydayDate(userId, year, month);
  to.setDate(to.getDate() - 1);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

// Which cycle label (year/month) "now" currently falls into. Once this
// month's payday has passed, the active cycle rolls forward to next month's label.
export async function getCurrentCycleLabel(userId: string) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  const payday = await getPaydayDate(userId, year, month);
  if (now >= payday) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { year, month };
}
