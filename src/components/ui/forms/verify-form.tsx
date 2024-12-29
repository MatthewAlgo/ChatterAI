'use client';
import { useState, useEffect } from 'react';
import InputFieldMaterial from '../cards/input-field-material';
import ButtonWithIcon from '../buttons/button-with-icon';
import { FaCheck } from 'react-icons/fa';
import { useAuth } from '../../../components/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function VerifyForm() {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const { verifyEmail, pendingVerificationEmail, setPendingVerificationEmail } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!pendingVerificationEmail) {
            router.push('/auth/login');
        }
    }, [pendingVerificationEmail, router]);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!pendingVerificationEmail) {
            setError('No email to verify');
            return;
        }
        try {
            await verifyEmail(pendingVerificationEmail, verificationCode);
            setPendingVerificationEmail(null);
            router.push('/auth/login');
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        }
    }

    if (!pendingVerificationEmail) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
                <p className="text-center">Please enter the verification code sent to {pendingVerificationEmail}</p>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <InputFieldMaterial
                        label="Verification Code"
                        placeholder="Enter verification code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <div className='flex gap-6 flex-wrap items-center justify-center'>
                        <ButtonWithIcon icon={<FaCheck size={16} />} type="submit">
                            Verify
                        </ButtonWithIcon>
                    </div>
                </form>
            </div>
        </div>
    );
}
