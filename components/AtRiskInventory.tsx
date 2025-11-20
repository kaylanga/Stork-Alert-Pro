import React, { useMemo } from 'react';
import { ProcessedProduct, InventoryStatus } from '../types';
import { AlertIcon } from './icons/AlertIcon';

interface AtRiskInventoryProps {
    products: ProcessedProduct[];
    loading: boolean;
}

const AtRiskInventory: React.FC<AtRiskInventoryProps> = ({ products, loading }) => {

    const atRiskProducts = useMemo(() => {
        return products
            .filter(p => p.status === InventoryStatus.Low || p.status === InventoryStatus.Critical)
            .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    }, [products]);

    const renderSkeleton = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white rounded-lg p-6 sticky top-24 shadow-sm border border-[#e1e3e5]">
            <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center mb-4">
                <AlertIcon className="w-6 h-6 mr-3 text-yellow-500" />
                At-Risk Inventory
            </h2>
            
            {loading ? renderSkeleton() : (
                atRiskProducts.length > 0 ? (
                    <ul className="space-y-4">
                        {atRiskProducts.map(product => (
                            <li key={product.id} className="flex items-center justify-between hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
                                <div className="flex items-center">
                                    <img 
                                        src={product.imageUrl}
                                        alt={product.name} 
                                        className="w-10 h-10 rounded-md mr-3 object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-[#1a1a1a] text-sm">{product.name}</p>
                                        <p className={`text-xs font-semibold ${product.status === InventoryStatus.Critical ? 'text-red-600' : 'text-yellow-600'}`}>{product.status} Stock</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-[#1a1a1a] text-sm">{product.totalStock} <span className="text-xs text-gray-500 font-normal">units</span></p>
                                     <p className="text-xs text-gray-500">~{product.daysUntilStockout} days left</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                        No products are currently at risk. Great job!
                    </p>
                )
            )}
        </div>
    );
};

export default AtRiskInventory;