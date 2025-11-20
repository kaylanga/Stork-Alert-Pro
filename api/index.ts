import { MOCK_VARIANTS, MOCK_INVENTORY_LEVELS, MOCK_ALERT_SETTINGS, MOCK_SALES_HISTORY, MOCK_EXTERNAL_INVENTORY_MAPPINGS, MOCK_PROMOTIONS } from '../constants';
// FIX: Import StockHistoryLogEntry
import { ProductVariant, ProcessedProduct, SubscriptionTier, InventoryStatus, ExternalInventoryMapping, InventoryLevel, AlertSetting, ShopifyPromotion, StockHistoryLogEntry } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simulate network latency
const ARTIFICIAL_DELAY = 500;

/**
 * Simulates calling an external supplier's API to get their stock level.
 */
const fetchExternalSupplierStock = (mapping: ExternalInventoryMapping): Promise<number> => {
    console.log(`API: Fetching external stock for ${mapping.supplier_sku} from ${mapping.supplier_name}`);
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, this would be a fetch() call.
            // We'll return a mock static value for demonstration.
            const mockStock = 75;
            console.log(`API: Received external stock for ${mapping.supplier_sku}: ${mockStock}`);
            resolve(mockStock);
        }, 300); // Shorter delay for the external call simulation
    });
};


/**
 * Simulates fetching and composing product data as a real backend would.
 * It "joins" variants, inventory, settings, and sales history.
 */
export const fetchProcessedProducts = (currentTier: SubscriptionTier): Promise<ProcessedProduct[]> => {
  console.log("API: Fetching and processing product data...");
  return new Promise(resolve => {
    setTimeout(async () => {
      const processedProducts = await Promise.all(MOCK_VARIANTS.map(async (variant) => {
        const inventory: InventoryLevel[] = MOCK_INVENTORY_LEVELS.filter(i => i.variant_id === variant.id);
        const alertSetting = MOCK_ALERT_SETTINGS.find(s => s.variant_id === variant.id)!;
        const salesHistory = MOCK_SALES_HISTORY.filter(h => h.variant_id === variant.id);
        const externalInventoryMapping = MOCK_EXTERNAL_INVENTORY_MAPPINGS.find(m => m.variant_id === variant.id);
        const promotions = MOCK_PROMOTIONS.filter(p => p.variant_id === variant.id);

        // --- Pro Feature: External Supplier Integration ---
        if (currentTier === SubscriptionTier.Pro && externalInventoryMapping) {
            const externalStock = await fetchExternalSupplierStock(externalInventoryMapping);
            inventory.push({
                variant_id: variant.id,
                centerId: 'supplier_' + externalInventoryMapping.supplier_name.replace(/\s/g, ''),
                centerName: `Supplier: ${externalInventoryMapping.supplier_name}`,
                stock: externalStock,
            });
        }

        const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
        
        // FIX: Generate mock stock history data.
        let currentStockForHistory = totalStock;
        const salesForHistory = salesHistory.slice(-5).reverse();
        const stockHistory: StockHistoryLogEntry[] = salesForHistory.map((sale, i) => {
            const change = -sale.units_sold;
            const entry = {
                id: `${variant.id}-sale-${i}`,
                timestamp: new Date(new Date(sale.date).getTime() + i * 1000).toISOString(),
                type: 'Sale' as const,
                change,
                newTotal: currentStockForHistory,
                user: 'System',
            };
            currentStockForHistory -= change;
            return entry;
        });
        if (variant.id === 'prod_2') {
             const adjChange = 10;
             currentStockForHistory -= adjChange;
             stockHistory.push({
                id: `${variant.id}-adj-1`,
                timestamp: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
                type: 'Manual Adjustment',
                change: adjChange,
                newTotal: totalStock - 5, // A recent total
                user: 'Jane Doe',
                reason: 'Stock Take Correction'
             });
        }
        stockHistory.push({
            id: `${variant.id}-init`,
            timestamp: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
            type: 'Initial Stock',
            change: currentStockForHistory,
            newTotal: currentStockForHistory,
            user: 'System'
        });
        stockHistory.reverse();

        let salesVelocity = 0;
        let analysis: string | undefined = undefined;

        // Velocity and forecasting should always be based on the most recent 30 days for accuracy
        const recentSalesHistory = salesHistory.slice(-30);
        const salesHistoryNumbers = recentSalesHistory.map(s => s.units_sold);

        if (currentTier === SubscriptionTier.Pro) {
            const forecast = await fetchAdvancedForecast(variant, recentSalesHistory, promotions);
            salesVelocity = forecast.salesVelocity;
            analysis = forecast.analysis;
        } else {
            const totalSales = salesHistoryNumbers.reduce((sum, daily) => sum + daily, 0);
            salesVelocity = salesHistoryNumbers.length > 0 ? totalSales / salesHistoryNumbers.length : 0;
        }

        const daysUntilStockout = salesVelocity > 0 ? totalStock / salesVelocity : Infinity;
        
        let status: InventoryStatus;
        if (totalStock <= alertSetting.reorder_point_units) {
            status = InventoryStatus.Critical;
        } else if (daysUntilStockout < alertSetting.low_stock_threshold_days) {
            status = InventoryStatus.Low;
        } else {
            status = InventoryStatus.Healthy;
        }


        return {
          ...variant,
          inventory,
          alertSetting,
          salesHistory, // Return the full history for the chart
          stockHistory,
          promotions,
          externalInventoryMapping,
          totalStock,
          salesVelocity: parseFloat(salesVelocity.toFixed(1)),
          daysUntilStockout: Math.floor(daysUntilStockout),
          status,
          analysis,
        };
      }));
      console.log("API: Finished processing products.");
      resolve(processedProducts);
    }, ARTIFICIAL_DELAY);
  });
};


