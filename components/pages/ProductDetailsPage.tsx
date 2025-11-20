import React from 'react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryStatus } from '../../types';
import SalesHistoryChart from '../charts/SalesHistoryChart';
import { AlertIcon } from '../icons/AlertIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { WarehouseIcon } from '../icons/WarehouseIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { BarChartIcon } from '../icons/BarChartIcon';
import { ErrorDisplay } from '../ErrorDisplay';

interface ProductDetailsPageProps {
    productId: string;
    onBack: () => void;
}

const statusConfig: { [key in InventoryStatus]: { color: string, textColor: string, icon: React.ReactElement, text: string } } = {
  [InventoryStatus.Healthy]: { color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckIcon className="w-5 h-5 text-green-600" />, text: 'Healthy Stock' },
  [InventoryStatus.Low]: { color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <AlertIcon className="w-5 h-5 text-yellow-600" />, text: 'Low Stock' },
  [InventoryStatus.Critical]: { color: 'bg-red-100', textColor: 'text-red-800', icon: <AlertIcon className="w-5 h-5 text-red-600" />, text: 'Critical Stock' },
};

const DetailCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e1e3e5] p-6">
        <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center mb-4">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        {children}
    </div>
);

const SalesHistoryTable: React.FC<{ product: ReturnType<typeof useInventory>['products'][0] }> = ({ product }) => {
    const recentSales = [...product.salesHistory].reverse().slice(0, 10);
    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Recent Transactions</h3>
            <div className="overflow-x-auto max-h-64 border rounded-lg border-gray-200">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentSales.map((sale, index) => (
                            <tr key={`${sale.date}-${index}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(sale.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-[#1a1a1a] text-right font-semibold">{sale.units_sold}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, onBack }) => {
    const { products, loading, error, refetchData, tier } = useInventory();
    const product = products.find(p => p.id === productId);

    if (loading) {
        return <div className="text-center text-gray-500">Loading product details...</div>;
    }

    if (error) {
        return <ErrorDisplay message={error} onRetry={refetchData} />
    }
    
    if (!product) {
        return (
            <div className="text-center text-yellow-600">
                Product not found. It might have been removed.
                <button onClick={onBack} className="mt-4 block mx-auto text-[#008060] hover:text-[#006e52]">Go Back</button>
            </div>
        );
    }
    
    const config = statusConfig[product.status];

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-[#008060] hover:text-[#006e52] mb-6 font-semibold">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Products
            </button>

            {/* Header */}
            <div className="flex items-center mb-8">
                <img src={product.imageUrl} alt={product.name} className="w-24 h-24 rounded-lg object-cover border border-gray-200 mr-6" />
                <div>
                    <h1 className="text-3xl font-bold text-[#1a1a1a]">{product.name}</h1>
                    <p className="text-md text-gray-600">{product.sku}</p>
                    <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.textColor}`}>
                        {config.icon}
                        <span className="ml-1.5">{config.text}</span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <DetailCard title="Inventory Breakdown" icon={<WarehouseIcon className="w-6 h-6 text-gray-600" />}>
                       <ul className="space-y-3 text-sm">
                            {product.inventory.map(item => (
                            <li key={item.centerId} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md">
                                <span className="text-gray-700">{item.centerName}</span>
                                <span className="font-semibold text-[#1a1a1a]">{item.stock} units</span>
                            </li>
                            ))}
                             <li className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3!">
                                <span className="text-gray-800 font-bold">Total Stock</span>
                                <span className="font-extrabold text-lg text-[#1a1a1a]">{product.totalStock} units</span>
                            </li>
                        </ul>
                         {product.externalInventoryMapping && (
                            <div className="text-xs text-cyan-700/80 mt-4 flex items-center">
                                <LinkIcon className="w-4 h-4 mr-2"/>
                                Part of this inventory is synced from {product.externalInventoryMapping.supplier_name}.
                            </div>
                        )}
                    </DetailCard>

                     <DetailCard title="Alert Settings" icon={<SettingsIcon className="w-6 h-6 text-gray-600" />}>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between"><span className="text-gray-600">Reorder Point:</span> <span className="font-semibold text-[#1a1a1a]">{product.alertSetting.reorder_point_units} units</span></li>
                            <li className="flex justify-between"><span className="text-gray-600">Reorder Quantity:</span> <span className="font-semibold text-[#1a1a1a]">{product.alertSetting.reorder_quantity} units</span></li>
                            <li className="flex justify-between"><span className="text-gray-600">Low Stock Threshold:</span> <span className="font-semibold text-[#1a1a1a]">{product.alertSetting.low_stock_threshold_days} days</span></li>
                            <li className="flex justify-between"><span className="text-gray-600">Supplier Lead Time:</span> <span className="font-semibold text-[#1a1a1a]">{product.alertSetting.supplier_lead_time_days} days</span></li>
                        </ul>
                    </DetailCard>
                </div>
                <div className="lg:col-span-2">
                    <DetailCard title="Sales History" icon={<BarChartIcon className="w-6 h-6 text-gray-600" />}>
                        <SalesHistoryChart products={products.filter(p => p.id === productId)} tier={tier} loading={loading} />
                        <SalesHistoryTable product={product} />
                    </DetailCard>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;