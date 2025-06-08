
import { useRef, useCallback, useEffect } from 'react';

interface TimerRef {
  id: NodeJS.Timeout;
  type: 'interval' | 'timeout';
  name?: string;
}

export const useTimerManager = () => {
  const timersRef = useRef<Map<string, TimerRef>>(new Map());
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
    });
    timersRef.current.clear();
  }, []);

  const clearTimer = useCallback((key: string) => {
    const timer = timersRef.current.get(key);
    if (timer) {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
      timersRef.current.delete(key);
    }
  }, []);

  const setTimer = useCallback((
    key: string,
    callback: () => void,
    delay: number,
    type: 'interval' | 'timeout' = 'timeout',
    name?: string
  ) => {
    // Clear existing timer with same key
    clearTimer(key);

    // Don't set new timers if component is unmounted
    if (!mountedRef.current) return;

    const wrappedCallback = () => {
      if (mountedRef.current) {
        callback();
      }
    };

    const timerId = type === 'interval' 
      ? setInterval(wrappedCallback, delay)
      : setTimeout(() => {
          wrappedCallback();
          timersRef.current.delete(key);
        }, delay);

    timersRef.current.set(key, { id: timerId, type, name });

    return () => clearTimer(key);
  }, [clearTimer]);

  const hasTimer = useCallback((key: string) => {
    return timersRef.current.has(key);
  }, []);

  const getActiveTimers = useCallback(() => {
    return Array.from(timersRef.current.entries()).map(([key, timer]) => ({
      key,
      type: timer.type,
      name: timer.name
    }));
  }, []);

  return {
    setTimer,
    clearTimer,
    clearAllTimers,
    hasTimer,
    getActiveTimers
  };
};
