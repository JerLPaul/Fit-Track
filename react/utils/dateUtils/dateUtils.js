// Small date helpers used across the diary/progress views. No date library
// dependency -- everything here operates on plain "YYYY-MM-DD" strings and
// local Date objects, which is all a per-day nutrition/weight log needs.

export function todayISO() {
    return toISODate(new Date());
}

export function toISODate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function addDays(isoDate, delta) {
    const d = new Date(`${isoDate}T00:00:00`);
    d.setDate(d.getDate() + delta);
    return toISODate(d);
}

export function formatDayLabel(isoDate) {
    const target = new Date(`${isoDate}T00:00:00`);
    const today = new Date(`${todayISO()}T00:00:00`);
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    return target.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
}

export function formatShortDate(isoDate) {
    const d = new Date(`${isoDate}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ISO week number (Mon-Sun), used to bucket entries into weekly averages.
export function isoWeekKey(isoDate) {
    const d = new Date(`${isoDate}T00:00:00`);
    const day = (d.getDay() + 6) % 7; // 0 = Monday
    d.setDate(d.getDate() - day);
    return toISODate(d); // the Monday of that week, used as a stable key
}

export function monthKey(isoDate) {
    return isoDate.slice(0, 7); // "YYYY-MM"
}

export function monthLabel(key) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function daysAgoISO(n) {
    return addDays(todayISO(), -n);
}
