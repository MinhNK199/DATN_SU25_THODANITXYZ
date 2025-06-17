import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/header';
import AdminSidebar from '../components/admin/sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto bg-[#f6f9ff] p-6">
          <div className="bg-white w-full p-5 rounded-xl shadow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
