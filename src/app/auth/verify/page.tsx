'use client';
import React from 'react';
import Header from '../../../components/common/header/header';
import Footer from '../../../components/common/footer/footer';
import VerifyForm from '../../../components/ui/forms/verify-form';
import { useAuth } from '../../../components/providers/auth-provider';

export default function Verify() {
  const { pendingVerificationEmail } = useAuth();

  return (
    <main>
      <Header />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen">
        <main className="flex flex-col gap-8 row-start-2 items-center">
          {pendingVerificationEmail ? (
            <VerifyForm />
          ) : (
            <p className="text-center text-gray-600">
              No pending verification. Please <a href="/auth/login" className="text-blue-500 hover:underline">login</a> first.
            </p>
          )}
        </main>
      </div>
      <Footer />
    </main>
  );
}
