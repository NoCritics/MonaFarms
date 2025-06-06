import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from "wagmi";
import PlayerLeaderboardABI from '../abis/PlayerLeaderboard.abi.json';
import PlayerRegistryInventoryABI from '../abis/PlayerRegistryInventory.abi.json';
import { CropsToken, Trophy } from '../assets/ItemImages';
import { useProgress } from '../context/ProgressContext';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';

// Function to truncate addresses for display
const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
    // Remove # if present
    color = color.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Adjust each component
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Define rank medal components
const RankMedal = ({ rank, size = 50 }) => {
    let medalColor, borderColor, textColor;
    
    switch(rank) {
        case 1:
            medalColor = '#FFD700';
            borderColor = '#B7950B';
            textColor = '#7D5C00';
            break;
        case 2:
            medalColor = '#C0C0C0';
            borderColor = '#A8A8A8';
            textColor = '#707070';
            break;
        case 3:
            medalColor = '#CD7F32';
            borderColor = '#A56326';
            textColor = '#8B4513';
            break;
        default:
            medalColor = '#8358FF';
            borderColor = '#6F48E8';
            textColor = 'white';
    }
    
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${medalColor}, ${borderColor})`,
            boxShadow: `0 4px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.5}px`,
            fontWeight: 'bold',
            color: textColor,
            border: `2px solid ${borderColor}`,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {rank <= 3 ? (
                <span style={{ fontSize: `${size * 0.6}px` }}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </span>
            ) : rank}
            
            {/* Shine effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
                transform: 'rotate(45deg)',
                animation: `medal-shine 3s infinite ease-in-out ${Math.random()}s`
            }}></div>
        </div>
    );
};

const LeaderboardComponent = () => {
    const { achievements } = useProgress();
    const { address } = useAccount();
    const [topPlayers, setTopPlayers] = useState([]);
    const [playerPoints, setPlayerPoints] = useState(0);
    const [playerRank, setPlayerRank] = useState(0);
    const [playerCount, setPlayerCount] = useState(0);
    const [nicknames, setNicknames] = useState({});
    const [loading, setLoading] = useState(true);

    const { data: pointsData } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'getPlayerPoints',
        args: [address],
        enabled: !!address,
    });

    // Get player's rank directly from the contract
    const { data: playerRankData, refetch: refetchPlayerRank } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'getPlayerRank',
        args: [address],
        enabled: !!address,
    });

    // Get total leaderboard size
    const { data: leaderboardSizeData, refetch: refetchLeaderboardSize } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'getLeaderboardSize',
        enabled: true,
    });

    // Get top players from the contract
    const { data: topPlayersData, refetch: refetchTopPlayers } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'getTopPlayers',
        args: [10], // Get top 10 players
        enabled: true,
    });

    // Using getCurrentPlayerTier to determine rank
    const { data: tierData } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'getCurrentPlayerTier',
        args: [address],
        enabled: !!address,
    });

    // Get tier thresholds to determine progress to next tier
    const { data: beginnerThreshold } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'tierPointThresholds',
        args: [0], // BEGINNER tier
    });

    const { data: intermediateThreshold } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'tierPointThresholds',
        args: [1], // INTERMEDIATE tier
    });

    const { data: expertThreshold } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'tierPointThresholds',
        args: [2], // EXPERT tier
    });

    const { data: masterThreshold } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'tierPointThresholds',
        args: [3], // MASTER tier
    });

    const { data: legendaryThreshold } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerLeaderboard,
        abi: PlayerLeaderboardABI,
        functionName: 'tierPointThresholds',
        args: [4], // LEGENDARY tier
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
                        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
                        abi: PlayerRegistryInventoryABI,
                        functionName: 'getPlayerProfile',
                        args: [addr],
                    });
                    
                    if (data && data.nickname) {
                        newNicknames[addr] = data.nickname;
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

    // Process the data when it changes
    useEffect(() => {
        if (pointsData) setPlayerPoints(Number(pointsData));
        if (playerRankData !== undefined) setPlayerRank(Number(playerRankData));
        if (leaderboardSizeData !== undefined) setPlayerCount(Number(leaderboardSizeData));
        
        // Process top players data from the contract
        if (topPlayersData && topPlayersData[0] && topPlayersData[1]) {
            const addresses = topPlayersData[0];
            const points = topPlayersData[1];
            
            const processedTopPlayers = addresses.map((address, index) => ({
                address,
                points: Number(points[index])
            }));
            
            setTopPlayers(processedTopPlayers);
        }
    }, [pointsData, playerRankData, leaderboardSizeData, topPlayersData]);

    // Refresh leaderboard data every minute
    useEffect(() => {
        const interval = setInterval(() => {
            refetchTopPlayers();
            refetchPlayerRank();
            refetchLeaderboardSize();
        }, 60000);
        
        return () => clearInterval(interval);
    }, [refetchTopPlayers, refetchPlayerRank, refetchLeaderboardSize]);

    // Convert tier to rank (lower tier number = higher rank)
    const getTierName = (tier) => {
        switch(Number(tier)) {
            case 0: return "BEGINNER";
            case 1: return "INTERMEDIATE";
            case 2: return "EXPERT";
            case 3: return "MASTER";
            case 4: return "LEGENDARY";
            case 5: return "EPOCHAL";
            default: return "UNKNOWN";
        }
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Leaderboard</h2>
            <p className="text-center text-secondary">Please connect your wallet to view your ranking.</p>
        </div>
    );

    // Define keyframes animations
    const keyframes = `
        @keyframes medal-shine {
            0% { transform: translate(-50%, -50%) rotate(45deg); }
            100% { transform: translate(150%, 150%) rotate(45deg); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 5px rgba(131, 88, 255, 0.5); }
            50% { box-shadow: 0 0 15px rgba(131, 88, 255, 0.8); }
            100% { box-shadow: 0 0 5px rgba(131, 88, 255, 0.5); }
        }
        @keyframes rank-number-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    `;

    return (
        <div className="leaderboard-container animate-fade-in">
            <style>{keyframes}</style>
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <h2 style={{ margin: 0 }}>Leaderboard</h2>
                <div style={{
                    background: 'linear-gradient(135deg, #8358FF, #6F48E8)',
                    borderRadius: '8px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    <span>🔥</span> Live Rankings
                </div>
            </div>
            
            <div className="player-rank card" style={{
                background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                border: playerRank > 0 && playerRank <= 3 ? `2px solid ${playerRank === 1 ? '#FFD700' : playerRank === 2 ? '#C0C0C0' : '#CD7F32'}` : 'none',
                animation: playerRank > 0 && playerRank <= 3 ? 'pulse-glow 3s infinite' : 'none'
            }}>
                {playerRank > 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            {playerRank <= 3 ? <RankMedal rank={playerRank} size={64} /> : (
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #523D7F, #8358FF)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                }}>#{playerRank}</div>
                            )}
                        </div>
                        
                        <div style={{ 
                            fontSize: '1.1rem',
                            marginBottom: '0.5rem',
                            color: '#F7B538'
                        }}>
                            Your Current Rank: <span style={{ fontWeight: 'bold' }}>{playerRank}</span> of {playerCount}
                        </div>
                        
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <CropsToken size={24} />
                            <span style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold',
                                color: '#F7B538'
                            }}>{playerPoints} points</span>
                        </div>
                        
                        {/* Progress to next rank */}
                        {playerRank > 1 && topPlayers.length >= playerRank && (
                            <div style={{
                                width: '100%',
                                marginTop: '1rem',
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.7)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>Your Points: {playerPoints}</div>
                                    <div>Next Rank: {topPlayers[playerRank-2]?.points || '???'}</div>
                                </div>
                                <div style={{
                                    height: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '3px',
                                    marginTop: '0.5rem',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (playerPoints / (topPlayers[playerRank-2]?.points || playerPoints+100)) * 100)}%`,
                                        background: 'linear-gradient(90deg, #8358FF, #F7B538)',
                                        transition: 'width 1s ease-out'
                                    }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '1rem'
                    }}>
                        <div style={{
                            fontSize: '5rem',
                            marginBottom: '1rem',
                            opacity: 0.8
                        }}>🏆</div>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>You're not yet on the leaderboard!</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Farm crops and complete activities to earn points and climb the rankings</p>
                        
                        <button style={{
                            background: 'linear-gradient(45deg, #8358FF, #6F48E8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem 1.5rem',
                            marginTop: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '1.5rem auto 0'
                        }}>
                            <span>🌱</span> Start Farming
                        </button>
                    </div>
                )}
            </div>
            
            {loading ? (
                <div className="card mt-lg text-center p-lg">
                    <div className="loading">Loading leaderboard data...</div>
                </div>
            ) : topPlayers.length > 0 ? (
                <>
                    {/* Top 3 Players Podium - Enhanced for Phase 4 */}
                    {topPlayers.length >= 3 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginTop: '2rem',
                            marginBottom: '2rem',
                            gap: '1rem',
                            paddingBottom: '1rem',
                            position: 'relative'
                        }}>
                            {/* Platform base */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '5%',
                                right: '5%',
                                height: '20px',
                                background: 'linear-gradient(to bottom, #523D7F, #1E1633)',
                                borderRadius: '5px 5px 0 0',
                                boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
                            }}></div>
                            
                            {/* 2nd Place */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                order: 1,
                                animation: 'float 6s ease-in-out infinite 0.2s',
                                transformOrigin: 'bottom center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    width: '120px',
                                    border: '2px solid #C0C0C0',
                                }}>
                                    <RankMedal rank={2} />
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '0.9rem',
                                        marginTop: '0.5rem',
                                        color: '#C0C0C0'
                                    }}>{nicknames[topPlayers[1].address] || truncateAddress(topPlayers[1].address)}</div>
                                    <div style={{ 
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        marginTop: '0.25rem'
                                    }}>{truncateAddress(topPlayers[1].address)}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem',
                                        marginTop: '0.5rem',
                                        background: 'rgba(192,192,192,0.2)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        color: '#C0C0C0'
                                    }}>
                                        <CropsToken size={16} />
                                        {topPlayers[1].points}
                                    </div>
                                </div>
                                <div style={{
                                    width: '80px',
                                    height: '70px',
                                    background: 'linear-gradient(to bottom, #C0C0C0, #A8A8A8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#1E1633',
                                    borderRadius: '0 0 8px 8px',
                                    fontSize: '1.5rem',
                                    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                }}>2</div>
                            </div>
                            
                            {/* 1st Place */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                order: 0,
                                zIndex: 10,
                                animation: 'float 6s ease-in-out infinite',
                                transformOrigin: 'bottom center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #352561, #4A357A)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                                    textAlign: 'center',
                                    width: '140px',
                                    border: '2px solid #FFD700',
                                }}>
                                    <RankMedal rank={1} size={70} />
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '1.1rem',
                                        marginTop: '0.5rem',
                                        color: '#FFD700'
                                    }}>{nicknames[topPlayers[0].address] || truncateAddress(topPlayers[0].address)}</div>
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        marginTop: '0.25rem'
                                    }}>{truncateAddress(topPlayers[0].address)}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem',
                                        marginTop: '0.5rem',
                                        background: 'rgba(255,215,0,0.2)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        color: '#FFD700'
                                    }}>
                                        <CropsToken size={18} color="#FFD700" />
                                        {topPlayers[0].points}
                                    </div>
                                </div>
                                <div style={{
                                    width: '100px',
                                    height: '90px',
                                    background: 'linear-gradient(to bottom, #FFD700, #B7950B)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#1E1633',
                                    borderRadius: '0 0 8px 8px',
                                    fontSize: '2rem',
                                    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
                                }}>1</div>
                            </div>
                            
                            {/* 3rd Place */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                order: 2,
                                animation: 'float 6s ease-in-out infinite 0.4s',
                                transformOrigin: 'bottom center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    width: '120px',
                                    border: '2px solid #CD7F32',
                                }}>
                                    <RankMedal rank={3} />
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '0.9rem',
                                        marginTop: '0.5rem',
                                        color: '#CD7F32'
                                    }}>{nicknames[topPlayers[2].address] || truncateAddress(topPlayers[2].address)}</div>
                                    <div style={{ 
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        marginTop: '0.25rem'
                                    }}>{truncateAddress(topPlayers[2].address)}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem',
                                        marginTop: '0.5rem',
                                        background: 'rgba(205,127,50,0.2)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        color: '#CD7F32'
                                    }}>
                                        <CropsToken size={16} />
                                        {topPlayers[2].points}
                                    </div>
                                </div>
                                <div style={{
                                    width: '80px',
                                    height: '50px',
                                    background: 'linear-gradient(to bottom, #CD7F32, #A56326)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#1E1633',
                                    borderRadius: '0 0 8px 8px',
                                    fontSize: '1.5rem',
                                    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                }}>3</div>
                            </div>
                        </div>
                    )}
                    
                    <div style={{
                        background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                        marginTop: '2rem'
                    }}>
                        <h3 style={{ 
                            margin: '0 0 1.5rem 0',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            paddingBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Trophy size={24} />
                            Top Farmers
                        </h3>
                        
                        <div>
                            {topPlayers.map((player, index) => {
                                // Determine if this is the user
                                const isCurrentUser = player.address.toLowerCase() === address?.toLowerCase();
                                
                                return (
                                    <div 
                                        key={player.address}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            marginBottom: '0.75rem',
                                            background: isCurrentUser ? 'rgba(131, 88, 255, 0.15)' : index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            border: isCurrentUser ? '1px solid rgba(131, 88, 255, 0.3)' : '1px solid transparent',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Rank number with animation for top 3 */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            marginRight: '1rem',
                                            color: index < 3 ? 
                                                (index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32') : 
                                                'white',
                                            background: index < 3 ?
                                                `radial-gradient(circle at center, ${index === 0 ? 'rgba(255,215,0,0.2)' : index === 1 ? 'rgba(192,192,192,0.2)' : 'rgba(205,127,50,0.2)'}, transparent)` :
                                                'transparent',
                                            borderRadius: '50%',
                                            animation: index < 3 ? 'rank-number-animation 3s infinite ease-in-out' : 'none',
                                            animationDelay: `${index * 0.2}s`
                                        }}>
                                            {index < 3 ? 
                                                (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : 
                                                (index + 1)}
                                        </div>
                                        
                                        {/* Player info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontWeight: 'bold',
                                                color: isCurrentUser ? '#8358FF' : 'white' 
                                            }}>
                                                {nicknames[player.address] || truncateAddress(player.address)}
                                                {isCurrentUser && (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        fontSize: '0.75rem',
                                                        background: '#8358FF',
                                                        color: 'white',
                                                        padding: '0.1rem 0.5rem',
                                                        borderRadius: '99px',
                                                        verticalAlign: 'middle'
                                                    }}>YOU</span>
                                                )}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.8rem',
                                                color: 'rgba(255,255,255,0.5)' 
                                            }}>{truncateAddress(player.address)}</div>
                                        </div>
                                        
                                        {/* Points display */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: index < 3 ? 
                                                `rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.1)` : 
                                                'rgba(255,255,255,0.05)',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '99px',
                                            fontWeight: 'bold',
                                            color: index < 3 ? 
                                                (index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32') : 
                                                'white'
                                        }}>
                                            <CropsToken size={16} />
                                            {player.points}
                                        </div>
                                        
                                        {/* Glow effect for top players and current user */}
                                        {(index < 3 || isCurrentUser) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                pointerEvents: 'none',
                                                opacity: 0.3,
                                                background: isCurrentUser ?
                                                    'radial-gradient(circle at center, rgba(131, 88, 255, 0.3), transparent)' :
                                                    index === 0 ? 
                                                        'radial-gradient(circle at center, rgba(255, 215, 0, 0.2), transparent)' :
                                                        index === 1 ?
                                                            'radial-gradient(circle at center, rgba(192, 192, 192, 0.2), transparent)' :
                                                            'radial-gradient(circle at center, rgba(205, 127, 50, 0.2), transparent)'
                                            }}></div>
                                        )}
                                    </div>
                                );
                            })}
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
                            <li>Planting crops: 5 points</li>
                            <li>Watering crops: 7 points</li>
                            <li>Harvesting crops: 10 points</li>
                            <li>Using fertilizer: 8 points</li>
                        </ul>
                    </div>
                    <div className="bg-container p-md rounded-md">
                        <div className="font-bold">Other Activities</div>
                        <ul className="list-disc pl-lg mt-xs">
                            <li>Buying items: 7 points</li>
                            <li>Buying a new tile: 15 points</li>
                            <li>Crafting items: 9 points</li>
                            <li>Achievements: Bonus points!</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="card mt-lg">
                <h3>Achievement Tiers</h3>
                <p className="text-secondary mt-sm">Earn points to unlock higher farming tiers with special rewards!</p>
                
                <div className="mt-md">
                    {[
                        { tier: "BEGINNER", threshold: beginnerThreshold ? Number(beginnerThreshold) : 0, color: "#4CAF50", emoji: "🌱" },
                        { tier: "INTERMEDIATE", threshold: intermediateThreshold ? Number(intermediateThreshold) : 501, color: "#2196F3", emoji: "🌿" },
                        { tier: "EXPERT", threshold: expertThreshold ? Number(expertThreshold) : 1501, color: "#9C27B0", emoji: "🌾" },
                        { tier: "MASTER", threshold: masterThreshold ? Number(masterThreshold) : 3001, color: "#FF9800", emoji: "🏆" },
                        { tier: "LEGENDARY", threshold: legendaryThreshold ? Number(legendaryThreshold) : 6001, color: "#F44336", emoji: "👑" },
                        { tier: "EPOCHAL", threshold: 10001, color: "#FFD700", emoji: "⚡" }
                    ].map((tier, index) => {
                        const isCurrentTier = tierData !== undefined && Number(tierData) === index;
                        const isUnlocked = playerPoints >= tier.threshold;
                        
                        return (
                            <div 
                                key={tier.tier}
                                style={{
                                    background: isCurrentTier ? `linear-gradient(to right, rgba(${hexToRgb(tier.color)}, 0.2), rgba(${hexToRgb(tier.color)}, 0.1))` : 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: isCurrentTier ? `1px solid ${tier.color}` : '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${tier.color}, ${adjustColor(tier.color, -30)})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    marginRight: '1rem',
                                    opacity: isUnlocked ? 1 : 0.5,
                                    filter: isUnlocked ? 'none' : 'grayscale(80%)'
                                }}>
                                    {tier.emoji}
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontWeight: 'bold',
                                        color: isCurrentTier ? tier.color : (isUnlocked ? 'white' : 'rgba(255,255,255,0.6)'),
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {tier.tier}
                                        {isCurrentTier && (
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                fontSize: '0.75rem',
                                                padding: '0.1rem 0.5rem',
                                                background: tier.color,
                                                color: 'white',
                                                borderRadius: '99px'
                                            }}>CURRENT</span>
                                        )}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>
                                        {tier.threshold.toLocaleString()} points required
                                    </div>
                                </div>
                                
                                {/* Progress bar */}
                                {!isUnlocked && (
                                    <div style={{
                                        width: '100px',
                                        marginLeft: '1rem'
                                    }}>
                                        <div style={{
                                            height: '6px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(100, Math.max(0, (playerPoints / tier.threshold) * 100))}%`,
                                                background: tier.color,
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            textAlign: 'right',
                                            marginTop: '0.25rem'
                                        }}>
                                            {Math.round((playerPoints / tier.threshold) * 100)}%
                                        </div>
                                    </div>
                                )}
                                
                                {/* Status */}
                                <div style={{
                                    marginLeft: '1rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: isUnlocked ? tier.color : 'rgba(255,255,255,0.4)'
                                }}>
                                    {isUnlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardComponent;