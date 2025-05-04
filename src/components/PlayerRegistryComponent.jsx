import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import PlayerRegistryABI from '../../contracts/abis/playerregistry-abi.json';

// Import new profile components
import FarmHistoryTimeline from './profile/FarmHistoryTimeline';
import AchievementGallery from './profile/AchievementGallery';
import StatsCharts from './profile/StatsCharts';
import SocialShareCard from './profile/SocialShareCard';

const CONTRACT_ADDRESSES = {
    playerRegistry: "0x117f6cdF4f0a03A2fCA6e505D2b72ecec1eF3eDE",
};

// Define available avatar options
const avatarOptions = [
    { id: 'farmer1', emoji: '👨‍🌾', name: 'Farmer', color: '#8358FF' },
    { id: 'farmer2', emoji: '👩‍🌾', name: 'Farmer Girl', color: '#F7B538' },
    { id: 'farmer3', emoji: '🧑‍🌾', name: 'Young Farmer', color: '#4CAF50' },
    { id: 'scientist', emoji: '👨‍🔬', name: 'Scientist', color: '#2196F3' },
    { id: 'alien', emoji: '👽', name: 'Alien', color: '#9C27B0' },
    { id: 'robot', emoji: '🤖', name: 'Robot', color: '#607D8B' },
    { id: 'ghost', emoji: '👻', name: 'Ghost', color: '#E91E63' },
    { id: 'cat', emoji: '🐱', name: 'Cat', color: '#FF9800' },
];

// Define color scheme options
const colorSchemes = [
    { id: 'purple', name: 'Monad Purple', primary: '#8358FF', secondary: '#523D7F' },
    { id: 'gold', name: 'Golden Harvest', primary: '#F7B538', secondary: '#DB9A2A' },
    { id: 'green', name: 'Fresh Growth', primary: '#4CAF50', secondary: '#388E3C' },
    { id: 'blue', name: 'Clear Sky', primary: '#2196F3', secondary: '#1976D2' },
    { id: 'red', name: 'Ripe Tomato', primary: '#F44336', secondary: '#D32F2F' },
];

