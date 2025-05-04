import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import CropsTokenABI from '../../contracts/abis/cropstoken-abi.json';
import FarmManagerABI from '../../contracts/abis/farmmanager-abi.json';
import { CropsToken, WaterBucket, Fertilizer, SeedPacket } from '../assets/FarmIcons';

const CONTRACT_ADDRESSES = {
    cropsToken: "0x9edD5162F5Cbc55Bd5d53342c996A44e3a753337",
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
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

    // Get token balance
    const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.cropsToken,
        abi: CropsTokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

    // Get inventory
    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerInventory',
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
        if (tokenBalance) {
            const newBalance = Number(formatEther(tokenBalance));
            setResources(prev => ({ ...prev, balance: newBalance }));
        }
        
        if (inventoryData) {
            const newResources = {
                potatoes: Number(inventoryData[0]),
                tomatoes: Number(inventoryData[1]),
                strawberries: Number(inventoryData[2]),
                water: Number(inventoryData[3]),
                fertilizer: Number(inventoryData[4])
            };
            
            setResources(prev => ({ ...prev, ...newResources }));
        }
    }, [tokenBalance, inventoryData]);

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