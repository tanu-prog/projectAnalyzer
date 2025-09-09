import { useState, useCallback } from 'react';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, hideToast };
}