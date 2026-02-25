export function formatDate(input: string | Date) {
    const d = typeof input === "string" ? new Date(input) : input
  
    if (Number.isNaN(d.getTime())) return ""
  
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }