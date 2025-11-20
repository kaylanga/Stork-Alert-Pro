import React, { useState } from 'react';
import { ProcessedProduct, InventoryStatus, SubscriptionTier } from '../types';
import { AlertIcon } from './icons/AlertIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { WarehouseIcon } from './icons/WarehouseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LockIcon } from './icons/LockIcon';
import { LinkIcon } from './icons/LinkIcon';
import { PlusMinusIcon } from './icons/PlusMinusIcon';
import StockAdjustmentModal from './StockAdjustmentModal';

interface ProductCardProps {
  product: ProcessedProduct;
  getReorderSuggestion: (product: ProcessedProduct) => Promise<string>;
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
  adjustStock: (variantId: string, adjustment: number, reason: string) => void;
}

const statusConfig = {
  [InventoryStatus.Healthy]: {
    color: 'bg-green-100',
    textColor: 'text-green-800',
    icon: <CheckIcon className="w-5 h-5 text-green-600" />,
    text: 'Healthy Stock',
  },
  [InventoryStatus.Low]: {
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: <AlertIcon className="w-5 h-5 text-yellow-600" />,
    text: 'Low Stock',
  },
  [InventoryStatus.Critical]: {
    color: 'bg-red-100',
    textColor: 'text-red-800',
    icon: <AlertIcon className="w-5 h-5 text-red-600" />,
    text: 'Critical Stock',
  },
};

const ProductCard: React.FC<ProductCardProps> = ({ product, getReorderSuggestion, currentTier, onUpgradeClick, adjustStock }) => {
  const { name, sku, imageUrl, totalStock, salesVelocity, daysUntilStockout, status, inventory, analysis, alertSetting, externalInventoryMapping } = product;
  const config = statusConfig[status];

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);


  const handleSuggestionClick = async () => {
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    const result = await getReorderSuggestion(product);
    setSuggestion(result);
    setIsLoadingSuggestion(false);
  };

  const isLowStock = status === InventoryStatus.Low || status === InventoryStatus.Critical;

  const progressBarSegments = (() => {
    const criticalThreshold = alertSetting.reorder_point_units;
    const lowThreshold = salesVelocity * alertSetting.low_stock_threshold_days;
    const maxForProgressBar = Math.max(lowThreshold * 1.5, totalStock * 1.2, 1);
    
    const segments: { color: string; width: number }[] = [];
        
    const criticalStockAmount = Math.min(totalStock, criticalThreshold);
    const lowStockAmount = Math.max(0, Math.min(totalStock, lowThreshold) - criticalStockAmount);
    const healthyStockAmount = Math.max(0, totalStock - lowThreshold);

    if (criticalStockAmount > 0) {
        segments.push({
            color: 'bg-[#dc3545]', // red
            width: (criticalStockAmount / maxForProgressBar) * 100,
        });
    }
    if (lowStockAmount > 0) {
         segments.push({
            color: 'bg-[#ffc107]', // yellow
            width: (lowStockAmount / maxForProgressBar) * 100,
        });
    }
    if (healthyStockAmount > 0) {
        segments.push({
            color: 'bg-[#28a745]', // green
            width: (healthyStockAmount / maxForProgressBar) * 100,
        });
    }
    
    const totalWidth = segments.reduce((sum, s) => sum + s.width, 0);
    if (totalWidth > 100) {
        return segments.map(s => ({ ...s, width: (s.width / totalWidth) * 100 }));
    }
    return segments;
  })();


  return (
    <>
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transform hover:shadow-md transition-shadow duration-300 ease-in-out border border-[#e1e3e5] flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex items-start space-x-4">
          <img src={imageUrl} alt={name} className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1a1a1a]">{name}</h3>
            <p className="text-sm text-gray-500">{sku}</p>
            <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.textColor}`}>
              {config.icon}
              <span className="ml-1.5">{config.text}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-600">Total Stock</span>
            <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#1a1a1a]">{totalStock} <span className="text-base font-normal text-gray-500">units</span></span>
                 <button onClick={() => setIsAdjustmentModalOpen(true)} className="text-gray-400 hover:text-gray-800 transition-colors" title="Adjust Stock Manually">
                    <PlusMinusIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 flex">
            {progressBarSegments.map((seg, index) => (
                <div 
                    key={index} 
                    className={`${seg.color} h-full first:rounded-l-full last:rounded-r-full`} 
                    style={{ width: `${seg.width}%` }}
                ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Empty</span>
            <span>Full</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center justify-center"><TrendingUpIcon className="w-4 h-4 mr-1"/>Sales Velocity</p>
            <p className="text-lg font-semibold text-[#1a1a1a]">{salesVelocity} <span className="text-sm font-normal text-gray-500">/ day</span></p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center justify-center"><AlertIcon className="w-4 h-4 mr-1"/>Est. Stockout</p>
            <p className={`text-lg font-semibold ${status === InventoryStatus.Critical ? 'text-red-600' : status === InventoryStatus.Low ? 'text-yellow-600' : 'text-gray-800'}`}>
              {isFinite(daysUntilStockout) ? `~${daysUntilStockout} days` : 'N/A'}
            </p>
          </div>
        </div>
        
        {analysis && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center mb-1">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Gemini Forecast Analysis
              </h4>
              <p className="text-sm text-gray-700 italic">"{analysis}"</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
            <WarehouseIcon className="w-5 h-5 mr-2 text-gray-500" />
            Fulfillment Centers
            {externalInventoryMapping && (
              <span title={`Synced with ${externalInventoryMapping.supplier_name}`}>
                <LinkIcon className="w-4 h-4 ml-2 text-cyan-600" />
              </span>
            )}
          </h4>
          <ul className="space-y-2 text-sm">
            {inventory.map(item => (
              <li key={item.centerId} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md">
                <span className="text-gray-700">{item.centerName}</span>
                <span className="font-semibold text-[#1a1a1a]">{item.stock} units</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isLowStock && (
        <div className="p-5 pt-0 mt-auto">
          {currentTier === SubscriptionTier.Pro ? (
            <div>
              <button 
                onClick={handleSuggestionClick}
                disabled={isLoadingSuggestion}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#1a1a1a] rounded-md hover:bg-[#333333] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-wait transition-colors"
              >
                <SparklesIcon className="w-5 h-5 mr-2"/>
                {isLoadingSuggestion ? 'Analyzing...' : 'Get Reorder Suggestion'}
              </button>
              {suggestion && (
                 <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-800">{suggestion}</p>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onUpgradeClick}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
            >
              <LockIcon className="w-5 h-5 mr-2"/>
              Unlock Reorder Suggestions
            </button>
          )}
        </div>
      )}
    </div>
    {isAdjustmentModalOpen && (
        <StockAdjustmentModal 
            product={product}
            onClose={() => setIsAdjustmentModalOpen(false)}
            onAdjust={adjustStock}
        />
    )}
    </>
  );
};

export default ProductCard;