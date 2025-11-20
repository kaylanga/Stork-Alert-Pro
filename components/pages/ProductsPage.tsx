import React, { useState, useMemo } from 'react';
// FIX: Import SubscriptionTier to fix type error.
import { ProcessedProduct, InventoryStatus, SubscriptionTier } from '../../types';
import { AlertIcon } from '../icons/AlertIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useInventory } from '../../hooks/useInventory';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { ErrorDisplay } from '../ErrorDisplay';
import { StockHistoryModal } from '../StockHistoryModal';
import { ClockIcon } from '../icons/ClockIcon';

interface ProductsPageProps {
    onViewDetails: (productId: string) => void;
}

type SortKey = 'name' | 'totalStock' | 'salesVelocity' | 'daysUntilStockout';

const statusConfig: { [key in InventoryStatus]: { color: string, textColor: string, icon: React.ReactElement } } = {
  [InventoryStatus.Healthy]: { color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckIcon className="w-5 h-5 text-green-600" /> },
  [InventoryStatus.Low]: { color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <AlertIcon className="w-5 h-5 text-yellow-600" /> },
  [InventoryStatus.Critical]: { color: 'bg-red-100', textColor: 'text-red-800', icon: <AlertIcon className="w-5 h-5 text-red-600" /> },
};

const ProductsPage: React.FC<ProductsPageProps> = ({ onViewDetails }) => {
  const { products, loading, error, simulateSale, tier, refetchData } = useInventory();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [historyModalProduct, setHistoryModalProduct] = useState<ProcessedProduct | null>(null);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey: key, children }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort(key)}>
      <div className="flex items-center">
        {children}
        {sortKey === key && (
          <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );

  if (error) return <ErrorDisplay message={error} onRetry={refetchData} />;

  return (
    <>
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">All Products</h1>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e1e3e5]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <SortableHeader sortKey="totalStock">Total Stock</SortableHeader>
                <SortableHeader sortKey="salesVelocity">
                    <div className="flex items-center">
                        Sales Velocity
                        {tier === SubscriptionTier.Pro && <span title="AI-Powered Forecast"><SparklesIcon className="w-4 h-4 ml-1.5 text-blue-600" /></span>}
                    </div>
                </SortableHeader>
                <SortableHeader sortKey="daysUntilStockout">Est. Stockout</SortableHeader>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-8 bg-gray-200 rounded w-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap animate-pulse"><div className="h-8 bg-gray-200 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                sortedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#1a1a1a] flex items-center">
                            {product.name}
                            {product.externalInventoryMapping && (
                                <span title={`Synced with ${product.externalInventoryMapping.supplier_name}`}>
                                    <LinkIcon className="w-4 h-4 ml-2 text-cyan-700" />
                                </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.totalStock} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.salesVelocity} / day</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${statusConfig[product.status].textColor}`}>
                      {isFinite(product.daysUntilStockout) ? `~${product.daysUntilStockout} days` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[product.status].color} ${statusConfig[product.status].textColor}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                            onClick={() => setHistoryModalProduct(product)}
                            className="text-gray-400 hover:text-[#008060] p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                            title="View stock history log"
                        >
                            <ClockIcon className="w-5 h-5"/>
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center items-center space-x-2">
                             <button 
                                onClick={() => simulateSale(product.id, 1)}
                                className="text-gray-400 hover:text-[#008060] p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                                title="Simulate a sale of 1 unit"
                            >
                                <ShoppingCartIcon className="w-5 h-5"/>
                            </button>
                             <button 
                                onClick={() => onViewDetails(product.id)}
                                className="text-gray-400 hover:text-[#008060] p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                                title="View product details"
                            >
                                <EyeIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {historyModalProduct && (
        <StockHistoryModal 
            product={historyModalProduct}
            onClose={() => setHistoryModalProduct(null)}
        />
      )}
    </>
  );
};

export default ProductsPage;