import React, { createContext, useContext, useState, useEffect } from "react";
import voucherService, { VoucherInfo } from '../services/voucherService';

export interface FormDataType {
  lastName: string;
  phone: string;
  address: string;
  province_code: string;
  district_code: string;
  ward_code: string;
  paymentMethod: string;
}

export interface CardInfoType {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface WalletInfoType {
  type: string;
  phone: string;
}

export interface BankTransferInfoType {
  transactionId: string;
}

interface CheckoutContextType {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  cardInfo: CardInfoType;
  setCardInfo: React.Dispatch<React.SetStateAction<CardInfoType>>;
  walletInfo: WalletInfoType;
  setWalletInfo: React.Dispatch<React.SetStateAction<WalletInfoType>>;
  bankTransferInfo: BankTransferInfoType;
  setBankTransferInfo: React.Dispatch<React.SetStateAction<BankTransferInfoType>>;
  voucher: VoucherInfo | null;
  setVoucher: React.Dispatch<React.SetStateAction<VoucherInfo | null>>;
  clearVoucher: () => void;
  revalidateVoucher: (orderValue: number) => Promise<void>;
}

const defaultFormData: FormDataType = {
  lastName: "",
  phone: "",
  address: "",
  province_code: "",
  district_code: "",
  ward_code: "",
  paymentMethod: "",
};

const defaultCardInfo: CardInfoType = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
};

const defaultWalletInfo: WalletInfoType = {
  type: "",
  phone: "",
};

const defaultBankTransferInfo: BankTransferInfoType = {
  transactionId: "",
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormDataType>(defaultFormData);
  const [cardInfo, setCardInfo] = useState<CardInfoType>(defaultCardInfo);
  const [walletInfo, setWalletInfo] = useState<WalletInfoType>(defaultWalletInfo);
  const [bankTransferInfo, setBankTransferInfo] = useState<BankTransferInfoType>(defaultBankTransferInfo);
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null);

  // Load voucher từ localStorage khi component mount
  useEffect(() => {
    const storedVoucher = voucherService.getVoucherFromStorage();
    if (storedVoucher) {
      setVoucher(storedVoucher);
    }
  }, []);

  const clearVoucher = () => {
    setVoucher(null);
    voucherService.clearVoucherFromStorage();
  };

  const revalidateVoucher = async (orderValue: number) => {
    if (!voucher) return;

    try {
      const updatedVoucher = await voucherService.revalidateStoredVoucher(orderValue);
      if (updatedVoucher) {
        setVoucher(updatedVoucher);
      }
    } catch (error) {
      console.error('Error revalidating voucher:', error);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        setFormData,
        cardInfo,
        setCardInfo,
        walletInfo,
        setWalletInfo,
        bankTransferInfo,
        setBankTransferInfo,
        voucher,
        setVoucher,
        clearVoucher,
        revalidateVoucher,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
