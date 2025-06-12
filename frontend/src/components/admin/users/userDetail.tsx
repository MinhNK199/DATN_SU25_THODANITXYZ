import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Card, Spin, Tag } from 'antd'
import { User } from '../../../interfaces/User'

const UserDetail = () => {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/auth/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    // Đúng: lấy user từ res.data.user
    setUser(res.data.user);
  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
};
    fetchUser()
  }, [id])

  if (loading) return <Spin />

  if (!user) return <div>Không tìm thấy người dùng</div>

  return (
    <Card title={`Thông tin người dùng: ${user.name || ''}`} className="rounded-2xl shadow-md p-6 text-gray-800 text-sm">
  <p className="mb-[15px]"><b>Email:</b> <span className="text-gray-700">{user.email}</span></p>

  <p className="flex items-center gap-2 mb-[15px]">
    <b>Quyền:</b>
    <Tag
      color={
        user.role === 'superadmin' ? 'red' :
        user.role === 'admin' ? 'orange' :
        user.role === 'staff' ? 'blue' : 'blue'
      }
      className="uppercase px-1.5 py-0.5 text-xs font-semibold rounded"
    >
      {user.role?.toUpperCase()}
    </Tag>
  </p>

  <p className="flex items-center gap-2 mb-[15px]">
    <b>Trạng thái:</b>
    <Tag
      color={user.active ? 'green' : 'red'}
      className="px-2 py-0.5 text-xs font-medium rounded"
    >
      {user.active ? 'Hoạt động' : 'Vô hiệu hóa'}
    </Tag>
  </p>

  <p className="mb-[15px]"><b>Số điện thoại:</b> <span className="text-gray-700">{user.phone || 'Chưa cập nhật'}</span></p>

  <p className="mb-[15px]">
    <b>Địa chỉ:</b>{' '}
    {Array.isArray(user.addresses) && user.addresses.length > 0 ? (
      user.addresses.map((a, idx) => (
        <div key={idx} className="pl-4 text-gray-700 text-sm">
          {a.street}, {a.city}{' '}
          {a.isDefault && (
            <Tag color="blue" className="ml-2 px-1.5 py-0.5 text-xs rounded">
              Mặc định
            </Tag>
          )}
        </div>
      ))
    ) : (
      'Chưa cập nhật'
    )}
  </p>

  <p className="mb-[15px]">
    <b>Ngày tạo:</b>{' '}
    {user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}
  </p>
</Card>



  )
}

export default UserDetail