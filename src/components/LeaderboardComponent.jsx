import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from "wagmi";
import LeaderboardABI from '../../contracts/abis/leaderboard-abi.json';
import PlayerRegistryABI from '../../contracts/abis/playerregistry-abi.json';
import { Trophy } from '../assets/FarmIcons';

const CONTRACT_ADDRESSES = {
    playerRegistry: "0x117f6cdF4f0a03A2fCA6e505D2b72ecec1eF3eDE",
    leaderboard: "0x2Cef48866f2490d3C9Dd5862072fF67405bA110f",
};

// Function to truncate addresses for display
const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const LeaderboardComponent = () => {
    const { address } = useAccount();
    const [topPlayers, setTopPlayers] = useState([]);
    const [playerPoints, setPlayerPoints] = useState(0);
    const [playerRank, setPlayerRank] = useState(0);
    const [playerCount, setPlayerCount] = useState(0);
    const [nicknames, setNicknames] = useState({});
    const [loading, setLoading] = useState(true);

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

    const { data: topPlayersData, refetch: refetchTopPlayers } = useReadContract({
        address: CONTRACT_ADDRESSES.leaderboard,
        abi: LeaderboardABI,
        functionName: 'getTopPlayers',
        args: [10],
    });

    // Load nicknames for top players
    useEffect(() => {
        const fetchNicknames = async () => {
            if (!topPlayersData || !topPlayersData[0] || topPlayersData[0].length === 0) {
                setLoading(false);
                return;
            }
            
            const addresses = topPlayersData[0];
            const newNicknames = { ...nicknames };
            
            for (const addr of addresses) {
                try {
                    // Skip if we already have the nickname
                    if (newNicknames[addr]) continue;
                    
                    const { data } = await useReadContract.fetch({
                        address: CONTRACT_ADDRESSES.playerRegistry,
                        abi: PlayerRegistryABI,
                        functionName: 'getPlayer',
                        args: [addr],
                    });
                    
                    if (data && data[0]) {
                        newNicknames[addr] = data[0];
                    }
                } catch (error) {
                    console.error(`Error fetching nickname for ${addr}:`, error);
                }
            }
            
            setNicknames(newNicknames);
            setLoading(false);
        };
        
        if (topPlayersData) {
            fetchNicknames();
        }
    }, [topPlayersData]);

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

    // Refresh leaderboard data every minute
    useEffect(() => {
        const interval = setInterval(() => {
            refetchTopPlayers();
        }, 60000);
        
        return () => clearInterval(interval);
    }, [refetchTopPlayers]);

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Leaderboard</h2>
            <p className="text-center text-secondary">Please connect your wallet to view your ranking.</p>
        </div>
    );

    return (
        <div className="leaderboard-container animate-fade-in">
            <h2>Leaderboard</h2>
            
            <div className="player-rank card">
                {playerRank > 0 ? (
                    <div className="flex flex-col items-center">
                        <div className="rank-indicator">
                            {playerRank <= 3 ? <Trophy size={32} /> : "#" + playerRank}
                        </div>
                        <div className="mt-sm">Your Rank: {playerRank} of {playerCount}</div>
                        <div className="text-highlight text-2xl mt-sm">{playerPoints} points</div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p>You're not yet on the leaderboard!</p>
                        <p className="text-secondary mt-sm">Farm crops and complete activities to earn points</p>
                    </div>
                )}
            </div>
            
            {loading ? (
                <div className="card mt-lg text-center p-lg">
                    <div className="loading">Loading leaderboard data...</div>
                </div>
            ) : topPlayers.length > 0 ? (
                <>
                    {/* Top 3 Players Podium */}
                    {topPlayers.length >= 3 && (
                        <div className="podium-container">
                            {/* 2nd Place */}
                            <div className="podium-place order-1">
                                <div className="podium-player">
                                    <div className="text-lg mb-xs">🥈</div>
                                    <div className="font-bold">{nicknames[topPlayers[1].address] || truncateAddress(topPlayers[1].address)}</div>
                                    <div className="podium-address">{truncateAddress(topPlayers[1].address)}</div>
                                    <div className="podium-points">{topPlayers[1].points} pts</div>
                                </div>
                                <div className="podium-block podium-block-2">2</div>
                            </div>
                            
                            {/* 1st Place */}
                            <div className="podium-place order-0">
                                <div className="podium-player">
                                    <div className="text-lg mb-xs">🥇</div>
                                    <div className="font-bold">{nicknames[topPlayers[0].address] || truncateAddress(topPlayers[0].address)}</div>
                                    <div className="podium-address">{truncateAddress(topPlayers[0].address)}</div>
                                    <div className="podium-points">{topPlayers[0].points} pts</div>
                                </div>
                                <div className="podium-block podium-block-1">1</div>
                            </div>
                            
                            {/* 3rd Place */}
                            <div className="podium-place order-2">
                                <div className="podium-player">
                                    <div className="text-lg mb-xs">🥉</div>
                                    <div className="font-bold">{nicknames[topPlayers[2].address] || truncateAddress(topPlayers[2].address)}</div>
                                    <div className="podium-address">{truncateAddress(topPlayers[2].address)}</div>
                                    <div className="podium-points">{topPlayers[2].points} pts</div>
                                </div>
                                <div className="podium-block podium-block-3">3</div>
                            </div>
                        </div>
                    )}
                    
                    <div className="card mt-lg">
                        <h3>Top Farmers</h3>
                        
                        <div className="leaderboard-list">
                            {topPlayers.map((player, index) => (
                                <div 
                                    key={player.address}
                                    className={`leaderboard-item ${player.address.toLowerCase() === address?.toLowerCase() ? 'bg-container' : ''}`}
                                >
                                    <div className={`leaderboard-rank rank-${index + 1}`}>{index + 1}</div>
                                    <div className="leaderboard-address">
                                        <div className="font-bold">{nicknames[player.address] || truncateAddress(player.address)}</div>
                                        <div className="text-secondary text-xs">{truncateAddress(player.address)}</div>
                                    </div>
                                    <div className="leaderboard-points">
                                        {player.points} pts
                                        {index < 3 && <span className="star-icon">⭐</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="card mt-lg text-center p-lg">
                    <p>No players on the leaderboard yet.</p>
                    <p className="text-secondary mt-sm">Be the first to make the rankings!</p>
                </div>
            )}
            
            <div className="card mt-lg">
                <h3>How to Earn Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
                    <div className="bg-container p-md rounded-md">
                        <div className="font-bold">Farming Activities</div>
                        <ul className="list-disc pl-lg mt-xs">
                            <li>Planting crops: 10 points</li>
                            <li>Watering crops: 5 points</li>
                            <li>Harvesting crops: 15 points</li>
                            <li>Using fertilizer: 8 points</li>
                        </ul>
                    </div>
                    <div className="bg-container p-md rounded-md">
                        <div className="font-bold">Shop Activities</div>
                        <ul className="list-disc pl-lg mt-xs">
                            <li>Buying seeds: 5 points</li>
                            <li>Buying water bucket: 5 points</li>
                            <li>Buying fertilizer: 10 points</li>
                            <li>Buying a new tile: 20 points</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardComponent;