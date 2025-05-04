import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import FarmManagerABI from '../../../contracts/abis/farmmanager-abi.json';
import { useNotification } from '../notifications/NotificationSystem';
import FarmGrid from './FarmGrid';
import { 
  WaterBucket, 
  Fertilizer, 
  SeedPacket 
} from '../../assets/FarmIcons';

const CONTRACT_ADDRESSES = {
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
};

const cropTypes = [
  { name: 'Potato', emoji: '🥔' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Strawberry', emoji: '🍓' }
];

const FarmManagerWrapper = () => {
    const { address } = useAccount();
    const notification = useNotification();
    const [selectedTile, setSelectedTile] = useState(0);
    const [cropType, setCropType] = useState(0);
    const [inventory, setInventory] = useState(null);
    const [tileInfo, setTileInfo] = useState(null);
    const [tileCount, setTileCount] = useState(0);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [cropConfigs, setCropConfigs] = useState([]);
    const [isWatering, setIsWatering] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isFertilizing, setIsFertilizing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerInventory',
        args: [address],
        enabled: !!address,
    });

    const { data: tileCountData, refetch: refetchTileCount } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerTileCount',
        args: [address],
        enabled: !!address,
    });

    const { data: tileInfoData, refetch: refetchTileInfo } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getTileInfo',
        args: [address, selectedTile],
        enabled: !!address && tileCount > 0,
    });

    // Get crop config for growth times and yields
    const getCropConfig = async (cropType) => {
      try {
        const { data } = await useReadContract.fetch({
          address: CONTRACT_ADDRESSES.farmManager,
          abi: FarmManagerABI,
          functionName: 'getCropConfig',
          args: [cropType],
        });
        
        return {
          cost: Number(data[0]),
          growthTime: Number(data[1]),
          yield: Number(data[2]),
          enabled: data[3]
        };
      } catch (error) {
        console.error("Error fetching crop config:", error);
        return {
          cost: 0,
          growthTime: 3600, // Default 1 hour
          yield: 0,
          enabled: true
        };
      }
    };

    // Fetch all crop configs initially
    useEffect(() => {
      const fetchCropConfigs = async () => {
        const configs = [];
        
        for (let i = 0; i < 3; i++) {
          try {
            const config = await getCropConfig(i);
            configs.push(config);
          } catch (error) {
            console.error(`Error fetching config for crop type ${i}:`, error);
            // Use fallback values
            configs.push({
              cost: 0,
              growthTime: i === 0 ? 10800 : i === 1 ? 7200 : 3600, // 3h, 2h, 1h
              yield: 0,
              enabled: true
            });
          }
        }
        
        setCropConfigs(configs);
      };
      
      if (address) {
        fetchCropConfigs();
      }
    }, [address]);

    useEffect(() => {
        if (inventoryData) {
            setInventory({
                potatoSeeds: Number(inventoryData[0]),
                tomatoSeeds: Number(inventoryData[1]),
                strawberrySeeds: Number(inventoryData[2]),
                waterBuckets: Number(inventoryData[3]),
                fertilizerCharges: Number(inventoryData[4]),
                lastFertilizerPurchase: Number(inventoryData[5])
            });
        }

        if (tileCountData) {
            setTileCount(Number(tileCountData));
        }

        if (tileInfoData) {
            const tileInfoObj = {
                exists: tileInfoData[0],
                cropType: Number(tileInfoData[1]),
                plantedTime: Number(tileInfoData[2]),
                isWatered: tileInfoData[3],
                cropExists: tileInfoData[4],
                isReady: tileInfoData[5]
            };
            
            setTileInfo(tileInfoObj);
            
            // Calculate growth percentage
            if (tileInfoObj.cropExists && tileInfoObj.isWatered && !tileInfoObj.isReady) {
                const currentTime = Math.floor(Date.now() / 1000);
                const plantedTime = tileInfoObj.plantedTime;
                const cropConfig = cropConfigs[tileInfoObj.cropType];
                
                if (cropConfig) {
                    const growthTime = cropConfig.growthTime;
                    const timePassed = currentTime - plantedTime;
                    const percentage = Math.min(100, Math.max(0, (timePassed / growthTime) * 100));
                    setGrowthPercentage(percentage);
                }
            } else if (tileInfoObj.isReady) {
                setGrowthPercentage(100);
            } else if (!tileInfoObj.isWatered && tileInfoObj.cropExists) {
                setGrowthPercentage(0);
            }
        }
    }, [inventoryData, tileCountData, tileInfoData, cropConfigs]);

    // Set up interval to update growth percentage
    useEffect(() => {
        let interval;
        
        if (tileInfo && tileInfo.cropExists && tileInfo.isWatered && !tileInfo.isReady) {
            interval = setInterval(() => {
                const currentTime = Math.floor(Date.now() / 1000);
                const plantedTime = tileInfo.plantedTime;
                const cropConfig = cropConfigs[tileInfo.cropType];
                
                if (cropConfig) {
                    const growthTime = cropConfig.growthTime;
                    const timePassed = currentTime - plantedTime;
                    const percentage = Math.min(100, Math.max(0, (timePassed / growthTime) * 100));
                    
                    setGrowthPercentage(percentage);
                    
                    // Refetch if the crop should be ready now
                    if (percentage >= 100) {
                        refetchTileInfo();
                        clearInterval(interval);
                    }
                }
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [tileInfo, cropConfigs, refetchTileInfo]);

    const { writeContractAsync: writeContract, isPending: isWriting } = useWriteContract();

    const plantCrop = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'plantCrop',
                args: [selectedTile, cropType]
            });
            
            notification.success(`${cropTypes[cropType].emoji} Planted ${cropTypes[cropType].name} seeds on tile ${selectedTile + 1}!`);
            
            setTimeout(() => {
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Plant crop error:", error);
            notification.error(`Failed to plant: ${error.message}`);
        }
    };

    const waterCrop = async () => {
        if (!address) return;
        try {
            setIsWatering(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'waterCrop',
                args: [selectedTile]
            });
            
            notification.success(`💧 Watered crop on tile ${selectedTile + 1}!`);
            
            setTimeout(() => {
                setIsWatering(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Water crop error:", error);
            setIsWatering(false);
            notification.error(`Failed to water: ${error.message}`);
        }
    };

    const harvestCrop = async () => {
        if (!address) return;
        try {
            setIsHarvesting(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'harvestCrop',
                args: [selectedTile]
            });
            
            notification.success(`🌾 Harvested crop from tile ${selectedTile + 1}!`);
            
            setTimeout(() => {
                setIsHarvesting(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Harvest crop error:", error);
            setIsHarvesting(false);
            notification.error(`Failed to harvest: ${error.message}`);
        }
    };

    const useFertilizer = async () => {
        if (!address) return;
        try {
            setIsFertilizing(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'useFertilizer',
                args: [selectedTile]
            });
            
            notification.success(`🧪 Applied fertilizer to tile ${selectedTile + 1}!`);
            
            setTimeout(() => {
                setIsFertilizing(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Use fertilizer error:", error);
            setIsFertilizing(false);
            notification.error(`Failed to use fertilizer: ${error.message}`);
        }
    };

    // Handle tile selection from FarmGrid
    const handleTileSelect = (tileIndex) => {
        setSelectedTile(tileIndex);
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Farm Manager</h2>
            <p className="text-center text-secondary">Please connect your wallet to manage your farm.</p>
        </div>
    );

    return (
        <div className="farm-container animate-fade-in">
            <h2>Farm Manager</h2>
            
            {inventory && (
                <div className="inventory-section">
                    <div className="section-header">
                        <h3>Inventory</h3>
                        <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                    
                    <div className={`inventory-grid ${isExpanded ? 'expanded' : ''}`}>
                        <div className="inventory-item">
                            <div className="inventory-icon">
                                <SeedPacket cropType={0} size={28} />
                            </div>
                            <div className="inventory-count">{inventory.potatoSeeds}</div>
                            <div className="inventory-label">Potato Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">
                                <SeedPacket cropType={1} size={28} />
                            </div>
                            <div className="inventory-count">{inventory.tomatoSeeds}</div>
                            <div className="inventory-label">Tomato Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">
                                <SeedPacket cropType={2} size={28} />
                            </div>
                            <div className="inventory-count">{inventory.strawberrySeeds}</div>
                            <div className="inventory-label">Strawberry Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">
                                <WaterBucket size={28} />
                            </div>
                            <div className="inventory-count">{inventory.waterBuckets}</div>
                            <div className="inventory-label">Water Charges</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">
                                <Fertilizer size={28} />
                            </div>
                            <div className="inventory-count">{inventory.fertilizerCharges}</div>
                            <div className="inventory-label">Fertilizer</div>
                        </div>
                    </div>
                    
                    {isExpanded && (
                        <div className="inventory-details">
                            <div className="card p-md mt-md">
                                <h4>Crop Growth Times</h4>
                                <div className="grid grid-cols-3 gap-md mt-sm">
                                    {cropConfigs.map((config, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-xl mb-xs">{cropTypes[index].emoji}</div>
                                            <div className="font-bold">{cropTypes[index].name}</div>
                                            <div className="text-sm text-secondary">
                                                {Math.floor(config.growthTime / 3600)} hours
                                            </div>
                                            <div className="text-success text-sm mt-xs">
                                                Yield: {config.yield / 10**18} CROPS
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <FarmGrid
                selectedTile={selectedTile}
                setSelectedTile={setSelectedTile}
                tileInfo={tileInfo}
                tileCount={tileCount}
                cropConfigs={cropConfigs}
                isWatering={isWatering}
                isHarvesting={isHarvesting}
                isFertilizing={isFertilizing}
                onTileSelect={handleTileSelect}
            />
            
            {tileInfo && tileInfo.exists && (
                <div className="tile-details card">
                    <h3>Tile {selectedTile + 1} Details</h3>
                    
                    {tileInfo.cropExists ? (
                        <div>
                            <div className="flex gap-md items-center mb-md">
                                <div className="tile-crop-icon">
                                    {cropTypes[tileInfo.cropType].emoji}
                                </div>
                                <div>
                                    <div className="font-bold text-xl">
                                        {cropTypes[tileInfo.cropType].name}
                                    </div>
                                    <div className="text-secondary">
                                        Planted on {new Date(tileInfo.plantedTime * 1000).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="status-badge mb-md">
                                Status: 
                                {tileInfo.isReady ? (
                                    <span className="badge badge-success ml-sm">Ready to Harvest! 🌟</span>
                                ) : tileInfo.isWatered ? (
                                    <span className="badge badge-primary ml-sm">Growing... 🌱</span>
                                ) : (
                                    <span className="badge badge-warning ml-sm">Needs Water 💧</span>
                                )}
                            </div>
                            
                            {tileInfo.isWatered && !tileInfo.isReady && (
                                <div className="mb-md">
                                    <div className="flex justify-between mb-xs">
                                        <div>Growth Progress:</div>
                                        <div>{Math.floor(growthPercentage)}%</div>
                                    </div>
                                    <div className="growth-progress">
                                        <div 
                                            className="growth-fill" 
                                            style={{ width: `${growthPercentage}%` }}
                                        ></div>
                                    </div>
                                    
                                    {cropConfigs[tileInfo.cropType] && (
                                        <div className="text-center text-secondary mt-sm">
                                            {(() => {
                                                const currentTime = Math.floor(Date.now() / 1000);
                                                const plantedTime = tileInfo.plantedTime;
                                                const growthTime = cropConfigs[tileInfo.cropType].growthTime;
                                                const timeLeft = Math.max(0, growthTime - (currentTime - plantedTime));
                                                
                                                const hours = Math.floor(timeLeft / 3600);
                                                const minutes = Math.floor((timeLeft % 3600) / 60);
                                                const seconds = timeLeft % 60;
                                                
                                                return `Ready in: ${hours}h ${minutes}m ${seconds}s`;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="tile-actions">
                                {!tileInfo.isWatered && inventory && inventory.waterBuckets > 0 && (
                                    <button 
                                        className="btn btn-water"
                                        onClick={waterCrop}
                                        disabled={isWriting || isWatering}
                                    >
                                        <span className="btn-icon">💧</span>
                                        Water Crop
                                    </button>
                                )}
                                
                                {tileInfo.isReady && (
                                    <button 
                                        className="btn btn-harvest"
                                        onClick={harvestCrop}
                                        disabled={isWriting || isHarvesting}
                                    >
                                        <span className="btn-icon">🌾</span>
                                        Harvest Crop
                                    </button>
                                )}
                                
                                {!tileInfo.isReady && inventory && inventory.fertilizerCharges > 0 && (
                                    <button 
                                        className="btn btn-fertilize"
                                        onClick={useFertilizer}
                                        disabled={isWriting || isFertilizing}
                                    >
                                        <span className="btn-icon">🧪</span>
                                        Use Fertilizer
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-md">This tile is empty and ready for planting.</p>
                            
                            <div className="mb-md">
                                <div className="font-bold mb-sm">Select Seed Type:</div>
                                <div className="flex flex-wrap gap-sm">
                                    <button 
                                        className={`btn ${cropType === 0 ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setCropType(0)}
                                    >
                                        🥔 Potato
                                    </button>
                                    <button 
                                        className={`btn ${cropType === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setCropType(1)}
                                    >
                                        🍅 Tomato
                                    </button>
                                    <button 
                                        className={`btn ${cropType === 2 ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setCropType(2)}
                                    >
                                        🍓 Strawberry
                                    </button>
                                </div>
                            </div>
                            
                            <div className="seed-info bg-container p-md rounded-md mb-md">
                                <div className="grid grid-cols-2 gap-md">
                                    <div>
                                        <div className="text-secondary">Available Seeds:</div>
                                        <div className="font-bold">
                                            {cropType === 0 ? inventory?.potatoSeeds || 0 :
                                            cropType === 1 ? inventory?.tomatoSeeds || 0 :
                                            inventory?.strawberrySeeds || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-secondary">Growth Time:</div>
                                        <div className="font-bold">
                                            {cropConfigs[cropType] ? 
                                            Math.floor(cropConfigs[cropType].growthTime / 3600) + ' hours' : 
                                            'Loading...'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-secondary">Yield:</div>
                                        <div className="font-bold text-success">
                                            {cropConfigs[cropType] ? 
                                            (cropConfigs[cropType].yield / 10**18) + ' CROPS' : 
                                            'Loading...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                className="btn btn-plant w-full"
                                onClick={plantCrop}
                                disabled={
                                    isWriting || 
                                    (cropType === 0 && (!inventory || inventory.potatoSeeds === 0)) || 
                                    (cropType === 1 && (!inventory || inventory.tomatoSeeds === 0)) || 
                                    (cropType === 2 && (!inventory || inventory.strawberrySeeds === 0))
                                }
                            >
                                <span className="btn-icon">🌱</span>
                                Plant {cropTypes[cropType].name} Seeds
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FarmManagerWrapper;