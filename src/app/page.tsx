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
    // Give a small delay to prevent flash of content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main>
      <Header />
      {isAuthenticated ? (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <div className='px-4 py-2 text-white sm:px-8 sm:py-3'>
              <ChatPage/>
            </div>
          </main>
        </div>
      ) : (
        <Homepage />
      )}
      <Footer />
    </main>
  );
}
