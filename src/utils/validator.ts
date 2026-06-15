export interface ValidationResult {
  valid: boolean
  message?: string
}

export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `请填写${fieldName}` }
  }
  return { valid: true }
}

export function validateMinLength(value: string, min: number, fieldName: string): ValidationResult {
  if (value.length < min) {
    return { valid: false, message: `${fieldName}至少${min}个字符` }
  }
  return { valid: true }
}

export function validateMaxLength(value: string, max: number, fieldName: string): ValidationResult {
  if (value.length > max) {
    return { valid: false, message: `${fieldName}不能超过${max}个字符` }
  }
  return { valid: true }
}

export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: '请输入正确的手机号' }
  }
  return { valid: true }
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入正确的邮箱' }
  }
  return { valid: true }
}

export function validateTripTitle(title: string): ValidationResult {
  const required = validateRequired(title, '标题')
  if (!required.valid) return required

  const minLength = validateMinLength(title, 2, '标题')
  if (!minLength.valid) return minLength

  const maxLength = validateMaxLength(title, 50, '标题')
  if (!maxLength.valid) return maxLength

  return { valid: true }
}

export function validateTripDescription(description: string): ValidationResult {
  const maxLength = validateMaxLength(description, 1000, '描述')
  if (!maxLength.valid) return maxLength

  return { valid: true }
}

export function validateMaxParticipants(max: number | undefined): ValidationResult {
  if (max !== undefined && (max < 1 || max > 999)) {
    return { valid: false, message: '人数限制应在1-999之间' }
  }
  return { valid: true }
}

export function validateEstimatedCost(cost: number | undefined): ValidationResult {
  if (cost !== undefined && cost < 0) {
    return { valid: false, message: '预算不能为负数' }
  }
  return { valid: true }
}
