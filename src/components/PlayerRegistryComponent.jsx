import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import PlayerRegistryABI from '../../contracts/abis/playerregistry-abi.json';

const CONTRACT_ADDRESSES = {
    playerRegistry: "0x117f6cdF4f0a03A2fCA6e505D2b72ecec1eF3eDE",
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

    return (
        <div className="animate-fade-in">
            <h2>Player Profile</h2>

            {isRegistered ? (
                <div className="player-card card">
                    {playerDetails && (
                        <>
                            <h3 className="player-nickname">{playerDetails.nickname}</h3>
                            <p className="text-secondary mb-md">
                                Joined on {new Date(playerDetails.registrationTime * 1000).toLocaleDateString()}
                            </p>

                            <div className="player-info">
                                <div className="player-stat">
                                    <div className="player-stat-value">{playerDetails.ownedTiles}</div>
                                    <div className="player-stat-label">Farm Tiles</div>
                                </div>
                                <div className="player-stat">
                                    <div className="player-stat-value">{playerDetails.waterBuckets}</div>
                                    <div className="player-stat-label">Water Buckets</div>
                                </div>
                                <div className="player-stat">
                                    <div className="player-stat-value">
                                        {playerDetails.initialSeedType === 0 ? '🥔' : 
                                         playerDetails.initialSeedType === 1 ? '🍅' : '🍓'}
                                    </div>
                                    <div className="player-stat-label">Starter Seeds</div>
                                </div>
                                <div className="player-stat">
                                    <div className="player-stat-value">{playerDetails.initialSeedCount}</div>
                                    <div className="player-stat-label">Seed Count</div>
                                </div>
                            </div>

                            <div className="form-group mt-lg">
                                <h3>Update Nickname</h3>
                                <div className="flex gap-md">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        placeholder="New Nickname"
                                        maxLength={16}
                                    />
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleUpdateNickname} 
                                        disabled={isUpdating || !newNickname || newNickname.length < 3}
                                    >
                                        {isUpdating ? "Updating..." : "Update"}
                                    </button>
                                </div>
                                <p className="text-secondary mt-sm">Nickname must be between 3-16 characters.</p>
                            </div>
                        </>
                    )}
                </div>
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