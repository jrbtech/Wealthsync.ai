// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password should be at least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one special character');
  }

  return { score: Math.min(score, 4), feedback };
}

export function isStrongPassword(password: string): boolean {
  return checkPasswordStrength(password).score >= 3;
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Required field validation
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// Number range validation
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Currency validation (positive numbers with up to 2 decimal places)
export function isValidCurrency(value: string): boolean {
  const currencyRegex = /^\d+(\.\d{0,2})?$/;
  return currencyRegex.test(value) && parseFloat(value) >= 0;
}

// Form validation helper
export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateForm(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      if (!rule.validate(data[field])) {
        errors[field] = rule.message;
        break;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Common validation rules
export const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: isRequired,
    message
  }),

  email: (message = 'Please enter a valid email'): ValidationRule => ({
    validate: (v) => isValidEmail(String(v || '')),
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (v) => String(v || '').length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (v) => String(v || '').length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (v) => !v || isValidPhone(String(v)),
    message
  }),

  password: (message = 'Password is too weak'): ValidationRule => ({
    validate: (v) => isStrongPassword(String(v || '')),
    message
  }),

  currency: (message = 'Please enter a valid amount'): ValidationRule => ({
    validate: (v) => isValidCurrency(String(v || '0')),
    message
  }),

  positive: (message = 'Must be a positive number'): ValidationRule => ({
    validate: (v) => Number(v) > 0,
    message
  })
};
