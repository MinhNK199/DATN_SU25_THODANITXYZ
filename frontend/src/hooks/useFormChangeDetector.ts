import { useEffect, useRef, useCallback } from 'react';
import { FormInstance } from 'antd';

interface UseFormChangeDetectorOptions {
  form: FormInstance;
  onFormChange?: (hasChanges: boolean) => void;
  debounceMs?: number;
}

export const useFormChangeDetector = ({
  form,
  onFormChange,
  debounceMs = 500
}: UseFormChangeDetectorOptions) => {
  const initialValues = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const hasChanges = useRef(false);

  // Store initial values
  useEffect(() => {
    const values = form.getFieldsValue();
    initialValues.current = JSON.parse(JSON.stringify(values));
  }, [form]);

  // Check for changes
  const checkForChanges = useCallback(() => {
    if (!initialValues.current) return;

    const currentValues = form.getFieldsValue();
    const hasFormChanges = JSON.stringify(currentValues) !== JSON.stringify(initialValues.current);
    
    if (hasFormChanges !== hasChanges.current) {
      hasChanges.current = hasFormChanges;
      onFormChange?.(hasFormChanges);
    }
  }, [form, onFormChange]);

  // Debounced change detection
  const debouncedCheck = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(checkForChanges, debounceMs);
  }, [checkForChanges, debounceMs]);

  // Set up form change listeners
  useEffect(() => {
    // Listen to form field changes using a polling approach
    // since Ant Design doesn't provide direct change listeners
    const interval = setInterval(debouncedCheck, 1000);

    return () => {
      clearInterval(interval);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedCheck]);

  // Reset initial values (call after successful save)
  const resetInitialValues = useCallback(() => {
    const values = form.getFieldsValue();
    initialValues.current = JSON.parse(JSON.stringify(values));
    hasChanges.current = false;
    onFormChange?.(false);
  }, [form, onFormChange]);

  return {
    hasChanges: hasChanges.current,
    resetInitialValues
  };
};
