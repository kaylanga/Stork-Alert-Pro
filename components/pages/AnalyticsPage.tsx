import React from 'react';
import { SubscriptionTier } from '../../types';
import { LockIcon } from '../icons/LockIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useInventory } from '../../hooks/useInventory';
import SalesHistoryChart from '../charts/SalesHistoryChart';
import { ErrorDisplay } from '../ErrorDisplay';

interface AnalyticsPageProps {
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
}

const ChartPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white p-6 rounded-lg border border-[#e1e3e5] shadow-sm">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">{title}</h3>
        <div className="animate-pulse flex items-end justify-between h-48 bg-gray-100 rounded-md p-4">
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-2/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/2"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-3/4"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-full"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-2/5"></div>
        </div>
    </div>
);

const LockedFeatureCard: React.FC<{ title: string, description: string, onUpgradeClick: () => void }> = ({ title, description, onUpgradeClick }) => (
    <div className="relative bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
            <LockIcon className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-blue-600"/>
                {title}
            </h3>
            <p className="text-gray-600 mt-2 text-sm max-w-xs">{description}</p>
            <button 
                onClick={onUpgradeClick}
                className="mt-4 bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
                Upgrade to Pro
            </button>
        </div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4 opacity-20">{title}</h3>
        <div className="flex items-end justify-between h-48 bg-gray-100 rounded-md p-4 opacity-20">
             <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-2/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/2"></div>
        </div>
    </div>
);

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ currentTier, onUpgradeClick }) => {
  const isPro = currentTier === SubscriptionTier.Pro;
  const { products, loading, error, refetchData } = useInventory();

  if (error) {
    return <ErrorDisplay message={error} onRetry={refetchData} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Sales & Inventory Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {isPro ? (
            <SalesHistoryChart products={products} tier={currentTier} loading={loading} />
        ) : (
            <LockedFeatureCard
                title="Historical Sales Analysis"
                description="Visualize sales trends over the last 30 days to make smarter inventory decisions."
                onUpgradeClick={onUpgradeClick}
            />
        )}

        <ChartPlaceholder title="Inventory by Fulfillment Center" />
        
        {isPro ? (
            <ChartPlaceholder title="Advanced Forecasting Reports" />
        ) : (
            <LockedFeatureCard 
                title="Advanced Forecasting Reports"
                description="Unlock deep insights with AI-powered trend analysis and seasonal demand prediction."
                onUpgradeClick={onUpgradeClick}
            />
        )}

        {isPro ? (
            <ChartPlaceholder title="SKU Performance Breakdown" />
        ) : (
            <LockedFeatureCard 
                title="SKU Performance Breakdown"
                description="Identify your top-performing products and optimize your inventory for profitability."
                onUpgradeClick={onUpgradeClick}
            />
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;