'use client';
import { useState } from 'react';
import InputFieldMaterial from '../cards/input-field-material';
import ButtonWithIcon from '../buttons/button-with-icon';
import { FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/user.service';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError('');

        // Client-side validation
        if (!email || !password || !name) {
            setError('All fields are required');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Create user in Cognito
            await register(email, password, name);
            
            // Create user in our database
            await userService.createUser(name, email, password);
            
            router.push('/auth/verify');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <InputFieldMaterial
                        label="Name"
                        placeholder="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <InputFieldMaterial
                        label="Email"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <InputFieldMaterial
                        label="Password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputFieldMaterial
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="flex gap-6 flex-wrap items-center justify-center">
                        <ButtonWithIcon
                            icon={<FaSignInAlt size={16} />}
                            type="submit"
                        >
                            Register
                        </ButtonWithIcon>
                    </div>
                </form>
                <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                    <Link href="/auth/login" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-black transition duration-300 ease-in-out transform hover:scale-105">
                        Already have an account? Login
                    </Link>
                </footer>
            </div>
        </div>
    );
}
