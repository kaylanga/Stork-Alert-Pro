import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedProduct, SubscriptionTier, ShopifyPromotion } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useNotification } from '../../hooks/useNotification';

interface SalesHistoryChartProps {
    products: ProcessedProduct[];
    tier: SubscriptionTier;
    loading: boolean;
}

const SalesHistoryChart: React.FC<SalesHistoryChartProps> = ({ products, tier, loading }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, units: number, promotion?: ShopifyPromotion } | null>(null);
    const { addNotification } = useNotification();
    const [dateError, setDateError] = useState<string | null>(null);

    const [activePreset, setActivePreset] = useState<'7D' | '30D' | '90D' | 'Custom'>('30D');
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        return { start, end };
    });
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        if (products.length > 0 && !selectedProductId) {
            setSelectedProductId(products[0].id);
        }
    }, [products, selectedProductId]);

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === selectedProductId);
    }, [products, selectedProductId]);

    const handlePresetClick = (preset: '7D' | '30D' | '90D') => {
        setActivePreset(preset);
        const end = new Date();
        const start = new Date();
        const days = preset === '7D' ? 6 : preset === '30D' ? 29 : 89;
        start.setDate(end.getDate() - days);
        setDateRange({ start, end });
        setCustomStartDate('');
        setCustomEndDate('');
        setDateError(null);
    };
    
    const handleApplyCustomRange = () => {
        setDateError(null);
        if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            if (start <= end) {
                setDateRange({ start, end });
                setActivePreset('Custom');
            } else {
                const errorMessage = "Start date cannot be after end date.";
                addNotification({ message: errorMessage, type: 'error' });
                setDateError(errorMessage);
            }
        } else {
             const errorMessage = "Please select both a start and end date.";
             addNotification({ message: errorMessage, type: 'error' });
             setDateError(errorMessage);
        }
    };

    const salesData = useMemo(() => {
        if (!selectedProduct) return [];
        const { start, end } = dateRange;
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return selectedProduct.salesHistory.filter(d => {
            const entryDate = new Date(d.date);
            entryDate.setMinutes(entryDate.getMinutes() + entryDate.getTimezoneOffset());
            return entryDate >= start && entryDate <= end;
        });
    }, [selectedProduct, dateRange]);


    const chartHeight = 250;
    const chartWidth = 500;
    const margin = { top: 20, right: 20, bottom: 40, left: 30 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const maxValue = useMemo(() => {
        const maxUnits = Math.max(...salesData.map(d => d.units_sold), 0);
        return Math.ceil(maxUnits * 1.2) || 10;
    }, [salesData]);

    const barWidth = salesData.length > 0 ? innerWidth / salesData.length : 0;
    
    const xAxisLabels = useMemo(() => {
        if (salesData.length < 2) return [];
        const labels = [];
        const maxLabels = 6;
        const step = Math.max(1, Math.floor(salesData.length / maxLabels));
        for (let i = 0; i < salesData.length; i += step) {
            labels.push({
                x: i * barWidth + barWidth / 2,
                date: salesData[i].date,
            });
        }
        return labels;
    }, [salesData, barWidth]);

    const getPromotionForDate = (date: string) => {
        return selectedProduct?.promotions.find(p => date >= p.start_date && date <= p.end_date);
    };

    const renderSkeleton = () => (
        <div className="animate-pulse flex items-end justify-between h-[188px] bg-gray-100 rounded-md p-4">
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-2/3"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-1/2"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-3/4"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-full"></div>
            <div className="w-1/6 bg-gray-200 rounded-t-sm h-2/5"></div>
        </div>
    );
    
    const PresetButton: React.FC<{ label: '7D' | '30D' | '90D' }> = ({ label }) => (
      <button
        onClick={() => handlePresetClick(label)}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          activePreset === label ? 'bg-[#1a1a1a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {label}
      </button>
    );

    return (
        <div className="bg-white p-6 rounded-lg border border-[#e1e3e5] shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-[#1a1a1a]">Sales Over Time</h3>
                <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="bg-white border border-gray-300 text-[#1a1a1a] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                    disabled={loading}
                >
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
             <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <PresetButton label="7D" />
                    <PresetButton label="30D" />
                    <PresetButton label="90D" />
                </div>
                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                    <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className={`bg-white text-gray-700 text-xs p-1.5 rounded-md border  focus:ring-blue-500 focus:border-blue-500 ${dateError ? 'border-red-500' : 'border-gray-300'}`} />
                    <span className="text-gray-500 text-xs">to</span>
                    <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className={`bg-white text-gray-700 text-xs p-1.5 rounded-md border  focus:ring-blue-500 focus:border-blue-500 ${dateError ? 'border-red-500' : 'border-gray-300'}`} />
                    <button onClick={handleApplyCustomRange} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activePreset === 'Custom' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        Apply
                    </button>
                </div>
            </div>
            <div className="relative">
                {loading ? renderSkeleton() : (
                    <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                        <g transform={`translate(${margin.left}, ${margin.top})`}>
                            {/* Y-axis */}
                            <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#e1e3e5" />
                            {[0, Math.round(maxValue / 2), maxValue].map(tick => (
                                <g key={tick} transform={`translate(0, ${innerHeight - (tick / maxValue) * innerHeight})`}>
                                    <text x="-8" y="4" textAnchor="end" fontSize="10" fill="#6b7280">{tick}</text>
                                    <line x1="0" y1="0" x2={innerWidth} y2="0" stroke="#e1e3e5" strokeDasharray="2,2" />
                                </g>
                            ))}

                            {/* X-axis */}
                            <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#e1e3e5" />
                            {xAxisLabels.map(label => (
                                <text
                                    key={label.date}
                                    x={label.x}
                                    y={innerHeight + 15}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#6b7280"
                                >
                                    {new Date(label.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </text>
                            ))}
                            <text x={innerWidth / 2} y={innerHeight + 30} textAnchor="middle" fontSize="10" fill="#6b7280">Date</text>
                            
                             {/* Promotion highlights */}
                            {tier === SubscriptionTier.Pro && salesData.map((d, i) => {
                                const promotion = getPromotionForDate(d.date);
                                if (promotion) {
                                    return (
                                        <rect
                                            key={`promo-${d.date}`}
                                            x={i * barWidth}
                                            y="0"
                                            width={barWidth}
                                            height={innerHeight}
                                            fill="rgba(255, 193, 7, 0.1)"
                                        />
                                    );
                                }
                                return null;
                            })}


                            {/* Bars */}
                            {salesData.map((d, i) => {
                                const barHeight = (d.units_sold / maxValue) * innerHeight;
                                const x = i * barWidth;
                                const y = innerHeight - barHeight;
                                return (
                                    <rect
                                        key={d.date}
                                        x={x}
                                        y={y}
                                        width={barWidth > 2 ? barWidth - 2 : barWidth}
                                        height={barHeight}
                                        fill="#6b7280"
                                        className="opacity-70 hover:opacity-100 transition-opacity"
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                            setTooltip({
                                                x: rect.left - svgRect.left + rect.width / 2,
                                                y: rect.top - svgRect.top - 10,
                                                date: d.date,
                                                units: d.units_sold,
                                                promotion: getPromotionForDate(d.date),
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                );
                            })}
                            
                            {/* Pro Feature: Forecast line */}
                            {tier === SubscriptionTier.Pro && selectedProduct && selectedProduct.salesVelocity > 0 && (
                                <g>
                                    <line
                                        x1="0"
                                        y1={innerHeight - (selectedProduct.salesVelocity / maxValue) * innerHeight}
                                        x2={innerWidth}
                                        y2={innerHeight - (selectedProduct.salesVelocity / maxValue) * innerHeight}
                                        stroke="#ffc107"
                                        strokeWidth="2"
                                        strokeDasharray="4,4"
                                    />
                                     <text x={innerWidth - 5} y={innerHeight - (selectedProduct.salesVelocity / maxValue) * innerHeight - 5} textAnchor="end" fontSize="10" fill="#b45309" className="font-semibold flex items-center">
                                        <SparklesIcon className="w-3 h-3 inline-block mr-1" />
                                        AI Forecast: {selectedProduct.salesVelocity}/day
                                    </text>
                                </g>
                            )}
                        </g>
                    </svg>
                )}
                {tooltip && (
                    <div
                        className="absolute bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none border border-gray-600 shadow-lg z-10"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y,
                            transform: 'translateX(-50%) translateY(-100%)',
                        }}
                    >
                        <p className="font-bold">{new Date(tooltip.date).toLocaleDateString()}</p>
                        <p>{tooltip.units} units sold</p>
                        {tooltip.promotion && (
                            <p className="mt-1 pt-1 border-t border-gray-700 text-yellow-400 font-semibold">{tooltip.promotion.title}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesHistoryChart;