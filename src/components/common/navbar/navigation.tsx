'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import { FiMenu, FiMessageSquare, FiUser, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../../components/providers/auth-provider';

interface NavigationProps {
  onToggleDrawer: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleDrawer }) => {
  const { isAuthenticated, userAttributes } = useAuth();

  return (
    <nav className="bg-gray-900 p-4 rounded-lg shadow-lg flex justify-between items-center">
      {isAuthenticated && (
        <Button
          onClick={onToggleDrawer}
          className="bg-transparent hover:bg-gray-700 p-2 rounded-lg"
        >
          <FiMenu size={24} />
        </Button>
      )}
      
      <div className="flex space-x-4">
        {isAuthenticated && (
          <>
            <Button className="bg-transparent hover:bg-gray-700 p-2 rounded-lg">
              <FiMessageSquare size={20} />
              <span className="ml-2">Chats</span>
            </Button>
            <Button className="bg-transparent hover:bg-gray-700 p-2 rounded-lg">
              <FiSettings size={20} />
              <span className="ml-2">Settings</span>
            </Button>
          </>
        )}
      </div>

      {isAuthenticated && userAttributes && (
        <div className="flex items-center space-x-2">
          <FiUser size={20} />
          <span>{userAttributes.name || 'User'}</span>
        </div>
      )}
    </nav>
  );
};

export default Navigation;