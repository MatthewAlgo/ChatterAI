'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatSession } from '@/services/chat-database.service';
import { FiPlus, FiMessageSquare, FiTrash } from 'react-icons/fi';

interface ChatSidebarProps {
    chats: ChatSession[];
    currentChatId?: string;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
    chats, 
    currentChatId, 
    onNewChat,
    onDeleteChat 
}) => {
    return (
        <div className="w-64 bg-gray-800/40 backdrop-blur-sm h-full flex flex-col border-r border-gray-700/30">
            <button
                onClick={onNewChat}
                className="flex items-center justify-center gap-2 p-4 hover:bg-gray-700/30 w-full text-gray-200 rounded-tr-xl"
            >
                <FiPlus /> New Chat
            </button>
            
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                    <div 
                        key={chat.chatId}
                        className={`flex items-center justify-between p-4 hover:bg-gray-700/30 ${
                            currentChatId === chat.chatId ? 'bg-gray-700/30' : ''
                        }`}
                    >
                        <Link href={`/chat/${chat.chatId}`} className="flex-1">
                            <div className="flex items-center gap-2">
                                <FiMessageSquare />
                                <div>
                                    <div className="font-medium">{chat.chatName}</div>
                                    {chat.lastMessage && (
                                        <div className="text-sm text-gray-400 truncate">
                                            {chat.lastMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={() => onDeleteChat(chat.chatId)}
                            className="p-2 hover:text-red-500"
                        >
                            <FiTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;
