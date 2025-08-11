/**
 * Centralized error messages for consistent formatting and tone
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    REQUIRED: "Authentication is required to access this feature.",
    INVALID_CREDENTIALS: "Invalid username or password. Please try again.",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
    UNAUTHORIZED: "You don't have permission to perform this action.",
    SETUP_REQUIRED: "Admin setup is required before proceeding.",
  },

  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required.`,
    INVALID_FORMAT: (field: string) => `${field} format is invalid.`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters long.`,
    MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters.`,
    PASSWORDS_DONT_MATCH: "Passwords do not match.",
    INVALID_EMAIL: "Please enter a valid email address.",
  },

  // Generation errors
  GENERATION: {
    NO_IMAGE: "Please upload an image for analysis.",
    NO_CONTENT: "Please provide content to generate copy.",
    GENERATION_FAILED: "Failed to generate content. Please try again.",
    INVALID_PARAMETERS: "Invalid generation parameters provided.",
    QUOTA_EXCEEDED: "Generation quota exceeded. Please try again later.",
  },

  // API errors
  API: {
    NETWORK_ERROR: "Network error occurred. Please check your connection.",
    SERVER_ERROR: "Server error occurred. Please try again later.",
    TIMEOUT: "Request timed out. Please try again.",
    INVALID_RESPONSE: "Received invalid response from server.",
    RATE_LIMITED: "Too many requests. Please wait before trying again.",
  },

  // File operations
  FILE: {
    UPLOAD_FAILED: "File upload failed. Please try again.",
    INVALID_TYPE: "Invalid file type. Please select a supported file.",
    TOO_LARGE: "File is too large. Please select a smaller file.",
    PROCESSING_FAILED: "File processing failed. Please try again.",
  },

  // Context errors
  CONTEXT: {
    PROVIDER_MISSING: (contextName: string) => `${contextName} must be used within its provider.`,
    INVALID_STATE: "Invalid application state detected.",
  },

  // Generic errors
  GENERIC: {
    UNEXPECTED: "An unexpected error occurred. Please try again.",
    NOT_FOUND: "The requested resource was not found.",
    PERMISSION_DENIED: "Permission denied.",
    OPERATION_FAILED: (operation: string) => `${operation} failed. Please try again.`,
  },
} as const;

/**
 * Format error message with consistent tone and structure
 */
export const formatErrorMessage = (error: unknown, fallback?: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return fallback || ERROR_MESSAGES.GENERIC.UNEXPECTED;
};

/**
 * Log error with consistent format
 */
export const logError = (context: string, error: unknown, additionalData?: any): void => {
  const errorMessage = formatErrorMessage(error);
  console.error(`[${context}] ${errorMessage}`, {
    error,
    additionalData,
    timestamp: new Date().toISOString(),
  });
};