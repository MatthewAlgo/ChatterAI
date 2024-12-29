'use client';
import React from 'react';
import { FiPlus, FiMessageSquare } from 'react-icons/fi';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, chats }) => {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
      <div className="p-4">
        <Button 
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleNewChat}
        >
          <FiPlus size={20} className="mr-2" />
          New Chat
        </Button>

        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <FiMessageSquare size={20} className="mr-2" />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{chat.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-500">{chat.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
