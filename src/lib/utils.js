import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const toUTCDate = (date) => {
  return new Date(new Date(date).toLocaleString("en-US", { timeZone: "UTC" }));
};
