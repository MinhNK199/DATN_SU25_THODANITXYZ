import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';

const ProfileLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          
          {/* Sidebar - sticky, cố định khi cuộn */}
          <div className="w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-8">
            <ProfileSidebar />
          </div>
          
          {/* Main content - phần này cuộn riêng */}
          <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-white rounded-lg shadow-sm p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
