import React from 'react';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BarChartIcon } from './icons/BarChartIcon';

interface OnboardingGuideProps {
    onDismiss: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onDismiss }) => {
    
    const checklistItems = [
        {
            icon: <SettingsIcon className="w-5 h-5 text-blue-600" />,
            title: "Configure Your First Alert",
            description: "Go to Settings to set up your first low-stock notification.",
            action: () => { /* In a real app, this would navigate to the Settings page */ }
        },
        {
            icon: <SparklesIcon className="w-5 h-5 text-yellow-600" />,
            title: "Explore Pro Features",
            description: "Preview AI forecasting and multi-channel alerts.",
             action: () => { /* In a real app, this would open the upgrade modal */ }
        },
        {
            icon: <BarChartIcon className="w-5 h-5 text-green-600" />,
            title: "Analyze Sales Trends",
            description: "Check the Analytics page for historical sales data.",
             action: () => { /* In a real app, this would navigate to the Analytics page */ }
        }
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 relative mb-8 shadow-sm animate-fade-in">
            <button 
                onClick={onDismiss} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                aria-label="Dismiss onboarding guide"
            >
                <XIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#008060] rounded-xl flex items-center justify-center mr-4">
                     <CheckIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">Welcome to Stock-Alert Pro!</h2>
                    <p className="text-gray-600">Let's get your inventory protected. Here's a quick guide to get started:</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {checklistItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 hover:bg-gray-100 transition-colors border border-gray-200">
                        <div className="flex-shrink-0 mt-1">{item.icon}</div>
                        <div>
                            <h3 className="font-semibold text-[#1a1a1a]">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default OnboardingGuide;