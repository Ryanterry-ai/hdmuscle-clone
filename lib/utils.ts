import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const USD_TO_INR = 92.5;

export function formatPrice(priceInUSD: number): string {
  const priceInINR = priceInUSD * USD_TO_INR;
  return `₹${priceInINR.toFixed(2)}`;
}

export function formatPriceWithPrefix(priceInUSD: number, prefix: string = ""): string {
  const priceInINR = priceInUSD * USD_TO_INR;
  return `${prefix}₹${priceInINR.toFixed(2)}`;
}
