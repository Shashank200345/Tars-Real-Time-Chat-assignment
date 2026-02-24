import { format, isToday, isThisYear } from "date-fns";

export function formatMessageTime(timestamp: number): string {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a"); // e.g., "2:34 PM"
    }

    if (isThisYear(date)) {
        return format(date, "MMM d"); // e.g., "Feb 15"
    }

    return format(date, "MM/dd/yy"); // e.g., "02/15/23"
}
