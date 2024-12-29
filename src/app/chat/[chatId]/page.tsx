'use client';
import React from 'react';
import ChatPage from '../../../components/common/chatpage/chat-page';
import Header from '../../../components/common/header/header';
import { useParams } from 'next/navigation';

export default function ChatRoute() {
  const params = useParams();
  const chatId = params.chatId as string;

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4">
        <ChatPage chatId={chatId} />
      </main>
    </div>
  );
}
