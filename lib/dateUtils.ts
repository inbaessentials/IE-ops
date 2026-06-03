export const TIMEFRAME_OPTIONS = [
  "This Month",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last Month",
  "All Time"
];

export const isDateInTimeframe = (dateStr: string | null | undefined, timeframe: string): boolean => {
  if (!dateStr || dateStr === "N/A" || dateStr === "Unknown") return true;
  if (timeframe === "All Time") return true;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  
  // Create exact midnight objects in local time to avoid timezone edge cases
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateToCompare = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const diffTime = today.getTime() - dateToCompare.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  switch (timeframe) {
    case "Today":
      return diffDays === 0;
    case "Yesterday":
      return diffDays === 1;
    case "Last 7 Days":
      return diffDays >= 0 && diffDays <= 7;
    case "This Month":
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    case "Last Month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }
    default:
      return true;
  }
};
