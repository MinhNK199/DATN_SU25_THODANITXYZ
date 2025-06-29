import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'

type PrivateRouteAdminProps = {
  children: JSX.Element
}

const PrivateRouteAdmin = ({ children }: PrivateRouteAdminProps) => {
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  // Nếu chưa đăng nhập hoặc không phải admin => redirect về trang chủ
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
  return <Navigate to="/" replace />
}

  // Nếu là admin => render children (trang admin)
  return children
}

export default PrivateRouteAdmin
