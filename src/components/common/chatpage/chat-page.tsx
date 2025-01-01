'use client';
import React, { useState, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import ChatSidebar from './chat-sidebar';
import { useAuth } from '../../../components/providers/auth-provider';
import { chatDatabaseService, ChatSession } from '@/services/chat-database.service';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'gpt';
  timestamp: string;
}

interface ChatPageProps {
  chatId?: string;
  initialMessages?: Message[];
}

const ChatPage: React.FC<ChatPageProps> = ({ chatId, initialMessages = [] }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const { user, userAttributes, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  const loadUserChats = async () => {
    if (userAttributes?.sub) {
      const userChats = await chatDatabaseService.getUserChats(userAttributes.sub);
      setChats(userChats);
    }
  };

  const handleNewChat = async () => {
    if (userAttributes?.sub) {
      const newChatId = await chatDatabaseService.createNewChat(userAttributes.sub);
      router.push(`/chat/${newChatId}`);
    }
  };

  const handleDeleteChat = async (chatIdToDelete: string) => {
    await chatDatabaseService.deleteChatHistory(chatIdToDelete);
    await loadUserChats();
    if (chatId === chatIdToDelete) {
      router.push('/chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // TODO: Implement API call to get GPT response
    // const gptResponse = await getGPTResponse(newMessage);
    // setMessages(prev => [...prev, gptResponse]);
  };

  if (!isAuthenticated) {
    return null; // Prevent flash of content while redirecting
  }

  return (
    <div className="flex h-full w-full rounded-xl overflow-hidden">
      <ChatSidebar
        chats={chats}
        currentChatId={chatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        {!chatId ? (
          <div className="flex-1 flex">
            <div className="flex-1 flex items-center justify-center bg-gray-800/20 backdrop-blur-sm m-4 rounded-xl border border-gray-700/30">
              <div className="text-center text-gray-300">
                <h2 className="text-4xl font-bold mb-6">Welcome to ChatAI</h2>
                <p className="text-xl text-gray-400">Select a chat or start a new conversation</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600/90 backdrop-blur-sm text-white'
                        : 'bg-gray-700/90 backdrop-blur-sm text-white'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs text-gray-300 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800/40 backdrop-blur-sm border-t border-gray-700/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="bg-blue-600/90 text-white rounded-xl px-4 py-2 hover:bg-blue-700/90 transition-colors backdrop-blur-sm"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
