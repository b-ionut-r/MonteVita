export const currency = (value: number, compact = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: compact && Math.abs(value) >= 100000 ? 'compact' : 'standard'
  }).format(value);

export const number = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value);

export const percent = (value: number, digits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: digits
  }).format(value);
