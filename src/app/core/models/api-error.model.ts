/** One field-level validation failure returned by the real API inside details[]. */
export interface ValidationError {
  /** camelCase field name (normalized from API's PascalCase by the error interceptor) */
  field: string;
  /** The specific issue text returned by the backend (e.g. "Password must be at least 8 characters.") */
  issue: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}
