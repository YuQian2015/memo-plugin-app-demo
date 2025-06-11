import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      const now = Date.now();

      if (lastRun.current && now < lastRun.current + delay) {
        // 如果距离上次执行时间小于延迟时间，则清除之前的定时器并设置新的定时器
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          lastRun.current = now;
          callback(...args);
        }, delay);
      } else {
        // 如果距离上次执行时间大于等于延迟时间，则立即执行
        lastRun.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
} 