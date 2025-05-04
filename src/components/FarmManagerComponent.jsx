import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import FarmManagerABI from '../../contracts/abis/farmmanager-abi.json';
import { 
  TomatoPlant, 
  PotatoPlant, 
  StrawberryPlant, 
  WaterBucket, 
  Fertilizer,
  EmptyPlot,
  PlantedPlot,
  WateredPlot
} from '../assets/FarmIcons';

const CONTRACT_ADDRESSES = {
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
};

const cropTypes = [
  { name: 'Potato', emoji: '🥔', component: PotatoPlant },
  { name: 'Tomato', emoji: '🍅', component: TomatoPlant },
  { name: 'Strawberry', emoji: '🍓', component: StrawberryPlant }
];

const getGrowthStage = (isPlanted, isWatered, isReady, plantedTime, growthTime) => {
  if (!isPlanted) return 0;
  
  if (isReady) return 3;
  
  if (!isWatered) return 1;
  
  // Calculate growth percentage
  const currentTime = Math.floor(Date.now() / 1000);
  const timePassed = currentTime - plantedTime;
  const percentComplete = Math.min(100, (timePassed / growthTime) * 100);
  
  if (percentComplete < 50) return 1;
  return 2;
};

const FarmManagerComponent = () => {
    const { address } = useAccount();
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
    const waterAnimationRef = useRef(null);
    const [lastAction, setLastAction] = useState('');
    const [lastActionTime, setLastActionTime] = useState(0);

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
            setLastAction('planted');
            setLastActionTime(Date.now());
            setTimeout(() => {
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Plant crop error:", error);
            alert("Action failed: " + error.message);
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
            
            // Animation and feedback for watering
            setLastAction('watered');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsWatering(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Water crop error:", error);
            setIsWatering(false);
            alert("Action failed: " + error.message);
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
            
            // Animation and feedback for harvest
            setLastAction('harvested');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsHarvesting(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Harvest crop error:", error);
            setIsHarvesting(false);
            alert("Action failed: " + error.message);
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
            
            // Animation and feedback for fertilizing
            setLastAction('fertilized');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsFertilizing(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Use fertilizer error:", error);
            setIsFertilizing(false);
            alert("Action failed: " + error.message);
        }
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
                    <h3>Inventory</h3>
                    <div className="inventory-grid">
                        <div className="inventory-item">
                            <div className="inventory-icon">🥔</div>
                            <div className="inventory-count">{inventory.potatoSeeds}</div>
                            <div className="inventory-label">Potato Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">🍅</div>
                            <div className="inventory-count">{inventory.tomatoSeeds}</div>
                            <div className="inventory-label">Tomato Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">🍓</div>
                            <div className="inventory-count">{inventory.strawberrySeeds}</div>
                            <div className="inventory-label">Strawberry Seeds</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">💧</div>
                            <div className="inventory-count">{inventory.waterBuckets}</div>
                            <div className="inventory-label">Water Buckets</div>
                        </div>
                        <div className="inventory-item">
                            <div className="inventory-icon">🧪</div>
                            <div className="inventory-count">{inventory.fertilizerCharges}</div>
                            <div className="inventory-label">Fertilizer</div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="farm-grid-container">
                <h3>My Farm {tileCount > 0 ? `(${tileCount} Tiles)` : ''}</h3>
                
                {tileCount > 0 ? (
                    <div>
                        <div className="farm-grid">
                            {Array.from({ length: tileCount }, (_, i) => (
                                <div
                                    key={i}
                                    className={`farm-tile ${selectedTile === i ? 'selected' : ''} ${isWatering && selectedTile === i ? 'watering' : ''} ${isHarvesting && selectedTile === i ? 'harvesting' : ''} ${isFertilizing && selectedTile === i ? 'fertilizing' : ''}`}
                                    onClick={() => setSelectedTile(i)}
                                >
                                    <div className="farm-tile-number">{i + 1}</div>
                                    
                                    {tileInfo && selectedTile === i && tileInfo.cropExists && (
                                        <>
                                            {(() => {
                                                const cropConfig = cropConfigs[tileInfo.cropType];
                                                const growthTime = cropConfig ? cropConfig.growthTime : 3600;
                                                const stage = getGrowthStage(
                                                    tileInfo.cropExists,
                                                    tileInfo.isWatered,
                                                    tileInfo.isReady,
                                                    tileInfo.plantedTime,
                                                    growthTime
                                                );
                                                
                                                const CropComponent = cropTypes[tileInfo.cropType].component;
                                                return <CropComponent stage={stage} size={40} />;
                                            })()}
                                            
                                            <div 
                                                className={`farm-tile-status ${tileInfo.isReady ? 'ready' : tileInfo.isWatered ? 'growing' : 'empty'}`}
                                            ></div>
                                        </>
                                    )}
                                    
                                    {(!tileInfo || selectedTile !== i || !tileInfo.cropExists) && (
                                        <EmptyPlot size={40} />
                                    )}
                                    
                                    {isWatering && selectedTile === i && (
                                        <div className="water-animation" ref={waterAnimationRef}>💧</div>
                                    )}
                                    
                                    {isHarvesting && selectedTile === i && (
                                        <div className="harvest-animation"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {tileInfo && tileInfo.exists && (
                            <div className="tile-details mt-lg">
                                <h3>Tile {selectedTile + 1} Details</h3>
                                
                                {tileInfo.cropExists ? (
                                    <div>
                                        <p>
                                            <span className={`font-bold crop-${cropTypes[tileInfo.cropType].name.toLowerCase()}`}>
                                                {cropTypes[tileInfo.cropType].emoji} {cropTypes[tileInfo.cropType].name}
                                            </span> planted on this tile.
                                        </p>
                                        
                                        <p>Status: {tileInfo.isReady ? 'Ready to Harvest! 🌟' : tileInfo.isWatered ? 'Growing... 🌱' : 'Needs Water 💧'}</p>
                                        
                                        {tileInfo.isWatered && !tileInfo.isReady && (
                                            <div>
                                                <p>Growth Progress:</p>
                                                <div className="growth-progress">
                                                    <div 
                                                        className="growth-fill" 
                                                        style={{ width: `${growthPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-secondary text-right">{Math.floor(growthPercentage)}%</p>
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
                                        <p>This tile is empty and ready for planting.</p>
                                        
                                        <div className="form-group mt-md">
                                            <label className="form-label">Select Seed Type:</label>
                                            <div className="flex gap-sm mb-md">
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
                                            
                                            <div className="seed-info">
                                                <p>Available Seeds: {
                                                    cropType === 0 ? inventory?.potatoSeeds || 0 :
                                                    cropType === 1 ? inventory?.tomatoSeeds || 0 :
                                                    inventory?.strawberrySeeds || 0
                                                }</p>
                                                <p>Growth Time: {
                                                    cropConfigs[cropType] ? 
                                                    Math.floor(cropConfigs[cropType].growthTime / 3600) + ' hours' : 
                                                    'Loading...'
                                                }</p>
                                            </div>
                                            
                                            <button 
                                                className="btn btn-plant w-full mt-md"
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
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-lg">
                        <p className="mb-md">You don't have any farm tiles yet. Visit the shop to buy your first tile!</p>
                    </div>
                )}
            </div>
            
            {lastAction && Date.now() - lastActionTime < 3000 && (
                <div className="fixed bottom-4 right-4 bg-container p-md rounded-md shadow-md animate-slide-up">
                    <p>You successfully {lastAction} your crop! ✅</p>
                </div>
            )}
        </div>
    );
};

export default FarmManagerComponent;