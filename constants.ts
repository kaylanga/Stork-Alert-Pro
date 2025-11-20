import { ProductVariant, InventoryLevel, AlertSetting, SalesHistoryEntry, ExternalInventoryMapping, ShopifyPromotion } from './types';

// --- 1. ProductVariants Table ---
export const MOCK_VARIANTS: ProductVariant[] = [
  {
    id: 'prod_1',
    shopify_variant_id: 'gid://shopify/ProductVariant/1001',
    name: 'Pro Wireless Headphones',
    sku: 'PWH-001-BLK',
    imageUrl: 'https://picsum.photos/seed/headphones/400/400',
  },
  {
    id: 'prod_2',
    shopify_variant_id: 'gid://shopify/ProductVariant/1002',
    name: 'Smart Fitness Tracker',
    sku: 'SFT-2024-GRY',
    imageUrl: 'https://picsum.photos/seed/tracker/400/400',
  },
  {
    id: 'prod_3',
    shopify_variant_id: 'gid://shopify/ProductVariant/1003',
    name: 'Organic Matcha Powder',
    sku: 'OMP-500G-JP',
    imageUrl: 'https://picsum.photos/seed/matcha/400/400',
  },
  {
    id: 'prod_4',
    shopify_variant_id: 'gid://shopify/ProductVariant/1004',
    name: 'Minimalist Leather Wallet',
    sku: 'MLW-BRN-01',
    imageUrl: 'https://picsum.photos/seed/wallet/400/400',
  },
  {
    id: 'prod_5',
    shopify_variant_id: 'gid://shopify/ProductVariant/1005',
    name: 'Insulated Water Bottle',
    sku: 'IWB-SS-32OZ',
    imageUrl: 'https://picsum.photos/seed/bottle/400/400',
  },
];

// --- 2. InventoryLevels Table (linked by variant_id) ---
export const MOCK_INVENTORY_LEVELS: InventoryLevel[] = [
  // Headphones
  { variant_id: 'prod_1', centerId: 'fc_1', centerName: 'East Coast FC', stock: 120 },
  { variant_id: 'prod_1', centerId: 'fc_2', centerName: 'West Coast FC', stock: 85 },
  // Tracker
  { variant_id: 'prod_2', centerId: 'fc_1', centerName: 'East Coast FC', stock: 45 },
  { variant_id: 'prod_2', centerId: 'fc_3', centerName: 'Midwest FC', stock: 30 },
  // Matcha
  { variant_id: 'prod_3', centerId: 'fc_2', centerName: 'West Coast FC', stock: 350 },
  { variant_id: 'prod_3', centerId: 'fc_3', centerName: 'Midwest FC', stock: 200 },
  // Wallet
  { variant_id: 'prod_4', centerId: 'fc_1', centerName: 'East Coast FC', stock: 25 },
  // Note: prod_4 also has external inventory, see MOCK_EXTERNAL_INVENTORY_MAPPINGS
  // Bottle
  { variant_id: 'prod_5', centerId: 'fc_1', centerName: 'East Coast FC', stock: 150 },
  { variant_id: 'prod_5', centerId: 'fc_2', centerName: 'West Coast FC', stock: 200 },
  { variant_id: 'prod_5', centerId: 'fc_3', centerName: 'Midwest FC', stock: 180 },
];

// --- 3. AlertSettings Table (linked by variant_id) ---
export const MOCK_ALERT_SETTINGS: AlertSetting[] = [
  { variant_id: 'prod_1', reorder_point_units: 50, reorder_quantity: 150, low_stock_threshold_days: 14, supplier_lead_time_days: 10, alert_email_list: ['owner@momentum.com', 'ops@momentum.com'], alert_sms_list: ['+15551234567'], alert_slack_list: ['#inventory-critical'] },
  { variant_id: 'prod_2', reorder_point_units: 20, reorder_quantity: 100, low_stock_threshold_days: 7, supplier_lead_time_days: 7, alert_email_list: ['owner@momentum.com'], alert_sms_list: [], alert_slack_list: [] },
  { variant_id: 'prod_3', reorder_point_units: 100, reorder_quantity: 300, low_stock_threshold_days: 21, supplier_lead_time_days: 14, alert_email_list: ['purchasing@momentum.com'], alert_sms_list: [], alert_slack_list: ['#inventory-general'] },
  { variant_id: 'prod_4', reorder_point_units: 15, reorder_quantity: 50, low_stock_threshold_days: 10, supplier_lead_time_days: 20, alert_email_list: ['owner@momentum.com', 'leathergoods@momentum.com'], alert_sms_list: [], alert_slack_list: [] },
  { variant_id: 'prod_5', reorder_point_units: 100, reorder_quantity: 250, low_stock_threshold_days: 14, supplier_lead_time_days: 5, alert_email_list: ['owner@momentum.com'], alert_sms_list: ['+15551234567'], alert_slack_list: [] },
];

// --- 4. SalesHistory Table (linked by variant_id) ---
const generateSalesHistory = (variant_id: string, baseSales: number, volatility: number, promotions: ShopifyPromotion[] = []): SalesHistoryEntry[] => {
    const history: SalesHistoryEntry[] = [];
    for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
        
        let seasonalMultiplier = 1.0;
        // Simple seasonality: higher sales on weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            seasonalMultiplier = 1.3;
        } else if (dayOfWeek === 1) { // Monday dip
            seasonalMultiplier = 0.8;
        }

        // Check for promotions
        const activePromotion = promotions.find(p => dateString >= p.start_date && dateString <= p.end_date);
        if (activePromotion) {
            seasonalMultiplier *= 2.5; // Massive sales boost during promo
        }

        const unitsSold = Math.max(0, Math.round(
            (baseSales + (Math.random() - 0.5) * volatility) * seasonalMultiplier
        ));

        history.push({
            variant_id,
            date: dateString,
            units_sold: unitsSold,
        });
    }
    return history;
};

// --- 5. Promotions Table (Pro Feature) ---
export const MOCK_PROMOTIONS: ShopifyPromotion[] = [
    {
        variant_id: 'prod_5',
        title: 'Summer Hydration Sale',
        discount_code: 'SUMMER20',
        start_date: (() => { const d = new Date(); d.setDate(d.getDate() - 20); return d.toISOString().split('T')[0]; })(),
        end_date: (() => { const d = new Date(); d.setDate(d.getDate() - 15); return d.toISOString().split('T')[0]; })(),
    }
];


export const MOCK_SALES_HISTORY: SalesHistoryEntry[] = [
    ...generateSalesHistory('prod_1', 8, 5),    // Headphones: Steady seller
    ...generateSalesHistory('prod_2', 12, 4),   // Tracker: Consistent
    ...generateSalesHistory('prod_3', 19, 6),   // Matcha: High volume
    ...generateSalesHistory('prod_4', 2, 3),    // Wallet: Slow mover
    ...generateSalesHistory('prod_5', 15, 7, MOCK_PROMOTIONS.filter(p => p.variant_id === 'prod_5')),   // Bottle: Popular, with a promo spike
];

// --- 6. ExternalInventoryMappings Table (Pro Feature) ---
export const MOCK_EXTERNAL_INVENTORY_MAPPINGS: ExternalInventoryMapping[] = [
    {
        variant_id: 'prod_4',
        supplier_name: 'Artisan Leather Goods',
        supplier_api_url: 'https://api.artisanleather.com/inventory',
        supplier_sku: 'ALG-WALLET-MIN-BRN',
        // FIX: Added cost_per_item to mock data.
        cost_per_item: 12.50
    }
];