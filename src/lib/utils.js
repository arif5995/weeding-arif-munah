export function cn(...inputs) {
  const classes = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    } else if (typeof input === "object") {
      // Dukung syntax { "nama-class": kondisiBoolean }
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}