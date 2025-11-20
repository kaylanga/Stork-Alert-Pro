import React, { useState } from 'react';
import { ProcessedProduct, ExternalInventoryMapping } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface SupplierIntegrationEditorProps {
    product: ProcessedProduct;
    onAdd: (variantId: string, mapping: Omit<ExternalInventoryMapping, 'variant_id'>) => void;
    onRemove: (variantId: string) => void;
}

const SupplierIntegrationEditor: React.FC<SupplierIntegrationEditorProps> = ({ product, onAdd, onRemove }) => {
    const [supplierName, setSupplierName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [supplierSku, setSupplierSku] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierName || !apiUrl || !supplierSku) return;
        onAdd(product.id, { supplier_name: supplierName, supplier_api_url: apiUrl, supplier_sku: supplierSku });
        // Reset form
        setSupplierName('');
        setApiUrl('');
        setSupplierSku('');
        setIsAdding(false);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="font-semibold text-[#1a1a1a]">{product.name}</p>
            <p className="text-xs text-gray-500 mb-4">{product.sku}</p>

            {product.externalInventoryMapping ? (
                <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                        <p className="flex items-center font-medium"><LinkIcon className="w-4 h-4 mr-2 text-cyan-700" /> Connected to: <strong>{product.externalInventoryMapping.supplier_name}</strong></p>
                        <p className="mt-1 pl-6"><strong>API URL:</strong> <span className="text-gray-500 break-all">{product.externalInventoryMapping.supplier_api_url}</span></p>
                        <p className="mt-1 pl-6"><strong>Supplier SKU:</strong> <span className="text-gray-500">{product.externalInventoryMapping.supplier_sku}</span></p>
                    </div>
                    <button onClick={() => onRemove(product.id)} className="w-full mt-2 flex items-center justify-center text-sm text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors">
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Remove Connection
                    </button>
                </div>
            ) : (
                <div>
                    {!isAdding ? (
                         <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center text-sm text-[#008060] hover:bg-green-50 p-2 rounded-md transition-colors border-2 border-dashed border-gray-300 hover:border-green-400">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add Supplier Connection
                        </button>
                    ) : (
                        <form onSubmit={handleAdd} className="space-y-3 mt-2">
                             <div>
                                <label className="text-xs text-gray-600 block mb-1">Supplier Name</label>
                                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g., Artisan Leather Goods" className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">Supplier API URL</label>
                                <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.supplier.com/inventory" className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">Supplier SKU</label>
                                <input type="text" value={supplierSku} onChange={e => setSupplierSku(e.target.value)} placeholder="e.g., ALG-WALLET-MIN-BRN" className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <button type="submit" className="flex-1 bg-[#008060] hover:bg-[#006e52] text-white font-bold p-2 text-sm rounded-md transition-colors">Save Connection</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold p-2 text-sm rounded-md transition-colors">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupplierIntegrationEditor;