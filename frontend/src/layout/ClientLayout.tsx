import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import CookieConsent from '../components/client/CookieConsent';
import ChatWidget from '../components/client/ChatWidget';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      <ChatWidget />
    </div>
  );
};

export default ClientLayout; 