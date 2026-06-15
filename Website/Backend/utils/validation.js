const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

export const isValidEmail = (email = '') => EMAIL_PATTERN.test(normalizeEmail(email));

export const normalizeName = (name = '') => String(name).trim().replace(/\s+/g, ' ');

export const validateSignupInput = ({ name, email, password }) => {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail || !password) {
    return { valid: false, message: 'Name, email, and password are required' };
  }

  if (normalizedName.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, message: 'Enter a valid email address' };
  }

  if (String(password).length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  return {
    valid: true,
    payload: {
      name: normalizedName,
      email: normalizedEmail,
      password,
    },
  };
};

export const validateLoginInput = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return { valid: false, message: 'Email and password are required' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, message: 'Enter a valid email address' };
  }

  return {
    valid: true,
    payload: {
      email: normalizedEmail,
      password,
    },
  };
};

export const validateProfileInput = ({ name, email }) => {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail) {
    return { valid: false, message: 'Name and email are required' };
  }

  if (normalizedName.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, message: 'Enter a valid email address' };
  }

  return {
    valid: true,
    payload: {
      name: normalizedName,
      email: normalizedEmail,
    },
  };
};

export const validatePasswordChangeInput = ({ currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { valid: false, message: 'Current password, new password, and confirmation are required' };
  }

  if (String(newPassword).length < 6) {
    return { valid: false, message: 'New password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { valid: false, message: 'New password and confirmation do not match' };
  }

  if (currentPassword === newPassword) {
    return { valid: false, message: 'New password must be different from the current password' };
  }

  return {
    valid: true,
    payload: {
      currentPassword,
      newPassword,
    },
  };
};
