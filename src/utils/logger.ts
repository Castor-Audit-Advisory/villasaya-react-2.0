/**
 * Production-safe logger utility
 * Automatically disables debug/info logs in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  includeTimestamp: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor() {
    // Disable debug/info logs in production
    const isProduction = import.meta.env.PROD;
    
    this.config = {
      enabled: !isProduction || import.meta.env.VITE_ENABLE_LOGS === 'true',
      minLevel: isProduction ? 'warn' : 'debug',
      includeTimestamp: !isProduction,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = this.config.includeTimestamp 
      ? `[${new Date().toISOString()}]` 
      : '';
    const prefix = timestamp ? `${timestamp} [${level.toUpperCase()}]` : `[${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args);
  }

  /**
   * Info level logging - only in development
   */
  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args);
  }

  /**
   * Warning level logging - always logged
   */
  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args);
  }

  /**
   * Error level logging - always logged
   */
  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args);
  }

  /**
   * Group logging (for development only)
   */
  group(label: string, callback: () => void): void {
    if (!this.shouldLog('debug')) return;
    console.group(label);
    callback();
    console.groupEnd();
  }
}

// Export singleton instance
export const logger = new Logger();

// Re-export for convenience
export default logger;
