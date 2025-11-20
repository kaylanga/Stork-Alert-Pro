import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';

export const ConfirmationPage: React.FC = () => {
    const { user, confirmEmail, logout } = useAuth();
    
    if (!user) {
        // This case should ideally not be hit if routing is correct, but it's a good safeguard.
        return (
            <div className="bg-[#f7f7f7] min-h-screen flex flex-col items-center justify-center text-[#1a1a1a] p-4">
                <p>An error occurred. Please try logging in again.</p>
                <button onClick={logout} className="mt-4 text-[#008060]">Back to Login</button>
            </div>
        );
    }

    return (
        <div className="bg-[#f7f7f7] min-h-screen flex flex-col items-center justify-center text-[#1a1a1a] p-4">
            <div className="text-center max-w-lg bg-white p-10 rounded-lg shadow-md border border-gray-200">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
                    <EnvelopeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold">Confirm Your Email</h1>
                <p className="text-lg text-gray-600 mt-4">
                    We've sent a confirmation link to your email address:
                </p>
                <p className="font-semibold text-lg my-2">{user.email}</p>
                <p className="text-gray-600">
                    Please click the link in that email to finish setting up your account.
                </p>
                
                <div className="mt-8">
                    <p className="text-sm text-gray-500 mb-2">(For demo purposes, click below to confirm)</p>
                    <button
                        onClick={confirmEmail}
                        className="w-full max-w-sm bg-[#008060] hover:bg-[#006e52] text-white font-bold py-3 px-6 rounded-lg text-base transition-colors duration-300"
                    >
                        I've Confirmed My Email
                    </button>
                </div>
                
                <div className="mt-6 flex justify-between items-center text-sm">
                    <button onClick={() => alert("Confirmation email re-sent!")} className="text-[#008060] hover:underline">
                        Resend Email
                    </button>
                     <button onClick={logout} className="text-gray-500 hover:text-gray-800">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;