const PlayerRegistryComponent = () => {
    const { playerStats, achievements, updateAvatar } = useProgress();
    const { address } = useAccount();
    const [nickname, setNickname] = useState("");
    const [newNickname, setNewNickname] = useState("");
    const [playerDetails, setPlayerDetails] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState('farmer1');
    const [selectedColorScheme, setSelectedColorScheme] = useState('purple');
    const [profileEditMode, setProfileEditMode] = useState(false);
    const [profileSection, setProfileSection] = useState('overview');

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
            setNewNickname("");
            refetchPlayerData();
        } catch (error) {
            console.error("Nickname update error:", error);
            alert("Update failed: " + error.message);
        }
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Player Profile</h2>
            <p className="text-center text-secondary">Please connect your wallet to view or create your player profile.</p>
        </div>
    );

    // Calculate farming statistics
    const farmingStats = {
        totalHarvests: playerStats?.harvestCount || 0,
        avgYield: playerStats?.totalHarvests > 0 ? 
            Math.round((playerStats?.totalTokensEarned || 0) / (playerStats?.harvestCount || 1)) : 0,
        favoriteActivity: playerStats?.waterCount > playerStats?.harvestCount ? 
            'Watering' : playerStats?.plantCount > playerStats?.harvestCount ? 
            'Planting' : 'Harvesting',
        farmingLevel: Math.floor((playerStats?.totalPoints || 0) / 100) + 1,
        activityScore: ((playerStats?.plantCount || 0) + 
                        (playerStats?.waterCount || 0) * 0.5 + 
                        (playerStats?.harvestCount || 0) * 1.5) / 10,
        efficiency: Math.min(100, ((playerStats?.harvestCount || 0) / 
                            Math.max(1, (playerStats?.plantCount || 1))) * 100),
    };

    // Helper function to format time span
    const formatTimeSpan = (timestamp) => {
        if (!timestamp) return 'New farmer';
        
        const now = Date.now() / 1000;
        const diffSeconds = now - timestamp;
        
        if (diffSeconds < 60) return 'Just started';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours`;
        
        return `${Math.floor(diffSeconds / 86400)} days`;
    };

    return (
        <div className="animate-fade-in">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
            }}>
                <h2 style={{ margin: 0 }}>Player Profile</h2>
                
                {playerDetails && (
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <button 
                            style={{
                                background: profileSection === 'overview' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
                                color: profileSection === 'overview' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setProfileSection('overview')}
                        >
                            <span>👤</span> Overview
                        </button>
                        
                        <button 
                            style={{
                                background: profileSection === 'stats' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
                                color: profileSection === 'stats' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setProfileSection('stats')}
                        >
                            <span>📊</span> Statistics
                        </button>
                        
                        <button 
                            style={{
                                background: profileSection === 'achievements' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
                                color: profileSection === 'achievements' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setProfileSection('achievements')}
                        >
                            <span>🏆</span> Achievements
                        </button>
                        
                        <button 
                            style={{
                                background: profileSection === 'history' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
                                color: profileSection === 'history' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setProfileSection('history')}
                        >
                            <span>📜</span> History
                        </button>
                    </div>
                )}
            </div>

            {isRegistered ? (
                <>
                    {/* Add new tab for History */}
                    {profileSection === 'history' && playerDetails && (
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)'
                        }}>
                            <FarmHistoryTimeline />
                        </div>
                    )}
                    {profileSection === 'overview' && playerDetails && (
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                            position: 'relative'
                        }}>
                            {/* Profile header with avatar and name */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: `linear-gradient(135deg, ${colorSchemes.find(cs => cs.id === selectedColorScheme)?.primary || '#8358FF'}, ${colorSchemes.find(cs => cs.id === selectedColorScheme)?.secondary || '#523D7F'})`,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                                    border: '3px solid rgba(255,255,255,0.2)',
                                    position: 'relative'
                                }}>
                                    {avatarOptions.find(av => av.id === selectedAvatar)?.emoji || '👨‍🌾'}
                                    
                                    {/* Edit avatar button */}
                                    <button 
                                        style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: '#8358FF',
                                            border: '2px solid rgba(255,255,255,0.8)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            color: 'white',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                        }}
                                        onClick={() => setProfileEditMode(!profileEditMode)}
                                    >
                                        {profileEditMode ? '✓' : '✏️'}
                                    </button>
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div>
                                            <h3 style={{ 
                                                margin: '0 0 0.5rem 0',
                                                fontSize: '1.75rem',
                                                fontWeight: 'bold',
                                                color: profileEditMode ? 'rgba(255,255,255,0.7)' : 'white',
                                                transition: 'all 0.3s ease'
                                            }}>{playerDetails.nickname}</h3>
                                            <p style={{ 
                                                margin: '0',
                                                color: 'rgba(255,255,255,0.6)',
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span role="img" aria-label="calendar">📅</span> 
                                                Joined {new Date(playerDetails.registrationTime * 1000).toLocaleDateString()}
                                                <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>•</span>
                                                <span>{formatTimeSpan(playerDetails.registrationTime)} of farming</span>
                                            </p>
                                        </div>
                                        
                                        {!profileEditMode && (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Farming Level</div>
                                                <div style={{ 
                                                    fontSize: '1.75rem', 
                                                    fontWeight: 'bold',
                                                    color: '#F7B538'
                                                }}>{farmingStats.farmingLevel}</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Farming details */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        marginTop: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem' }}>{playerDetails.ownedTiles}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Farm Tiles</div>
                                        </div>
                                        
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem' }}>{playerDetails.waterBuckets}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Water Buckets</div>
                                        </div>
                                        
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem' }}>
                                                {playerDetails.initialSeedType === 0 ? '🥔' : 
                                                 playerDetails.initialSeedType === 1 ? '🍅' : '🍓'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Starter Seeds</div>
                                        </div>
                                        
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem' }}>{playerStats?.totalPoints || 0}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Total Points</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Avatar selection in edit mode */}
                            {profileEditMode && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    background: 'rgba(131, 88, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '1rem',
                                        color: '#F7B538'
                                    }}>Choose your avatar:</h4>
                                    
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: '0.75rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {avatarOptions.map((avatar) => (
                                            <div 
                                                key={avatar.id}
                                                style={{
                                                    background: selectedAvatar === avatar.id ? 
                                                        'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: selectedAvatar === avatar.id ? 
                                                        '2px solid #8358FF' : '2px solid transparent',
                                                    transform: selectedAvatar === avatar.id ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                                onClick={() => setSelectedAvatar(avatar.id)}
                                            >
                                                <div style={{
                                                    fontSize: '2rem',
                                                    marginBottom: '0.5rem'
                                                }}>{avatar.emoji}</div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: selectedAvatar === avatar.id ? 
                                                        'white' : 'rgba(255,255,255,0.7)'
                                                }}>{avatar.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <h4 style={{
                                        margin: '1rem 0 0.75rem 0',
                                        fontSize: '1rem',
                                        color: '#F7B538'
                                    }}>Choose color scheme:</h4>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.75rem'
                                    }}>
                                        {colorSchemes.map((scheme) => (
                                            <div 
                                                key={scheme.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem',
                                                    background: selectedColorScheme === scheme.id ? 
                                                        'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: selectedColorScheme === scheme.id ? 
                                                        '2px solid rgba(255,255,255,0.4)' : '2px solid transparent'
                                                }}
                                                onClick={() => setSelectedColorScheme(scheme.id)}
                                            >
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})`,
                                                    borderRadius: '50%',
                                                    border: '2px solid rgba(255,255,255,0.2)'
                                                }}></div>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    color: selectedColorScheme === scheme.id ? 
                                                        'white' : 'rgba(255,255,255,0.7)'
                                                }}>{scheme.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        marginTop: '1rem'
                                    }}>
                                        <button 
                                            style={{
                                                background: '#8358FF',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onClick={() => {
                                                setProfileEditMode(false);
                                                // Save the changes (normally would be to blockchain)
                                                // For now just update local state
                                                updateAvatar?.(selectedAvatar, selectedColorScheme);
                                            }}
                                        >
                                            <span>💾</span> Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginTop: '1.5rem'
                            }}>
                                <h3 style={{
                                    margin: '0 0 1rem 0',
                                    fontSize: '1.2rem',
                                    color: '#F7B538',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span>✏️</span> Update Nickname
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        type="text"
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem 0.75rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        placeholder="New Nickname"
                                        maxLength={16}
                                    />
                                    <button 
                                        style={{
                                            background: (!newNickname || newNickname.length < 3 || isUpdating) ? 
                                                'rgba(131, 88, 255, 0.3)' : '#8358FF',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.5rem 1rem',
                                            fontWeight: 'bold',
                                            cursor: (!newNickname || newNickname.length < 3 || isUpdating) ? 
                                                'not-allowed' : 'pointer',
                                            opacity: (!newNickname || newNickname.length < 3 || isUpdating) ? 
                                                0.6 : 1
                                        }}
                                        onClick={handleUpdateNickname} 
                                        disabled={isUpdating || !newNickname || newNickname.length < 3}
                                    >
                                        {isUpdating ? "Updating..." : "Update"}
                                    </button>
                                </div>
                                <p style={{ 
                                    margin: '0.5rem 0 0 0',
                                    fontSize: '0.8rem',
                                    color: 'rgba(255,255,255,0.5)'
                                }}>Nickname must be between 3-16 characters.</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Statistics Tab */}
                    {profileSection === 'stats' && playerDetails && (
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)'
                        }}>
                            {/* Enhanced stats charts */}
                            <StatsCharts />
                            
                            {/* Original stats content */}
                            <h3 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#F7B538',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>📊</span> Farming Statistics
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        fontSize: '1rem',
                                        marginBottom: '0.5rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Farming Level</div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#F7B538'
                                    }}>{farmingStats.farmingLevel}</div>
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginTop: '0.25rem'
                                    }}>{playerStats?.totalPoints || 0} total points</div>
                                </div>
                                
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        fontSize: '1rem',
                                        marginBottom: '0.5rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Activity Score</div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#4CAF50'
                                    }}>{farmingStats.activityScore.toFixed(1)}</div>
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginTop: '0.25rem'
                                    }}>Based on farming actions</div>
                                </div>
                                
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        fontSize: '1rem',
                                        marginBottom: '0.5rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Harvest Efficiency</div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: farmingStats.efficiency > 75 ? '#4CAF50' : 
                                               farmingStats.efficiency > 50 ? '#FFC107' : 
                                               '#F44336'
                                    }}>{Math.round(farmingStats.efficiency)}%</div>
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginTop: '0.25rem'
                                    }}>Harvests / Plantings</div>
                                </div>
                            </div>
                            
                            <h4 style={{
                                margin: '1.5rem 0 1rem 0',
                                fontSize: '1.1rem',
                                color: '#F7B538'
                            }}>Activity Breakdown</h4>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        marginBottom: '0.25rem',
                                        color: '#F44336'
                                    }}>🌱</div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>{playerStats?.plantCount || 0}</div>
                                    <div style={{ 
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>Plants</div>
                                </div>
                                
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        marginBottom: '0.25rem',
                                        color: '#2196F3'
                                    }}>💧</div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>{playerStats?.waterCount || 0}</div>
                                    <div style={{ 
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>Waterings</div>
                                </div>
                                
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        marginBottom: '0.25rem',
                                        color: '#4CAF50'
                                    }}>🌾</div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>{playerStats?.harvestCount || 0}</div>
                                    <div style={{ 
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>Harvests</div>
                                </div>
                                
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        marginBottom: '0.25rem',
                                        color: '#9C27B0'
                                    }}>🧪</div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>{playerStats?.fertilizerCount || 0}</div>
                                    <div style={{ 
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>Fertilizers</div>
                                </div>
                            </div>
                            
                            <h4 style={{
                                margin: '1.5rem 0 1rem 0',
                                fontSize: '1.1rem',
                                color: '#F7B538'
                            }}>Harvest Yields</h4>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>💰</span>
                                        <span>Total Earnings:</span>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: '#F7B538'
                                    }}>{playerStats?.totalTokensEarned || 0} CROPS</div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>📊</span>
                                        <span>Average Yield:</span>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: '#4CAF50'
                                    }}>{farmingStats.avgYield} CROPS</div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>⭐</span>
                                        <span>Favorite Activity:</span>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: '#2196F3'
                                    }}>{farmingStats.favoriteActivity}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Achievements Tab */}
                    {profileSection === 'achievements' && playerDetails && (
                        <div style={{
                            background: 'linear-gradient(135deg, #2A1D48, #3D2A6D)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            {/* Enhanced achievement gallery */}
                            <AchievementGallery />
                            
                            {/* Social sharing functionality */}
                            <SocialShareCard />
                            
                            {/* Original achievements content for backward compatibility */}
                            <h3 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#F7B538',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>🏆</span> Achievements
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1rem'
                            }}>
                                {/* Achievement cards */}
                                <div style={{
                                    background: (playerStats?.plantCount || 0) >= 10 ? 
                                        'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))' : 
                                        'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    border: (playerStats?.plantCount || 0) >= 10 ? 
                                        '1px solid rgba(76, 175, 80, 0.5)' : 
                                        '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '1.1rem',
                                        color: (playerStats?.plantCount || 0) >= 10 ? 
                                            '#4CAF50' : 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🌱</span> Green Thumb
                                        {(playerStats?.plantCount || 0) >= 10 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                fontSize: '0.8rem',
                                                padding: '0.2rem 0.5rem',
                                                background: 'rgba(76, 175, 80, 0.2)',
                                                borderRadius: '4px',
                                                color: '#4CAF50'
                                            }}>UNLOCKED</span>
                                        )}
                                    </h4>
                                    
                                    <p style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '0.9rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Plant 10 crops in your farm.</p>
                                    
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, ((playerStats?.plantCount || 0) / 10) * 100)}%`,
                                            background: '#4CAF50',
                                            borderRadius: '4px',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: 'right'
                                    }}>{playerStats?.plantCount || 0}/10</div>
                                </div>
                                
                                <div style={{
                                    background: (playerStats?.harvestCount || 0) >= 15 ? 
                                        'linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.1))' : 
                                        'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    border: (playerStats?.harvestCount || 0) >= 15 ? 
                                        '1px solid rgba(255, 193, 7, 0.5)' : 
                                        '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '1.1rem',
                                        color: (playerStats?.harvestCount || 0) >= 15 ? 
                                            '#FFC107' : 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🌾</span> Master Harvester
                                        {(playerStats?.harvestCount || 0) >= 15 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                fontSize: '0.8rem',
                                                padding: '0.2rem 0.5rem',
                                                background: 'rgba(255, 193, 7, 0.2)',
                                                borderRadius: '4px',
                                                color: '#FFC107'
                                            }}>UNLOCKED</span>
                                        )}
                                    </h4>
                                    
                                    <p style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '0.9rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Harvest 15 crops from your farm.</p>
                                    
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, ((playerStats?.harvestCount || 0) / 15) * 100)}%`,
                                            background: '#FFC107',
                                            borderRadius: '4px',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: 'right'
                                    }}>{playerStats?.harvestCount || 0}/15</div>
                                </div>
                                
                                <div style={{
                                    background: (playerStats?.totalTokensEarned || 0) >= 500 ? 
                                        'linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.1))' : 
                                        'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    border: (playerStats?.totalTokensEarned || 0) >= 500 ? 
                                        '1px solid rgba(33, 150, 243, 0.5)' : 
                                        '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '1.1rem',
                                        color: (playerStats?.totalTokensEarned || 0) >= 500 ? 
                                            '#2196F3' : 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>💰</span> Wealthy Farmer
                                        {(playerStats?.totalTokensEarned || 0) >= 500 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                fontSize: '0.8rem',
                                                padding: '0.2rem 0.5rem',
                                                background: 'rgba(33, 150, 243, 0.2)',
                                                borderRadius: '4px',
                                                color: '#2196F3'
                                            }}>UNLOCKED</span>
                                        )}
                                    </h4>
                                    
                                    <p style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '0.9rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Earn 500 CROPS tokens from harvests.</p>
                                    
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, ((playerStats?.totalTokensEarned || 0) / 500) * 100)}%`,
                                            background: '#2196F3',
                                            borderRadius: '4px',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: 'right'
                                    }}>{playerStats?.totalTokensEarned || 0}/500</div>
                                </div>
                                
                                <div style={{
                                    background: playerDetails?.ownedTiles >= 10 ? 
                                        'linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(156, 39, 176, 0.1))' : 
                                        'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    border: playerDetails?.ownedTiles >= 10 ? 
                                        '1px solid rgba(156, 39, 176, 0.5)' : 
                                        '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '1.1rem',
                                        color: playerDetails?.ownedTiles >= 10 ? 
                                            '#9C27B0' : 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🏞️</span> Land Baron
                                        {playerDetails?.ownedTiles >= 10 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                fontSize: '0.8rem',
                                                padding: '0.2rem 0.5rem',
                                                background: 'rgba(156, 39, 176, 0.2)',
                                                borderRadius: '4px',
                                                color: '#9C27B0'
                                            }}>UNLOCKED</span>
                                        )}
                                    </h4>
                                    
                                    <p style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: '0.9rem',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>Own 10 farm tiles.</p>
                                    
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, ((playerDetails?.ownedTiles || 0) / 10) * 100)}%`,
                                            background: '#9C27B0',
                                            borderRadius: '4px',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: 'right'
                                    }}>{playerDetails?.ownedTiles || 0}/10</div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="register-form animate-slide-up">
                    <h3 className="text-center mb-md">Welcome to MonaFarms!</h3>
                    <p className="text-center mb-lg">Join the farming community with a unique nickname.</p>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="nickname">Choose your nickname:</label>
                        <input
                            id="nickname"
                            type="text"
                            className="form-control"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Your Nickname"
                            maxLength={16}
                        />
                        <p className="text-secondary mt-sm">Nickname must be between 3-16 characters.</p>
                    </div>
                    
                    <button 
                        className="btn btn-primary w-full mt-md" 
                        onClick={handleRegister} 
                        disabled={isRegistering || !nickname || nickname.length < 3}
                    >
                        {isRegistering ? (
                            <span className="flex items-center justify-center gap-md">
                                <span className="animate-pulse">Creating Profile...</span>
                            </span>
                        ) : (
                            "Create Profile"
                        )}
                    </button>
                    
                    <p className="text-center text-secondary mt-md">
                        You'll get random starter seeds and farming equipment!
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlayerRegistryComponent;

/**
 * Phase 4 Implementation Notes:
 * - Added comprehensive player profile with avatar selection
 * - Implemented color scheme customization
 * - Added detailed statistics dashboard with player metrics
 * - Created achievements gallery with progress indicators
 * - Added tabbed interface for better organization
 * - Implemented progress bars and visual indicators
 */