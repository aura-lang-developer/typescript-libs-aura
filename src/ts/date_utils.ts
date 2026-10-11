// ==============================================================================
// Settlement Date & Business Day Engine (using NPM `date-fns`)
// ==============================================================================

import { format, addDays, isWeekend, parseISO } from "date-fns";

export interface SettlementWindow {
  tradeDate: string;
  settlementDate: string;
  isBusinessDay: boolean;
  daysToSettle: number;
}

/**
 * Returns the current ISO-8601 UTC timestamp.
 */
export function getIsoTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculates financial T+N settlement window, skipping weekend days.
 */
export function calculateSettlementWindow(
  tradeDateIso: string,
  daysAhead: number
): SettlementWindow {
  const baseDate = parseISO(tradeDateIso);
  let settled = baseDate;
  let remainingDays = daysAhead;

  while (remainingDays > 0) {
    settled = addDays(settled, 1);
    if (!isWeekend(settled)) {
      remainingDays -= 1;
    }
  }

  return {
    tradeDate: format(baseDate, "yyyy-MM-dd HH:mm:ss"),
    settlementDate: format(settled, "yyyy-MM-dd"),
    isBusinessDay: !isWeekend(settled),
    daysToSettle: daysAhead,
  };
}

/**
 * Formats an ISO string into human readable financial date.
 */
export function formatDisplayDate(isoDate: string): string {
  const parsed = parseISO(isoDate);
  return format(parsed, "MMM dd, yyyy");
}
