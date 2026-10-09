// Date helpers. Teaches: working with ISO strings.
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
export const daysBetween = (a, b) => Math.round((new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0)) / 864e5);
export function relativeTime(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)} min ago`; if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
    const d = daysBetween(iso, new Date()); return d === 1 ? 'yesterday' : `${d} days ago`
}
