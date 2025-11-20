import React, { createContext, useState, useEffect, useCallback } from 'react';
// FIX: Import PurchaseOrder and StockHistoryLogEntry
import { ProcessedProduct, SubscriptionTier, InventoryStatus, SalesHistoryEntry, ExternalInventoryMapping, ProductVariant, InventoryLevel, PurchaseOrder, StockHistoryLogEntry } from '../types';
import * as api from '../api';

interface InventoryContextType {
    products: ProcessedProduct[];
    // FIX: Add purchaseOrders for replenishment page
    purchaseOrders: PurchaseOrder[];
    loading: boolean;
    error: string | null;
    tier: SubscriptionTier;
    getReorderSuggestion: (product: ProcessedProduct) => Promise<string>;
    simulateSale: (variantId: string, quantity: number) => void;
    addAlertEmail: (variantId: string, email: string) => void;
    removeAlertEmail: (variantId: string, email: string) => void;
    addAlertSms: (variantId: string, phone: string) => void;
    removeAlertSms: (variantId: string, phone: string) => void;
    addAlertSlack: (variantId: string, channel: string) => void;
    removeAlertSlack: (variantId: string, channel: string) => void;
    sendTestAlert: (variantId: string) => Promise<string>;
    addSupplierMapping: (variantId: string, mapping: Omit<ExternalInventoryMapping, 'variant_id'>) => void;
    removeSupplierMapping: (variantId: string) => void;
    updateReorderPoint: (variantId: string, units: number) => void;
    updateReorderQuantity: (variantId: string, quantity: number) => void;
    updateSupplierLeadTime: (variantId: string, days: number) => void;
    adjustStock: (variantId: string, adjustment: number, reason: string) => void;
    // FIX: Expose refetchData
    refetchData: () => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
    children: React.ReactNode;
    tier: SubscriptionTier;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children, tier }) => {
    const [products, setProducts] = useState<ProcessedProduct[]>([]);
    // FIX: Add state for purchase orders
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const composedProducts = await api.fetchProcessedProducts(tier);
            setProducts(composedProducts);

            // FIX: Generate mock purchase orders
            const draftPOs: PurchaseOrder[] = composedProducts
                .filter(p => p.status === InventoryStatus.Critical)
                .map(p => ({
                    id: `po_draft_${p.id}`,
                    product: p,
                    quantity: p.alertSetting.reorder_quantity,
                    status: 'Draft',
                }));
            const sentPOs: PurchaseOrder[] = composedProducts
                .filter(p => p.id === 'prod_2') // Mock one as sent
                .map(p => ({
                    id: `po_sent_${p.id}`,
                    product: p,
                    quantity: 50,
                    status: 'Sent',
                }));
            setPurchaseOrders([...draftPOs, ...sentPOs]);
        } catch (e) {
            console.error(e);
            setError('Failed to fetch inventory data from the server.');
        } finally {
            setLoading(false);
        }
    }, [tier]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getReorderSuggestion = (product: ProcessedProduct): Promise<string> => {
        return api.fetchReorderSuggestion(product);
    };

    // FIX: Refactored recalculateProductState to be more robust
    const recalculateProductState = (product: ProcessedProduct, newSalesHistory?: SalesHistoryEntry[]): ProcessedProduct => {
        const salesHistoryToUse = newSalesHistory || product.salesHistory;
        // Velocity and forecasting should always be based on the most recent 30 days for accuracy
        const recentSalesHistory = salesHistoryToUse.slice(-30);
        const totalSales = recentSalesHistory.reduce((sum, s) => sum + s.units_sold, 0);
        const newSalesVelocity = recentSalesHistory.length > 0 ? totalSales / recentSalesHistory.length : 0;
        
        const newDaysUntilStockout = newSalesVelocity > 0 ? product.totalStock / newSalesVelocity : Infinity;
        
        let newStatus: InventoryStatus;
        if (product.totalStock <= product.alertSetting.reorder_point_units) {
            newStatus = InventoryStatus.Critical;
        } else if (newDaysUntilStockout < product.alertSetting.low_stock_threshold_days) {
            newStatus = InventoryStatus.Low;
        } else {
            newStatus = InventoryStatus.Healthy;
        }

        return {
            ...product,
            salesHistory: salesHistoryToUse,
            salesVelocity: parseFloat(newSalesVelocity.toFixed(1)),
            daysUntilStockout: Math.floor(newDaysUntilStockout),
            status: newStatus,
        };
    };

    // FIX: Updated to log sale to stock history
    const simulateSale = (variantId: string, quantity: number) => {
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === variantId) {
                    const newTotalStock = p.totalStock - quantity;

                    const today = new Date().toISOString().split('T')[0];
                    const newSalesHistory: SalesHistoryEntry[] = [...p.salesHistory, {
                        variant_id: p.id,
                        date: today,
                        units_sold: quantity
                    }];

                    const newStockHistoryLog: StockHistoryLogEntry = {
                        id: `log_${new Date().getTime()}`,
                        timestamp: new Date().toISOString(),
                        type: 'Sale',
                        change: -quantity,
                        newTotal: newTotalStock,
                        user: 'System'
                    };
                    
                    const updatedProduct = {
                        ...p,
                        totalStock: newTotalStock,
                        stockHistory: [...p.stockHistory, newStockHistoryLog]
                    };
                    
                    return recalculateProductState(updatedProduct, newSalesHistory);
                }
                return p;
            });
        });
    };

    // FIX: Updated to log adjustment to stock history
    const adjustStock = (variantId: string, adjustment: number, reason: string) => {
        console.log(`Adjusting stock for ${variantId} by ${adjustment}. Reason: ${reason}`);
         setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === variantId) {
                    const newTotalStock = p.totalStock + adjustment;
                    
                    const newStockHistoryLog: StockHistoryLogEntry = {
                        id: `log_${new Date().getTime()}`,
                        timestamp: new Date().toISOString(),
                        type: 'Manual Adjustment',
                        change: adjustment,
                        newTotal: newTotalStock,
                        user: 'Jane Doe', // This should be from auth context in a real app
                        reason: reason
                    };
                    
                    const updatedProduct = { 
                        ...p, 
                        totalStock: newTotalStock,
                        stockHistory: [...p.stockHistory, newStockHistoryLog]
                    };
                    
                    // We can reuse the recalculation logic, just passing the original sales history
                    return recalculateProductState(updatedProduct);
                }
                return p;
            });
        });
    };

    const updateAlertList = (variantId: string, listKey: keyof ProcessedProduct['alertSetting'], value: string, action: 'add' | 'remove') => {
        setProducts(prev => prev.map(p => {
            if (p.id === variantId) {
                const currentList = p.alertSetting[listKey] as string[];
                const newList = action === 'add'
                    ? [...currentList, value]
                    : currentList.filter(item => item !== value);
                
                return {
                    ...p,
                    alertSetting: {
                        ...p.alertSetting,
                        [listKey]: newList
                    }
                };
            }
            return p;
        }));
    };

    const addAlertEmail = (variantId: string, email: string) => updateAlertList(variantId, 'alert_email_list', email, 'add');
    const removeAlertEmail = (variantId: string, email: string) => updateAlertList(variantId, 'alert_email_list', email, 'remove');
    const addAlertSms = (variantId: string, phone: string) => updateAlertList(variantId, 'alert_sms_list', phone, 'add');
    const removeAlertSms = (variantId: string, phone: string) => updateAlertList(variantId, 'alert_sms_list', phone, 'remove');
    const addAlertSlack = (variantId: string, channel: string) => updateAlertList(variantId, 'alert_slack_list', channel, 'add');
    const removeAlertSlack = (variantId: string, channel: string) => updateAlertList(variantId, 'alert_slack_list', channel, 'remove');
    
    const sendTestAlert = async (variantId: string): Promise<string> => {
        const product = products.find(p => p.id === variantId);
        if (!product) {
            throw new Error("Product not found");
        }
        return api.sendTestAlert(product.name, product.alertSetting);
    };

    const addSupplierMapping = async (variantId: string, mapping: Omit<ExternalInventoryMapping, 'variant_id'>) => {
        setProducts(prev => prev.map(p => 
            p.id === variantId ? { ...p, externalInventoryMapping: { ...mapping, variant_id: variantId } } : p
        ));
        await fetchData();
    };

    const removeSupplierMapping = async (variantId: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === variantId) {
                const { externalInventoryMapping, ...rest } = p;
                return { ...rest };
            }
            return p;
        }));
        await fetchData();
    };
    
    const updateReorderPoint = (variantId: string, units: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === variantId) {
                const updatedProduct = {
                    ...p,
                    alertSetting: { ...p.alertSetting, reorder_point_units: units }
                };
                return recalculateProductState(updatedProduct);
            }
            return p;
        }));
    };

    const updateReorderQuantity = (variantId: string, quantity: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === variantId) {
                return {
                    ...p,
                    alertSetting: { ...p.alertSetting, reorder_quantity: quantity }
                };
            }
            return p;
        }));
    };

    const updateSupplierLeadTime = (variantId: string, days: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === variantId) {
                return {
                    ...p,
                    alertSetting: { ...p.alertSetting, supplier_lead_time_days: days }
                };
            }
            return p;
        }));
    };

    return (
        <InventoryContext.Provider value={{ 
            products, 
            purchaseOrders,
            loading, 
            error, 
            tier, 
            getReorderSuggestion, 
            simulateSale,
            addAlertEmail,
            removeAlertEmail,
            addAlertSms,
            removeAlertSms,
            addAlertSlack,
            removeAlertSlack,
            sendTestAlert,
            addSupplierMapping,
            removeSupplierMapping,
            updateReorderPoint,
            updateReorderQuantity,
            updateSupplierLeadTime,
            adjustStock,
            refetchData: fetchData,
        }}>
            {children}
        </InventoryContext.Provider>
    );
};