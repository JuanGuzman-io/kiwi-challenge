/**
 * Logging utility for rewards feature
 * Per FR-054, FR-055, FR-056, FR-057, FR-058
 * Tasks T126-T129
 *
 * IMPORTANT: Never log sensitive data (balance amounts, transaction details, user IDs)
 */

interface LogContext {
  [key: string]: unknown;
}

/**
 * Log levels for categorizing log messages
 */
type LogLevel = 'info' | 'warn' | 'error';

/**
 * Sanitize context to remove sensitive data
 * Per FR-058: Ensure no sensitive data is logged
 */
function sanitizeContext(context: LogContext): LogContext {
  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    // Skip sensitive keys
    const sensitiveKeys = [
      'balance',
      'amount',
      'userId',
      'user_id',
      'x-user-id',
      'transaction',
      'transactions',
      'currency',
      'description',
    ];

    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as LogContext);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Core logging function
 * Sends logs to console in development, could be extended to send to logging service
 */
function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitizeContext(context) : {};

  const logEntry = {
    timestamp,
    level,
    feature: 'rewards',
    message,
    ...sanitizedContext,
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logFn('[Rewards]', message, sanitizedContext);
  }

  // In production, could send to logging service (e.g., Sentry, DataDog)
  // Example: sendToLoggingService(logEntry);

  return logEntry;
}

/**
 * T126: Log API failures
 * Per FR-054, FR-055: Track API errors for monitoring
 */
export function logAPIFailure(
  endpoint: string,
  error: Error,
  context?: LogContext
) {
  return log('error', `API request failed: ${endpoint}`, {
    endpoint,
    errorType: error.name,
    errorMessage: error.message,
    ...context,
  });
}

/**
 * T127: Log page load performance
 * Per FR-056: Track page load times for performance monitoring
 */
export function logPageLoad(pageName: string, loadTime: number) {
  return log('info', `Page loaded: ${pageName}`, {
    pageName,
    loadTimeMs: loadTime,
    isSlowLoad: loadTime > 2000, // Flag if > 2 seconds
  });
}

/**
 * T128: Log client-side errors
 * Per FR-057: Catch and log unexpected client errors
 */
export function logClientError(
  error: Error,
  context?: LogContext
) {
  return log('error', `Client error: ${error.message}`, {
    errorType: error.name,
    errorMessage: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log informational messages
 */
export function logInfo(message: string, context?: LogContext) {
  return log('info', message, context);
}

/**
 * Log warnings
 */
export function logWarn(message: string, context?: LogContext) {
  return log('warn', message, context);
}

/**
 * Setup global error handler
 * Per T128: Catch unhandled errors and exceptions
 */
export function setupGlobalErrorHandler() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logClientError(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      { reason: event.reason }
    );
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    logClientError(
      new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });
}

/**
 * Performance marker utility
 * Helper for measuring page load times
 */
export class PerformanceMarker {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end() {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    logPageLoad(this.name, duration);
    return duration;
  }
}
