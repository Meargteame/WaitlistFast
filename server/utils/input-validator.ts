/**
 * Input Validation Utility
 * 
 * Validates user input for AI generation requests.
 * Requirements: 1.5, 1.6, 1.7
 */

/**
 * Generation request input
 */
export interface GenerationRequest {
  productName: string;
  shortDescription: string;
  industry?: string;
  targetAudience?: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a generation request
 * 
 * Rules:
 * - Product name: required, 1-100 characters
 * - Short description: required, 10-500 characters
 * - Industry: optional
 * - Target audience: optional
 * 
 * @param request - The generation request to validate
 * @returns Validation result with any errors
 */
export function validateGenerationRequest(request: GenerationRequest): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate product name
  if (!request.productName || request.productName.trim().length === 0) {
    errors.push({
      field: 'productName',
      message: 'Product name is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (request.productName.length < 1) {
    errors.push({
      field: 'productName',
      message: 'Product name must be at least 1 character',
      code: 'FIELD_TOO_SHORT',
    });
  } else if (request.productName.length > 100) {
    errors.push({
      field: 'productName',
      message: 'Product name must be 100 characters or less',
      code: 'FIELD_TOO_LONG',
    });
  }

  // Validate short description
  if (!request.shortDescription || request.shortDescription.trim().length === 0) {
    errors.push({
      field: 'shortDescription',
      message: 'Product description is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (request.shortDescription.length < 10) {
    errors.push({
      field: 'shortDescription',
      message: 'Description must be at least 10 characters',
      code: 'FIELD_TOO_SHORT',
    });
  } else if (request.shortDescription.length > 500) {
    errors.push({
      field: 'shortDescription',
      message: 'Description must be 500 characters or less',
      code: 'FIELD_TOO_LONG',
    });
  }

  // Industry and target audience are optional, no validation needed

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates product name only
 * 
 * @param productName - The product name to validate
 * @returns Validation result
 */
export function validateProductName(productName: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!productName || productName.trim().length === 0) {
    errors.push({
      field: 'productName',
      message: 'Product name is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (productName.length < 1) {
    errors.push({
      field: 'productName',
      message: 'Product name must be at least 1 character',
      code: 'FIELD_TOO_SHORT',
    });
  } else if (productName.length > 100) {
    errors.push({
      field: 'productName',
      message: 'Product name must be 100 characters or less',
      code: 'FIELD_TOO_LONG',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates product description only
 * 
 * @param description - The description to validate
 * @returns Validation result
 */
export function validateProductDescription(description: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!description || description.trim().length === 0) {
    errors.push({
      field: 'shortDescription',
      message: 'Product description is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (description.length < 10) {
    errors.push({
      field: 'shortDescription',
      message: 'Description must be at least 10 characters',
      code: 'FIELD_TOO_SHORT',
    });
  } else if (description.length > 500) {
    errors.push({
      field: 'shortDescription',
      message: 'Description must be 500 characters or less',
      code: 'FIELD_TOO_LONG',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Throws an error if validation fails
 * 
 * @param request - The generation request to validate
 * @throws ValidationError if validation fails
 */
export function assertValidGenerationRequest(request: GenerationRequest): void {
  const result = validateGenerationRequest(request);
  
  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
}
