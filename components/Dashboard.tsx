import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { ProcessedProduct, SubscriptionTier } from '../types';
import { LockIcon } from './icons/LockIcon';
import AlertsSettings from './AlertsSettings';
import { useInventory } from '../hooks/useInventory';
import OnboardingGuide from './OnboardingGuide';
import AtRiskInventory from './AtRiskInventory';
import { ErrorDisplay } from './ErrorDisplay';

interface DashboardProps {
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentTier, onUpgradeClick }) => {
  const { products, loading, error, getReorderSuggestion, adjustStock, refetchData } = useInventory();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const STARTER_TIER_LIMIT = 3;

  const renderSkeleton = () => (
    <div className="bg-white rounded-lg p-4 animate-pulse border border-[#e1e3e5] shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 h-6 bg-gray-200 rounded w-full"></div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
  
  if (error) {
    return <ErrorDisplay message={error} onRetry={refetchData} />
  }

  const visibleProducts = currentTier === SubscriptionTier.Starter ? products.slice(0, STARTER_TIER_LIMIT) : products;
  const hiddenProductCount = products.length - visibleProducts.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <div>
            {showOnboarding && <OnboardingGuide onDismiss={() => setShowOnboarding(false)} />}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Inventory Overview</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading 
                ? Array.from({ length: 4 }).map((_, index) => <div key={index}>{renderSkeleton()}</div>)
                : visibleProducts.map((product: ProcessedProduct) => (
                <ProductCard 
                    key={product.id} 
                    product={product}
                    getReorderSuggestion={getReorderSuggestion}
                    currentTier={currentTier}
                    onUpgradeClick={onUpgradeClick}
                    adjustStock={adjustStock}
                />
            ))}
            {hiddenProductCount > 0 && (
                <div className="relative bg-white rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                    <LockIcon className="w-12 h-12 text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold text-[#1a1a1a]">Unlock More Products</h3>
                    <p className="text-gray-600 mt-2">
                    Your current plan allows you to track {STARTER_TIER_LIMIT} items.
                    </p>
                    <button 
                    onClick={onUpgradeClick}
                    className="mt-4 bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                    Upgrade to Pro
                    </button>
                </div>
                <div className="w-24 h-24 bg-gray-200 rounded-md mb-4 opacity-30"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 opacity-30"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 opacity-30"></div>
                </div>
            )}
            </div>
        </div>
      </div>
      <div className="xl:col-span-1 space-y-8">
          <AtRiskInventory products={products} loading={loading} />
          <AlertsSettings />
      </div>
    </div>
  );
};

export default Dashboard;