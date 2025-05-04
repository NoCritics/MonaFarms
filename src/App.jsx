import React, { useState, useEffect } from 'react';
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

// Import components
import PlayerRegistryComponent from './components/PlayerRegistryComponent';
import CropsTokenComponent from './components/CropsTokenComponent';
import FarmManagerWrapper from './components/farm/FarmManagerWrapper';
import ShopManagerComponent from './components/ShopManagerComponent';
import LeaderboardComponent from './components/LeaderboardComponent';
import Sidebar from './components/Sidebar';
import DayNightCycle from './components/animations/DayNightCycle';
import { NotificationProvider, useNotification } from './components/notifications/NotificationSystem';
import LoadingScreen from './components/ui/LoadingScreen';
import AchievementNotifications from './components/notifications/AchievementNotifications';
import { LevelUpAnimation } from './components/animations/LevelUpAnimation';

// Context providers
import { DragDropProvider } from './components/ui/DragDropContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';

const MainContent = () => {
    const [activeTab, setActiveTab] = useState('farm');
    const { address, isConnected } = useAccount();
    const [isScrolled, setIsScrolled] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const notification = useNotification();
    const [isLoading, setIsLoading] = useState(true);
    const { showLevelUp, levelUpRewards, dismissLevelUp } = useProgress();
    
    // Simulate initial loading
    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Listen for scroll to add shadow to navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Show welcome notification on first connect
    useEffect(() => {
        if (isConnected) {
            notification.success("Welcome to MonaFarms! 🌱", 5000);
        }
    }, [isConnected]);

    // Handle tab changes with animations
    const handleTabChange = (tab) => {
        // Only change if it's not already active
        if (tab !== activeTab) {
            setActiveTab(tab);
            
            // Update URL hash for deep linking
            window.location.hash = tab;
        }
    };

    // Check for hash in URL on load
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['farm', 'shop', 'token', 'player', 'leaderboard'].includes(hash)) {
            setActiveTab(hash);
        }
    }, []);

    // Toggle sidebar on mobile
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <>
            <LoadingScreen isLoading={isLoading} minDisplayTime={2000} />
            
            <div className={`app-container ${sidebarVisible ? 'sidebar-visible' : ''}`}>
                <div className={`navbar ${isScrolled ? 'shadow-md' : ''}`}>
                    <div className="flex items-center">
                        <div className="logo text-2xl font-bold text-accent">MonaFarms</div>
                    </div>
                    
                    <ConnectKitButton 
                        customTheme={{
                            "--ck-connectbutton-background": "#8358FF",
                            "--ck-connectbutton-color": "white",
                            "--ck-connectbutton-hover-background": "#9781C7",
                            "--ck-connectbutton-hover-color": "white",
                            "--ck-connectbutton-active-background": "#523D7F",
                            "--ck-connectbutton-active-color": "white",
                        }}
                    />
                </div>

                {/* Mobile sidebar toggle */}
                <div className="sidebar-toggle-mobile" onClick={toggleSidebar}>
                    {sidebarVisible ? '×' : '≡'}
                </div>

                {/* Sidebar overlay for mobile */}
                <div 
                    className={`sidebar-overlay ${sidebarVisible ? 'visible' : ''}`}
                    onClick={() => setSidebarVisible(false)}
                ></div>

                {/* Sidebar */}
                {isConnected && <Sidebar />}

                {/* Day/Night Cycle Effect */}
                <DayNightCycle />

                <div className={`main-content ${isConnected ? 'with-sidebar' : ''}`}>
                    <div className="container">
                        <div className="welcome-section">
                            {isConnected ? (
                                <div className="card text-center">
                                    <h1>Welcome to MonaFarms!</h1>
                                    <p className="text-secondary mb-md">A blockchain-based farming simulation game on the Monad testnet</p>
                                    <p className="text-xs text-secondary">Connected as: {address}</p>
                                </div>
                            ) : (
                                <div className="card text-center">
                                    <h1>Welcome to MonaFarms!</h1>
                                    <p className="text-secondary mb-md">A blockchain-based farming simulation game on the Monad testnet</p>
                                    <p>Connect your wallet to start playing!</p>
                                </div>
                            )}
                        </div>

                        {isConnected && (
                            <>
                                <div className="nav-tabs">
                                    <div
                                        className={`nav-tab ${activeTab === 'farm' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('farm')}
                                    >
                                        <span className="nav-tab-icon">🌱</span> Farm
                                    </div>
                                    <div
                                        className={`nav-tab ${activeTab === 'shop' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('shop')}
                                    >
                                        <span className="nav-tab-icon">🛒</span> Shop
                                    </div>
                                    <div
                                        className={`nav-tab ${activeTab === 'token' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('token')}
                                    >
                                        <span className="nav-tab-icon">💰</span> Tokens
                                    </div>
                                    <div
                                        className={`nav-tab ${activeTab === 'player' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('player')}
                                    >
                                        <span className="nav-tab-icon">👤</span> Profile
                                    </div>
                                    <div
                                        className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('leaderboard')}
                                    >
                                        <span className="nav-tab-icon">🏆</span> Leaderboard
                                    </div>
                                </div>

                                <div className="tab-content section-transition-enter-active">
                                    {activeTab === 'player' && <PlayerRegistryComponent />}
                                    {activeTab === 'token' && <CropsTokenComponent />}
                                    {activeTab === 'farm' && <FarmManagerWrapper />}
                                    {activeTab === 'shop' && <ShopManagerComponent />}
                                    {activeTab === 'leaderboard' && <LeaderboardComponent />}
                                </div>
                            </>
                        )}
                        
                        <footer className="footer mt-2xl mb-xl text-center text-secondary">
                            <p className="mb-xs">MonaFarms - Blockchain farming simulation game on Monad testnet</p>
                            <div className="text-xs flex justify-center gap-md">
                                <a href="#" className="footer-link">About</a>
                                <a href="#" className="footer-link">How to Play</a>
                                <a href="#" className="footer-link">Monad</a>
                            </div>
                        </footer>
                    </div>
                </div>
                
                {/* Achievement Notifications */}
                <AchievementNotifications />
                
                {/* Level Up Animation */}
                {showLevelUp && (
                    <LevelUpAnimation 
                        rewards={levelUpRewards}
                        onComplete={dismissLevelUp}
                    />
                )}
            </div>
        </>
    );
};

// Wrap the main app with all providers
const App = () => {
    return (
        <NotificationProvider>
            <ProgressProvider>
                <DragDropProvider>
                    <MainContent />
                </DragDropProvider>
            </ProgressProvider>
        </NotificationProvider>
    );
};

export default App;