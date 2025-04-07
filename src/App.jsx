import React, { useState, useEffect } from 'react';
import { ConnectKitButton } from "connectkit";
import { useAccount, useContractRead, useContractWrite, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from 'viem';

import PlayerRegistryABI from '../contracts/abis/playerregistry-abi.json';
import CropsTokenABI from '../contracts/abis/cropstoken-abi.json';
import FarmManagerABI from '../contracts/abis/farmmanager-abi.json';
import ShopManagerABI from '../contracts/abis/shopmanager-abi.json';
import LeaderboardABI from '../contracts/abis/leaderboard-abi.json';

const CONTRACT_ADDRESSES = {
    playerRegistry: "0x117f6cdF4f0a03A2fCA6e505D2b72ecec1eF3eDE",
    cropsToken: "0x9edD5162F5Cbc55Bd5d53342c996A44e3a753337",
    leaderboard: "0x2Cef48866f2490d3C9Dd5862072fF67405bA110f",
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
    shopManager: "0xF3b09f381d98A1b40D4038f35C66f227C178Cb89"
};

const PlayerRegistryComponent = () => {
    const { address } = useAccount();
    const [nickname, setNickname] = useState("");
    const [newNickname, setNewNickname] = useState("");
    const [playerDetails, setPlayerDetails] = useState(null);

        const { data: isRegistered } = useReadContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: PlayerRegistryABI,
        functionName: 'isPlayerRegistered',
        args: [address],
        enabled: !!address,
    });

        const { data: playerData, refetch: refetchPlayerData } = useReadContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: PlayerRegistryABI,
        functionName: 'getPlayer',
        args: [address],
        enabled: !!address && isRegistered,
    });

    useEffect(() => {
        if (playerData) {
            setPlayerDetails({
                nickname: playerData[0],
                registrationTime: Number(playerData[1]),
                exists: playerData[2],
                waterBuckets: Number(playerData[3]),
                initialSeedType: Number(playerData[4]),
                initialSeedCount: Number(playerData[5]),
                ownedTiles: Number(playerData[6])
            });
        }
    }, [playerData]);

        const { writeContractAsync: registerPlayer, isPending: isRegistering } = useWriteContract();

    const handleRegister = async () => {
        if (!nickname) return;
        try {
            await registerPlayer({
                address: CONTRACT_ADDRESSES.playerRegistry,
                abi: PlayerRegistryABI,
                functionName: 'registerPlayer',
                args: [nickname]
            });
            alert("Registration submitted!");
            setNickname("");
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    };

        const { writeContractAsync: updateNicknameFunc, isPending: isUpdating } = useWriteContract();

    const handleUpdateNickname = async () => {
        if (!newNickname) return;
        try {
            await updateNicknameFunc({
                address: CONTRACT_ADDRESSES.playerRegistry,
                abi: PlayerRegistryABI,
                functionName: 'updateNickname',
                args: [newNickname]
            });
            alert("Nickname update submitted!");
            setNewNickname("");
            refetchPlayerData();
        } catch (error) {
            console.error("Nickname update error:", error);
            alert("Update failed: " + error.message);
        }
    };

    if (!address) return <div>Please connect your wallet first</div>;

    return (
        <div>
            <h2>Player Registry</h2>

            {isRegistered ? (
                <div>
                    <p>Registration status: Registered</p>

                    {playerDetails && (
                        <div>
                            <h3>Player Details</h3>
                            <p>Nickname: {playerDetails.nickname}</p>
                            <p>Registration Time: {new Date(playerDetails.registrationTime * 1000).toLocaleString()}</p>
                            <p>Water Bucket Charges: {playerDetails.waterBuckets}</p>
                            <p>Initial Seed Type: {playerDetails.initialSeedType}</p>
                            <p>Initial Seed Count: {playerDetails.initialSeedCount}</p>
                            <p>Owned Tiles: {playerDetails.ownedTiles}</p>
                        </div>
                    )}

                    <div>
                        <h3>Update Nickname</h3>
                        <input
                            type="text"
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            placeholder="New Nickname"
                        />
                        <button onClick={handleUpdateNickname} disabled={isUpdating || !newNickname}>
                            {isUpdating ? "Updating..." : "Update Nickname"}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Registration status: Not Registered</p>
                    <div>
                        <h3>Register Player</h3>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Your Nickname"
                        />
                        <button onClick={handleRegister} disabled={isRegistering || !nickname}>
                            {isRegistering ? "Registering..." : "Register"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CropsTokenComponent = () => {
    const { address } = useAccount();
    const [transferAmount, setTransferAmount] = useState("");
    const [transferRecipient, setTransferRecipient] = useState("");

        const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.cropsToken,
        abi: CropsTokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

        const { data: faucetTime, refetch: refetchFaucetTime } = useReadContract({
        address: CONTRACT_ADDRESSES.cropsToken,
        abi: CropsTokenABI,
        functionName: 'timeUntilNextFaucet',
        args: [address],
        enabled: !!address,
    });

        const { writeContractAsync: claimFaucet, isPending: isClaiming } = useWriteContract();

    const handleClaimFaucet = async () => {
        try {
            await claimFaucet({
                address: CONTRACT_ADDRESSES.cropsToken,
                abi: CropsTokenABI,
                functionName: 'claimDailyFaucet'
            });
            alert("Faucet claim submitted!");
            refetchBalance();
            refetchFaucetTime();
        } catch (error) {
            console.error("Faucet claim error:", error);
            alert("Claim failed: " + error.message);
        }
    };

        const { writeContractAsync: transferTokens, isPending: isTransferring } = useWriteContract();

    const handleTransfer = async () => {
        if (!transferAmount || !transferRecipient) return;
        try {
            await transferTokens({
                address: CONTRACT_ADDRESSES.cropsToken,
                abi: CropsTokenABI,
                functionName: 'transfer',
                args: [transferRecipient, parseEther(transferAmount)]
            });
            alert("Transfer submitted!");
            setTransferAmount("");
            setTransferRecipient("");
            refetchBalance();
        } catch (error) {
            console.error("Transfer error:", error);
            alert("Transfer failed: " + error.message);
        }
    };

    if (!address) return <div>Please connect your wallet first</div>;

    return (
        <div>
            <h2>CROPS Token</h2>

            <div>
                <h3>Token Balance</h3>
                <p>{tokenBalance ? formatEther(tokenBalance) : '0'} CROPS</p>
            </div>

            <div>
                <h3>Daily Faucet</h3>
                {faucetTime && Number(faucetTime) > 0 ? (
                    <p>Time until next claim: {Math.floor(Number(faucetTime) / 3600)}h {Math.floor((Number(faucetTime) % 3600) / 60)}m</p>
                ) : (
                    <div>
                        <p>You can claim the daily faucet now</p>
                        <button onClick={handleClaimFaucet} disabled={isClaiming}>
                            {isClaiming ? "Claiming..." : "Claim 50 CROPS"}
                        </button>
                    </div>
                )}
            </div>

            <div>
                <h3>Transfer Tokens</h3>
                <input
                    type="text"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    placeholder="Recipient Address"
                />
                <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Amount (CROPS)"
                />
                <button
                    onClick={handleTransfer}
                    disabled={isTransferring || !transferAmount || !transferRecipient}
                >
                    {isTransferring ? "Transferring..." : "Transfer"}
                </button>
            </div>
        </div>
    );
};

const FarmManagerComponent = () => {
    const { address } = useAccount();
    const [selectedTile, setSelectedTile] = useState(0);
    const [cropType, setCropType] = useState(0);
    const [inventory, setInventory] = useState(null);
    const [tileInfo, setTileInfo] = useState(null);
    const [tileCount, setTileCount] = useState(0);

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
            setTileInfo({
                exists: tileInfoData[0],
                cropType: Number(tileInfoData[1]),
                plantedTime: Number(tileInfoData[2]),
                isWatered: tileInfoData[3],
                cropExists: tileInfoData[4],
                isReady: tileInfoData[5]
            });
        }
    }, [inventoryData, tileCountData, tileInfoData]);

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
            alert("Plant crop action submitted!");
            refetchInventory();
            refetchTileInfo();
        } catch (error) {
            console.error("Plant crop error:", error);
            alert("Action failed: " + error.message);
        }
    };

    const waterCrop = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'waterCrop',
                args: [selectedTile]
            });
            alert("Water crop action submitted!");
            refetchInventory();
            refetchTileInfo();
        } catch (error) {
            console.error("Water crop error:", error);
            alert("Action failed: " + error.message);
        }
    };

    const harvestCrop = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'harvestCrop',
                args: [selectedTile]
            });
            alert("Harvest crop action submitted!");
            refetchInventory();
            refetchTileInfo();
        } catch (error) {
            console.error("Harvest crop error:", error);
            alert("Action failed: " + error.message);
        }
    };

    const useFertilizer = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'useFertilizer',
                args: [selectedTile]
            });
            alert("Use fertilizer action submitted!");
            refetchInventory();
            refetchTileInfo();
        } catch (error) {
            console.error("Use fertilizer error:", error);
            alert("Action failed: " + error.message);
        }
    };

    if (!address) return <div>Please connect your wallet first</div>;

    return (
        <div>
            <h2>Farm Manager</h2>

            {inventory && (
                <div>
                    <h3>Inventory</h3>
                    <p>Potato Seeds: {inventory.potatoSeeds}</p>
                    <p>Tomato Seeds: {inventory.tomatoSeeds}</p>
                    <p>Strawberry Seeds: {inventory.strawberrySeeds}</p>
                    <p>Water Bucket Charges: {inventory.waterBuckets}</p>
                    <p>Fertilizer Charges: {inventory.fertilizerCharges}</p>
                </div>
            )}

            <div>
                <h3>Tile Management</h3>
                <p>You have {tileCount} tiles</p>

                <div>
                    <label>
                        Select Tile:
                        <select
                            value={selectedTile}
                            onChange={(e) => setSelectedTile(Number(e.target.value))}
                        >
                            {Array.from({ length: tileCount }, (_, i) => (
                                <option key={i} value={i}>Tile {i}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {tileInfo && tileInfo.exists && (
                    <div>
                        <h4>Tile {selectedTile} Info</h4>
                        <p>Has Crop: {tileInfo.cropExists ? "Yes" : "No"}</p>
                        {tileInfo.cropExists && (
                            <>
                                <p>Crop Type: {tileInfo.cropType === 0 ? "Potato" : tileInfo.cropType === 1 ? "Tomato" : "Strawberry"}</p>
                                <p>Planted Time: {new Date(tileInfo.plantedTime * 1000).toLocaleString()}</p>
                                <p>Is Watered: {tileInfo.isWatered ? "Yes" : "No"}</p>
                                <p>Is Ready to Harvest: {tileInfo.isReady ? "Yes" : "No"}</p>
                            </>
                        )}
                    </div>
                )}

                <div>
                    <h4>Actions</h4>

                    {(!tileInfo || !tileInfo.cropExists) && (
                        <div>
                            <label>
                                Crop Type:
                                <select value={cropType} onChange={(e) => setCropType(Number(e.target.value))}>
                                    <option value={0}>Potato</option>
                                    <option value={1}>Tomato</option>
                                    <option value={2}>Strawberry</option>
                                </select>
                            </label>
                            <button onClick={plantCrop} disabled={isWriting}>
                                Plant Crop
                            </button>
                        </div>
                    )}

                    {tileInfo && tileInfo.cropExists && !tileInfo.isWatered && (
                        <button onClick={waterCrop} disabled={isWriting}>
                            Use Water (1 charge)
                        </button>
                    )}

                    {tileInfo && tileInfo.cropExists && tileInfo.isReady && (
                        <button onClick={harvestCrop} disabled={isWriting}>
                            Harvest Crop
                        </button>
                    )}

                    {tileInfo && tileInfo.cropExists && inventory && inventory.fertilizerCharges > 0 && (
                        <button onClick={useFertilizer} disabled={isWriting}>
                            Use Fertilizer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShopManagerComponent = () => {
    const { address } = useAccount();
    const [seedType, setSeedType] = useState(0);
    const [seedAmount, setSeedAmount] = useState(1);
    const [prices, setPrices] = useState({});
    const [tileCount, setTileCount] = useState(0);

        const { data: playerData } = useReadContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: PlayerRegistryABI,
        functionName: 'getPlayer',
        args: [address],
        enabled: !!address,
    });

    useEffect(() => {
        if (playerData) {
            setTileCount(Number(playerData[6]));
        }
    }, [playerData]);

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
        if (potatoPrice) newPrices.potato = potatoPrice;
        if (tomatoPrice) newPrices.tomato = tomatoPrice;
        if (strawberryPrice) newPrices.strawberry = strawberryPrice;
        if (waterBucketPrice) newPrices.waterBucket = waterBucketPrice;
        if (fertilizerPrice) newPrices.fertilizer = fertilizerPrice;
        if (tilePrice) newPrices.tile = tilePrice;
        setPrices(newPrices);
    }, [potatoPrice, tomatoPrice, strawberryPrice, waterBucketPrice, fertilizerPrice, tilePrice]);

        const { writeContractAsync: writeContract, isPending: isWriting } = useWriteContract();

    const buySeeds = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buySeeds',
                args: [seedType, seedAmount]
            });
            alert("Buy seeds transaction submitted!");
        } catch (error) {
            console.error("Buy seeds error:", error);
            alert("Transaction failed: " + error.message);
        }
    };

    const buyWaterBucket = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyWaterBucket'
            });
            alert("Buy water bucket transaction submitted!");
        } catch (error) {
            console.error("Buy water bucket error:", error);
            alert("Transaction failed: " + error.message);
        }
    };

    const buyFertilizer = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyFertilizer'
            });
            alert("Buy fertilizer transaction submitted!");
        } catch (error) {
            console.error("Buy fertilizer error:", error);
            alert("Transaction failed: " + error.message);
        }
    };

    const buyTile = async () => {
        if (!address) return;
        try {
            await writeContract({
                address: CONTRACT_ADDRESSES.shopManager,
                abi: ShopManagerABI,
                functionName: 'buyTile'
            });
            alert("Buy tile transaction submitted!");
        } catch (error) {
            console.error("Buy tile error:", error);
            alert("Transaction failed: " + error.message);
        }
    };

    if (!address) return <div>Please connect your wallet first</div>;

    return (
        <div>
            <h2>Farm Shop</h2>

            <div>
                <h3>Prices</h3>
                <p>Potato Seeds: {prices.potato ? formatEther(prices.potato) : '?'} CROPS</p>
                <p>Tomato Seeds: {prices.tomato ? formatEther(prices.tomato) : '?'} CROPS</p>
                <p>Strawberry Seeds: {prices.strawberry ? formatEther(prices.strawberry) : '?'} CROPS</p>
                <p>Water Bucket (6 charges): {prices.waterBucket ? formatEther(prices.waterBucket) : '?'} CROPS</p>
                <p>Fertilizer: {prices.fertilizer ? formatEther(prices.fertilizer) : '?'} CROPS</p>
                <p>New Tile: {prices.tile ? formatEther(prices.tile) : '?'} CROPS</p>
            </div>

            <div>
                <h3>Buy Seeds</h3>
                <label>
                    Seed Type:
                    <select value={seedType} onChange={(e) => setSeedType(Number(e.target.value))}>
                        <option value={0}>Potato</option>
                        <option value={1}>Tomato</option>
                        <option value={2}>Strawberry</option>
                    </select>
                </label>
                <label>
                    Amount:
                    <input
                        type="number"
                        min="1"
                        value={seedAmount}
                        onChange={(e) => setSeedAmount(Number(e.target.value))}
                    />
                </label>
                <button onClick={buySeeds} disabled={isWriting}>
                    Buy Seeds
                </button>
            </div>

            <div>
                <h3>Buy Other Items</h3>
                <button onClick={buyWaterBucket} disabled={isWriting}>
                    Buy Water Bucket (6 Charges)
                </button>
                <button onClick={buyFertilizer} disabled={isWriting}>
                    Buy Fertilizer
                </button>
                <button onClick={buyTile} disabled={isWriting}>
                    Buy New Tile
                </button>
            </div>
        </div>
    );
};

