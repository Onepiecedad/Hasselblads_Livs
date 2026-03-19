export type PortionSize = "hel" | "halv" | "kvart";

export const PORTION_LABELS: Record<PortionSize, string> = {
  hel: "Hel",
  halv: "Halv",
  kvart: "Kvart",
};

export const PORTION_ORDER: PortionSize[] = ["hel", "halv", "kvart"];

export const PORTION_MULTIPLIERS: Record<PortionSize, number> = {
  hel: 1,
  halv: 0.5,
  kvart: 0.25,
};
