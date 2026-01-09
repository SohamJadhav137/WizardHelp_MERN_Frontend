export const formatChatTimestamp = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  const now = new Date();

  // Start of today
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Start of yesterday
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Start of this week (Sunday)
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  // Today → time
  if (date >= startOfToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  // Yesterday
  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  // This week → weekday
  if (date >= startOfWeek) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  // This year → month
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short" });
  }

  // Older → year
  return date.getFullYear().toString();
};