const LeaderboardComponent = () => {
    const { address } = useAccount();
    const [topPlayers, setTopPlayers] = useState([]);
    const [playerPoints, setPlayerPoints] = useState(0);
    const [playerRank, setPlayerRank] = useState(0);
    const [playerCount, setPlayerCount] = useState(0);

        const { data: pointsData } = useReadContract({
        address: CONTRACT_ADDRESSES.leaderboard,
        abi: LeaderboardABI,
        functionName: 'getPlayerPoints',
        args: [address],
        enabled: !!address,
    });

        const { data: rankData } = useReadContract({
        address: CONTRACT_ADDRESSES.leaderboard,
        abi: LeaderboardABI,
        functionName: 'getPlayerRank',
        args: [address],
        enabled: !!address,
    });

        const { data: countData } = useReadContract({
        address: CONTRACT_ADDRESSES.leaderboard,
        abi: LeaderboardABI,
        functionName: 'getPlayerCount',
    });

        const { data: topPlayersData } = useReadContract({
        address: CONTRACT_ADDRESSES.leaderboard,
        abi: LeaderboardABI,
        functionName: 'getTopPlayers',
        args: [10],
    });

    useEffect(() => {
        if (pointsData) setPlayerPoints(Number(pointsData));
        if (rankData) setPlayerRank(Number(rankData));
        if (countData) setPlayerCount(Number(countData));

        if (topPlayersData) {
            const addresses = topPlayersData[0];
            const points = topPlayersData[1];

            const playersWithPoints = addresses.map((addr, index) => ({
                address: addr,
                points: Number(points[index])
            }));

            setTopPlayers(playersWithPoints);
        }
    }, [pointsData, rankData, countData, topPlayersData]);

    if (!address) return <div>Please connect your wallet first</div>;

    return (
        <div>
            <h2>Leaderboard</h2>

            <div>
                <h3>Your Stats</h3>
                <p>Points: {playerPoints}</p>
                <p>Rank: {playerRank} out of {playerCount}</p>
            </div>

            <div>
                <h3>Top Players</h3>
                <ol>
                    {topPlayers.map((player, index) => (
                        <li key={index}>
                            {player.address} - {player.points} points
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('player');
    const { address, isConnected } = useAccount();

    return (
        <div>
            <h1>Farm Game</h1>

            <div>
                <ConnectKitButton />
            </div>

            {isConnected && (
                <div>
                    <p>Connected Wallet: {address}</p>

                    <div>
                        <button onClick={() => setActiveTab('player')}>Player Registry</button>
                        <button onClick={() => setActiveTab('token')}>CROPS Token</button>
                        <button onClick={() => setActiveTab('farm')}>Farm Manager</button>
                        <button onClick={() => setActiveTab('shop')}>Shop</button>
                        <button onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
                    </div>

                    <div>
                        {activeTab === 'player' && <PlayerRegistryComponent />}
                        {activeTab === 'token' && <CropsTokenComponent />}
                        {activeTab === 'farm' && <FarmManagerComponent />}
                        {activeTab === 'shop' && <ShopManagerComponent />}
                        {activeTab === 'leaderboard' && <LeaderboardComponent />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;