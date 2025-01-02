'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import ChatSidebar from './chat-sidebar';
import { useAuth } from '../../../components/providers/auth-provider';
import { chatDatabaseService, ChatSession } from '@/services/chat-database.service';
import { useRouter } from 'next/navigation';
import { openAIService } from '@/services/azure-openai.service';
import { chatService } from '@/services/chat.service';
import { ChatMessage } from '@/services/types/chat.types';
import { useDatabase } from '../../../components/providers/database-provider';

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

interface ErrorBannerProps {
  error: string;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out animate-fade-in-up">
      <div className="flex items-center space-x-2">
        <span>{
          error.includes('429') 
            ? 'Rate limit exceeded. Please wait a few seconds before trying again.' 
            : 'Failed to get AI response. Please try again.'
        }</span>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ChatPage: React.FC<ChatPageProps> = ({ chatId, initialMessages = [] }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const { user, userAttributes, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, onConnected } = useDatabase();
  const [showBanner, setShowBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (chatId) {
      loadChatHistory();
    }
  }, [chatId]);

  const loadUserChats = useCallback(async () => {
    if (!userAttributes?.sub || !isConnected) return;
    
    try {
      const userChats = await chatDatabaseService.getUserChats(userAttributes.sub);
      setChats(userChats);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, [userAttributes?.sub, isConnected]);

  useEffect(() => {
    loadUserChats();
    
    const intervalId = setInterval(loadUserChats, 30000);
    
    return () => clearInterval(intervalId);
  }, [loadUserChats]);

  useEffect(() => {
    if (isConnected) {
      loadUserChats();
    }
  }, [isConnected, loadUserChats]);

  const loadChatHistory = async () => {
    if (chatId) {
      const history = await chatService.getChatHistory(chatId);
      setMessages(history.map(msg => ({
        id: msg.convoId,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp instanceof Date 
          ? msg.timestamp.toISOString()
          : new Date(msg.timestamp).toISOString()
      })));
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
    if (!newMessage.trim() || !chatId) return;
    setError(null); // Clear any existing errors

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      await chatService.saveMessage(chatId, userMessage.content, 'user');

      const messageHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const fullContext: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        ...messageHistory,
        { role: 'user', content: userMessage.content }
      ];

      const response = await openAIService.getChatCompletion(fullContext, chatId);

      if (response) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response,
          sender: 'gpt',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        await chatService.saveMessage(chatId, response, 'gpt');
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setError(error instanceof Error ? error.message : 'Failed to get AI response');
      setMessages(prev => prev.slice(0, -1)); // Remove the failed message
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out animate-fade-in-up">
          Chat list updated
        </div>
      )}
      
      {error && (
        <ErrorBanner 
          error={error} 
          onClose={() => setError(null)} 
        />
      )}
      
      <div className="flex h-full w-full rounded-xl overflow-hidden">
        <ChatSidebar
          chats={chats}
          currentChatId={chatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
        
        {showBanner && (
          <div className="fixed bottom-4 right-4 z-[9999] bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out animate-fade-in-up">
            Chat list updated
          </div>
        )}
        
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/90 backdrop-blur-sm text-white rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">Thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
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
    </>
  );
};

export default ChatPage;
