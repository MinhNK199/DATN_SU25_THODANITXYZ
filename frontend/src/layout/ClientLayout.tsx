import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import NotificationBanner from '../components/client/NotificationBanner';
import CookieConsent from '../components/client/CookieConsent';
import BackToTop from '../components/client/BackToTop';
import ChatWidget from '../components/client/ChatWidget';

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
      <ChatWidget />
    </div>
  );
};

export default ClientLayout; 