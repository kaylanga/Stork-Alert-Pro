import React, { useState, useEffect } from 'react';
import { ProcessedProduct, SubscriptionTier } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MailIcon } from './icons/MailIcon';
import { SmsIcon } from './icons/SmsIcon';
import { SlackIcon } from './icons/SlackIcon';
import { LockIcon } from './icons/LockIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { useNotification } from '../hooks/useNotification';

type AlertType = 'email' | 'sms' | 'slack';

interface ProductAlertEditorProps {
    product: ProcessedProduct;
    currentTier: SubscriptionTier;
    onUpgradeClick: () => void;
    onAddEmail: (variantId: string, email: string) => void;
    onRemoveEmail: (variantId: string, email: string) => void;
    onAddSms: (variantId: string, phone: string) => void;
    onRemoveSms: (variantId: string, phone: string) => void;
    onAddSlack: (variantId: string, channel: string) => void;
    onRemoveSlack: (variantId: string, channel: string) => void;
    onSendTestAlert: (variantId: string) => Promise<string>;
    onUpdateReorderPoint: (variantId: string, units: number) => void;
    onUpdateReorderQuantity: (variantId: string, quantity: number) => void;
    onUpdateSupplierLeadTime: (variantId: string, days: number) => void;
}

const AlertList: React.FC<{ items: string[]; onRemove: (item: string) => void }> = ({ items, onRemove }) => (
    items.length > 0 ? (
        <ul className="space-y-2">
            {items.map(item => (
                <li key={item} className="flex items-center justify-between bg-gray-100 text-sm text-gray-800 px-3 py-1.5 rounded-md border border-gray-200">
                    <span>{item}</span>
                    <button onClick={() => onRemove(item)} className="text-gray-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </li>
            ))}
        </ul>
    ) : (
        <p className="text-sm text-gray-500 italic">No recipients configured.</p>
    )
);

const AddItemForm: React.FC<{
    placeholder: string;
    inputType: string;
    validationPattern?: string;
    validationMessage?: string;
    onAdd: (value: string) => void;
    description?: string;
}> = ({ placeholder, inputType, validationPattern, validationMessage, onAdd, description }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        if (validationPattern && !new RegExp(validationPattern).test(value)) {
            setError(validationMessage || 'Invalid format.');
            return;
        }

        setError('');
        onAdd(value);
        setValue('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start space-x-2 mt-4">
            <div className="flex-grow">
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setError('');
                    }}
                    placeholder={placeholder}
                    className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                {description && !error && <p className="text-gray-500 text-xs mt-1">{description}</p>}
            </div>
            <button type="submit" className="flex-shrink-0 bg-[#008060] hover:bg-[#006e52] text-white font-bold p-2 rounded-lg transition-colors disabled:bg-gray-300" disabled={!value}>
                <PlusCircleIcon className="w-5 h-5" />
            </button>
        </form>
    );
};

