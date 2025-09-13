import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useShipper } from '../contexts/ShipperContext';

interface PrivateRouteShipperProps {
  children: React.ReactNode;
}

const PrivateRouteShipper: React.FC<PrivateRouteShipperProps> = ({ children }) => {
  const { state } = useShipper();
  const location = useLocation();

  // Debug log
  console.log('🔍 PrivateRouteShipper Debug:');
  console.log('- State:', state);
  console.log('- Token exists:', !!localStorage.getItem('shipperToken'));
  console.log('- Shipper data exists:', !!localStorage.getItem('shipper'));

  // LUÔN CHO PHÉP TRUY CẬP NẾU CÓ TOKEN
  const hasToken = localStorage.getItem('shipperToken');
  const hasShipperData = localStorage.getItem('shipper');
  
  if (hasToken && hasShipperData) {
    console.log('✅ PrivateRouteShipper: Has token and data, ALLOWING ACCESS');
    return <>{children}</>;
  }

  // Nếu không có token, hiển thị loading một chút rồi redirect
  console.log('❌ PrivateRouteShipper: No token found, redirecting to main login');
  
  // Redirect về main login thay vì shipper login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRouteShipper;
