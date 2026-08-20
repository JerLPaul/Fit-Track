import { isoWeekKey, monthKey, monthLabel, formatShortDate } from '../dateUtils/dateUtils';

// Turns a flat list of { date, calories, fat, carbs, protein, count } food
// entries into one row per day with day totals, sorted chronologically.
export function dailyCalorieTotals(entries) {
    const byDate = new Map();
    for (const e of entries) {
        const totals = byDate.get(e.date) || { date: e.date, calories: 0, fat: 0, carbs: 0, protein: 0 };
        totals.calories += e.calories * e.count;
        totals.fat += e.fat * e.count;
        totals.carbs += e.carbs * e.count;
        totals.protein += e.protein * e.count;
        byDate.set(e.date, totals);
    }
    return Array.from(byDate.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, label: formatShortDate(d.date), calories: Math.round(d.calories) }));
}

// Buckets daily totals into ISO weeks and averages calories across the days
// that actually have entries (not every calendar day in the week).
export function weeklyAverages(dailyTotals) {
    const byWeek = new Map();
    for (const day of dailyTotals) {
        const key = isoWeekKey(day.date);
        const bucket = byWeek.get(key) || { key, total: 0, count: 0 };
        bucket.total += day.calories;
        bucket.count += 1;
        byWeek.set(key, bucket);
    }
    return Array.from(byWeek.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((w) => ({
            label: `Wk of ${formatShortDate(w.key)}`,
            average: Math.round(w.total / w.count),
        }));
}

export function monthlyAverages(dailyTotals) {
    const byMonth = new Map();
    for (const day of dailyTotals) {
        const key = monthKey(day.date);
        const bucket = byMonth.get(key) || { key, total: 0, count: 0 };
        bucket.total += day.calories;
        bucket.count += 1;
        byMonth.set(key, bucket);
    }
    return Array.from(byMonth.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((m) => ({
            label: monthLabel(m.key),
            average: Math.round(m.total / m.count),
        }));
}

export function weightSeries(weightEntries) {
    return [...weightEntries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((w) => ({ label: formatShortDate(w.date), weight: w.weight, date: w.date }));
}

export function weightWeeklyAverages(weightEntries) {
    const byWeek = new Map();
    for (const w of weightEntries) {
        const key = isoWeekKey(w.date);
        const bucket = byWeek.get(key) || { key, total: 0, count: 0 };
        bucket.total += w.weight;
        bucket.count += 1;
        byWeek.set(key, bucket);
    }
    return Array.from(byWeek.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((w) => ({
            label: `Wk of ${formatShortDate(w.key)}`,
            average: Math.round((w.total / w.count) * 10) / 10,
        }));
}

export function weightMonthlyAverages(weightEntries) {
    const byMonth = new Map();
    for (const w of weightEntries) {
        const key = monthKey(w.date);
        const bucket = byMonth.get(key) || { key, total: 0, count: 0 };
        bucket.total += w.weight;
        bucket.count += 1;
        byMonth.set(key, bucket);
    }
    return Array.from(byMonth.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((m) => ({
            label: monthLabel(m.key),
            average: Math.round((m.total / m.count) * 10) / 10,
        }));
}
