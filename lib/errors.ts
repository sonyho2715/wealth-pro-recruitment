import { z } from 'zod';

// Custom error classes for better error handling
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly details: z.ZodError['errors'] | undefined;

  constructor(message: string, details?: z.ZodError['errors']) {
    super(message, 400);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// Standard API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper to create success response
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

// Helper to create error response
export function errorResponse(error: string, details?: unknown): ApiErrorResponse {
  return { success: false, error, details };
}

// Server Action result types
export interface ActionSuccessResult<T> {
  success: true;
  data: T;
}

export interface ActionErrorResult {
  success: false;
  error: string;
  details?: unknown;
}

export type ActionResult<T> = ActionSuccessResult<T> | ActionErrorResult;

// Helper to handle errors in Server Actions
export function handleActionError(error: unknown): ActionErrorResult {
  // Log the error for debugging
  console.error('Action error:', error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Invalid input',
      details: error.errors,
    };
  }

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Generic error - don't expose internal details
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
  };
}

// Helper to handle errors in API routes
export function handleApiError(error: unknown): {
  response: ApiErrorResponse;
  status: number;
} {
  // Log the error for debugging
  console.error('API error:', error);

  if (error instanceof z.ZodError) {
    return {
      response: errorResponse('Invalid input', error.errors),
      status: 400,
    };
  }

  if (error instanceof ValidationError) {
    return {
      response: errorResponse(error.message, error.details),
      status: 400,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      response: errorResponse(error.message),
      status: 401,
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      response: errorResponse(error.message),
      status: 403,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      response: errorResponse(error.message),
      status: 404,
    };
  }

  if (error instanceof ConflictError) {
    return {
      response: errorResponse(error.message),
      status: 409,
    };
  }

  if (error instanceof AppError) {
    return {
      response: errorResponse(error.message),
      status: error.statusCode,
    };
  }

  // Generic error - don't expose internal details in production
  return {
    response: errorResponse('An unexpected error occurred'),
    status: 500,
  };
}
