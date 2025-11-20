import React from 'react';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SubscriptionTier } from '../types';

interface TierModalProps {
  onClose: () => void;
  onSelectTier: (tier: SubscriptionTier) => void;
}

interface TierCardProps {
    title: string;
    price: string;
    features: string[];
    isPro?: boolean;
    onClick: () => void;
    buttonText: string;
    disabled?: boolean;
}

const TierCard: React.FC<TierCardProps> = ({ title, price, features, isPro = false, onClick, buttonText, disabled = false }) => (
  <div className={`rounded-xl p-8 w-full md:w-1/2 border ${isPro ? 'bg-[#1a1a1a] text-white border-gray-800' : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
    <h3 className="text-2xl font-bold">{title}</h3>
    <p className="text-4xl font-extrabold mt-4">
      ${price}
      <span className={`text-base font-medium ${isPro ? 'text-gray-300' : 'text-gray-500'}`}>/month</span>
    </p>
    <ul className="mt-8 space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckIcon className={`w-6 h-6 mr-3 flex-shrink-0 ${isPro ? 'text-white' : 'text-[#008060]'}`} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`w-full mt-10 py-3 font-bold rounded-lg transition-colors ${
            disabled 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isPro 
                    ? 'bg-white text-[#1a1a1a] hover:bg-gray-200' 
                    : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'
        }`}>
      {buttonText}
    </button>
  </div>
);

const TierModal: React.FC<TierModalProps> = ({ onClose, onSelectTier }) => {
  const starterFeatures = [
    "Track up to 3 items",
    "Basic low-stock email alerts",
    "Standard support",
  ];

  const proFeatures = [
    "Track unlimited items",
    "AI Sales velocity forecasting",
    "Slack & SMS alerts",
    "Priority support",
    "API Access",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative transform transition-all scale-95 animate-modal-enter">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a]">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mt-2">Scale your business without the fear of stockouts.</p>
          <div className="mt-10 flex flex-col md:flex-row gap-8 items-center">
            <TierCard 
                title="Starter" 
                price="15" 
                features={starterFeatures} 
                onClick={() => onSelectTier(SubscriptionTier.Starter)}
                buttonText="Current Plan"
                disabled
            />
            <TierCard 
                title="Pro" 
                price="49" 
                features={proFeatures} 
                isPro 
                onClick={() => onSelectTier(SubscriptionTier.Pro)}
                buttonText="Upgrade to Pro & Preview"
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TierModal;