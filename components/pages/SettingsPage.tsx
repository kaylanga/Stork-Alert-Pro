import React from 'react';
import { SubscriptionTier } from '../../types';
import { LockIcon } from '../icons/LockIcon';
import ProductAlertEditor from '../ProductAlertEditor';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../contexts/AuthContext';
import SupplierIntegrationEditor from '../SupplierIntegrationEditor';
import { ErrorDisplay } from '../ErrorDisplay';

interface SettingsPageProps {
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-[#e1e3e5]">
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

const LockedFeature: React.FC<{ title: string; description: string; onUpgradeClick: () => void }> = ({ title, description, onUpgradeClick }) => (
    <div className="relative p-6 rounded-lg border-2 border-dashed border-gray-300 mt-6">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
            <LockIcon className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-md font-bold text-[#1a1a1a]">
                {title}
            </h3>
            <p className="text-gray-600 mt-1 text-xs max-w-xs">{description}</p>
            <button 
                onClick={onUpgradeClick}
                className="mt-3 bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs"
            >
                Upgrade to Pro
            </button>
        </div>
        <h3 className="text-md font-semibold text-[#1a1a1a] mb-2 opacity-20">{title}</h3>
        <p className="text-sm text-gray-500 opacity-20">{description}</p>
    </div>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ currentTier, onUpgradeClick }) => {
  const { user } = useAuth();
  const { products, loading, error, refetchData, sendTestAlert, addAlertEmail, removeAlertEmail, addAlertSms, removeAlertSms, addAlertSlack, removeAlertSlack, addSupplierMapping, removeSupplierMapping, updateReorderPoint, updateReorderQuantity, updateSupplierLeadTime } = useInventory();
  const isPro = currentTier === SubscriptionTier.Pro;

  if (error) {
    return <ErrorDisplay message={error} onRetry={refetchData} />;
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <SettingsCard title="Profile">
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="block text-gray-600">Name</label>
                        <input type="text" value={user.name} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 mt-1 text-[#1a1a1a]"/>
                    </div>
                    <div>
                        <label className="block text-gray-600">Email</label>
                        <input type="email" value={user.email} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 mt-1 text-[#1a1a1a]"/>
                    </div>
                </div>
            </SettingsCard>
            <SettingsCard title="Billing & Plan">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Current Plan</p>
                            <p className="text-lg font-bold text-[#008060]">{currentTier}</p>
                        </div>
                        <button 
                            onClick={onUpgradeClick}
                            className="bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            {isPro ? 'Manage Plan' : 'Upgrade to Pro'}
                        </button>
                    </div>
                </div>
            </SettingsCard>
             <SettingsCard title="Supplier Integrations">
                {isPro ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Manage connections to external supplier inventory systems.</p>
                        {loading ? <p className="text-gray-500 text-sm">Loading products...</p> : products.map(p => (
                            <SupplierIntegrationEditor
                                key={p.id}
                                product={p}
                                onAdd={addSupplierMapping}
                                onRemove={removeSupplierMapping}
                            />
                        ))}
                    </div>
                ) : (
                     <LockedFeature 
                        title="Connect External Suppliers"
                        description="Automatically sync inventory from 3rd-party logistics and dropshipping partners."
                        onUpgradeClick={onUpgradeClick}
                    />
                )}
            </SettingsCard>
        </div>
        <div className="lg:col-span-2">
            <SettingsCard title="Product Alert Settings">
                <p className="text-sm text-gray-600 mb-6">Configure inventory thresholds and alert recipients for low-stock notifications on a per-product basis.</p>
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-gray-500">Loading products...</p>
                    ) : (
                        products.map(product => (
                            <ProductAlertEditor
                                key={product.id}
                                product={product}
                                onAddEmail={addAlertEmail}
                                onRemoveEmail={removeAlertEmail}
                                onAddSms={addAlertSms}
                                onRemoveSms={removeAlertSms}
                                onAddSlack={addAlertSlack}
                                onRemoveSlack={removeAlertSlack}
                                onSendTestAlert={sendTestAlert}
                                onUpdateReorderPoint={updateReorderPoint}
                                onUpdateReorderQuantity={updateReorderQuantity}
                                onUpdateSupplierLeadTime={updateSupplierLeadTime}
                                currentTier={currentTier}
                                onUpgradeClick={onUpgradeClick}
                            />
                        ))
                    )}
                </div>
            </SettingsCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;