import type { JSX } from 'react'
import AdminAccessDenied from './AdminAccessDenied'

type PrivateRouteAdminProps = {
  children: JSX.Element
}

const PrivateRouteAdmin = ({ children }: PrivateRouteAdminProps) => {
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  // Nếu chưa đăng nhập hoặc không phải admin => hiển thị trang 404
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <AdminAccessDenied />
  }

  // Nếu là admin => render children (trang admin)
  return children
}

export default PrivateRouteAdmin
