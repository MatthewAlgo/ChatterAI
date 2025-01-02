'use client';
import React, { useEffect, useState } from 'react';
import Header from '../components/common/header/header';
import Footer from '../components/common/footer/footer';
import Homepage from '../components/common/homepage/homepage';
import { useAuth } from '../components/providers/auth-provider';
import ChatPage from './chat/page';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      {isAuthenticated ? (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 shadow-xl overflow-hidden">
            <ChatPage />
          </div>
        </div>
      ) : (
        <Homepage />
      )}
      <Footer />
    </div>
  );
}