/**
 * Calls the Gemini API to get an advanced sales forecast for a product.
 * This function would live on the backend in a real application.
 */
export const fetchAdvancedForecast = async (variant: ProductVariant, salesHistory: {date: string, units_sold: number}[], promotions: ShopifyPromotion[]): Promise<{ salesVelocity: number; analysis: string }> => {
  console.log(`API: Fetching advanced forecast for ${variant.sku}...`);
  const salesDataString = salesHistory.map(s => s.units_sold).join(', ');
  const promotionContext = promotions.length > 0
    ? `There was a promotion titled "${promotions[0].title}" from ${promotions[0].start_date} to ${promotions[0].end_date}.`
    : 'There were no major promotions during this period.';

  const prompt = `
    Analyze the following daily sales data for the product "${variant.name}" over the last 30 days.
    Sales Data: [${salesDataString}]

    Additional Context:
    ${promotionContext}

    Act as an e-commerce supply chain expert. Your primary goal is to determine the true organic daily sales velocity, factoring out the temporary spike caused by any promotions.
    
    1.  Calculate a forecasted average daily sales velocity for the next 30 days, attempting to normalize for the promotional lift.
    2.  Provide a brief, one-sentence analysis explaining your forecast, specifically mentioning the promotion's impact if applicable.
  `;
  
  const salesHistoryNumbers = salesHistory.map(s => s.units_sold);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
            systemInstruction: "You are an e-commerce data analyst. Your goal is to provide accurate sales forecasts and concise insights based on historical data, accounting for promotions. Respond ONLY with a valid JSON object matching the requested schema.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    forecastedVelocity: {
                        type: Type.NUMBER,
                        description: "The forecasted average daily sales velocity, normalized to account for promotions."
                    },
                    analysis: {
                        type: Type.STRING,
                        description: "A brief, one-sentence analysis of the sales trend, mentioning any promotions."
                    }
                },
                required: ["forecastedVelocity", "analysis"]
            }
        }
    });
    
    // FIX: Access the text output correctly.
    const jsonText = response.text?.trim();
    if (!jsonText) {
        throw new Error("Empty response from API");
    }
    const result = JSON.parse(jsonText);
    console.log(`API: Received forecast for ${variant.sku}.`);
    return { salesVelocity: result.forecastedVelocity, analysis: result.analysis };
  } catch (e) {
    console.error("API Error: Gemini forecast call failed for product:", variant.name, e);
    // Fallback to simple calculation on API error
    const totalSales = salesHistoryNumbers.reduce((sum, dailySales) => sum + dailySales, 0);
    const simpleVelocity = salesHistoryNumbers.length > 0 ? totalSales / salesHistoryNumbers.length : 0;
    return { salesVelocity: simpleVelocity, analysis: "AI forecast unavailable. Using basic average." };
  }
};

/**
 * Calls the Gemini API to get a reorder suggestion.
 * This function would live on the backend in a real application.
 */
export const fetchReorderSuggestion = async (product: ProcessedProduct): Promise<string> => {
    console.log(`API: Fetching reorder suggestion for ${product.sku}...`);
    const prompt = `
      You are an expert inventory manager for an e-commerce store.
      Based on the following data for the product "${product.name}", provide a concise reorder suggestion.

      Current Data:
      - Product Name: ${product.name}
      - SKU: ${product.sku}
      - Current Total Stock: ${product.totalStock} units
      - Forecasted Daily Sales: ${product.salesVelocity} units/day
      - Supplier Lead Time: ${product.alertSetting.supplier_lead_time_days} days

      Your task is to recommend a quantity to reorder.
      Your suggestion should aim to cover at least a 30-day sales period AFTER the new stock arrives.
      Explain your reasoning in one or two sentences. Respond only with the suggestion text.

      Example response format: "To prevent a stockout and maintain a 30-day supply, I recommend reordering at least 250 units. This covers the 10-day lead time and forecasted demand."
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      console.log(`API: Received suggestion for ${product.sku}.`);
      // FIX: Access text output correctly.
      return response.text?.trim() ?? "No suggestion available.";
    } catch (e) {
      console.error("API Error: Gemini suggestion call failed:", e);
      return "Could not generate a suggestion at this time. Please try again later.";
    }
};

/**
 * Simulates sending a test alert to configured channels.
 */
export const sendTestAlert = (productName: string, settings: AlertSetting): Promise<string> => {
    console.log(`API: Sending test alert for "${productName}"...`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const emailCount = settings.alert_email_list.length;
            const smsCount = settings.alert_sms_list.length;
            const slackCount = settings.alert_slack_list.length;

            if (emailCount + smsCount + slackCount === 0) {
                return reject(new Error("No recipients configured for this product."));
            }

            const message = `Test alert for "${productName}" sent to ${emailCount} email(s), ${smsCount} SMS, and ${slackCount} Slack channel(s).`;
            console.log(`API: ${message}`);
            resolve(message);
        }, 800);
    });
};