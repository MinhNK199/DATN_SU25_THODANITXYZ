import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useModernNotification } from '../components/client/ModernNotification';
import { Product } from '../interfaces/Product';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddToCompare: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const MAX_COMPARE_ITEMS = 4; // Giới hạn tối đa 4 sản phẩm
  const { showError, showSuccess } = useModernNotification();

  // Load từ localStorage khi component mount
  useEffect(() => {
    const savedCompareList = localStorage.getItem('compareList');
    if (savedCompareList) {
      try {
        const parsed = JSON.parse(savedCompareList);
        setCompareList(parsed);
      } catch (error) {
        console.error('Error loading compare list from localStorage:', error);
        localStorage.removeItem('compareList');
      }
    }
  }, []);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product: Product) => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      showError('Giới hạn so sánh', `Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm`);
      return;
    }

    if (isInCompare(product._id)) {
      showError('Đã có trong so sánh', 'Sản phẩm này đã có trong danh sách so sánh');
      return;
    }

    setCompareList(prev => [...prev, product]);
    showSuccess('Thêm vào so sánh', 'Đã thêm vào danh sách so sánh');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(product => product._id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some(product => product._id === productId);
  };

  const canAddToCompare = compareList.length < MAX_COMPARE_ITEMS;

  const value: CompareContextType = {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddToCompare,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
