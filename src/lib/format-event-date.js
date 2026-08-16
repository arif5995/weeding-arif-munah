/**
 * Formats a date string into Indonesian format
 * @param {string} isoString - The ISO date string to format
 * @param {('full'|'short'|'time')} [format='full'] - The format type to use
 * @param {boolean} [isJakartaTime=false] - Whether the input is already in Jakarta time
 * @returns {string} The formatted date string in Indonesian
 *
 * @example
 * // returns "Senin, 1 Januari 2024"
 * formatEventDate("2024-01-01T00:00:00.000Z", "full")
 *
 * // returns "1 Januari 2024"
 * formatEventDate("2024-01-01T00:00:00.000Z", "short")
 *
 * // returns "00:00"
 * formatEventDate("2024-01-01T00:00:00.000Z", "time")
 */
export const formatEventDate = (
  isoString,
  format = "full",
  isJakartaTime = false,
) => {
  let date = new Date(isoString);

  // If the timestamp is already in Jakarta time (from API), we need to adjust it
  // because JavaScript Date constructor assumes UTC for ISO strings
  if (isJakartaTime && isoString && !isoString.endsWith("Z")) {
    // Add 'Z' to treat it as UTC, then it will be converted correctly to Jakarta time
    date = new Date(isoString + "Z");
  }

  const formats = {
    full: {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    },
    short: {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    },
  };

  // Indonesian month names mapping
  const monthsIndonesian = {
    January: "Januari",
    February: "Februari",
    March: "Maret",
    April: "April",
    May: "Mei",
    June: "Juni",
    July: "Juli",
    August: "Agustus",
    September: "September",
    October: "Oktober",
    November: "November",
    December: "Desember",
  };

  // Indonesian day names mapping
  const daysIndonesian = {
    Sunday: "Minggu",
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
  };

  let formatted = date.toLocaleDateString("en-US", formats[format]);

  // Handle time format separately
  if (format === "time") {
    return date.toLocaleTimeString("en-US", formats[format]);
  }

  // Replace English month and day names with Indonesian ones
  Object.keys(monthsIndonesian).forEach((english) => {
    formatted = formatted.replace(english, monthsIndonesian[english]);
  });

  Object.keys(daysIndonesian).forEach((english) => {
    formatted = formatted.replace(english, daysIndonesian[english]);
  });

  // Format adjustment for full date
  if (format === "full") {
    // Convert "Hari, Tanggal Bulan Tahun" format
    const parts = formatted.split(", ");
    if (parts.length === 2) {
      formatted = `${parts[0]}, ${parts[1]}`;
    }
  }

  return formatted;
};

/**
 * Formats a date string into separate date parts for flexible layout
 * @param {string} isoString - The ISO date string to format
 * @param {boolean} [isJakartaTime=false] - Whether the input is already in Jakarta time
 * @returns {object} Object with { day, date, month, year } properties
 *
 * @example
 * // returns { day: "Saturday", date: "14", month: "December", year: "2024" }
 * formatEventDateParts("2024-12-14T00:00:00.000Z")
 */
export const formatEventDateParts = (isoString, isJakartaTime = false) => {
  let date = new Date(isoString);

  if (isJakartaTime && isoString && !isoString.endsWith("Z")) {
    date = new Date(isoString + "Z");
  }

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Jakarta",
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "Asia/Jakarta",
  });

  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return {
    day: dayFormatter.format(date),
    date: dateFormatter.format(date),
    month: monthFormatter.format(date),
    year: yearFormatter.format(date),
  };
};
