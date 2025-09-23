import type { Request, Response, NextFunction } from 'express';

export interface APIError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements APIError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error details
  console.error(`Error ${statusCode}: ${err.message}`);
  if (!isProduction) {
    console.error(err.stack);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      statusCode,
      ...((!isProduction || statusCode < 500) && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};

// Async error wrapper to catch async/await errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationErrors = (errors: any[]) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value,
  }));
};