const LockedAlertChannel: React.FC<{ onUpgradeClick: () => void }> = ({ onUpgradeClick }) => (
     <div className="relative p-6 rounded-lg border-2 border-dashed border-gray-300 mt-4">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
            <LockIcon className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-md font-bold text-[#1a1a1a]">Unlock Pro Alerts</h3>
            <p className="text-gray-600 mt-1 text-xs max-w-xs">Upgrade to Pro to enable SMS and Slack notifications.</p>
            <button 
                onClick={onUpgradeClick}
                className="mt-3 bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs"
            >
                Upgrade
            </button>
        </div>
        <p className="text-sm text-gray-500 italic opacity-30">No recipients configured.</p>
    </div>
);


const ProductAlertEditor: React.FC<ProductAlertEditorProps> = (props) => {
    const { product, currentTier, onUpgradeClick, onAddEmail, onRemoveEmail, onAddSms, onRemoveSms, onAddSlack, onRemoveSlack, onSendTestAlert, onUpdateReorderPoint, onUpdateReorderQuantity, onUpdateSupplierLeadTime } = props;
    
    const [activeTab, setActiveTab] = useState<AlertType>('email');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const { addNotification } = useNotification();
    const isPro = currentTier === SubscriptionTier.Pro;

    const [reorderPoint, setReorderPoint] = useState(product.alertSetting.reorder_point_units);
    const [reorderQuantity, setReorderQuantity] = useState(product.alertSetting.reorder_quantity);
    const [leadTime, setLeadTime] = useState(product.alertSetting.supplier_lead_time_days);
    const [isEditingSettings, setIsEditingSettings] = useState(false);

    useEffect(() => {
        setReorderPoint(product.alertSetting.reorder_point_units);
        setReorderQuantity(product.alertSetting.reorder_quantity);
        setLeadTime(product.alertSetting.supplier_lead_time_days);
    }, [product]);

    useEffect(() => {
        const hasChanged = reorderPoint !== product.alertSetting.reorder_point_units || 
                           reorderQuantity !== product.alertSetting.reorder_quantity ||
                           leadTime !== product.alertSetting.supplier_lead_time_days;
        setIsEditingSettings(hasChanged);
    }, [reorderPoint, reorderQuantity, leadTime, product.alertSetting]);
    
    const handleSaveSettings = () => {
        onUpdateReorderPoint(product.id, reorderPoint);
        onUpdateReorderQuantity(product.id, reorderQuantity);
        onUpdateSupplierLeadTime(product.id, leadTime);
    };

    const handleCancelSettings = () => {
        setReorderPoint(product.alertSetting.reorder_point_units);
        setReorderQuantity(product.alertSetting.reorder_quantity);
        setLeadTime(product.alertSetting.supplier_lead_time_days);
    };

    const totalRecipients = product.alertSetting.alert_email_list.length + product.alertSetting.alert_sms_list.length + product.alertSetting.alert_slack_list.length;

    const handleSendTest = async () => {
        setIsSendingTest(true);
        try {
            const message = await onSendTestAlert(product.id);
            addNotification({ message, type: 'success' });
        } catch(e: any) {
            addNotification({ message: e.toString(), type: 'error' });
        }
        setIsSendingTest(false);
    };

    const tabs: { id: AlertType; icon: React.ReactNode; label: string }[] = [
        { id: 'email', icon: <MailIcon className="w-5 h-5" />, label: 'Email' },
        { id: 'sms', icon: <SmsIcon className="w-5 h-5" />, label: 'SMS' },
        { id: 'slack', icon: <SlackIcon className="w-5 h-5" />, label: 'Slack' },
    ];
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4" />
                    <div>
                        <p className="font-semibold text-[#1a1a1a]">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                    </div>
                </div>
                 {isPro && (
                    <button 
                        onClick={handleSendTest}
                        disabled={totalRecipients === 0 || isSendingTest}
                        className="flex items-center text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-md transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={totalRecipients === 0 ? "Add at least one recipient to send a test" : "Send a test alert"}
                    >
                        <PaperAirplaneIcon className="w-4 h-4 mr-2"/>
                        {isSendingTest ? "Sending..." : "Send Test"}
                    </button>
                 )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border-t border-b border-gray-200 py-4">
                <div>
                    <label htmlFor={`reorder-point-${product.id}`} className="block text-sm font-medium text-gray-700">Reorder Point</label>
                    <input 
                        type="number"
                        id={`reorder-point-${product.id}`}
                        value={reorderPoint}
                        onChange={e => setReorderPoint(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls to this level.</p>
                </div>
                <div>
                    <label htmlFor={`reorder-qty-${product.id}`} className="block text-sm font-medium text-gray-700">Reorder Quantity</label>
                    <input 
                        type="number"
                        id={`reorder-qty-${product.id}`}
                        value={reorderQuantity}
                        onChange={e => setReorderQuantity(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default qty for purchase orders.</p>
                </div>
                 <div>
                    <label htmlFor={`lead-time-${product.id}`} className="block text-sm font-medium text-gray-700">Supplier Lead Time</label>
                    <input 
                        type="number"
                        id={`lead-time-${product.id}`}
                        value={leadTime}
                        onChange={e => setLeadTime(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2 text-sm text-[#1a1a1a] focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days for stock to arrive.</p>
                </div>
                {isEditingSettings && (
                    <div className="flex items-end space-x-2">
                        <button onClick={handleSaveSettings} className="flex-1 bg-[#008060] hover:bg-[#006e52] text-white font-bold p-2 text-sm rounded-md transition-colors h-10">Save</button>
                        <button onClick={handleCancelSettings} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold p-2 text-sm rounded-md transition-colors h-10">Cancel</button>
                    </div>
                )}
            </div>


            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-[#008060] text-[#008060]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                            }`}
                        >
                            {tab.icon}
                            <span className="ml-2">{tab.label}</span>
                            {!isPro && tab.id !== 'email' && <LockIcon className="w-3 h-3 ml-2 text-yellow-600" />}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'email' && (
                    <div>
                        <AlertList items={product.alertSetting.alert_email_list} onRemove={(email) => onRemoveEmail(product.id, email)} />
                        <AddItemForm
                            placeholder="Add new email..."
                            inputType="email"
                            validationPattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            validationMessage="Please enter a valid email."
                            onAdd={(email) => onAddEmail(product.id, email)}
                        />
                    </div>
                )}
                {activeTab === 'sms' && (isPro ? (
                    <div>
                        <AlertList items={product.alertSetting.alert_sms_list} onRemove={(phone) => onRemoveSms(product.id, phone)} />
                        <AddItemForm
                            placeholder="Add phone number..."
                            inputType="tel"
                            validationPattern="^\+?[1-9]\d{1,14}$"
                            validationMessage="Enter a valid number (e.g., +15551234567)."
                            onAdd={(phone) => onAddSms(product.id, phone)}
                            description="Include country code, e.g., +15551234567"
                        />
                    </div>
                ) : <LockedAlertChannel onUpgradeClick={onUpgradeClick} />)}
                
                {activeTab === 'slack' && (isPro ? (
                     <div>
                        <AlertList items={product.alertSetting.alert_slack_list} onRemove={(channel) => onRemoveSlack(product.id, channel)} />
                        <AddItemForm
                            placeholder="Add Slack channel..."
                            inputType="text"
                            validationPattern="^#[\w-]+$"
                            validationMessage="Enter a valid channel name (e.g., #inventory)."
                            onAdd={(channel) => onAddSlack(product.id, channel)}
                            description="e.g., #inventory. Must be a public channel."
                        />
                    </div>
                ) : <LockedAlertChannel onUpgradeClick={onUpgradeClick} />)}
            </div>
        </div>
    );
};

export default ProductAlertEditor;