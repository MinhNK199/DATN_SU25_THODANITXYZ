import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/header';
import AdminSidebar from '../components/admin/sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto bg-gradient-to-r from-purple-50 to-blue-50 p-6">
          <div className="bg-white w-full p-5 rounded-xl shadow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
