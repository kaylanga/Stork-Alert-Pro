import React from 'react';
import { AlertIcon } from './icons/AlertIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface ErrorDisplayProps {
    message: string;
    onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm my-8 text-center">
            <div className="flex justify-center mb-4">
                <AlertIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-800">An Error Occurred</h3>
            <p className="mt-2 text-sm text-red-700">{message}</p>
            <p className="mt-1 text-sm text-red-700">Please check your connection and try again.</p>
            <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                <RefreshIcon className="w-5 h-5 mr-2"/>
                Retry
            </button>
        </div>
    );
};
