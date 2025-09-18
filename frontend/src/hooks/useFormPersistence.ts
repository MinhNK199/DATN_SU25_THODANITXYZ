import { useEffect, useRef, useCallback } from 'react';
import { FormInstance } from 'antd';

interface UseFormPersistenceOptions {
  formKey: string;
  form: FormInstance;
  enabled?: boolean;
  autoSaveInterval?: number; // milliseconds
  onBeforeUnload?: () => boolean; // return true if has unsaved changes
}

export const useFormPersistence = ({
  formKey,
  form,
  enabled = true,
  autoSaveInterval = 30000, // 30 seconds
  onBeforeUnload
}: UseFormPersistenceOptions) => {
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled) return;

    const savedData = localStorage.getItem(`form_${formKey}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.setFieldsValue(parsedData);
        console.log(`📝 Đã khôi phục dữ liệu form cho ${formKey}:`, parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [formKey, form, enabled]);

  // Auto-save form data
  const saveFormData = useCallback(() => {
    if (!enabled) return;

    const formValues = form.getFieldsValue();
    const hasValues = Object.values(formValues).some(value => 
      value !== undefined && value !== null && value !== ''
    );

    if (hasValues) {
      localStorage.setItem(`form_${formKey}`, JSON.stringify(formValues));
      hasUnsavedChanges.current = true;
      console.log(`💾 Đã tự động lưu dữ liệu form cho ${formKey}`);
    }
  }, [formKey, form, enabled]);

  // Set up auto-save timer
  useEffect(() => {
    if (!enabled || autoSaveInterval <= 0) return;

    autoSaveTimer.current = setInterval(saveFormData, autoSaveInterval);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [saveFormData, autoSaveInterval, enabled]);

  // Listen for form changes
  useEffect(() => {
    if (!enabled) return;

    const handleFormChange = () => {
      hasUnsavedChanges.current = true;
      saveFormData();
    };

    // Listen to form field changes
    const unsubscribe = form.getFieldsValue;
    // Note: Ant Design Form doesn't have a direct change listener
    // We'll use a different approach with form validation trigger

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [form, saveFormData, enabled]);

  // Handle beforeunload warning
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Dữ liệu sẽ được khôi phục khi bạn quay lại trang.';
        return 'Bạn có thay đổi chưa được lưu. Dữ liệu sẽ được khôi phục khi bạn quay lại trang.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`form_${formKey}`);
    hasUnsavedChanges.current = false;
    console.log(`🗑️ Đã xóa dữ liệu form đã lưu cho ${formKey}`);
  }, [formKey]);

  // Mark as saved (call after successful submit)
  const markAsSaved = useCallback(() => {
    hasUnsavedChanges.current = false;
    clearSavedData();
  }, [clearSavedData]);

  // Manual save
  const manualSave = useCallback(() => {
    saveFormData();
  }, [saveFormData]);

  return {
    clearSavedData,
    markAsSaved,
    manualSave,
    hasUnsavedChanges: hasUnsavedChanges.current
  };
};
