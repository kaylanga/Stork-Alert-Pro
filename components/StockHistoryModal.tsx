import React from 'react';
// FIX: StockHistoryLogEntry is now correctly exported from types.ts
import { ProcessedProduct, StockHistoryLogEntry } from '../types';
import { XIcon } from './icons/XIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { PlusMinusIcon } from './icons/PlusMinusIcon';

interface StockHistoryModalProps {
    product: ProcessedProduct;
    onClose: () => void;
}

const eventConfig: { [key in StockHistoryLogEntry['type']]: { icon: React.ReactNode; label: string } } = {
    'Initial Stock': { icon: <PlusMinusIcon className="w-5 h-5 text-gray-500" />, label: 'Initial Stock' },
    'Sale': { icon: <ShoppingCartIcon className="w-5 h-5 text-red-500" />, label: 'Sale' },
    'Manual Adjustment': { icon: <PlusMinusIcon className="w-5 h-5 text-blue-500" />, label: 'Manual Adjustment' },
};

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ product, onClose }) => {
    const sortedHistory = [...product.stockHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative transform transition-all scale-95 animate-modal-enter">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a1a1a]">Stock History</h2>
                            <p className="text-sm text-gray-600 mt-1">{product.name} - {product.sku}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">New Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User/Reason</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedHistory.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                        <div className="flex items-center">
                                            {eventConfig[log.type].icon}
                                            <span className="ml-2">{eventConfig[log.type].label}</span>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.change > 0 ? `+${log.change}` : log.change}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[#1a1a1a]">{log.newTotal}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        <p>{log.user}</p>
                                        {log.reason && <p className="text-xs text-gray-500 italic">{log.reason}</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-enter {
                    animation: modal-enter 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};