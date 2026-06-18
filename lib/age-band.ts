export type AgeBand = "6-8" | "9-11" | "12-14" | "15+";

export function calculateAgeBand(dateOfBirth: Date | string): AgeBand {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age >= 6 && age <= 8) return "6-8";
  if (age >= 9 && age <= 11) return "9-11";
  if (age >= 12 && age <= 14) return "12-14";
  return "15+";
}

export function getAgeBandLabel(ageBand: AgeBand): string {
  return {
    "6-8": "Ages 6-8",
    "9-11": "Ages 9-11",
    "12-14": "Ages 12-14",
    "15+": "Ages 15+",
  }[ageBand];
}

export function getAgeBandColor(ageBand: AgeBand): string {
  return {
    "6-8": "bg-yellow-100 text-yellow-800",
    "9-11": "bg-blue-100 text-blue-800",
    "12-14": "bg-purple-100 text-purple-800",
    "15+": "bg-orange-100 text-orange-800",
  }[ageBand];
}
