/**
 * Validadores para autenticación
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateName = (name) => {
  return name && name.trim().length >= 2;
};

const validateRole = (role) => {
  return ['cliente', 'patronista'].includes(role);
};

const validateRegisterData = (data) => {
  const errors = [];
  
  if (!validateName(data.firstName)) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!validateName(data.lastName)) {
    errors.push('El apellido debe tener al menos 2 caracteres');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('El email no es válido');
  }
  
  if (!validatePassword(data.password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!validateRole(data.role)) {
    errors.push('El rol debe ser cliente o patronista');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLoginData = (data) => {
  const errors = [];
  
  if (!validateEmail(data.email)) {
    errors.push('El email no es válido');
  }
  
  if (!data.password) {
    errors.push('La contraseña es requerida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRole,
  validateRegisterData,
  validateLoginData
};