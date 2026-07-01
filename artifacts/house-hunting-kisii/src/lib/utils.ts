import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, pricePeriod: string, listingType: string): string {
  const formatted = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
  if (listingType === "rent") {
    const period = pricePeriod === "per_month" ? "/mo" : pricePeriod === "per_year" ? "/yr" : "";
    return `${formatted}${period}`;
  }
  return formatted;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });
}
