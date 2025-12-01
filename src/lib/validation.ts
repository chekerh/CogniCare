/**
 * Input validation and sanitization utilities
 */

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف واحد على الأقل');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (name.trim().length < 2) {
    return { valid: false, error: 'الاسم يجب أن يكون حرفين على الأقل' };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'الاسم طويل جداً' };
  }
  return { valid: true };
}

export function validateAge(age: number): { valid: boolean; error?: string } {
  if (age < 0 || age > 17) {
    return { valid: false, error: 'العمر يجب أن يكون بين 0 و 17' };
  }
  return { valid: true };
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a'];
  // This is a simplified version - use DOMPurify for production
  return html.replace(/<script[^>]*>.*?<\/script>/gi, '');
}

