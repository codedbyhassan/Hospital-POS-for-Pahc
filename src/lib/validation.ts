// Input validation utilities for PAHC POS system

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

// Patient name validation - allows letters, spaces, hyphens, apostrophes, and Unicode letters
const PATIENT_NAME_PATTERN = /^[\p{L}\s\-']+$/u;

// Amount validation - positive numbers with up to 2 decimal places
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

// Product name validation - allows alphanumeric, spaces, and common symbols
const PRODUCT_NAME_PATTERN = /^[a-zA-Z0-9\s\-_()[\]{}.,&]+$/;

export const validatePatientName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Patient name is required" };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Patient name must be at least 2 characters" };
  }

  if (name.length > 100) {
    return { isValid: false, error: "Patient name cannot exceed 100 characters" };
  }

  if (!PATIENT_NAME_PATTERN.test(name)) {
    return { isValid: false, error: "Patient name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  return { isValid: true };
};

export const validateAmount = (amount: string, fieldName = "Amount"): ValidationResult => {
  if (!amount || amount.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const numValue = parseFloat(amount);
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (numValue < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }

  if (numValue > 999999.99) {
    return { isValid: false, error: `${fieldName} cannot exceed ₵999,999.99` };
  }

  if (!AMOUNT_PATTERN.test(amount)) {
    return { isValid: false, error: `${fieldName} can have at most 2 decimal places` };
  }

  return { isValid: true };
};

export const validateProductName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Product name is required" };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Product name must be at least 2 characters" };
  }

  if (name.length > 200) {
    return { isValid: false, error: "Product name cannot exceed 200 characters" };
  }

  if (!PRODUCT_NAME_PATTERN.test(name)) {
    return { isValid: false, error: "Product name contains invalid characters" };
  }

  return { isValid: true };
};

export const validateReceiptNumber = (number: number): ValidationResult => {
  if (!Number.isInteger(number) || number <= 0) {
    return { isValid: false, error: "Receipt number must be a positive integer" };
  }

  if (number > 999999999) {
    return { isValid: false, error: "Receipt number cannot exceed 9 digits" };
  }

  return { isValid: true };
};

export const validateCategoryName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Category name is required" };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Category name must be at least 2 characters" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Category name cannot exceed 50 characters" };
  }

  // Allow alphanumeric, spaces, hyphens, underscores
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, error: "Category name contains invalid characters" };
  }

  return { isValid: true };
};

export const validateQuantity = (quantity: number): ValidationResult => {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { isValid: false, error: "Quantity must be a non-negative integer" };
  }

  if (quantity > 9999) {
    return { isValid: false, error: "Quantity cannot exceed 9,999" };
  }

  return { isValid: true };
};

// Generic field validation function
export const validateField = (value: string, rules: ValidationRules, fieldName = "Field"): ValidationResult => {
  // Required check
  if (rules.required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true };
  }

  // Min length check
  if (rules.minLength && value.length < rules.minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${rules.minLength} characters` };
  }

  // Max length check
  if (rules.maxLength && value.length > rules.maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${rules.maxLength} characters` };
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
};