'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import ChatPage from '../../../components/common/chatpage/chat-page';

export default function ChatRoute() {
  const params = useParams();
  const chatId = params.chatId as string;

  return (
    <main className="h-full w-full overflow-hidden">
      <ChatPage chatId={chatId} />
    </main>
  );
}
