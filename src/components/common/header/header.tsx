'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { FiLogIn, FiLogOut, FiHome } from 'react-icons/fi';
import { useAuth } from '../../providers/auth-provider';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
    const { isAuthenticated, login, logout } = useAuth();
    const router = useRouter();
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        // This ensures window is only accessed on the client side
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const handleAuthAction = () => {
        if (isAuthenticated) {
            logout();
        } else {
            // Use Next.js router for navigation
            router.push('/auth/login');
        }
    };

    // Determine if the current page is the login or register page
    const isAuthPage = ['/auth/login', '/auth/register'].includes(currentPath);

    return (
        <header className="bg-gray-800 bg-opacity-75 text-white rounded-lg p-4 m-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white tracking-wider">
                    <span className="text-blue-300">C</span>
                    <span className="text-green-300">h</span>
                    <span className="text-yellow-300">a</span>
                    <span className="text-purple-300">t</span>
                    <span className="text-red-300">t</span>
                    <span className="text-pink-300">e</span>
                    <span className="text-indigo-300">r</span>
                    <span className="text-blue-300">AI</span>
                </h1>
                {isAuthPage ? (
                    <Button
                        color="primary"
                        onClick={() => router.push('/')}
                        className="ml-4 flex items-center"
                    >
                        <FiHome className="mr-2" />
                        Home
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        onClick={handleAuthAction}
                        className="ml-4 flex items-center"
                    >
                        {isAuthenticated ? <FiLogOut className="mr-2" /> : <FiLogIn className="mr-2" />}
                        {isAuthenticated ? 'Logout' : 'Login'}
                    </Button>
                )}
            </div>
        </header>
    );
};

export default Header;