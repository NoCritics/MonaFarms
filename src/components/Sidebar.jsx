import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import CROPS_TokenABI from '../abis/CROPS_Token.abi.json';
import FarmManagerABI from '../abis/FarmManager.abi.json';
import PlayerRegistryInventoryABI from '../abis/PlayerRegistryInventory.abi.json';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { CropsToken, WaterBucket, Fertilizer, SeedPacket } from '../assets/ItemImages';

// ItemID enum values
const ITEM_IDS = {
    CROPS_CURRENCY: 0,
    WATER_BUCKET: 1,
    FERTILIZER: 2,
    POTATO_SEED: 8,
    TOMATO_SEED: 9,
    STRAWBERRY_SEED: 10
};

const Sidebar = () => {
    const { address } = useAccount();
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
    const [resources, setResources] = useState({
        balance: 0,
        potatoes: 0,
        tomatoes: 0,
        strawberries: 0,
        water: 0,
        fertilizer: 0
    });
    const [resourceAnimations, setResourceAnimations] = useState({});
    const [prevResources, setPrevResources] = useState(null);
    const [tokenDecimals, setTokenDecimals] = useState(18);

    // Get token decimals
    const { data: decimalsData } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'decimals',
        enabled: !!address,
    });

    // Set token decimals when data is received
    useEffect(() => {
        if (decimalsData !== undefined) {
            setTokenDecimals(Number(decimalsData));
        }
    }, [decimalsData]);

    // Get token balance
    const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

    // Get inventory from PlayerRegistryInventory instead of FarmManager
    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
        abi: PlayerRegistryInventoryABI,
        functionName: 'getPlayerFullInventory',
        args: [address],
        enabled: !!address,
    });

    // Handle window resize for responsive collapsed state
    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth < 1024);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update resources state when data changes
    useEffect(() => {
        if (tokenBalance && decimalsData) {
            const newBalance = Number(formatUnits(tokenBalance, tokenDecimals));
            setResources(prev => ({ ...prev, balance: newBalance }));
        }
        
        if (inventoryData) {
            // inventoryData is an array of two arrays: [itemIds[], amounts[]]
            const inventoryObj = {};
            inventoryData[0].forEach((id, index) => {
                inventoryObj[Number(id)] = Number(inventoryData[1][index]);
            });

            // Update resources based on the inventoryObj
            const newResources = {
                potatoes: inventoryObj[ITEM_IDS.POTATO_SEED] || 0,
                tomatoes: inventoryObj[ITEM_IDS.TOMATO_SEED] || 0,
                strawberries: inventoryObj[ITEM_IDS.STRAWBERRY_SEED] || 0,
                water: inventoryObj[ITEM_IDS.WATER_BUCKET] || 0,
                fertilizer: inventoryObj[ITEM_IDS.FERTILIZER] || 0
            };
            
            setResources(prev => ({ ...prev, ...newResources }));
        }
    }, [tokenBalance, inventoryData, tokenDecimals]);

    // Compare previous and current resource values to trigger animations
    useEffect(() => {
        if (prevResources) {
            const animations = {};
            
            Object.keys(resources).forEach(key => {
                if (resources[key] > prevResources[key]) {
                    animations[key] = 'resource-increase';
                } else if (resources[key] < prevResources[key]) {
                    animations[key] = 'resource-decrease';
                }
            });
            
            if (Object.keys(animations).length > 0) {
                setResourceAnimations(animations);
                
                // Clear animations after they complete
                setTimeout(() => {
                    setResourceAnimations({});
                }, 1500);
            }
        }
        
        setPrevResources(resources);
    }, [resources]);

    // Refresh data periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (address) {
                refetchBalance();
                refetchInventory();
            }
        }, 15000); // Refresh every 15 seconds
        
        return () => clearInterval(interval);
    }, [address, refetchBalance, refetchInventory]);

    if (!address) return null;

    return (
        <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? '⟩' : '⟨'}
            </div>
            
            <div className="sidebar-content">
                <div className="resource-item">
                    <div className="resource-icon">
                        <CropsToken size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">CROPS</div>
                        <div className={`resource-value ${resourceAnimations.balance || ''}`}>
                            {resources.balance.toFixed(0)}
                        </div>
                    </div>
                </div>
                
                <div className="resource-item">
                    <div className="resource-icon">
                        <SeedPacket cropType={0} size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">Potato Seeds</div>
                        <div className={`resource-value ${resourceAnimations.potatoes || ''}`}>
                            {resources.potatoes}
                        </div>
                    </div>
                </div>
                
                <div className="resource-item">
                    <div className="resource-icon">
                        <SeedPacket cropType={1} size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">Tomato Seeds</div>
                        <div className={`resource-value ${resourceAnimations.tomatoes || ''}`}>
                            {resources.tomatoes}
                        </div>
                    </div>
                </div>
                
                <div className="resource-item">
                    <div className="resource-icon">
                        <SeedPacket cropType={2} size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">Strawberry Seeds</div>
                        <div className={`resource-value ${resourceAnimations.strawberries || ''}`}>
                            {resources.strawberries}
                        </div>
                    </div>
                </div>
                
                <div className="resource-item">
                    <div className="resource-icon">
                        <WaterBucket size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">Water Charges</div>
                        <div className={`resource-value ${resourceAnimations.water || ''}`}>
                            {resources.water}
                        </div>
                    </div>
                </div>
                
                <div className="resource-item">
                    <div className="resource-icon">
                        <Fertilizer size={isCollapsed ? 20 : 24} />
                    </div>
                    <div className={`resource-info ${isCollapsed ? 'hidden' : ''}`}>
                        <div className="resource-label">Fertilizer</div>
                        <div className={`resource-value ${resourceAnimations.fertilizer || ''}`}>
                            {resources.fertilizer}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={`sidebar-actions ${isCollapsed ? 'hidden' : ''}`}>
                <button className="btn btn-sm btn-secondary w-full mb-sm" onClick={() => window.location.href = '#shop'}>
                    Shop
                </button>
                <button className="btn btn-sm btn-secondary w-full" onClick={() => window.location.href = '#farm'}>
                    Farm
                </button>
            </div>
        </div>
    );
};

export default Sidebar;