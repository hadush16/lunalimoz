const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 300;
const MAX_NOTE_LENGTH = 1000;

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function truncate(input: string, maxLength: number): string {
  return input.length > maxLength ? input.slice(0, maxLength) : input;
}

export function validateCoordinate(value: number, type: "lat" | "lng"): boolean {
  if (type === "lat") return value >= -90 && value <= 90;
  return value >= -180 && value <= 180;
}

export function validatePositiveNumber(value: number): boolean {
  return value > 0 && isFinite(value);
}

export function sanitizeName(name: string): string {
  return truncate(sanitizeInput(name), MAX_NAME_LENGTH);
}

export function sanitizeAddress(address: string): string {
  return truncate(sanitizeInput(address), MAX_ADDRESS_LENGTH);
}

export function sanitizeNote(note: string): string {
  return truncate(sanitizeInput(note), MAX_NOTE_LENGTH);
}
