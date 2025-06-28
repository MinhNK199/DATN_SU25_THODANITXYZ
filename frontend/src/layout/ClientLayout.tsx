import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import NotificationBanner from '../components/client/NotificationBanner';
import CookieConsent from '../components/client/CookieConsent';
import BackToTop from '../components/client/BackToTop';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NotificationBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      <BackToTop />
    </div>
  );
};

export default ClientLayout; 