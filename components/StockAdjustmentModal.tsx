import React, { useState } from 'react';
import { ProcessedProduct } from '../types';
import { XIcon } from './icons/XIcon';

interface StockAdjustmentModalProps {
    product: ProcessedProduct;
    onClose: () => void;
    onAdjust: (variantId: string, adjustment: number, reason: string) => void;
}

const adjustmentReasons = [
    'Stock Take Correction',
    'Damaged Goods',
    'Returned by Customer',
    'Promotion/Marketing',
    'Supplier Error',
    'Other',
];

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, onClose, onAdjust }) => {
    const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState(adjustmentReasons[0]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) return;
        
        const adjustmentAmount = adjustmentType === 'increase' ? quantity : -quantity;
        onAdjust(product.id, adjustmentAmount, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative transform transition-all scale-95 animate-modal-enter">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                    <XIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-[#1a1a1a]">Adjust Stock</h2>
                        <div className="flex items-center mt-2">
                           <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-3"/>
                            <div>
                                <p className="font-semibold text-[#1a1a1a]">{product.name}</p>
                                <p className="text-sm text-gray-600">Current Stock: {product.totalStock}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                                <div className="mt-1 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustmentType('increase')}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${adjustmentType === 'increase' ? 'bg-[#008060] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Increase Stock
                                    </button>
                                     <button
                                        type="button"
                                        onClick={() => setAdjustmentType('decrease')}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${adjustmentType === 'decrease' ? 'bg-[#dc3545] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Decrease Stock
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2 text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                />
                            </div>
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                                <select
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2 text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {adjustmentReasons.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={quantity <= 0} className="px-4 py-2 text-sm font-medium text-white bg-[#008060] hover:bg-[#006e52] rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                            Apply Adjustment
                        </button>
                    </div>
                </form>
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

export default StockAdjustmentModal;