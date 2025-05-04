import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from 'viem';
import { useProgress } from '../context/ProgressContext';
import { useNotification } from './notifications/NotificationSystem';
import { ShopItem } from './ui/ShopItem';
import { LoadingOverlay } from './ui/LoadingSpinner';
import PlayerRegistryABI from '../../contracts/abis/playerregistry-abi.json';
import ShopManagerABI from '../../contracts/abis/shopmanager-abi.json';
import CropsTokenABI from '../../contracts/abis/cropstoken-abi.json';
import FarmManagerABI from '../../contracts/abis/farmmanager-abi.json';
import { 
  SeedPacket, 
  WaterBucket, 
  Fertilizer, 
  TilePlot, 
  CropsToken as CropsTokenIcon 
} from '../assets/FarmIcons';

import '../styles/shop.css';

const CONTRACT_ADDRESSES = {
    playerRegistry: "0x117f6cdF4f0a03A2fCA6e505D2b72ecec1eF3eDE",
    cropsToken: "0x9edD5162F5Cbc55Bd5d53342c996A44e3a753337",
    shopManager: "0xF3b09f381d98A1b40D4038f35C66f227C178Cb89",
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
};

const ShopManagerComponent = () => {
    // State for seasonal offers and bundles
    const [showSpecialOffers, setShowSpecialOffers] = useState(true);
    const { address } = useAccount();
    const notification = useNotification();
    const { updateStats } = useProgress();
    
    const [activeCategory, setActiveCategory] = useState('all');
    const [seedAmount, setSeedAmount] = useState(1);
    const [prices, setPrices] = useState({});
    const [tileCount, setTileCount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [fertilizerCooldown, setFertilizerCooldown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inventory, setInventory] = useState({
        potatoSeeds: 0,
        tomatoSeeds: 0,
        strawberrySeeds: 0,
        waterBuckets: 0,
        fertilizerCharges: 0
    });

    const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.cropsToken,
        abi: CropsTokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

    const { data: playerData } = useReadContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: PlayerRegistryABI,
        functionName: 'getPlayer',
        args: [address],
        enabled: !!address,
    });
    
    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerInventory',
        args: [address],
        enabled: !!address,
    });

    const { data: fertilizerTimeData, refetch: refetchFertilizerTime } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'timeUntilNextFertilizer',
        args: [address],
        enabled: !!address,
    });

    useEffect(() => {
        if (tokenBalance) {
            setBalance(Number(formatEther(tokenBalance)));
        }
        
        if (playerData) {
            setTileCount(Number(playerData[6]));
        }
        
        if (inventoryData) {
            setInventory({
                potatoSeeds: Number(inventoryData[0]),
                tomatoSeeds: Number(inventoryData[1]),
                strawberrySeeds: Number(inventoryData[2]),
                waterBuckets: Number(inventoryData[3]),
                fertilizerCharges: Number(inventoryData[4])
            });
        }
        
        if (fertilizerTimeData) {
            const time = Number(fertilizerTimeData);
            setFertilizerCooldown(time);
            
            // Clear any existing interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Only set up interval if there's time remaining
            if (time > 0) {
                const interval = setInterval(() => {
                    setFertilizerCooldown(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(interval);
                            refetchFertilizerTime();
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
                
                setCountdownInterval(interval);
            }
        }
        
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [tokenBalance, playerData, inventoryData, fertilizerTimeData, refetchFertilizerTime]);

    // Get prices for all items
    const { data: potatoPrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getSeedPrice',
        args: [0],
    });

    const { data: tomatoPrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getSeedPrice',
        args: [1],
    });

    const { data: strawberryPrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getSeedPrice',
        args: [2],
    });

    const { data: waterBucketPrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getWaterBucketPrice',
    });

    const { data: fertilizerPrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getFertilizerPrice',
    });

    const { data: tilePrice } = useReadContract({
        address: CONTRACT_ADDRESSES.shopManager,
        abi: ShopManagerABI,
        functionName: 'getTilePrice',
        args: [tileCount],
        enabled: tileCount > 0,
    });

    useEffect(() => {
        const newPrices = {};
        if (potatoPrice) newPrices.potato = Number(formatEther(potatoPrice));
        if (tomatoPrice) newPrices.tomato = Number(formatEther(tomatoPrice));
        if (strawberryPrice) newPrices.strawberry = Number(formatEther(strawberryPrice));
        if (waterBucketPrice) newPrices.waterBucket = Number(formatEther(waterBucketPrice));
        if (fertilizerPrice) newPrices.fertilizer = Number(formatEther(fertilizerPrice));
        if (tilePrice) newPrices.tile = Number(formatEther(tilePrice));
        setPrices(newPrices);
    }, [potatoPrice, tomatoPrice, strawberryPrice, waterBucketPrice, fertilizerPrice, tilePrice]);

    const { writeContractAsync: writeContract, isPending: isWriting } = useWriteContract();

    const buySeeds = async (seedType, amount = 1) => {
        if (!address) return;
        setIsLoading(true);
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buySeeds',
                args: [seedType, amount]
            });
            
            const seedName = seedType === 0 ? 'Potato' : seedType === 1 ? 'Tomato' : 'Strawberry';
            notification.success(`🌱 Purchased ${amount} ${seedName} Seeds!`);
            
            // Update player stats
            updateStats({
                totalTokensEarned: -prices[seedType === 0 ? 'potato' : seedType === 1 ? 'tomato' : 'strawberry'] * amount
            });
            
            setTimeout(() => {
                refetchBalance();
                refetchInventory();
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Buy seeds error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    const buyWaterBucket = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyWaterBucket'
            });
            
            notification.success('💧 Purchased Water Bucket (6 charges)!');
            
            // Update player stats
            updateStats({
                totalTokensEarned: -prices.waterBucket
            });
            
            setTimeout(() => {
                refetchBalance();
                refetchInventory();
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Buy water bucket error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    const buyFertilizer = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyFertilizer'
            });
            
            notification.success('🧪 Purchased Fertilizer (4 charges)!');
            
            // Update player stats
            updateStats({
                totalTokensEarned: -prices.fertilizer
            });
            
            setTimeout(() => {
                refetchBalance();
                refetchInventory();
                refetchFertilizerTime();
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Buy fertilizer error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    const buyTile = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyTile'
            });
            
            notification.success('🧑‍🌾 Purchased New Farm Tile!');
            
            // Update player stats
            updateStats({
                totalTokensEarned: -prices.tile,
                tilesOwned: tileCount + 1
            });
            
            setTimeout(() => {
                refetchBalance();
                // Refetch player data to update tile count
                const getData = async () => {
                    const { data } = await useReadContract.fetch({
                        address: CONTRACT_ADDRESSES.playerRegistry,
                        abi: PlayerRegistryABI,
                        functionName: 'getPlayer',
                        args: [address],
                    });
                    
                    if (data) {
                        setTileCount(Number(data[6]));
                    }
                };
                getData();
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Buy tile error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Farm Shop</h2>
            <p className="text-center text-secondary">Please connect your wallet to access the shop.</p>
        </div>
    );

    return (
        <div className="shop-container animate-fade-in">
            <LoadingOverlay 
                isLoading={isLoading}
                text="Processing Purchase..."
            />
            
            <h2>Farm Shop</h2>
            
            <div className="card mb-lg">
                <div className="flex justify-between items-center mb-md">
                    <h3 className="text-xl m-0">Balance: <span className="text-warning">{balance.toFixed(2)} CROPS</span></h3>
                    <button 
                        className="btn btn-primary"
                        onClick={() => notification.info("Visit the Tokens tab to claim your daily tokens!")}
                    >
                        <span className="btn-icon">💰</span>
                        Get More Tokens
                    </button>
                </div>
            </div>
            
            {/* Special offers banner */}
            {showSpecialOffers && (
                <div className="special-offers-banner" style={{
                    background: 'linear-gradient(135deg, #8358FF, #F7B538)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(131, 88, 255, 0.3)'
                }}>
                    <button 
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                        onClick={() => setShowSpecialOffers(false)}
                    >×</button>
                    
                    <div className="banner-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="banner-icon" style={{
                            fontSize: '2.5rem',
                            animation: 'pulse 2s infinite'
                        }}>🌟</div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Spring Farming Bundle!</h3>
                            <p style={{ margin: '0', color: 'rgba(255,255,255,0.9)' }}>Get 5 of each seed type + 2 water buckets for just 200 CROPS! Limited time offer.</p>
                        </div>
                        <button className="btn btn-highlight" style={{
                            background: 'white',
                            color: '#8358FF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontWeight: 'bold',
                            cursor: balance >= 200 ? 'pointer' : 'not-allowed',
                            opacity: balance >= 200 ? 1 : 0.6,
                            marginLeft: 'auto',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>Purchase Bundle</button>
                    </div>
                    
                    {/* Animated sparkles effect */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 10%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 10%)'
                    }}></div>
                </div>
            )}
            
            <div className="shop-categories">
                <button 
                    className={`shop-category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeCategory === 'all' ? '#8358FF' : '#523D7F',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeCategory === 'all' ? '0 0 10px rgba(131, 88, 255, 0.5)' : 'none'
                    }}
                >
                    🛒 All Items
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'seeds' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('seeds')}
                >
                    🌱 Seeds
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'tools' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('tools')}
                >
                    🧰 Farming Tools
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'expansion' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('expansion')}
                >
                    🧑‍🌾 Farm Expansion
                </button>
            </div>
            
            {/* Bundle Section - New for Phase 4 */}
            {activeCategory === 'all' && showSpecialOffers && (
                <div className="shop-section">
                    <div className="shop-section-title" style={{
                        fontSize: '1.5rem',
                        color: '#F7B538',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span className="shop-section-icon">🎁</span>
                        Special Bundles
                    </div>
                    
                    <div className="shop-grid">
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                            border: '2px solid #F7B538'
                        }}>
                            <div style={{ position: 'absolute', top: '10px', right: '-30px', background: '#F7B538', color: '#1E1633', padding: '4px 40px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 'bold' }}>BEST VALUE</div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#F7B538' }}>Spring Starter Pack</h3>
                                <div style={{ color: '#F7B538', fontWeight: 'bold' }}>💰 200</div>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', flexGrow: 1 }}>
                                    <span>🥔</span>
                                    <div>5 Potato Seeds</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', flexGrow: 1 }}>
                                    <span>🍅</span>
                                    <div>5 Tomato Seeds</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', flexGrow: 1 }}>
                                    <span>🍓</span>
                                    <div>5 Strawberry Seeds</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', flexGrow: 1 }}>
                                    <span>💧</span>
                                    <div>2 Water Buckets</div>
                                </div>
                            </div>
                            
                            <div style={{ background: 'rgba(247, 181, 56, 0.1)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ color: '#F7B538', fontWeight: 'bold', marginBottom: '0.25rem' }}>You Save: 💰 80 CROPS</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Individual value: 280 CROPS</div>
                            </div>
                            
                            <button style={{
                                background: balance >= 200 ? 'linear-gradient(45deg, #F7B538, #FFA000)' : 'rgba(247, 181, 56, 0.3)',
                                color: balance >= 200 ? '#1E1633' : 'rgba(255,255,255,0.5)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                fontWeight: 'bold',
                                cursor: balance >= 200 ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>🛒</span> Purchase Bundle
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Seeds Section */}
            {(activeCategory === 'all' || activeCategory === 'seeds') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🌱</span>
                        Seeds
                    </div>
                    
                    <div className="shop-grid">
                        <ShopItem 
                            title="Potato Seeds"
                            description="Slow growing but reliable crop. Takes 3 hours to mature."
                            price={prices.potato || 10}
                            icon={<SeedPacket cropType={0} size={40} />}
                            count={inventory.potatoSeeds}
                            onPurchase={() => buySeeds(0, 1)}
                            disabled={isWriting || prices.potato > balance}
                            itemType="seed"
                            itemData={0}
                        />
                        
                        <ShopItem 
                            title="Tomato Seeds"
                            description="Medium growth time with good yield. Takes 2 hours to mature."
                            price={prices.tomato || 30}
                            icon={<SeedPacket cropType={1} size={40} />}
                            count={inventory.tomatoSeeds}
                            onPurchase={() => buySeeds(1, 1)}
                            disabled={isWriting || prices.tomato > balance}
                            itemType="seed"
                            itemData={1}
                        />
                        
                        <ShopItem 
                            title="Strawberry Seeds"
                            description="Fast growing and high value crop. Takes 1 hour to mature."
                            price={prices.strawberry || 50}
                            icon={<SeedPacket cropType={2} size={40} />}
                            count={inventory.strawberrySeeds}
                            onPurchase={() => buySeeds(2, 1)}
                            disabled={isWriting || prices.strawberry > balance}
                            itemType="seed"
                            itemData={2}
                            className="special-offer"
                        />
                    </div>
                </div>
            )}
            
            {/* Farming Tools Section */}
            {(activeCategory === 'all' || activeCategory === 'tools') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🧰</span>
                        Farming Tools
                    </div>
                    
                    <div className="shop-grid">
                        <ShopItem 
                            title="Water Bucket"
                            description="Provides 6 water charges. Required to grow crops after planting."
                            price={prices.waterBucket || 50}
                            icon={<WaterBucket size={40} />}
                            count={inventory.waterBuckets}
                            onPurchase={buyWaterBucket}
                            disabled={isWriting || prices.waterBucket > balance}
                            itemType="water"
                            itemData="bucket"
                        />
                        
                        <ShopItem 
                            title="Fertilizer"
                            description={
                                fertilizerCooldown > 0 
                                    ? `Available in ${formatTime(fertilizerCooldown)}. Provides 4 fertilizer charges. Instantly matures crops.` 
                                    : "Provides 4 fertilizer charges. Instantly matures crops and can be used instead of water."
                            }
                            price={prices.fertilizer || 100}
                            icon={<Fertilizer size={40} />}
                            count={inventory.fertilizerCharges}
                            onPurchase={buyFertilizer}
                            disabled={
                                isWriting || 
                                fertilizerCooldown > 0 || 
                                prices.fertilizer > balance
                            }
                            itemType="fertilizer"
                            itemData="charges"
                        />
                    </div>
                </div>
            )}
            
            {/* Farm Expansion Section */}
            {(activeCategory === 'all' || activeCategory === 'expansion') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🧑‍🌾</span>
                        Farm Expansion
                    </div>
                    
                    <div className="shop-grid">
                        <ShopItem 
                            title="Farm Tile"
                            description={
                                tileCount >= 24 
                                    ? "Maximum tile count reached (24/24)." 
                                    : `Expands your farm with a new tile for growing crops. Currently owned: ${tileCount}/24 tiles.`
                            }
                            price={prices.tile || 250}
                            icon={<TilePlot size={40} />}
                            count={24 - tileCount}
                            onPurchase={buyTile}
                            disabled={
                                isWriting || 
                                tileCount >= 24 || 
                                prices.tile > balance
                            }
                            itemType="tile"
                            itemData="farm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopManagerComponent;