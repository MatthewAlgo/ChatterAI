'use client';
import React from 'react';
import Header from '../../../components/common/header/header';
import Footer from '../../../components/common/footer/footer';
import RegisterForm from '../../../components/ui/forms/register-form';

export default function Register() {
  return (
    <main>
      <Header />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <RegisterForm/>
        </main>
      </div>
      <Footer />
    </main>
  );
}