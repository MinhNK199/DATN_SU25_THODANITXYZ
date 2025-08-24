import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const location = useLocation();
  const summary = location.state || {};
  const navigate = useNavigate();
  
  // Redirect đến trang checkout đầu tiên
  useEffect(() => {
    navigate('/checkout/shipping', { state: summary });
  }, [navigate, summary]);
  
  // Không render gì cả vì sẽ redirect
  return null;
};

export default Checkout;
