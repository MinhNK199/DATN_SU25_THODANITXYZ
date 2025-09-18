import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseUnsavedChangesProtectionOptions {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
}

export const useUnsavedChangesProtection = ({
  hasUnsavedChanges,
  onSave,
  onDiscard
}: UseUnsavedChangesProtectionOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Dữ liệu sẽ được khôi phục khi bạn quay lại trang.';
        return 'Bạn có thay đổi chưa được lưu. Dữ liệu sẽ được khôi phục khi bạn quay lại trang.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle navigation with unsaved changes
  const handleNavigation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowWarning(true);
    } else {
      navigate(path);
    }
  }, [hasUnsavedChanges, navigate]);

  // Handle warning confirmation
  const handleConfirmNavigation = useCallback(() => {
    setShowWarning(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [navigate, pendingNavigation]);

  // Handle warning cancellation
  const handleCancelNavigation = useCallback(() => {
    setShowWarning(false);
    setPendingNavigation(null);
  }, []);

  // Handle save and continue
  const handleSaveAndContinue = useCallback(async () => {
    if (onSave) {
      try {
        await onSave();
        setShowWarning(false);
        if (pendingNavigation) {
          navigate(pendingNavigation);
          setPendingNavigation(null);
        }
      } catch (error) {
        console.error('Error saving:', error);
        // Keep warning open if save failed
      }
    }
  }, [onSave, navigate, pendingNavigation]);

  // Handle discard changes
  const handleDiscardChanges = useCallback(() => {
    if (onDiscard) {
      onDiscard();
    }
    setShowWarning(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [onDiscard, navigate, pendingNavigation]);

  return {
    showWarning,
    handleNavigation,
    handleConfirmNavigation,
    handleCancelNavigation,
    handleSaveAndContinue,
    handleDiscardChanges,
    pendingNavigation
  };
};
