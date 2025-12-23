export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDateRange = (startDate, endDate) => {
  return new Date(startDate) < new Date(endDate);
};

export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = values[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
    }
    
    if (rule.email && value && !validateEmail(value)) {
      errors[field] = 'Invalid email address';
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters`;
    }
    
    if (rule.custom && value) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return errors;
};