import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Shipper } from '../interfaces/Shipper';
import { shipperApi } from '../services/shipperApi';

interface ShipperState {
  shipper: Shipper | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type ShipperAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { shipper: Shipper; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Shipper };

const initialState: ShipperState = {
  shipper: null,
  token: localStorage.getItem('shipperToken'),
  isAuthenticated: false,
  isLoading: true,
};

const shipperReducer = (state: ShipperState, action: ShipperAction): ShipperState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        shipper: action.payload.shipper,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        shipper: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        shipper: action.payload,
      };
    default:
      return state;
  }
};

interface ShipperContextType {
  state: ShipperState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    address: string;
    idCard: string;
    licensePlate: string;
    vehicleType: 'motorbike' | 'car' | 'bicycle';
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  updateOnlineStatus: (isOnline: boolean, location?: any) => Promise<void>;
}

const ShipperContext = createContext<ShipperContextType | undefined>(undefined);

export const useShipper = () => {
  const context = useContext(ShipperContext);
  if (context === undefined) {
    throw new Error('useShipper must be used within a ShipperProvider');
  }
  return context;
};

interface ShipperProviderProps {
  children: ReactNode;
}

export const ShipperProvider: React.FC<ShipperProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(shipperReducer, initialState);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('shipperToken');
      const shipper = localStorage.getItem('shipper');
      
      console.log('ShipperContext checkAuth:', { token: !!token, shipper: !!shipper });
      
      if (token && shipper) {
        try {
          // Nếu có cả token và shipper data trong localStorage, dùng luôn
          const shipperData = JSON.parse(shipper);
          
          // Set token vào axios instance
          const axiosInstance = (await import('../api/axiosInstance')).default;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { shipper: shipperData, token }
          });
          
          console.log('ShipperContext: Login success from localStorage');
          console.log('ShipperContext: State should now be authenticated');
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('shipperToken');
          localStorage.removeItem('shipper');
          dispatch({ type: 'LOGOUT' });
        }
      } else if (token) {
        // Nếu chỉ có token, validate với server
        try {
          const axiosInstance = (await import('../api/axiosInstance')).default;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await shipperApi.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { shipper: response.data.shipper, token }
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('shipperToken');
          localStorage.removeItem('shipper');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await shipperApi.login({ email, password });
      
      localStorage.setItem('shipperToken', response.data.token);
      
      // Set token vào axios instance
      const axiosInstance = (await import('../api/axiosInstance')).default;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { shipper: response.data.shipper, token: response.data.token }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    address: string;
    idCard: string;
    licensePlate: string;
    vehicleType: 'motorbike' | 'car' | 'bicycle';
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await shipperApi.register(data);
      
      localStorage.setItem('shipperToken', response.data.token);
      
      // Set token vào axios instance
      const axiosInstance = (await import('../api/axiosInstance')).default;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { shipper: response.data.shipper, token: response.data.token }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('shipperToken');
    localStorage.removeItem('shipper');
    delete (window as any).axiosInstance?.defaults?.headers?.common?.['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await shipperApi.updateProfile(data);
      dispatch({ type: 'UPDATE_PROFILE', payload: response.data.shipper });
    } catch (error) {
      throw error;
    }
  };

  const updateOnlineStatus = async (isOnline: boolean, location?: any) => {
    try {
      await shipperApi.updateOnlineStatus({ isOnline, currentLocation: location });
      if (state.shipper) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: { ...state.shipper, isOnline, currentLocation: location }
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const value: ShipperContextType = {
    state,
    login,
    register,
    logout,
    updateProfile,
    updateOnlineStatus,
  };

  return (
    <ShipperContext.Provider value={value}>
      {children}
    </ShipperContext.Provider>
  );
};
