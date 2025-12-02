/**
 * Structured logging utility
 * Provides consistent logging format across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';

function formatLogEntry(entry: LogEntry): string {
  if (isDevelopment) {
    // Pretty format for development
    const { timestamp, level, message, context, error } = entry;
    let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (context && Object.keys(context).length > 0) {
      output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }
    if (error) {
      output += `\n  Error: ${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`;
      }
    }
    return output;
  }

  // JSON format for production (better for log aggregation)
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    };
  }

  return entry;
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLogEntry(entry));
    }
  },

  info(message: string, context?: LogContext): void {
    const entry = createLogEntry('info', message, context);
    console.info(formatLogEntry(entry));
  },

  warn(message: string, context?: LogContext): void {
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLogEntry(entry));
  },

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : undefined;
    const entry = createLogEntry('error', message, context, err);
    console.error(formatLogEntry(entry));
  },
};

/**
 * Create a logger with a specific prefix/module name
 */
export function createLogger(module: string) {
  return {
    debug(message: string, context?: LogContext): void {
      logger.debug(`[${module}] ${message}`, context);
    },

    info(message: string, context?: LogContext): void {
      logger.info(`[${module}] ${message}`, context);
    },

    warn(message: string, context?: LogContext): void {
      logger.warn(`[${module}] ${message}`, context);
    },

    error(message: string, error?: Error | unknown, context?: LogContext): void {
      logger.error(`[${module}] ${message}`, error, context);
    },
  };
}

export default logger;
