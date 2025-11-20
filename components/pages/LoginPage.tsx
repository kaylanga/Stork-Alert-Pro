import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShopifyIcon } from '../icons/ShopifyIcon';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="bg-[#f7f7f7] min-h-screen flex flex-col items-center justify-center text-[#1a1a1a] p-4">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-[#008060] rounded-2xl flex items-center justify-center flex-shrink-0 mr-4">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.88 10.05a4.86 4.86 0 00-4.23-2 4.83 4.83 0 00-4.32 2.15A3.44 3.44 0 005 12.5a3.5 3.5 0 003.5 3.5h9.13a2.87 2.87 0 001.25-5.55zM12.11 14.07L11 12.92v2.73a1.13 1.13 0 01-2.26 0V9.34a1.13 1.13 0 012.26 0v2.24l1.11-1.12a1.12 1.12 0 111.59 1.59l-1.92 1.92a1.13 1.13 0 01-1.6 0l-1.91-1.92a1.13 1.13 0 111.59-1.59z" fill="currentColor"/></svg>
            </div>
            <h1 className="text-5xl font-bold">Stock-Alert Pro</h1>
        </div>
        <p className="text-xl text-gray-600 mb-12">
          Your proactive inventory watchdog for Shopify. Stop stockouts before they happen.
        </p>
        <button
          onClick={login}
          className="w-full max-w-sm bg-[#008060] hover:bg-[#006e52] text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center transition-colors duration-300 shadow-lg hover:shadow-green-500/30"
        >
          <ShopifyIcon className="w-7 h-7 mr-3" />
          Login with Shopify
        </button>
        <p className="text-xs text-gray-500 mt-6">
            By logging in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;