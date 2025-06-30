// validation to avoid xss attacks or any malicious activity
export const ValidationUtils = {
  // Email validation with enhanced security
  validateEmail: (email: string): { isValid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    // Trim and convert to lowercase
    email = email.trim().toLowerCase();

    // Length checks
    if (email.length < 5 || email.length > 254) {
      return { isValid: false, error: 'Email must be between 5 and 254 characters' };
    }

    // email regex that prevents common injection patterns
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // check suspicious patterns
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /on\w+=/i, // XSS patterns
      /union\s+select/i, /drop\s+table/i, // SQL injection patterns
      /\.{2,}/, // Path traversal
      /%[0-9a-f]{2}/i, // URL encoding
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(email))) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  },

  // Password validation
  validatePassword: (password: string): { isValid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } => {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: 'Password is required' };
    }

    // Length requirements
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters' };
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let score = 0;
    if (hasLowercase) score++;
    if (hasUppercase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    if (score < 3) {
      return { 
        isValid: false, 
        error: 'Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters' 
      };
    }

    const commonPatterns = [
      /password/i, /123456/, /qwerty/i, /admin/i, /root/i,
      /(.)\1{2,}/, // Repeated characters (aaa, 111)
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      return { isValid: false, error: 'Password is too common or contains repeated patterns' };
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4 && password.length >= 12) {
      strength = 'strong';
    } else if (score >= 3 && password.length >= 8) {
      strength = 'medium';
    }

    return { isValid: true, strength };
  },

  // Name validation XSS protection
  validateName: (name: string): { isValid: boolean; error?: string; sanitized?: string } => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Name is required' };
    }

    // Trim whitespace
    name = name.trim();

    // Length checks
    if (name.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }

    if (name.length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }

    // Only allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<[^>]*>/g, // HTML tags
      /javascript:/i, /on\w+=/i, // JS injection
      /[{}[\]()]/g, // Brackets that could be code
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(name))) {
      return { isValid: false, error: 'Name contains invalid characters' };
    }

    // Sanitize: remove multiple spaces, trim
    const sanitized = name.replace(/\s+/g, ' ').trim();

    return { isValid: true, sanitized };
  },

  // General text input sanitization
  sanitizeTextInput: (input: string, maxLength: number = 1000): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potential XSS patterns
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  },

  // Validate file uploads
  validateImageFile: (uri: string, fileSize?: number): { isValid: boolean; error?: string } => {
    if (!uri || typeof uri !== 'string') {
      return { isValid: false, error: 'Invalid file' };
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = uri.toLowerCase().split('.').pop();
    if (!extension || !allowedExtensions.includes(`.${extension}`)) {
      return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize && fileSize > maxSize) {
      return { isValid: false, error: 'Image must be smaller than 5MB' };
    }

    // Check for suspicious patterns in filename
    const suspiciousPatterns = [
      /\.php$/i, /\.js$/i, /\.html$/i, /\.exe$/i,
      /\.\./g, // Path traversal
      /%[0-9a-f]{2}/i, // URL encoding
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(uri))) {
      return { isValid: false, error: 'Invalid file type' };
    }

    return { isValid: true };
  },

  rateLimitCheck: (() => {
    const attempts: { [key: string]: number[] } = {};
    
    return (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!attempts[identifier]) {
        attempts[identifier] = [];
      }
      
      // Remove old attempts outside the window
      attempts[identifier] = attempts[identifier].filter(time => time > windowStart);
      
      // Check if limit exceeded
      if (attempts[identifier].length >= maxAttempts) {
        return false; // Rate limited
      }
      
      attempts[identifier].push(now);
      return true; 
    };
  })(),
}; 