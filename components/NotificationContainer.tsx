import React from 'react';
import { useNotification } from '../hooks/useNotification';
import { CheckIcon } from './icons/CheckIcon';
import { AlertIcon } from './icons/AlertIcon';
import { XIcon } from './icons/XIcon';

const NotificationToast: React.FC<{
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}> = ({ message, type, onDismiss }) => {
    const isSuccess = type === 'success';

    return (
        <div 
            className={`w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${isSuccess ? 'border-green-300' : 'border-red-300'} animate-toast-enter`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {isSuccess ? (
                            <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                        ) : (
                            <AlertIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                        )}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className={`text-sm font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                            {isSuccess ? 'Success' : 'Error'}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onDismiss}
                        >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <>
            <div
                aria-live="assertive"
                className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
            >
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map((notification) => (
                        <NotificationToast
                            key={notification.id}
                            message={notification.message}
                            type={notification.type}
                            onDismiss={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes toast-enter {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-toast-enter {
                    animation: toast-enter 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default NotificationContainer;