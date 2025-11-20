import React from 'react';
// FIX: PurchaseOrder is now correctly exported from types.ts
import { SubscriptionTier, PurchaseOrder } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { ErrorDisplay } from '../ErrorDisplay';

interface ReplenishmentPageProps {
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
}

const PurchaseOrderCard: React.FC<{po: PurchaseOrder}> = ({ po }) => {
    const product = po.product;
    if (!product) return null;

    const estCost = (product.externalInventoryMapping?.cost_per_item || 0) * po.quantity;

    return (
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-gray-200">
            <div className="flex items-center">
                 <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                <div>
                    <p className="font-bold text-[#1a1a1a]">{product.name}</p>
                    <p className="text-sm text-gray-500">To: {product.externalInventoryMapping?.supplier_name || 'N/A'}</p>
                </div>
            </div>
            <div className="text-left sm:text-right">
                <p className="font-semibold text-[#1a1a1a]">{po.quantity} units</p>
                <p className="text-sm text-gray-500">Est. Cost: ${estCost.toFixed(2)}</p>
            </div>
             <div className="flex-shrink-0">
                {po.status === 'Draft' && (
                     <button className="bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                        Review & Send
                    </button>
                )}
                 {po.status === 'Sent' && (
                     <span className="text-sm font-medium text-blue-600">Awaiting Delivery</span>
                )}
            </div>
        </div>
    );
}


const ReplenishmentPage: React.FC<ReplenishmentPageProps> = ({ currentTier, onUpgradeClick }) => {
  // FIX: Destructure purchaseOrders from useInventory.
  const { products, purchaseOrders, loading, error, refetchData } = useInventory();

  if (error) {
    return <ErrorDisplay message={error} onRetry={refetchData} />;
  }

  const draftPOs = purchaseOrders.filter(po => po.status === 'Draft');
  const sentPOs = purchaseOrders.filter(po => po.status === 'Sent');
  const receivedPOs = purchaseOrders.filter(po => po.status === 'Received');

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Replenishment Center</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        This is your command center for reordering stock. Draft purchase orders are automatically created for items that hit their reorder point. Review them here and send them to your suppliers with one click.
      </p>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-[#1a1a1a] border-b border-gray-200 pb-2 mb-4">Draft Purchase Orders ({loading ? '...' : draftPOs.length})</h2>
          <div className="bg-white rounded-lg p-6 border border-[#e1e3e5] shadow-sm space-y-4">
            {loading ? (
                <p className="text-gray-500">Loading drafts...</p>
            ) : draftPOs.length > 0 ? (
                draftPOs.map(po => <PurchaseOrderCard key={po.id} po={po} />)
            ) : (
                <p className="text-gray-500">No purchase orders are waiting for review. Good work!</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#1a1a1a] border-b border-gray-200 pb-2 mb-4">Sent & Awaiting Delivery ({loading ? '...' : sentPOs.length})</h2>
           <div className="bg-white rounded-lg p-6 border border-[#e1e3e5] shadow-sm space-y-4">
             {loading ? (
                <p className="text-gray-500">Loading sent orders...</p>
            ) : sentPOs.length > 0 ? (
                sentPOs.map(po => <PurchaseOrderCard key={po.id} po={po} />)
            ) : (
                <p className="text-gray-500">Purchase orders you've sent to suppliers will be tracked here.</p>
            )}
          </div>
        </div>
        
         <div>
          <h2 className="text-2xl font-semibold text-[#1a1a1a] border-b border-gray-200 pb-2 mb-4">Received History ({loading ? '...' : receivedPOs.length})</h2>
           <div className="bg-white rounded-lg p-6 border border-[#e1e3e5] shadow-sm">
             {loading ? (
                <p className="text-gray-500">Loading history...</p>
            ) : receivedPOs.length > 0 ? (
                <p className="text-gray-500">TODO: Display history</p>
            ) : (
                <p className="text-gray-500">A log of all completed purchase orders will appear here.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReplenishmentPage;