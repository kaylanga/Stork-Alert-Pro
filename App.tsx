import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TierModal from './components/TierModal';
import { SubscriptionTier } from './types';
import ProductsPage from './components/pages/ProductsPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import SettingsPage from './components/pages/SettingsPage';
import { InventoryProvider } from './contexts/InventoryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/pages/LoginPage';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import ReplenishmentPage from './components/pages/ReplenishmentPage';
import ProductDetailsPage from './components/pages/ProductDetailsPage';
import ConfirmationPage from './components/pages/ConfirmationPage';

type Page = 'Dashboard' | 'Products' | 'Replenishment' | 'Analytics' | 'Settings' | 'ProductDetails';

const AppContent: React.FC = () => {
    const { user, store } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.Starter);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [activePage, setActivePage] = useState<Page>('Dashboard');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleSelectTier = (tier: SubscriptionTier) => {
        if (tier === SubscriptionTier.Pro && currentTier === SubscriptionTier.Starter) {
            setCurrentTier(SubscriptionTier.Pro);
            setIsPreviewing(true);
        }
        setIsModalOpen(false);
    };

    const handleFinalizeUpgrade = () => {
        setIsPreviewing(false);
        // In a real app, this would trigger the Shopify Billing API flow.
        alert("Subscription finalized! You are now a Pro user.");
    };
    
    const navigateToProductDetails = (productId: string) => {
        setSelectedProductId(productId);
        setActivePage('ProductDetails');
    };
    
    const navigateToProducts = () => {
        setSelectedProductId(null);
        setActivePage('Products');
    }

    const renderActivePage = () => {
        switch (activePage) {
            case 'Products':
                return <ProductsPage onViewDetails={navigateToProductDetails} />;
            case 'Analytics':
                return <AnalyticsPage currentTier={currentTier} onUpgradeClick={() => setIsModalOpen(true)} />;
            case 'Settings':
                return <SettingsPage currentTier={currentTier} onUpgradeClick={() => setIsModalOpen(true)} />;
            case 'Replenishment':
                return <ReplenishmentPage currentTier={currentTier} onUpgradeClick={() => setIsModalOpen(true)} />;
            case 'ProductDetails':
                 if (selectedProductId) {
                    return <ProductDetailsPage productId={selectedProductId} onBack={navigateToProducts} />;
                }
                // Fallback to products list if no ID is selected
                setActivePage('Products');
                return <ProductsPage onViewDetails={navigateToProductDetails} />;
            case 'Dashboard':
            default:
                return <Dashboard currentTier={currentTier} onUpgradeClick={() => setIsModalOpen(true)} />;
        }
    };

    if (!user || !store) {
        return (
            <div className="bg-[#f7f7f7] min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-400"></div>
            </div>
        );
    }

    return (
        <InventoryProvider tier={currentTier}>
            <div className="bg-[#f7f7f7] text-[#1a1a1a] min-h-screen font-sans antialiased">
                <NotificationContainer />
                <div className="flex">
                    <Sidebar store={store} activePage={activePage} onNavigate={(page) => setActivePage(page as Page)} />
                    <div className="flex-1 flex flex-col min-h-screen ml-16 md:ml-64">
                        <Header 
                            onUpgradeClick={() => setIsModalOpen(true)} 
                            currentTier={currentTier}
                            isPreviewing={isPreviewing}
                            onFinalizeUpgrade={handleFinalizeUpgrade}
                        />
                        <main className="flex-1 p-4 sm:p-6 lg:p-8">
                            {renderActivePage()}
                        </main>
                    </div>
                </div>
                {isModalOpen && <TierModal onClose={() => setIsModalOpen(false)} onSelectTier={handleSelectTier} />}
            </div>
        </InventoryProvider>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AppWrapper />
            </NotificationProvider>
        </AuthProvider>
    );
};

const AppWrapper: React.FC = () => {
    const { status } = useAuth();

    if (status === 'loading') {
        return (
            <div className="bg-[#f7f7f7] min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-400"></div>
            </div>
        );
    }
    
    if (status === 'awaitingConfirmation') {
        return <ConfirmationPage />;
    }

    if (status === 'loggedIn') {
        return <AppContent />;
    }

    return <LoginPage />;
}

export default App;