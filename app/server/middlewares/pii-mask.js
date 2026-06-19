export function maskPii(text = "") {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "***")
    .replace(/01[016789]-?\d{3,4}-?\d{4}/g, "***")
    .replace(/\d{2,3}-\d{3,4}-\d{4}/g, "***");
}
