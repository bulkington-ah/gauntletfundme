export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainValidationError";
  }
}

export const requireNonEmptyString = (
  value: string,
  fieldName: string,
): string => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new DomainValidationError(`${fieldName} is required.`);
  }

  return normalizedValue;
};

export const normalizeEmail = (value: string): string => {
  const normalizedValue = requireNonEmptyString(value, "email").toLowerCase();

  if (!normalizedValue.includes("@")) {
    throw new DomainValidationError("email must be valid.");
  }

  return normalizedValue;
};

export const normalizeSlug = (value: string, fieldName: string): string => {
  const normalizedValue = requireNonEmptyString(value, fieldName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedValue) {
    throw new DomainValidationError(`${fieldName} must include letters or numbers.`);
  }

  return normalizedValue;
};

export const requirePositiveInteger = (
  value: number,
  fieldName: string,
): number => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new DomainValidationError(`${fieldName} must be a positive integer.`);
  }

  return value;
};

export const requireDate = (value: Date, fieldName: string): Date => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainValidationError(`${fieldName} must be a valid date.`);
  }

  return value;
};
