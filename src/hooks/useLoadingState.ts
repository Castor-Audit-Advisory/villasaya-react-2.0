import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  data: any;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    initialLoading = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    isSuccess: false,
    data: null,
  });

  const retriesRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: null }));
  }, []);

  const setError = useCallback((error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: errorMessage, 
      isSuccess: false 
    }));
    
    if (error instanceof Error && onError) {
      onError(error);
    }
  }, [onError]);

  const setSuccess = useCallback((data: any = null) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: null, 
      isSuccess: true,
      data 
    }));
    
    if (onSuccess) {
      onSuccess(data);
    }
  }, [onSuccess]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
      data: null,
    });
    retriesRef.current = 0;
  }, []);

  const execute = useCallback(async <T,>(
    asyncFunction: (signal?: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    retriesRef.current = 0;

    const attemptExecution = async (): Promise<T | null> => {
      try {
        const result = await asyncFunction(signal);
        setSuccess(result);
        return result;
      } catch (error) {
        if (signal.aborted) {
          // Request was cancelled, don't update state
          return null;
        }

        if (retriesRef.current < retryCount) {
          retriesRef.current += 1;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptExecution();
        }

        setError(error as Error);
        return null;
      }
    };

    return attemptExecution();
  }, [setLoading, setSuccess, setError, retryCount, retryDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    isSuccess: state.isSuccess,
    data: state.data,
    setLoading,
    setError,
    setSuccess,
    reset,
    execute,
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates<T extends Record<string, any>>(
  keys: (keyof T)[]
) {
  const initialState = keys.reduce((acc, key) => {
    acc[key] = {
      isLoading: false,
      error: null,
      isSuccess: false,
      data: null,
    } as LoadingState;
    return acc;
  }, {} as Record<keyof T, LoadingState>);

  const [states, setStates] = useState(initialState);

  const setLoading = useCallback((key: keyof T, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading: loading, error: null },
    }));
  }, []);

  const setError = useCallback((key: keyof T, error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setStates(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        isLoading: false, 
        error: errorMessage, 
        isSuccess: false 
      },
    }));
  }, []);

  const setSuccess = useCallback((key: keyof T, data: any = null) => {
    setStates(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        isLoading: false, 
        error: null, 
        isSuccess: true, 
        data 
      },
    }));
  }, []);

  const reset = useCallback((key?: keyof T) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: {
          isLoading: false,
          error: null,
          isSuccess: false,
          data: null,
        },
      }));
    } else {
      setStates(initialState);
    }
  }, [initialState]);

  const isAnyLoading = Object.values(states).some((state: LoadingState) => state.isLoading);
  const hasAnyError = Object.values(states).some((state: LoadingState) => state.error !== null);

  return {
    states,
    setLoading,
    setError,
    setSuccess,
    reset,
    isAnyLoading,
    hasAnyError,
  };
}

// Hook for debounced loading state
export function useDebouncedLoadingState(delay: number = 200) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    
    // Only show loading after delay
    timeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, delay);
  }, [delay]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setShowLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    showLoading,
    startLoading,
    stopLoading,
  };
}

// Hook for progress tracking
export function useProgress(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const progress = (currentStep / totalSteps) * 100;

  const incrementStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, totalSteps);
      if (next === totalSteps) {
        setIsComplete(true);
      }
      return next;
    });
  }, [totalSteps]);

  const setStep = useCallback((step: number) => {
    const validStep = Math.max(0, Math.min(step, totalSteps));
    setCurrentStep(validStep);
    setIsComplete(validStep === totalSteps);
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
  }, []);

  return {
    currentStep,
    totalSteps,
    progress,
    isComplete,
    incrementStep,
    setStep,
    reset,
  };
}