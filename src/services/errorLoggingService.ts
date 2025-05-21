
import { supabase } from "@/integrations/supabase/client";

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface for error log entry
interface ErrorLogEntry {
  error_type: string;
  message: string;
  stack?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  severity: ErrorSeverity;
}

// Log errors to console for monitoring and analysis
// Since we don't have an error_logs table yet, we'll just log to console
export const logError = async (
  errorType: string,
  message: string,
  options: {
    stack?: string;
    userId?: string;
    metadata?: Record<string, any>;
    severity?: ErrorSeverity;
  } = {}
): Promise<boolean> => {
  try {
    const { 
      stack, 
      userId, 
      metadata, 
      severity = ErrorSeverity.ERROR 
    } = options;
    
    // Log to console for local debugging
    console.error(`[${severity.toUpperCase()}] ${errorType}: ${message}`);
    if (stack) {
      console.error(stack);
    }
    
    // Construct error log entry
    const logEntry: ErrorLogEntry = {
      error_type: errorType,
      message,
      stack,
      user_id: userId,
      metadata,
      severity
    };
    
    // For now, we'll just log to console since we don't have an error_logs table
    console.error("Error log entry:", logEntry, "Timestamp:", new Date().toISOString());
    
    // Return true to indicate successful logging
    return true;
  } catch (err) {
    // Fallback logging if database logging fails
    console.error('Error in error logging service:', err);
    return false;
  }
};

// Global error boundary for unhandled errors
export const setupGlobalErrorHandler = (): void => {
  const originalConsoleError = console.error;
  
  // Override console.error to capture and log errors
  console.error = (...args) => {
    // Call original console.error
    originalConsoleError(...args);
    
    // Extract error information
    let errorMessage = '';
    let errorStack = '';
    
    args.forEach(arg => {
      if (arg instanceof Error) {
        errorMessage = arg.message;
        errorStack = arg.stack || '';
      } else if (typeof arg === 'string') {
        errorMessage += arg + ' ';
      } else {
        try {
          errorMessage += JSON.stringify(arg) + ' ';
        } catch (e) {
          errorMessage += '[Unstringifiable Object] ';
        }
      }
    });
    
    // Log error if it appears to be a real error
    if (errorMessage && !errorMessage.includes('above error occurred in the')) {
      logError('console', errorMessage.trim(), { stack: errorStack, severity: ErrorSeverity.WARNING });
    }
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logError('unhandledrejection', error?.message || String(error), {
      stack: error?.stack,
      severity: ErrorSeverity.ERROR
    });
  });
  
  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    logError('uncaughtException', event.message, {
      stack: event.error?.stack,
      severity: ErrorSeverity.CRITICAL
    });
  });
};

// Connection status monitoring
export const monitorConnectivity = (): void => {
  window.addEventListener('online', () => {
    logError('connectivity', 'Application came back online', { severity: ErrorSeverity.INFO });
  });
  
  window.addEventListener('offline', () => {
    logError('connectivity', 'Application went offline', { severity: ErrorSeverity.WARNING });
  });
};

// Initialize monitoring services
export const initializeErrorMonitoring = (): void => {
  setupGlobalErrorHandler();
  monitorConnectivity();
  
  console.log('Error monitoring services initialized');
};
