export enum InventoryStatus {
  Healthy = 'Healthy',
  Low = 'Low',
  Critical = 'Critical',
}

// Represents the core product variant from Shopify
export interface ProductVariant {
  id: string; // Internal ID, e.g., 'prod_1'
  shopify_variant_id: string; // The real Shopify ID
  sku: string;
  name: string;
  imageUrl: string;
}

// Represents the inventory level at a specific fulfillment center
export interface InventoryLevel {
  variant_id: string; // Foreign key to ProductVariant
  centerId: string;
  centerName: string;
  stock: number;
}

// Represents the merchant's configuration for alerts on a specific variant
export interface AlertSetting {
  variant_id: string; // Foreign key to ProductVariant
  reorder_point_units: number; // e.g., Alert when stock < 20
  reorder_quantity: number; // The suggested amount to reorder
  low_stock_threshold_days: number; // e.g., Alert when stock < 14 days of supply
  supplier_lead_time_days: number;
  alert_email_list: string[];
  alert_sms_list: string[]; // Pro feature
  alert_slack_list: string[]; // Pro feature
}

// Represents a single day's sales record for a variant
export interface SalesHistoryEntry {
    variant_id: string; // Foreign key to ProductVariant
    date: string; // YYYY-MM-DD
    units_sold: number;
}

// Represents the link to an external supplier's inventory system (Pro Feature)
export interface ExternalInventoryMapping {
  variant_id: string; // Foreign key to ProductVariant
  supplier_name: string;
  supplier_api_url: string;
  supplier_sku: string;
  // FIX: Added cost_per_item for purchase order calculations
  cost_per_item?: number;
}

// Represents a discount or marketing event from Shopify (Pro Feature)
export interface ShopifyPromotion {
    variant_id: string; // Foreign key to ProductVariant
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    title: string; // e.g., "Summer Sale"
    discount_code?: string; // e.g., "SUMMER25"
}

// FIX: Added StockHistoryLogEntry to track all stock changes.
export interface StockHistoryLogEntry {
    id: string;
    timestamp: string; // ISO string
    type: 'Initial Stock' | 'Sale' | 'Manual Adjustment';
    change: number; // e.g., -1 for a sale, +50 for adjustment
    newTotal: number;
    user: string; // "System" or "Jane Doe"
    reason?: string; // "Stock Take Correction"
}


// This is a composed, "denormalized" object that the UI components will use.
// It's constructed by the API layer by combining data from the other models.
export interface ProcessedProduct extends ProductVariant {
  inventory: InventoryLevel[];
  salesHistory: SalesHistoryEntry[];
  // FIX: Added stockHistory for detailed logging.
  stockHistory: StockHistoryLogEntry[];
  alertSetting: AlertSetting;
  promotions: ShopifyPromotion[];
  externalInventoryMapping?: ExternalInventoryMapping;
  totalStock: number;
  salesVelocity: number; // units per day
  daysUntilStockout: number;
  status: InventoryStatus;
  analysis?: string; // Gemini-powered analysis
}

// FIX: Added PurchaseOrder type for the replenishment page.
export interface PurchaseOrder {
    id: string;
    product: ProcessedProduct;
    quantity: number;
    status: 'Draft' | 'Sent' | 'Received';
}

export enum SubscriptionTier {
    Starter = 'Starter',
    Pro = 'Pro',
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Store {
  name: string;
  domain: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  alertsEnabled: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}