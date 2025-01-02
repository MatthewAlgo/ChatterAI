'use client';
import Header from '../../components/common/header/header';
import Footer from '../../components/common/footer/footer';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      <div className="flex-1 w-full py-6">
        <div className="max-w-7xl mx-auto w-full px-4">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 shadow-xl h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
